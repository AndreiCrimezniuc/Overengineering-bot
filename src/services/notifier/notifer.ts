import TgBot from "../telegram";
import logger from "../logger/logger";
import moment from "moment";
import {GetRows as GetRowsFromExcel} from "../excelHandler";
import {Config} from "../config/config";

const AUDIO_TEAM_ROW_NUMBER = 11
const SECURITY_TEAM_ROW_START = 16
const SECURITY_TEAM_ROW_END = 25

export type ScheduleOptions = {
    securityOn?: boolean,
    force?: boolean,
    chatID?: number
    debugChatID?: number
}

export type AudioTeam = {
    Date: moment.Moment,
    FirstMicrophone: string,
    SecondMicrophone: string,
    Sound: string,
    SoundLearner: string,
}

function AudioTeamIsValid(t: AudioTeam) {
    return t.Date !== undefined &&
        t.SoundLearner !== undefined &&
        t.Sound !== undefined &&
        t.FirstMicrophone !== undefined &&
        t.SecondMicrophone !== undefined
}

function SecurityTeamIsValid(t: Security) {
    return t.Date !== undefined &&
        t.Entrance !== undefined &&
        t.Hall !== undefined
}

export type Security = {
    Hall: string,
    Entrance: string,
    Date: moment.Moment,
}

export type MinistersSchedule = {
    AudioTeamSchedule: AudioTeam[],
    SecuritySchedule: Security[],
}

export type MinisterScheduleLatest = {
    AudioTeamSchedule: AudioTeam,
    SecuritySchedule: Security,
}

export async function handleMinisterNotification(config: Config, tgBot: TgBot, scheduleOptions: ScheduleOptions) {
    await GetRowsFromExcel(config.SpreadSheetID, 'credentials.json').then((data) => {
        if (data != null) {
            let Ministers = ConvertRows(data.data.values)
            sendMinisterNotification(Ministers, tgBot, scheduleOptions)
        } else {
            sendGivenNotification("no data in excel", tgBot, tgBot.debugChatID)
            logger.warn('Here is nothing inside')
        }
    })
}

export async function runOnTuesdayAndSaturday(bot: TgBot, config: Config) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours() + 2; // because we live in UTC+3
        const currentMinute = now.getUTCMinutes();

        const isSaturdayEightAM = currentDay === 6 && currentHour === 10 && currentMinute === 15
        const isTuesdayEightAM = currentDay === 2 && currentHour === 10 && currentMinute === 15

        // Check if it's Tuesday and the time is 8:00
        if (isSaturdayEightAM || isTuesdayEightAM) {
            handleMinisterNotification(config, bot,
                {
                    securityOn: true,
                    debugChatID: bot.debugChatID,
                    chatID: bot.GetRecurrentChatID()
                })
        } else if (currentMinute === 0) {
            logger.info(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`)
        }

    }, 60000); // Check every minute
}

export function ConvertRows(rows: string[][]): MinistersSchedule {
    let Ministers: MinistersSchedule = {
        AudioTeamSchedule: [],
        SecuritySchedule: [],
    }

    const rowsToHandle = rows.length > SECURITY_TEAM_ROW_END ? SECURITY_TEAM_ROW_END : rows.length

    for (let i = 1; i < rowsToHandle; i++) {
        if (i < AUDIO_TEAM_ROW_NUMBER) {
            let rowObj: AudioTeam | undefined = convertAudioTeamRows(rows[i])
            if (rowObj !== undefined) {
                Ministers.AudioTeamSchedule.push(rowObj)
            }
        }

        if (i >= SECURITY_TEAM_ROW_START - 1 && i <= SECURITY_TEAM_ROW_END - 1) {
            let rowObj: Security | undefined = convertSecurityTeam(rows[i])
            if (rowObj !== undefined) {
                Ministers.SecuritySchedule.push(rowObj)
            }
        }
    }

    return Ministers
}

function HandleBrokenSchedule(bot: TgBot, ministers: MinistersSchedule, scheduleOptions: ScheduleOptions) {
    bot.sendMsg(`Привет. Кажется расписание составлено не полностью, либо я сломался.
         Что-то умерло, посмотри код ${JSON.stringify(ministers)}
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, scheduleOptions.debugChatID).then((r) =>
        logger.info(r)
    )
}

function HandleSendingSuccessfulSchedule(filteredMinisters: MinisterScheduleLatest, bot: TgBot, scheduleOptions: ScheduleOptions) {
    let msg = `
Привет. Напоминание на сегодня \n 
    <b>На аппаратуре:</b> ${filteredMinisters.AudioTeamSchedule.Sound} 
    <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.FirstMicrophone} 
    <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.SecondMicrophone} 
    <b>Обучение за пультом: </b> ${filteredMinisters.AudioTeamSchedule.SoundLearner} \n `

    let securityMsg = ""

    if (SecurityTeamIsValid(filteredMinisters.SecuritySchedule)) {
        securityMsg = `\nРаспорядители:  
    <b>Зал:</b> ${filteredMinisters.SecuritySchedule.Hall}
    <b>Вход:</b> ${filteredMinisters.SecuritySchedule.Entrance} \n`
    }

    const warningMsg = `Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`
    bot.sendMsg(msg + securityMsg + warningMsg, scheduleOptions.chatID).then((r) =>
        logger.info(r + ` send msg "${msg.substring(0, 10)}..." for ${scheduleOptions.chatID}`)
    )
}

export function sendGivenNotification(notification: string, bot: TgBot, chat: number) {
    try {
        bot.sendMsg(notification, chat).then((r) =>
            logger.info(r)
        )
    } catch (e) {
        logger.error(e, "Some problem with sending given notification")
    }
}


export function sendMinisterNotification(ministers: MinistersSchedule, bot: TgBot, scheduleOptions: ScheduleOptions) { // some weird stuff here
    if (ministers.AudioTeamSchedule.length === 0) {
        HandleBrokenSchedule(bot, ministers, scheduleOptions);
    }

    let filteredMinisters = FilterMinisterRowsByCriteria(ministers, scheduleOptions.force ?? false)

    if (AudioTeamIsValid(filteredMinisters.AudioTeamSchedule)) {
        HandleSendingSuccessfulSchedule(filteredMinisters, bot, scheduleOptions);
    } else {
        HandleBrokenSchedule(bot, ministers, scheduleOptions);
    }

    return
}

function convertSecurityTeam(row: string[]): Security | undefined {
    const date = moment(row[1], "DD-MM-YYYY")

    if (date.isValid() && row[2] && row[3]) { // nolint,please: the most ugly code that I every write
        logger.info(`converted raw as valid by date for ${date}`)
        return {
            Date: date,
            Hall: MicrophoneDictionary(row[2]),
            Entrance: MicrophoneDictionary(row[3])
        }
    }
}

function convertAudioTeamRows(row: string[]): AudioTeam | undefined { // here is solid is dead. It should return object with audio stuff and sendMsg in another function(S-solid)
    const date = moment(row[1], "DD-MM-YYYY")

    if (date.isValid() && row[2] && row[3] && row[4] && row[5]) { // nolint,please: the most ugly code that I every write
        logger.info(`converted raw as valid by date for ${date}`)
        return {
            Date: date,
            Sound: MicrophoneDictionary(row[2]),
            FirstMicrophone: MicrophoneDictionary(row[3]),
            SecondMicrophone: MicrophoneDictionary(row[4]),
            SoundLearner: MicrophoneDictionary(row[5])
        }
    }
}

function onThisWeek(date: moment.Moment): boolean {
    const today = moment()
    return date.isoWeek() == today.isoWeek()
}

export function isTuesdayOrSaturday(date: moment.Moment) {
    return [2, 6].includes(date.day())
}


export function getLatestMinistersSchedule(ministers: MinistersSchedule): MinisterScheduleLatest {
    function findLatestValue<T extends { Date: moment.Moment }>(schedule: T[]): T {
        let latestValue: T = schedule[0];

        for (const item of schedule) {
            if (latestValue === null || item.Date.isAfter(latestValue.Date)) {
                latestValue = item;
            }
        }

        return latestValue;
    }

    const latestAudioTeam: AudioTeam = findLatestValue(ministers.AudioTeamSchedule);
    const latestSecurityTeam: Security = findLatestValue(ministers.SecuritySchedule);

    return {
        AudioTeamSchedule: latestAudioTeam,
        SecuritySchedule: latestSecurityTeam
    }
}

function FilterMinisterRowsByCriteria(ministers: MinistersSchedule, force: boolean): MinisterScheduleLatest {
    const filterCallBack = <T extends { Date: moment.Moment }>(m: T) => {
        if (force && onThisWeek(m.Date)) {
            return true
        }
        if (!force && onThisWeek(m.Date) && isTuesdayOrSaturday(m.Date)) {
            return true
        }
    }

    ministers.AudioTeamSchedule = ministers.AudioTeamSchedule.filter((filterCallBack))
    ministers.SecuritySchedule = ministers.SecuritySchedule.filter(filterCallBack)

    return getLatestMinistersSchedule(ministers)
}

function MicrophoneDictionary(s: string): string {
    const ministersDictionary: Map<string, string> = new Map;
    ministersDictionary.set("Белоусов Н.", "@tokimedo")
    ministersDictionary.set("Кавлюк И.", "@cavliman")
    ministersDictionary.set("Кримезнюк А.", "@Andrei_crimezniuc")
    ministersDictionary.set("Масленников Д.", "@dantes024")
    ministersDictionary.set("Родионов И.", "@bellylollipop")
    ministersDictionary.set("Гарбузарь В.", "Гарбузарь В.")
    ministersDictionary.set("Жокот С.", "Жокот С.")
    ministersDictionary.set("Курка А.", "@Endrus_Rare")
    ministersDictionary.set("Кутуряну К.", "@constantincutureanu")
    ministersDictionary.set("Маноле М.", "@Max_Manole")
    ministersDictionary.set("Русановский Р.", "@rosinrusanovschi")
    ministersDictionary.set("Сахечидзе Г.", "Сахечидзе Г.")
    ministersDictionary.set("Смоляк Д.", "Смоляк Д.")
    ministersDictionary.set("Страшник А.", "@AurelStrashnik")
    ministersDictionary.set("Флянку Я.", "@your_pixel")
    ministersDictionary.set("Чухненко В.", "Чухненко В.")
    ministersDictionary.set("Нагурня М.", "Нагурня М.")
    ministersDictionary.set("Русановский В.", "Русановский В.")

    return ministersDictionary.get(s) ?? s
}