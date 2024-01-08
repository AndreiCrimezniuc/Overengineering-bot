"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTuesdayOrSaturday = exports.sendNotification = exports.ConvertRows = exports.runOnTuesdayAndSaturday = void 0;
const tslib_1 = require("tslib");
const logger_1 = tslib_1.__importDefault(require("../logger/logger"));
const moment_1 = tslib_1.__importDefault(require("moment"));
const ROWS_IN_TABLE_AUDIO_MINISTERS = 11;
async function runOnTuesdayAndSaturday(NotifyNow, bot) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours() + 2;
        const currentMinute = now.getUTCMinutes();
        const logWrongTime = () => {
            logger_1.default.warn(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`);
        };
        const isSaturdayEightAM = currentDay === 6 && currentHour === 10 && currentMinute === 15;
        const isTuesdayEightAM = currentDay === 2 && currentHour === 10 && currentMinute === 15;
        if (isSaturdayEightAM || isTuesdayEightAM) {
            const scheduleOptions = {
                audioMinistersOn: true,
                stewardsOn: true,
                debugChatID: bot.debugChatID,
                chatID: bot.GetRecurrentChatID()
            };
            NotifyNow(scheduleOptions);
        }
        else if (currentMinute === 0) {
            logWrongTime();
        }
    }, 60000);
}
exports.runOnTuesdayAndSaturday = runOnTuesdayAndSaturday;
function ConvertRows(rows) {
    let resultRows = [];
    const namesToHandle = rows.length > ROWS_IN_TABLE_AUDIO_MINISTERS ? ROWS_IN_TABLE_AUDIO_MINISTERS : rows.length;
    for (let i = 1; i < namesToHandle; i++) {
        let rowObj = convertRow(rows[i]);
        if (rowObj !== undefined) {
            resultRows.push(rowObj);
        }
    }
    return resultRows;
}
exports.ConvertRows = ConvertRows;
function sendNotification(ministers, bot, scheduleOptions) {
    var _a;
    const filteredMinisters = FilterMinisterRowsByCriteria(ministers, (_a = scheduleOptions.force) !== null && _a !== void 0 ? _a : false);
    filteredMinisters.forEach((m) => {
        if (m.SoundLearner === undefined || m.Sound === undefined || m.FirstMicrophone === undefined || m.SecondMicrophone === undefined) {
            bot.SendMsg(`Привет. Я бот, но у меня что-то сломалось.Однако покажу что нашел в расписании: \n На аппаратуре послужит ${m.Sound}. \n На первом микрофоне: ${m.FirstMicrophone}. \nНа втором микрофоне: ${m.SecondMicrophone}.
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, scheduleOptions.debugChatID).then((r) => logger_1.default.info(r));
        }
        else {
            let msg = `Привет. Напоминание на сегодня \n <b>На аппаратуре:</b> ${m.Sound} \n <b>На первом микрофоне:</b> ${m.FirstMicrophone} \n <b>На втором микрофоне:</b> ${m.SecondMicrophone} \n<b>Обучение за пультом: </b> ${m.SoundLearner}
         \n Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`;
            bot.SendMsg(msg, scheduleOptions.chatID).then((r) => logger_1.default.info(r + ` send msg "${msg.substring(0, 10)}..." for ${scheduleOptions.chatID}`));
        }
    });
}
exports.sendNotification = sendNotification;
function convertRow(row) {
    const date = (0, moment_1.default)(row[1], "DD-MM-YYYY");
    if (date.isValid() && row[2] && row[3] && row[4] && row[5]) {
        logger_1.default.info(`converted raw as valid by date for ${date}`);
        return {
            date: date,
            Sound: MicrophoneDictionary(row[2]),
            FirstMicrophone: MicrophoneDictionary(row[3]),
            SecondMicrophone: MicrophoneDictionary(row[4]),
            SoundLearner: MicrophoneDictionary(row[5])
        };
    }
}
function onThisWeek(date) {
    const today = (0, moment_1.default)();
    return date.isoWeek() == today.isoWeek();
}
function isTuesdayOrSaturday(date) {
    return [2, 6].includes(date.day());
}
exports.isTuesdayOrSaturday = isTuesdayOrSaturday;
function FilterMinisterRowsByCriteria(ministers, force) {
    return ministers.filter((m) => {
        if (force && onThisWeek(m.date)) {
            return true;
        }
        if (!force && onThisWeek(m.date) && isTuesdayOrSaturday(m.date)) {
            return true;
        }
    });
}
function MicrophoneDictionary(s) {
    var _a;
    const ministersDictionary = new Map;
    ministersDictionary.set("Белоусов Н.", "@tokimedo");
    ministersDictionary.set("Кавлюк И.", "@cavliman");
    ministersDictionary.set("Кримезнюк А.", "@Andrei_crimezniuc");
    ministersDictionary.set("Масленников Д.", "@dantes024");
    ministersDictionary.set("Родионов И.", "@bellylollipop");
    ministersDictionary.set("Гарбузарь В.", "Гарбузарь В.");
    ministersDictionary.set("Жокот С.", "Жокот С.");
    ministersDictionary.set("Курка А.", "@Endrus_Rare");
    ministersDictionary.set("Кутуряну К.", "@constantincutureanu");
    ministersDictionary.set("Маноле М.", "@Max_Manole");
    ministersDictionary.set("Русановский Р.", "@rosinrusanovschi");
    ministersDictionary.set("Сахечидзе Г.", "Сахечидзе Г.");
    ministersDictionary.set("Смоляк Д.", "Смоляк Д.");
    ministersDictionary.set("Страшник А.", "@AurelStrashnik");
    ministersDictionary.set("Флянку Я.", "@your_pixel");
    ministersDictionary.set("Чухненко В.", "Чухненко В.");
    ministersDictionary.set("Нагурня М.", "Нагурня М.");
    ministersDictionary.set("Русановский В.", "Русановский В.");
    return (_a = ministersDictionary.get(s)) !== null && _a !== void 0 ? _a : s;
}
//# sourceMappingURL=notifer.js.map