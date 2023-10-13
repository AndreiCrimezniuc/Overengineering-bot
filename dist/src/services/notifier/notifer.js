"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.GetRowsFromExcel = exports.runOnTuesdayAndSaturday = void 0;
const ROWS_IN_TABLE = 11;
async function runOnTuesdayAndSaturday(NotifyNow, bot) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();
        if (currentDay === 2 && currentHour === 8 && currentMinute === 0) {
            NotifyNow(false, bot.GetRecurrentChatID());
        }
        if (currentDay === 6 && currentHour === 8 && currentMinute === 0) {
            NotifyNow(false, bot.GetRecurrentChatID());
        }
    }, 60000);
}
exports.runOnTuesdayAndSaturday = runOnTuesdayAndSaturday;
function GetRowsFromExcel(rows, bot, force) {
    let resultRows = [];
    const namesToHandle = rows.length > ROWS_IN_TABLE ? ROWS_IN_TABLE : rows.length;
    for (let i = 1; i < namesToHandle; i++) {
        let rowObj = handleRow(rows[i], bot, force);
        rowObj ? resultRows.push(rowObj) : console.log("found broken raw");
    }
    return resultRows;
}
exports.GetRowsFromExcel = GetRowsFromExcel;
function isToday(row) {
    const today = new Date();
    return DateFromString(row).toDateString() === today.toDateString();
}
function sendNotification(servers, bot, chatID) {
    servers.forEach((el) => {
        if (el.SoundLearner === undefined || el.Sound === undefined || el.FirstMicrophone === undefined || el.SecondMicrophone === undefined) {
            bot.SendMsg(`Привет. Я бот, но у меня что-то сломалось.Однако покажу что нашел в расписании: \n На аппаратуре послужит ${el.Sound}. \n На первом микрофоне: ${el.FirstMicrophone}. \nНа втором микрофоне: ${el.SecondMicrophone}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, chatID).then((r) => console.log(r));
        }
        else {
            bot.SendMsg(`Привет. Я бот на стажировке. Пока я еще не уверен в себе, но уже могу предупредить, что: \n <b>На аппаратуре:</b> ${el.Sound} \n <b>На первом микрофоне:</b> ${el.FirstMicrophone} \n <b>На втором микрофоне:</b> ${el.SecondMicrophone} \n<b>Обучение за пультом: </b> ${el.SoundLearner}
         \n Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`, chatID).then((r) => console.log(r));
        }
    });
}
exports.sendNotification = sendNotification;
function handleRow(row, bot, force) {
    const date = Date.parse(row[1]);
    if (!isNaN(date)) {
        if (!isToday(row[1]) && !(force && onThisWeek(DateFromString(row[1])))) {
            console.log(`I saw row with not today date - IGNORED ${row[1]}`);
            return undefined;
        }
        return {
            date: new Date(row[1]),
            Sound: row[2],
            FirstMicrophone: row[3],
            SecondMicrophone: row[4],
            SoundLearner: row[5]
        };
    }
}
function onThisWeek(date) {
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const weekToCheck = getWeekNumber(date);
    return currentWeek === weekToCheck;
}
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
function DateFromString(date) {
    const rowDateArray = date.split('.');
    return new Date(Number(rowDateArray[2]), Number(rowDateArray[1]) - 1, Number(rowDateArray[0]));
}
//# sourceMappingURL=notifer.js.map