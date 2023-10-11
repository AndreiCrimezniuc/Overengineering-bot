"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRowsFromExcel = exports.runOnTuesdayAndSaturday = void 0;
const ROWS_IN_TABLE = 11;
async function runOnTuesdayAndSaturday(NotifyNow) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();
        if (currentDay === 2 && currentHour === 8 && currentMinute === 0) {
            NotifyNow();
        }
        if (currentDay === 6 && currentHour === 8 && currentMinute === 0) {
            NotifyNow();
        }
    }, 60000);
}
exports.runOnTuesdayAndSaturday = runOnTuesdayAndSaturday;
function GetRowsFromExcel(rows, bot, force) {
    const namesToHandle = rows.length > ROWS_IN_TABLE ? ROWS_IN_TABLE : rows.length;
    for (let i = 1; i < namesToHandle; i++) {
        handleRow(rows[i], bot, force);
        console.log(`Handling ${rows[i]}`);
    }
}
exports.GetRowsFromExcel = GetRowsFromExcel;
function isToday(row) {
    const today = new Date();
    return DateFromString(row).toDateString() === today.toDateString();
}
function handleRow(row, bot, force) {
    if (!isNaN(Date.parse(row[1]))) {
        if (!isToday(row[1]) && !(force && onThisWeek(DateFromString(row[1])))) {
            console.log(`I saw row with not today date - IGNORED ${row[1]}`);
            return;
        }
        console.log(row);
        if (row[2] === undefined || row[3] === undefined || row[4] === undefined || row[5] === undefined) {
            bot.SendMsg(`Привет. Я бот, но у меня что-то сломалось.Однако покажу что нашел в расписании: \n На аппаратуре послужит ${row[2]}. \n На первом микрофоне: ${row[3]}. \nНа втором микрофоне: ${row[4]}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`).then((r) => console.log(r));
        }
        else {
            bot.SendMsg(`Привет. Я бот на стажировке. Пока я еще не уверен в себе, но уже могу предупредить, что: \n <b>На аппаратуре:</b> ${row[2]} \n <b>На первом микрофоне:</b> ${row[3]} \n <b>На втором микрофоне:</b> ${row[4]} \n<b>Обучение за пультом: </b> ${row[5]}
         \n Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`).then((r) => console.log(r));
        }
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
    return new Date(Number(rowDateArray[2]), Number(rowDateArray[1]), Number(rowDateArray[0]));
}
//# sourceMappingURL=notifer.js.map