"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTuesdayOrSaturday = exports.sendMinisterNotification = exports.sendGivenNotification = exports.ConvertRows = exports.runOnTuesdayAndSaturday = exports.handleMinisterNotification = void 0;
const tslib_1 = require("tslib");
const logger_1 = tslib_1.__importDefault(require("../logger/logger"));
const moment_1 = tslib_1.__importDefault(require("moment"));
const excelHandler_1 = require("../excelHandler");
const AUDIO_TEAM_ROW_NUMBER = 11;
const SECURITY_TEAM_ROW_START = 16;
const SECURITY_TEAM_ROW_END = 25;
async function handleMinisterNotification(config, tgBot, scheduleOptions) {
    await (0, excelHandler_1.GetRows)(config.SpreadSheetID, 'credentials.json').then((data) => {
        if (data != null) {
            let Ministers = ConvertRows(data.data.values);
            sendMinisterNotification(Ministers, tgBot, scheduleOptions);
        }
        else {
            sendGivenNotification("no data in excel", tgBot, tgBot.debugChatID);
            logger_1.default.warn('Here is nothing inside');
        }
    });
}
exports.handleMinisterNotification = handleMinisterNotification;
async function runOnTuesdayAndSaturday(bot, config) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours() + 2;
        const currentMinute = now.getUTCMinutes();
        const isSaturdayEightAM = currentDay === 6 && currentHour === 10 && currentMinute === 15;
        const isTuesdayEightAM = currentDay === 2 && currentHour === 10 && currentMinute === 15;
        if (isSaturdayEightAM || isTuesdayEightAM) {
            handleMinisterNotification(config, bot, {
                securityOn: true,
                debugChatID: bot.debugChatID,
                chatID: bot.GetRecurrentChatID()
            });
        }
        else if (currentMinute === 0) {
            logger_1.default.info(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`);
        }
    }, 60000);
}
exports.runOnTuesdayAndSaturday = runOnTuesdayAndSaturday;
function ConvertRows(rows) {
    let Ministers = {
        AudioTeamSchedule: [],
        SecuritySchedule: [],
    };
    const rowsToHandle = rows.length > SECURITY_TEAM_ROW_END ? SECURITY_TEAM_ROW_END : rows.length;
    for (let i = 1; i < rowsToHandle; i++) {
        if (i < AUDIO_TEAM_ROW_NUMBER) {
            let rowObj = convertAudioTeamRows(rows[i]);
            if (rowObj !== undefined) {
                Ministers.AudioTeamSchedule.push(rowObj);
            }
        }
        if (i >= SECURITY_TEAM_ROW_START - 1 && i <= SECURITY_TEAM_ROW_END - 1) {
            let rowObj = convertSecurityTeam(rows[i]);
            if (rowObj !== undefined) {
                Ministers.SecuritySchedule.push(rowObj);
            }
        }
    }
    return Ministers;
}
exports.ConvertRows = ConvertRows;
function HandleBrokenSchedule(bot, filteredMinisters, i, securitySchedule, scheduleOptions) {
    bot.sendMsg(`Привет. Кажется расписание составлено не полностью, либо я сломался.
           \n <b>На аппаратуре</b> послужит ${filteredMinisters.AudioTeamSchedule[i].Sound}. \n
            <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule[i].FirstMicrophone}. \n
            <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule[i].SecondMicrophone}. \n
         
            <b>Распорядители:</b>  \n
            <b>Зал:</b> ${securitySchedule === null || securitySchedule === void 0 ? void 0 : securitySchedule.Hall} \n
            <b>Вход:</b>  ${securitySchedule === null || securitySchedule === void 0 ? void 0 : securitySchedule.Entrance}
            }
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, scheduleOptions.debugChatID).then((r) => logger_1.default.info(r));
}
function HandleSendingSuccessfulSchedule(filteredMinisters, i, securitySchedule, bot, scheduleOptions) {
    let msg = `
Привет. Напоминание на сегодня \n 
    <b>На аппаратуре:</b> ${filteredMinisters.AudioTeamSchedule[i].Sound} 
    <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule[i].FirstMicrophone} 
    <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule[i].SecondMicrophone} 
    <b>Обучение за пультом: </b> ${filteredMinisters.AudioTeamSchedule[i].SoundLearner} \n `;
    let securityMsg = "";
    if (securitySchedule !== undefined &&
        securitySchedule.Entrance !== undefined &&
        securitySchedule.Hall !== undefined) {
        securityMsg = `\nРаспорядители:  
    <b>Зал:</b> ${securitySchedule.Hall}
    <b>Вход:</b> ${securitySchedule.Entrance} \n`;
    }
    const warningMsg = `Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`;
    bot.sendMsg(msg + securityMsg + warningMsg, scheduleOptions.chatID).then((r) => logger_1.default.info(r + ` send msg "${msg.substring(0, 10)}..." for ${scheduleOptions.chatID}`));
}
function sendGivenNotification(notification, bot, chat) {
    try {
        bot.sendMsg(notification, chat).then((r) => logger_1.default.info(r));
    }
    catch (e) {
        logger_1.default.error(e, "Some problem with sending given notification");
    }
}
exports.sendGivenNotification = sendGivenNotification;
function sendMinisterNotification(ministers, bot, scheduleOptions) {
    var _a;
    const filteredMinisters = FilterMinisterRowsByCriteria(ministers, (_a = scheduleOptions.force) !== null && _a !== void 0 ? _a : false);
    for (let i = 0; i < filteredMinisters.AudioTeamSchedule.length; i++) {
        let securitySchedule = undefined;
        if (scheduleOptions.securityOn) {
            securitySchedule = GetSecurityScheduleByDate(filteredMinisters.AudioTeamSchedule[i].Date, ministers);
        }
        if (filteredMinisters.AudioTeamSchedule[i].SoundLearner === undefined ||
            filteredMinisters.AudioTeamSchedule[i].Sound === undefined ||
            filteredMinisters.AudioTeamSchedule[i].FirstMicrophone === undefined ||
            filteredMinisters.AudioTeamSchedule[i].SecondMicrophone === undefined) {
            HandleBrokenSchedule(bot, filteredMinisters, i, securitySchedule, scheduleOptions);
            continue;
        }
        HandleSendingSuccessfulSchedule(filteredMinisters, i, securitySchedule, bot, scheduleOptions);
        return;
    }
}
exports.sendMinisterNotification = sendMinisterNotification;
function GetSecurityScheduleByDate(date, m) {
    for (let i = 0; i < m.SecuritySchedule.length; i++) {
        if (date.isSame(m.SecuritySchedule[i].Date)) {
            return m.SecuritySchedule[i];
        }
    }
}
function convertSecurityTeam(row) {
    const date = (0, moment_1.default)(row[1], "DD-MM-YYYY");
    if (date.isValid() && row[2] && row[3]) {
        logger_1.default.info(`converted raw as valid by date for ${date}`);
        return {
            Date: date,
            Hall: MicrophoneDictionary(row[2]),
            Entrance: MicrophoneDictionary(row[3])
        };
    }
}
function convertAudioTeamRows(row) {
    const date = (0, moment_1.default)(row[1], "DD-MM-YYYY");
    if (date.isValid() && row[2] && row[3] && row[4] && row[5]) {
        logger_1.default.info(`converted raw as valid by date for ${date}`);
        return {
            Date: date,
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
    const filterCallBack = (m) => {
        if (force && onThisWeek(m.Date)) {
            return true;
        }
        if (!force && onThisWeek(m.Date) && isTuesdayOrSaturday(m.Date)) {
            return true;
        }
    };
    ministers.AudioTeamSchedule = ministers.AudioTeamSchedule.filter((filterCallBack));
    ministers.SecuritySchedule = ministers.SecuritySchedule.filter(filterCallBack);
    return ministers;
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