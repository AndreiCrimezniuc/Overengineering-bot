"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.GetRowsFromExcel = exports.runOnTuesdayAndSaturday = void 0;
const tslib_1 = require("tslib");
const logger_1 = tslib_1.__importDefault(require("../logger/logger"));
const moment_1 = tslib_1.__importDefault(require("moment"));
const ROWS_IN_TABLE = 11;
async function runOnTuesdayAndSaturday(NotifyNow, bot) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getHours();
        const currentMinute = now.getUTCMinutes();
        const logWrongTime = () => {
            logger_1.default.warn(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`);
        };
        const isSaturdayEightAM = currentDay === 6 && currentHour === 8 && currentMinute === 0;
        const isTuesdayEightAM = currentDay === 2 && currentHour === 8 && currentMinute === 0;
        if (isSaturdayEightAM || isTuesdayEightAM) {
            NotifyNow(false, bot.GetRecurrentChatID());
        }
        else if (currentMinute === 0) {
            logWrongTime();
        }
    }, 60000);
}
exports.runOnTuesdayAndSaturday = runOnTuesdayAndSaturday;
function GetRowsFromExcel(rows, bot, force) {
    let resultRows = [];
    const namesToHandle = rows.length > ROWS_IN_TABLE ? ROWS_IN_TABLE : rows.length;
    for (let i = 1; i < namesToHandle; i++) {
        let rowObj = handleRow(rows[i], bot, force);
        if (rowObj !== undefined) {
            resultRows.push(rowObj);
        }
    }
    return resultRows;
}
exports.GetRowsFromExcel = GetRowsFromExcel;
function isToday(date) {
    const today = (0, moment_1.default)();
    console.log(`Its today today = ${today.dayOfYear()} and the date is ${date.dayOfYear()}`);
    return today.dayOfYear() == date.dayOfYear();
}
function sendNotification(servers, bot, chatID) {
    servers.forEach((el) => {
        if (el.SoundLearner === undefined || el.Sound === undefined || el.FirstMicrophone === undefined || el.SecondMicrophone === undefined) {
            bot.SendMsg(`Привет. Я бот, но у меня что-то сломалось.Однако покажу что нашел в расписании: \n На аппаратуре послужит ${el.Sound}. \n На первом микрофоне: ${el.FirstMicrophone}. \nНа втором микрофоне: ${el.SecondMicrophone}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, chatID).then((r) => logger_1.default.info(r));
        }
        else {
            let msg = `Привет. Я бот на стажировке. Пока я еще не уверен в себе, но уже могу предупредить, что: \n <b>На аппаратуре:</b> ${el.Sound} \n <b>На первом микрофоне:</b> ${el.FirstMicrophone} \n <b>На втором микрофоне:</b> ${el.SecondMicrophone} \n<b>Обучение за пультом: </b> ${el.SoundLearner}
         \n Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`;
            bot.SendMsg(msg, chatID).then((r) => logger_1.default.info(r + ` send msg "${msg.substring(0, 10)}..." for ${chatID}`));
        }
    });
}
exports.sendNotification = sendNotification;
function handleRow(row, bot, force) {
    const date = (0, moment_1.default)(row[1], "DD-MM-YYYY");
    if (date.isValid()) {
        if (isToday(date) || (force && onThisWeek(date))) {
            logger_1.default.info("Got correct schedule for current week");
            return {
                date: date,
                Sound: row[2],
                FirstMicrophone: row[3],
                SecondMicrophone: row[4],
                SoundLearner: row[5]
            };
        }
        logger_1.default.warn(`Got schedule for other date: ${row[1]}`);
        return undefined;
    }
    else {
        console.log(`Weird date ${row[1]}`);
    }
}
function onThisWeek(date) {
    const today = (0, moment_1.default)();
    return date.week() == today.week();
}
//# sourceMappingURL=notifer.js.map