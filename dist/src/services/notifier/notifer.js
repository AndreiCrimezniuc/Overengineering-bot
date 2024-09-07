"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestMinistersSchedule = exports.isTuesday = exports.isTuesdayOrSaturday = exports.sendNotification = exports.MinisterScheduleFromRawRows = exports.SpeakerScheduleFromRawRows = exports.runOnTuesdayAndSaturday = void 0;
const tslib_1 = require("tslib");
const logger_1 = tslib_1.__importDefault(require("../logger/logger"));
const moment_1 = tslib_1.__importDefault(require("moment"));
async function runOnTuesdayAndSaturday(NotifyNow, bot) {
    setInterval(() => {
        const now = new Date();
        const currentDay = now.getUTCDay();
        const currentHour = now.getUTCHours() + 2;
        const currentMinute = now.getUTCMinutes();
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
            logger_1.default.warn(`Hm. Skipped recurrent task. Now is just day-${currentDay}, hour-${currentHour} and minutes-${currentMinute}`);
        }
    }, 60000);
}
exports.runOnTuesdayAndSaturday = runOnTuesdayAndSaturday;
function SpeakerScheduleFromRawRows(rows) {
    let todayDateLine = 0;
    let nextDateLine = 0;
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] !== undefined && (0, moment_1.default)(rows[i][1], 'DD.MM.YYYY').isSame((0, moment_1.default)().add(1, 'days'), 'day')) {
            todayDateLine = i;
            logger_1.default.info("Got line where to start :" + todayDateLine);
        }
        if (rows[i][1] !== undefined && (0, moment_1.default)(rows[i][1], 'DD.MM.YYYY').isSame((0, moment_1.default)().add(6, 'days'), 'day')) {
            nextDateLine = i;
            logger_1.default.info("Got line where to end :" + nextDateLine);
            break;
        }
    }
    if (todayDateLine == 0 && nextDateLine == 0) {
        logger_1.default.info("Got nothing about speakers in excel");
        return undefined;
    }
    let schedule = {
        Date: (0, moment_1.default)()
    };
    for (let i = todayDateLine; i <= nextDateLine; i++) {
        if (rows[i].some(cell => cell.includes("Председатель:")) && schedule.Chairman === undefined) {
            schedule.Chairman = rows[i][6];
            logger_1.default.info("Got Role: " + rows[i][6]);
        }
        if (rows[i].some(cell => cell.includes("Молитва:")) && schedule.FirstPray === undefined) {
            schedule.FirstPray = rows[i][6];
            logger_1.default.info("Got Role: " + rows[i][6]);
        }
        if (rows[i].some(cell => cell.includes("(10 мин.)")) &&
            rows[i].some(cell => cell.includes("18:36")) &&
            schedule.Speech10min === undefined) {
            schedule.Speech10min = rows[i][6];
            logger_1.default.info("Got Role: " + rows[i][6]);
        }
        if (rows[i].some(cell => cell.includes("Духовные жемчужины")) &&
            rows[i].some(cell => cell.includes("18:46")) &&
            schedule.Gems === undefined) {
            schedule.Gems = rows[i][6];
            logger_1.default.info("Got Role: " + rows[i][6]);
        }
        if (rows[i].some(cell => cell.includes("Изучение Библии в собрании")) &&
            schedule.LeadingBookStudy === undefined) {
            schedule.LeadingBookStudy = rows[i][6];
            logger_1.default.info("Got Role: " + rows[i][6]);
        }
        if (rows[i].some(cell => cell.includes("Изучение Библии в собрании")) &&
            schedule.ReaderBookStudy === undefined) {
            schedule.ReaderBookStudy = rows[i + 1][6];
            logger_1.default.info("Got Role: " + rows[i][6]);
        }
        if (rows[i].some(cell => cell.includes("Молитва:")) &&
            rows[i].some(cell => cell.includes("20:10")) &&
            schedule.LastPray === undefined) {
            schedule.LastPray = rows[i][6];
            logger_1.default.info("Got Role: " + rows[i][6]);
        }
    }
    return schedule;
}
exports.SpeakerScheduleFromRawRows = SpeakerScheduleFromRawRows;
function MinisterScheduleFromRawRows(rows) {
    let Ministers = {
        AudioTeamSchedule: [],
        SecuritySchedule: [],
    };
    let securityRawsStartFrom = 0;
    let securityRawsLength = 15;
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].some(cell => cell.includes("Распорядитель Зал"))) {
            securityRawsStartFrom = i + 1;
            break;
        }
    }
    let AudioTeamRawsEndIn = securityRawsStartFrom - 1;
    for (let i = 0; i < rows.length; i++) {
        if (i <= AudioTeamRawsEndIn) {
            let rowObj = convertAudioTeamRows(rows[i]);
            if (rowObj !== undefined) {
                Ministers.AudioTeamSchedule.push(rowObj);
            }
        }
        if (i >= securityRawsStartFrom && i <= securityRawsStartFrom + securityRawsLength) {
            let rowObj = convertSecurityTeam(rows[i]);
            if (rowObj !== undefined) {
                Ministers.SecuritySchedule.push(rowObj);
            }
        }
    }
    return Ministers;
}
exports.MinisterScheduleFromRawRows = MinisterScheduleFromRawRows;
function HandleBrokenSchedule(bot, filteredMinisters, securitySchedule, scheduleOptions) {
    bot.SendMsg(`Привет. Кажется расписание составлено не полностью, либо я сломался.
           \n <b>На аппаратуре</b> послужит ${filteredMinisters.AudioTeamSchedule.Sound}. \n
            <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.FirstMicrophone}. \n
            <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.SecondMicrophone}. \n
         
            <b>Распорядители:</b>  \n
            <b>Зал:</b> ${securitySchedule === null || securitySchedule === void 0 ? void 0 : securitySchedule.Hall} \n
            <b>Вход:</b>  ${securitySchedule === null || securitySchedule === void 0 ? void 0 : securitySchedule.Entrance}
            }
         Пожалуйста, предупреди,если у тебя нет такой возможности.`, scheduleOptions.debugChatID).then((r) => logger_1.default.info(r));
}
function HandleSendingSuccessfulSchedule(filteredMinisters, filteredSpeaker, securitySchedule, bot, scheduleOptions) {
    let msg = `
Привет. Напоминание на сегодня \n 
    <b>На аппаратуре:</b> ${filteredMinisters.AudioTeamSchedule.Sound} 
    <b>На первом микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.FirstMicrophone} 
    <b>На втором микрофоне:</b> ${filteredMinisters.AudioTeamSchedule.SecondMicrophone} \n`;
    let securityMsg = "";
    if (securitySchedule !== undefined &&
        securitySchedule.Entrance !== undefined &&
        securitySchedule.Hall !== undefined) {
        securityMsg = `\nРаспорядители:  
    <b>Зал:</b> ${securitySchedule.Hall}
    <b>Вход:</b> ${securitySchedule.Entrance} \n`;
    }
    const warningMsg = `Пожалуйста, предупреди,если у тебя нет такой возможности <b><i>заранее</i></b>.`;
    let conflictMsg = "";
    if (securitySchedule != undefined) {
        conflictMsg = isThereConflictsInSchedule(filteredMinisters.AudioTeamSchedule, securitySchedule) ? "\n \n <b> Кажется есть конфликты в расписании</b>" : "";
    }
    msg = msg + securityMsg + warningMsg + conflictMsg;
    msg = handleSpeakerMsg(msg, filteredSpeaker);
    bot.SendMsg(msg, scheduleOptions.chatID).then((r) => logger_1.default.info(r + ` send msg "${msg.substring(0, 10)}..." for ${scheduleOptions.chatID}`));
}
function isThereConflictsInSchedule(audioTeam, st) {
    return audioTeam.FirstMicrophone === st.Hall || audioTeam.SecondMicrophone === st.Hall || audioTeam.Sound === st.Hall ||
        audioTeam.FirstMicrophone === st.Entrance || audioTeam.SecondMicrophone === st.Entrance || audioTeam.Sound === st.Entrance;
}
function sendNotification(speakers, ministers, bot, scheduleOptions) {
    var _a;
    const filteredMinisters = FilterMinisterRowsByCriteria(ministers, (_a = scheduleOptions.force) !== null && _a !== void 0 ? _a : false);
    const securitySchedule = GetSecurityScheduleByDate((0, moment_1.default)(), ministers);
    if (NotificateThatYouHaveSomethingBroken(filteredMinisters, speakers, securitySchedule, scheduleOptions, bot)) {
        return;
    }
    HandleSendingSuccessfulSchedule(filteredMinisters, speakers, securitySchedule, bot, scheduleOptions);
    return;
}
exports.sendNotification = sendNotification;
function handleSpeakerMsg(msg, filteredSpeaker) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (filteredSpeaker == undefined) {
        return msg;
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
             <b> Председатель: </b> ${MicrophoneDictionary((_a = filteredSpeaker.Chairman) !== null && _a !== void 0 ? _a : "")} \n
             <b> Первая молитва: </b> ${MicrophoneDictionary((_b = filteredSpeaker.FirstPray) !== null && _b !== void 0 ? _b : "")}\n
             <b> 10 минутная речь: </b> ${MicrophoneDictionary((_c = filteredSpeaker.Speech10min) !== null && _c !== void 0 ? _c : "")}\n
             <b> Жемчужины: </b> ${MicrophoneDictionary((_d = filteredSpeaker.Gems) !== null && _d !== void 0 ? _d : "")}\n
             <b> Изучение библии:</b> ${MicrophoneDictionary((_e = filteredSpeaker.LeadingBookStudy) !== null && _e !== void 0 ? _e : "")}\n
             <b> Чтец на изучении библии: </b> ${MicrophoneDictionary((_f = filteredSpeaker.ReaderBookStudy) !== null && _f !== void 0 ? _f : "")}\n
             <b> Последняя молитва: </b> ${MicrophoneDictionary((_g = filteredSpeaker.LastPray) !== null && _g !== void 0 ? _g : "")}\n
             <b> Дата -  </b> ${filteredSpeaker.Date.format("DD.MM.YYYY")} 
        `;
    }
    return msg;
}
function NotificateThatYouHaveSomethingBroken(ministers, speaker, security, options, bot) {
    if (ministers.AudioTeamSchedule.Sound === undefined ||
        ministers.AudioTeamSchedule.FirstMicrophone === undefined ||
        ministers.AudioTeamSchedule.SecondMicrophone === undefined) {
        HandleBrokenSchedule(bot, ministers, security, options);
        return true;
    }
    else {
        return false;
    }
}
function GetSecurityScheduleByDate(date, m) {
    if (m.SecuritySchedule.length == 0) {
        logger_1.default.info("No security schedule found in excel");
        return undefined;
    }
    for (let i = 0; i < m.SecuritySchedule.length; i++) {
        if (date.format("YYYY-MM-DD") === m.SecuritySchedule[i].Date.format("YYYY-MM-DD")) {
            return m.SecuritySchedule[i];
        }
        else {
            logger_1.default.info(`[GetSecurityScheduleByDate] compared ${date.format("YYYY-MM-DD")} with ${m.SecuritySchedule[i].Date.format("YYYY-MM-DD")}`);
        }
    }
    logger_1.default.info(`No security schedule found for ${date.format("YYYY-MM-DD")}`);
}
function convertSecurityTeam(row) {
    const date = (0, moment_1.default)(row[1], "DD-MM-YYYY");
    if (date.isValid() && row[2] && row[3]) {
        return {
            Date: date,
            Hall: MicrophoneDictionary(row[2]),
            Entrance: MicrophoneDictionary(row[3])
        };
    }
}
function convertAudioTeamRows(row) {
    const date = (0, moment_1.default)(row[1], "DD-MM-YYYY");
    if (date.isValid() && row[2] && row[3] && row[4]) {
        return {
            Date: date,
            Sound: MicrophoneDictionary(row[2]),
            FirstMicrophone: MicrophoneDictionary(row[3]),
            SecondMicrophone: MicrophoneDictionary(row[4])
        };
    }
}
function onThisWeek(date) {
    return date.isoWeek() == (0, moment_1.default)().isoWeek();
}
function isTuesdayOrSaturday(date) {
    return [2, 6].includes(date.day());
}
exports.isTuesdayOrSaturday = isTuesdayOrSaturday;
function isTuesday(date) {
    return [2].includes(date.day());
}
exports.isTuesday = isTuesday;
function getLatestMinistersSchedule(ministers) {
    function findLatestValue(schedule) {
        let latestValue = schedule[0];
        for (const item of schedule) {
            if (latestValue === null || item.Date.isAfter(latestValue.Date)) {
                latestValue = item;
            }
        }
        return latestValue;
    }
    const latestAudioTeam = findLatestValue(ministers.AudioTeamSchedule);
    const latestSecurityTeam = findLatestValue(ministers.SecuritySchedule);
    return {
        AudioTeamSchedule: latestAudioTeam,
        SecuritySchedule: latestSecurityTeam
    };
}
exports.getLatestMinistersSchedule = getLatestMinistersSchedule;
function filterMinisters(m, force) {
    if (force && onThisWeek(m.Date)) {
        return true;
    }
    return !force && onThisWeek(m.Date) && isTuesdayOrSaturday(m.Date);
}
function filterSpeaker(m, force) {
    if (force && onThisWeek(m.Date)) {
        return true;
    }
    return !force && onThisWeek(m.Date) && isTuesday(m.Date);
}
function FilterMinisterRowsByCriteria(ministers, force) {
    ministers.AudioTeamSchedule = ministers.AudioTeamSchedule.filter((audioTeam) => filterMinisters(audioTeam, force));
    ministers.SecuritySchedule = ministers.SecuritySchedule.filter((security) => filterMinisters(security, force));
    return getLatestMinistersSchedule(ministers);
}
function MicrophoneDictionary(s) {
    var _a;
    const ministersDictionary = new Map;
    ministersDictionary.set("Белоусов Н.", "@tokimedo");
    ministersDictionary.set("Кавлюк И.", "@cavliman");
    ministersDictionary.set("Кримезнюк А.", "@Andrei_crimezniuc");
    ministersDictionary.set("Масленников Д.", "@dantes024");
    ministersDictionary.set("Родионов И.", "@bellylollipop");
    ministersDictionary.set("Гарбузарь В.", "@Viorelu123");
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
    ministersDictionary.set("Бучушкану Александр", "@Alexandru_Buciuscanu");
    ministersDictionary.set("Кутуряну Константин", "@constantincutureanu");
    ministersDictionary.set("Гарбузарь Виорел", "@Viorelu123");
    ministersDictionary.set("Сахечидзе Георгий", "Сахечидзе Георгий");
    ministersDictionary.set("Смоляк Денис", "@Ds69298805");
    ministersDictionary.set("Кавлюк Игорь", "@cavliman");
    ministersDictionary.set("Маноле Максим", "@Max_Manole");
    ministersDictionary.set("Кримезнюк Андрей", "@Andrei_crimezniuc");
    ministersDictionary.set("Масленников Даниил", "@dantes024");
    ministersDictionary.set("Флянку Ярослав", "@your_pixel");
    ministersDictionary.set("Жокот Сергей", "Сергей Жокот");
    ministersDictionary.set("Страшник Аурел", "@AurelStrashnik");
    ministersDictionary.set("Белоусов Николай", "@tokimedo");
    ministersDictionary.set("Яврумян Алик", "Яврумян Алик");
    return (_a = ministersDictionary.get(s)) !== null && _a !== void 0 ? _a : s;
}
//# sourceMappingURL=notifer.js.map