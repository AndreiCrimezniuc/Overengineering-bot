import TgBot from "../telegram";
import logger from "../logger/logger";
import moment from "moment";

const ROWS_IN_TABLE = 11

export type MinistersRow = {
    date: moment.Moment,
    FirstMicrophone: string,
    SecondMicrophone: string,
    Sound: string,
    SoundLearner: string
}

export async function runOnTuesdayAndSaturday(NotifyNow: (force?: boolean, chatID?: number) => void, bot: TgBot) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours() + 3; // because we live in UTC+3
        const currentMinute = now.getUTCMinutes();
        const logWrongTime = () => {
            logger.warn(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`)
        }

        const isSaturdayEightAM = currentDay === 6 && currentHour === 8 && currentMinute === 0
        const isTuesdayEightAM = currentDay === 2 && currentHour === 8 && currentMinute === 0

        // Check if it's Tuesday and the time is 8:00
        if (isSaturdayEightAM || isTuesdayEightAM) {
            NotifyNow(false, bot.GetRecurrentChatID())
        } else if (currentMinute === 0) {
            logWrongTime()
        }

    }, 60000); // Check every minute
}

export function ConvertRows(rows: string[][], bot: TgBot, force: boolean) {
    let resultRows: MinistersRow[] = []

    const namesToHandle = rows.length > ROWS_IN_TABLE ? ROWS_IN_TABLE : rows.length
    for (let i = 1; i < namesToHandle; i++) {
        let rowObj = convertRow(rows[i], bot, force)
        if (rowObj !== undefined) {
            resultRows.push(rowObj)
        }
    }

    return resultRows
}

export function sendNotification(ministers: MinistersRow[], bot: TgBot, force: boolean, chatID?: number) {
    const filteredMinisters = FilterMinisterRowsByCriteria(ministers, force)

    filteredMinisters.forEach((m) => {
        if (m.SoundLearner === undefined || m.Sound === undefined || m.FirstMicrophone === undefined || m.SecondMicrophone === undefined) {
            bot.SendMsg(`Привет. Я бот, но у меня что-то сломалось.Однако покажу что нашел в расписании: \n На аппаратуре послужит ${m.Sound}. \n На первом микрофоне: ${m.FirstMicrophone}. \nНа втором микрофоне: ${m.SecondMicrophone}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, chatID).then((r) =>
                logger.info(r)
            )
        } else {
            let msg = `Привет. Я бот на стажировке. Пока я еще не уверен в себе, но уже могу предупредить, что: \n <b>На аппаратуре:</b> ${m.Sound} \n <b>На первом микрофоне:</b> ${m.FirstMicrophone} \n <b>На втором микрофоне:</b> ${m.SecondMicrophone} \n<b>Обучение за пультом: </b> ${m.SoundLearner}
         \n Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`

            bot.SendMsg(msg, chatID).then((r) =>
                logger.info(r + ` send msg "${msg.substring(0, 10)}..." for ${chatID}`)
            )
        }
    })
}

function convertRow(row: string[], bot: TgBot, force: boolean): MinistersRow | undefined { // here is solid is dead. It should return object with audo stuff and sendMsg in another function(S-solid)
    const date = moment(row[1], "DD-MM-YYYY")

    if (date.isValid() && row[2] && row[3] && row[4] && row[5]) { // nolint,please: the most ugly code that I every write
        logger.info(`converted raw as valid by date for ${date}`)
        return {
            date: date,
            Sound: row[2],
            FirstMicrophone: row[3],
            SecondMicrophone: row[4],
            SoundLearner: row[5]
        }
    }
}

function isToday(date: moment.Moment) {
    const today = moment()
    return today.dayOfYear() == date.dayOfYear()
}

function onThisWeek(date: moment.Moment): boolean {
    const today = moment()
    return date.isoWeek() == today.isoWeek()
}

export function isTuesdayOrSaturday(date: moment.Moment) {
   return [2,6].includes(date.day())
}

function FilterMinisterRowsByCriteria(ministers: MinistersRow[], force: boolean): MinistersRow[] {
    return ministers.filter((m) =>{
        if (force && onThisWeek(m.date)) {
           return true
        }

        if (!force && isToday(m.date) && isTuesdayOrSaturday(m.date)) {
            return true
        }
    })
}
