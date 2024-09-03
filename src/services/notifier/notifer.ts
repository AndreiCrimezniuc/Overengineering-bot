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

export type MinistersScheduleRaw = {
    AudioTeamSchedule: AudioTeam[],
    SecuritySchedule: Security[],
}

export type MinisterScheduleToday = {
    AudioTeamSchedule: AudioTeam,
    SecuritySchedule: Security,
}

export type SpeakerSchedule = {
    Chairman?: string,
    Speech10min?: string,
    Gems?: string,
    ReaderBookStudy?: string,
    LeadingBookStudy?: string
    Date: moment.Moment
    FirstPray?: string,
    LastPray?: string
}

export async function runOnTuesdayAndSaturday(NotifyNow: (scheduleOptions: ScheduleOptions) => void, bot: TgBot) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours() + 2; // because we live in UTC+3
        const currentMinute = now.getUTCMinutes();
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
            logger.warn(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`)
        }

    }, 60000); // Check every minute
}

export function SpeakerScheduleFromRawRows(rows: string[][]): SpeakerSchedule | undefined {
    let todayDateLine = 0
    let nextDateLine = 0


    // not elegant, but it doesn't matter
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] !== undefined && moment(rows[i][1], 'DD.MM.YYYY').isSame(moment().add(1, 'days'), 'day')) {
            todayDateLine = i
            logger.info("Got line where to start :" + todayDateLine)
        }
        if (rows[i][1] !== undefined && moment(rows[i][1], 'DD.MM.YYYY').isSame(moment().add(6, 'days'), 'day')) {
            nextDateLine = i;
            logger.info("Got line where to end :" + nextDateLine)

            break
        }

    }

    if (todayDateLine == 0 && nextDateLine == 0) {
        logger.info("Got nothing about speakers in excel")
        return undefined
    }

    let schedule: SpeakerSchedule = {
        Date: moment()
    }
    for (let i = todayDateLine; i <= nextDateLine; i++) {
        if (rows[i].some(cell => cell.includes("Председатель:")) && schedule.Chairman === undefined) {
            schedule.Chairman = rows[i][6];
            logger.info("Got Role: " + rows[i][6]);
        }

// Check if any cell contains "Молитва:" and assign FirstPray if it is undefined
// Ensure the correct "Молитва:" is processed based on order if there are multiple occurrences
        if (rows[i].some(cell => cell.includes("Молитва:")) && schedule.FirstPray === undefined) {
            schedule.FirstPray = rows[i][6];
            logger.info("Got Role: " + rows[i][6]);
        }

// Check if the row contains both "(10 мин.)" and "18:36" and assign Speech10min if it is undefined
        if (rows[i].some(cell => cell.includes("(10 мин.)")) &&
            rows[i].some(cell => cell.includes("18:36")) &&
            schedule.Speech10min === undefined) {
            schedule.Speech10min = rows[i][6];
            logger.info("Got Role: " + rows[i][6]);
        }

// Check if the row contains both "Духовные жемчужины" and "18:46" and assign Gems if it is undefined
        if (rows[i].some(cell => cell.includes("Духовные жемчужины")) &&
            rows[i].some(cell => cell.includes("18:46")) &&
            schedule.Gems === undefined) {
            schedule.Gems = rows[i][6];
            logger.info("Got Role: " + rows[i][6]);
        }

// Check if the row contains "Изучение Библии в собрании" and assign LeadingBookStudy if it is undefined
        if (rows[i].some(cell => cell.includes("Изучение Библии в собрании")) &&
            schedule.LeadingBookStudy === undefined) {
            schedule.LeadingBookStudy = rows[i][6];
            logger.info("Got Role: " + rows[i][6]);
        }

        if (rows[i].some(cell => cell.includes("Изучение Библии в собрании")) &&
            schedule.ReaderBookStudy === undefined) {
            schedule.ReaderBookStudy = rows[i + 1][6];
            logger.info("Got Role: " + rows[i][6]);
        }

// Check if the row contains both "Молитва:" and "20:10" and assign LastPray if it is undefined
        if (rows[i].some(cell => cell.includes("Молитва:")) &&
            rows[i].some(cell => cell.includes("20:10")) &&
            schedule.LastPray === undefined) {
            schedule.LastPray = rows[i][6];
            logger.info("Got Role: " + rows[i][6]);
        }
    }

    return schedule
}

export function MinisterScheduleFromRawRows(rows: string[][]): MinistersScheduleRaw {
    let Ministers: MinistersScheduleRaw = {
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

function HandleBrokenSchedule(bot: TgBot, filteredMinisters: MinisterScheduleToday, securitySchedule: Security | undefined, scheduleOptions: ScheduleOptions) {
    bot.SendMsg(`Привет. Кажется расписание составлено не полностью, либо я сломался.
           \n <b>На аппаратуре</b> послужит ${filteredMinisters.AudioTeamSchedule.Sound}. \n
            <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.FirstMicrophone}. \n
            <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.SecondMicrophone}. \n
         
            <b>Распорядители:</b>  \n
            <b>Зал:</b> ${securitySchedule?.Hall} \n
            <b>Вход:</b>  ${securitySchedule?.Entrance}
            }
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, scheduleOptions.debugChatID).then((r) =>
        logger.info(r)
    )
}

function HandleSendingSuccessfulSchedule(filteredMinisters: MinisterScheduleToday, filteredSpeaker: SpeakerSchedule | undefined, securitySchedule: Security | undefined, bot: TgBot, scheduleOptions: ScheduleOptions) {
    let msg = `
Привет. Напоминание на сегодня \n 
    <b>На аппаратуре:</b> ${filteredMinisters.AudioTeamSchedule.Sound} 
    <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.FirstMicrophone} 
    <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.SecondMicrophone} \n`

    let securityMsg = ""

    if (securitySchedule !== undefined &&
        securitySchedule.Entrance !== undefined &&
        securitySchedule.Hall !== undefined) {
        securityMsg = `\nРаспорядители:  
    <b>Зал:</b> ${securitySchedule.Hall}
    <b>Вход:</b> ${securitySchedule.Entrance} \n`
    }


    const warningMsg = `Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`

    let conflictMsg = ""
    if (securitySchedule != undefined) {
        conflictMsg = isThereConflictsInSchedule(filteredMinisters.AudioTeamSchedule, securitySchedule) ? "\n \n <b> Кажется есть конфликты в расписании</b>" : ""
    }

    msg = msg + securityMsg + warningMsg + conflictMsg

    msg = handleSpeakerMsg(msg, filteredSpeaker)

    bot.SendMsg(msg, scheduleOptions.chatID).then((r) =>
        logger.info(r + ` send msg "${msg.substring(0, 10)}..." for ${scheduleOptions.chatID}`)
    )
}

function isThereConflictsInSchedule(audioTeam: AudioTeam, st: Security): boolean {
    return audioTeam.FirstMicrophone === st.Hall || audioTeam.SecondMicrophone === st.Hall || audioTeam.Sound === st.Hall ||
        audioTeam.FirstMicrophone === st.Entrance || audioTeam.SecondMicrophone === st.Entrance || audioTeam.Sound === st.Entrance
}

export function sendNotification(speakers: SpeakerSchedule | undefined, ministers: MinistersScheduleRaw, bot: TgBot, scheduleOptions: ScheduleOptions) {
    const filteredMinisters = FilterMinisterRowsByCriteria(ministers, scheduleOptions.force ?? false)


    const securitySchedule = GetSecurityScheduleByDate(moment(), ministers)

    if (NotificateThatYouHaveSomethingBroken(filteredMinisters, speakers, securitySchedule, scheduleOptions, bot)) {
        return
    }

    HandleSendingSuccessfulSchedule(filteredMinisters, speakers, securitySchedule, bot, scheduleOptions);

    return
}

function handleSpeakerMsg(msg: string, filteredSpeaker: SpeakerSchedule | undefined): string {
    if (filteredSpeaker == undefined) {
        return msg
    }

    const requiredProperties = [
        'Chairman',
        'FirstPray',
        'Speech10min',
        'Gems',
        'LeadingBookStudy',
        'ReaderBookStudy',
        'LastPray'
    ];

    const allPropertiesDefined = requiredProperties.every(prop => filteredSpeaker[prop] !== undefined);

    if (allPropertiesDefined) {
        msg += `
            \n\n<b> <i> Экспериментальный список докладчиков. Список пока тестируется. Не верьте ему наслово! Но если он вас упоминает, то стоит проверить \n </i> </b>
             <b> Председатель: </b> ${MicrophoneDictionary(filteredSpeaker.Chairman ?? "")} \n
             <b> Первая молитва: </b> ${MicrophoneDictionary(filteredSpeaker.FirstPray ?? "")}\n
             <b> 10 минутная речь: </b> ${MicrophoneDictionary(filteredSpeaker.Speech10min ?? "")}\n
             <b> Жемчужины: </b> ${MicrophoneDictionary(filteredSpeaker.Gems ?? "")}\n
             <b> Изучение библии:</b> ${MicrophoneDictionary(filteredSpeaker.LeadingBookStudy ?? "")}\n
             <b> Чтец на изучении библии: </b> ${MicrophoneDictionary(filteredSpeaker.ReaderBookStudy ?? "")}\n
             <b> Последняя молитва: </b> ${MicrophoneDictionary(filteredSpeaker.LastPray ?? "")}\n
             <b> Дата -  </b> ${filteredSpeaker.Date.format("DD.MM.YYYY")} 
        `
    }

    return msg
}

function NotificateThatYouHaveSomethingBroken(ministers: MinisterScheduleToday, speaker: SpeakerSchedule | undefined, security: Security | undefined, options: ScheduleOptions, bot: TgBot): boolean {
    if (ministers.AudioTeamSchedule.Sound === undefined ||
        ministers.AudioTeamSchedule.FirstMicrophone === undefined ||
        ministers.AudioTeamSchedule.SecondMicrophone === undefined
    ) {//toDo: added check for speaker
        HandleBrokenSchedule(bot, ministers, security, options);

        return true
    } else {
        return false
    }
}

function GetSecurityScheduleByDate(date: moment.Moment, m: MinistersScheduleRaw): Security | undefined {
    for (let i = 0; i < m.SecuritySchedule.length; i++) {
        if (date.format("YYYY-MM-DD") === m.SecuritySchedule[i].Date.format("YYYY-MM-DD")) {
            return m.SecuritySchedule[i]
        }
    }
}


function convertSecurityTeam(row: string[]): Security | undefined {
    const date = moment(row[1], "DD-MM-YYYY")

    if (date.isValid() && row[2] && row[3]) { // nolint,please: the most ugly code that I every write
        // logger.info(`converted raw as valid by date for ${date}`)
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

        // logger.info(`converted raw as valid by date for ${date}`)
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

export function isTuesday(date: moment.Moment) {
    return [2].includes(date.day())
}

export function getLatestMinistersSchedule(ministers: MinistersScheduleRaw): MinisterScheduleToday {
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

function filterMinisters<T extends { Date: moment.Moment }>(m: T, force: boolean): boolean {
    if (force && onThisWeek(m.Date)) {
        return true;
    }

    return !force && onThisWeek(m.Date) && isTuesdayOrSaturday(m.Date);
}

function filterSpeaker<T extends { Date: moment.Moment }>(m: T, force: boolean): boolean {
    if (force && onThisWeek(m.Date)) {
        return true;
    }
    return !force && onThisWeek(m.Date) && isTuesday(m.Date);
}

function FilterMinisterRowsByCriteria(ministers: MinistersScheduleRaw, force: boolean): MinisterScheduleToday {
    ministers.AudioTeamSchedule = ministers.AudioTeamSchedule.filter((audioTeam) => filterMinisters(audioTeam, force));
    ministers.SecuritySchedule = ministers.SecuritySchedule.filter((security) => filterMinisters(security, force));

    return getLatestMinistersSchedule(ministers);
}

function MicrophoneDictionary(s: string): string {
    const ministersDictionary: Map<string, string> = new Map;
    ministersDictionary.set("Белоусов Н.", "@tokimedo")
    ministersDictionary.set("Кавлюк И.", "@cavliman")
    ministersDictionary.set("Кримезнюк А.", "@Andrei_crimezniuc")
    ministersDictionary.set("Масленников Д.", "@dantes024")
    ministersDictionary.set("Родионов И.", "@bellylollipop")
    ministersDictionary.set("Гарбузарь В.", "@Viorelu123")
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
    ministersDictionary.set("Бучушкану Александр", "@Alexandru_Buciuscanu")
    ministersDictionary.set("Кутуряну Константин", "@constantincutureanu")
    ministersDictionary.set("Гарбузарь Виорел", "@Viorelu123")
    ministersDictionary.set("Сахечидзе Георгий", "Сахечидзе Георгий")
    ministersDictionary.set("Смоляк Денис", "@Ds69298805")
    ministersDictionary.set("Кавлюк Игорь", "@cavliman")
    ministersDictionary.set("Маноле Максим", "@Max_Manole")
    ministersDictionary.set("Кримезнюк Андрей", "@Andrei_crimezniuc")
    ministersDictionary.set("Масленников Даниил", "@dantes024")
    ministersDictionary.set("Флянку Ярослав", "@your_pixel")
    ministersDictionary.set("Жокот Сергей", "Сергей Жокот")
    ministersDictionary.set("Страшник Аурел", "@AurelStrashnik")
    ministersDictionary.set("Белоусов Николай", "@tokimedo")
    ministersDictionary.set("Яврумян Алик", "Яврумян Алик")



    return ministersDictionary.get(s) ?? s
}