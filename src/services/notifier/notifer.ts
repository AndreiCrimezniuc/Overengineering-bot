import TgBot from "../telegram";

const ROWS_IN_TABLE = 11

type ServersRows = {
    date: Date,
    FirstMicrophone: string,
    SecondMicrophone: string,
    Sound: string,
    SoundLearner: string
}

export async function runOnTuesdayAndSaturday(NotifyNow: (force?: boolean) => void) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();

        // Check if it's Tuesday and the time is 8:00
        if (currentDay === 2 && currentHour === 8 && currentMinute === 0) {
            NotifyNow()
        }

        // Check if it's Saturday and the time is 8:00
        if (currentDay === 6 && currentHour === 8 && currentMinute === 0) {
            NotifyNow();
        }
    }, 60000); // Check every minute
}

export function GetRowsFromExcel(rows: string[][], bot: TgBot, force: boolean) {
    const namesToHandle = rows.length > ROWS_IN_TABLE ?  ROWS_IN_TABLE : rows.length
    for (let i = 1; i < namesToHandle; i++) {
        handleRow(rows[i], bot, force)
        console.log(`Handling ${rows[i]}`)
    }
}

function isToday(row: string) {
    const today = new Date()

    return DateFromString(row).toDateString() === today.toDateString();
}

function handleRow(row: string[], bot: TgBot, force: boolean) { // here is solid is dead. It should return object with audo stuff and sendMsg in another function(S-solid)
    if (!isNaN(Date.parse(row[1]))) { // nolint,please: the most ugly code that I every write
        if (!isToday(row[1]) && !(force && onThisWeek(DateFromString(row[1])))) {
            console.log(`I saw row with not today date - IGNORED ${row[1]}`)
            return
        }
        console.log(row)
        if (row[2] === undefined || row[3] === undefined || row[4] === undefined|| row[5] === undefined) {
            bot.SendMsg(`Привет. Я бот, но у меня что-то сломалось.Однако покажу что нашел в расписании: \n На аппаратуре послужит ${row[2]}. \n На первом микрофоне: ${row[3]}. \nНа втором микрофоне: ${row[4]}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`).then((r) =>
                console.log(r)
            )
        } else {
            bot.SendMsg(`Привет. Я бот на стажировке. Пока я еще не уверен в себе, но уже могу предупредить, что: \n <b>На аппаратуре:</b> ${row[2]} \n <b>На первом микрофоне:</b> ${row[3]} \n <b>На втором микрофоне:</b> ${row[4]} \n<b>Обучение за пультом: </b> ${row[5]}
         \n Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`).then((r) =>
                console.log(r)
            )
        }
    }
}

function onThisWeek(date: Date): boolean {
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const weekToCheck = getWeekNumber(date);

    return currentWeek === weekToCheck;
}

function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function DateFromString(date: string): Date {
    const rowDateArray = date.split('.')

    return new Date(Number(rowDateArray[2]), Number(rowDateArray[1]), Number(rowDateArray[0]))
}