import TgBot from "../telegram";
import logger from "../logger/logger";
import moment from "moment";

const ROWS_IN_TABLE = 11

type ServersRows = {
    date: moment.Moment,
    FirstMicrophone: string,
    SecondMicrophone: string,
    Sound: string,
    SoundLearner: string
}

export async function runOnTuesdayAndSaturday(NotifyNow: (force?: boolean, chatID?:number) => void, bot: TgBot) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getHours();
        const currentMinute = now.getUTCMinutes();
        const logWrongTime = () => {
            logger.warn(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`)
        }

        const isSaturdayEightAM = currentDay === 6 && currentHour === 8 && currentMinute === 0
        const isTuesdayEightAM = currentDay === 2 && currentHour === 8 && currentMinute === 0

        // Check if it's Tuesday and the time is 8:00
        if (isSaturdayEightAM || isTuesdayEightAM) {
            NotifyNow(false, bot.GetRecurrentChatID())
        } else {
            logWrongTime()
        }

    }, 60000); // Check every minute
}

export function GetRowsFromExcel(rows: string[][], bot: TgBot, force: boolean) {
    let resultRows: ServersRows[] = []

    const namesToHandle = rows.length > ROWS_IN_TABLE ? ROWS_IN_TABLE : rows.length
    for (let i = 1; i < namesToHandle; i++) {
        let rowObj = handleRow(rows[i], bot, force)
        if (rowObj !== undefined) {
            resultRows.push(rowObj)
        }
    }

    return resultRows
}

function isToday(date: moment.Moment) {
    const today = moment()

    return today.day() == date.day()
}

export function sendNotification(servers: ServersRows[], bot: TgBot, chatID?: number) {
    servers.forEach((el) => {
        if (el.SoundLearner === undefined || el.Sound === undefined || el.FirstMicrophone === undefined || el.SecondMicrophone === undefined) {
           bot.SendMsg(`Привет. Я бот, но у меня что-то сломалось.Однако покажу что нашел в расписании: \n На аппаратуре послужит ${el.Sound}. \n На первом микрофоне: ${el.FirstMicrophone}. \nНа втором микрофоне: ${el.SecondMicrophone}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, chatID).then((r) =>
                logger.info(r)
            )
        } else {
            let msg = `Привет. Я бот на стажировке. Пока я еще не уверен в себе, но уже могу предупредить, что: \n <b>На аппаратуре:</b> ${el.Sound} \n <b>На первом микрофоне:</b> ${el.FirstMicrophone} \n <b>На втором микрофоне:</b> ${el.SecondMicrophone} \n<b>Обучение за пультом: </b> ${el.SoundLearner}
         \n Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`

            bot.SendMsg(msg, chatID).then((r) =>
                logger.info(r + ` send msg "${msg.substring(0, 10)}..." for ${chatID}`)
            )
        }
    })
}

function handleRow(row: string[], bot: TgBot, force: boolean): ServersRows | undefined { // here is solid is dead. It should return object with audo stuff and sendMsg in another function(S-solid)
    const date = moment(row[1], "DD-MM-YYYY")

    if (date.isValid()) { // nolint,please: the most ugly code that I every write
        if (isToday(date) || (force && onThisWeek(date))) {
            logger.info("Got correct schedule for current week")
            return {
                date: date,
                Sound: row[2],
                FirstMicrophone: row[3],
                SecondMicrophone: row[4],
                SoundLearner: row[5]
            }
        }
        logger.warn(`Got schedule for other date: ${row[1]}`)

        return undefined
    } else {
        console.log(`Weird date ${row[1]}`)
    }
}

function onThisWeek(date: moment.Moment): boolean {
    const today = moment()

    return date.week() == today.week()
}
