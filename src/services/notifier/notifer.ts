import TgBot from "../telegram";
import logger from "../logger/logger";
import moment from "moment";

const AUDIO_TEAM_ROW_NUMBER = 11
const SECURITY_TEAM_ROW_START = 16
const SECURITY_TEAM_ROW_END = 25

export type ScheduleOptions = {
    audioMinistersOn: boolean,
    stewardsOn: boolean,
    force?: boolean,
    chatID?: number
    debugChatID?: number
}

export type AudioTeam = {
    Date: moment.Moment,
    FirstMicrophone: string,
    SecondMicrophone: string,
    Sound: string,
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

export async function runOnTuesdayAndSaturday(NotifyNow: (scheduleOptions: ScheduleOptions) => void, bot: TgBot) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours() + 2; // because we live in UTC+3
        const currentMinute = now.getUTCMinutes();
        const logWrongTime = () => {
            logger.warn(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`)
        }

        const isSaturdayEightAM = currentDay === 6 && currentHour === 10 && currentMinute === 15
        const isTuesdayEightAM = currentDay === 2 && currentHour === 10 && currentMinute === 15

        // Check if it's Tuesday and the time is 8:00
        if (isSaturdayEightAM || isTuesdayEightAM) {
            const scheduleOptions: ScheduleOptions = {
                audioMinistersOn: true,
                stewardsOn: true,
                debugChatID: bot.debugChatID,
                chatID: bot.GetRecurrentChatID()
            }

            NotifyNow(scheduleOptions)
        } else if (currentMinute === 0) {
            logWrongTime()
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

        if (i >= SECURITY_TEAM_ROW_START && i <= SECURITY_TEAM_ROW_END) {
            let rowObj: Security | undefined = convertSecurityTeam(rows[i])
            if (rowObj !== undefined) {
                Ministers.SecuritySchedule.push(rowObj)
            }
        }

    }
    return Ministers
}

function HandleBrokenSchedule(bot: TgBot, filteredMinisters: MinistersSchedule, i: number, securitySchedule: Security | undefined, scheduleOptions: ScheduleOptions) {
    bot.SendMsg(`Привет. Кажется расписание составлено не полностью, либо я сломался.
           \n <b>На аппаратуре</b> послужит ${filteredMinisters.AudioTeamSchedule[i].Sound}. \n
            <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule[i].FirstMicrophone}. \n
            <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule[i].SecondMicrophone}. \n
         
            <b>Распорядители:</b>  \n
            <b>Зал:</b> ${securitySchedule?.Hall} \n
            <b>Вход:</b>  ${securitySchedule?.Entrance}
            }
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, scheduleOptions.debugChatID).then((r) =>
        logger.info(r)
    )
}

function HandleSendingSuccessfulSchedule(filteredMinisters: MinistersSchedule, i: number, securitySchedule: Security | undefined, bot: TgBot, scheduleOptions: ScheduleOptions) {
    let msg = `
Привет. Напоминание на сегодня \n 
    <b>На аппаратуре:</b> ${filteredMinisters.AudioTeamSchedule[i].Sound} 
    <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule[i].FirstMicrophone} 
    <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule[i].SecondMicrophone} \n`

    let securityMsg = ""

    if (securitySchedule !== undefined &&
        securitySchedule.Entrance !== undefined &&
        securitySchedule.Hall !== undefined) {
        securityMsg = `\nРаспорядители:  
    <b>Зал:</b> ${securitySchedule.Hall}
    <b>Вход:</b> ${securitySchedule.Entrance} \n`
    }

    const warningMsg = `Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`

    bot.SendMsg(msg + securityMsg + warningMsg, scheduleOptions.chatID).then((r) =>
        logger.info(r + ` send msg "${msg.substring(0, 10)}..." for ${scheduleOptions.chatID}`)
    )
}

export function sendNotification(ministers: MinistersSchedule, bot: TgBot, scheduleOptions: ScheduleOptions) {
    const filteredMinisters = FilterMinisterRowsByCriteria(ministers, scheduleOptions.force ?? false)

    for (let i = 0; i < filteredMinisters.AudioTeamSchedule.length; i++) {
        const securitySchedule = GetSecurityScheduleByDate(moment(), ministers)

        if (filteredMinisters.AudioTeamSchedule[i].Sound === undefined ||
            filteredMinisters.AudioTeamSchedule[i].FirstMicrophone === undefined ||
            filteredMinisters.AudioTeamSchedule[i].SecondMicrophone === undefined
        ) {
            HandleBrokenSchedule(bot, filteredMinisters, i, securitySchedule, scheduleOptions);

            continue
        }

        HandleSendingSuccessfulSchedule(filteredMinisters, i, securitySchedule, bot, scheduleOptions);

        return
    }
}


function GetSecurityScheduleByDate(date: moment.Moment, m: MinistersSchedule): Security | undefined {
    for (let i = 0; i < m.SecuritySchedule.length; i++) {
        if (date.isSame(m.SecuritySchedule[i].Date)) {
            return m.SecuritySchedule[i]
        }
    }
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

function convertAudioTeamRows(row: string[]): AudioTeam | undefined { // here is solid is dead. It should return object with audo stuff and sendMsg in another function(S-solid)
    const date = moment(row[1], "DD-MM-YYYY")
    if (date.isValid() && row[2] && row[3] && row[4]) { // nolint,please: the most ugly code that I every write

        logger.info(`converted raw as valid by date for ${date}`)
        return {
            Date: date,
            Sound: MicrophoneDictionary(row[2]),
            FirstMicrophone: MicrophoneDictionary(row[3]),
            SecondMicrophone: MicrophoneDictionary(row[4])
        }
    }
}

function onThisWeek(date: moment.Moment): boolean {
    return date.isoWeek() == moment().isoWeek()
}

export function isTuesdayOrSaturday(date: moment.Moment) {
    return [2, 6].includes(date.day())
}

function FilterMinisterRowsByCriteria(ministers: MinistersSchedule, force: boolean): MinistersSchedule { // I guess it should be find instead of filter
    const filterCallBack = (m: any) => {
        if (force && onThisWeek(m.Date)) {
            return true
        }
        if (!force && onThisWeek(m.Date) && isTuesdayOrSaturday(m.Date)) {
            return true
        }
    }

    ministers.AudioTeamSchedule = ministers.AudioTeamSchedule.filter((filterCallBack))
    ministers.SecuritySchedule = ministers.SecuritySchedule.filter(filterCallBack)

    return ministers
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