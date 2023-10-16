"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.GetRowsFromExcel = exports.runOnTuesdayAndSaturday = void 0;
var logger_1 = require("../logger/logger");
var moment_1 = require("moment");
var ROWS_IN_TABLE = 11;
function runOnTuesdayAndSaturday(NotifyNow, bot) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setInterval(function () {
                var now = new Date();
                var currentDay = now.getUTCDay();
                var currentHour = now.getHours();
                var currentMinute = now.getUTCMinutes();
                var logWrongTime = function () {
                    logger_1.default.warn("Hm. Skipped recurrent task. Now is just day-".concat(currentDay, ", hour-").concat(currentHour, " and minutes-").concat(currentMinute));
                };
                var isSaturdayEightAM = currentDay === 6 && currentHour === 8 && currentMinute === 0;
                var isTuesdayEightAM = currentDay === 2 && currentHour === 8 && currentMinute === 0;
                // Check if it's Tuesday and the time is 8:00
                if (isSaturdayEightAM || isTuesdayEightAM) {
                    NotifyNow(false, bot.GetRecurrentChatID());
                }
                else {
                    logWrongTime();
                }
            }, 60000); // Check every minute
            return [2 /*return*/];
        });
    });
}
exports.runOnTuesdayAndSaturday = runOnTuesdayAndSaturday;
function GetRowsFromExcel(rows, bot, force) {
    var resultRows = [];
    var namesToHandle = rows.length > ROWS_IN_TABLE ? ROWS_IN_TABLE : rows.length;
    for (var i = 1; i < namesToHandle; i++) {
        var rowObj = handleRow(rows[i], bot, force);
        if (rowObj !== undefined) {
            resultRows.push(rowObj);
        }
    }
    return resultRows;
}
exports.GetRowsFromExcel = GetRowsFromExcel;
function isToday(date) {
    var today = (0, moment_1.default)();
    return today.day() == date.day();
}
function sendNotification(servers, bot, chatID) {
    servers.forEach(function (el) {
        if (el.SoundLearner === undefined || el.Sound === undefined || el.FirstMicrophone === undefined || el.SecondMicrophone === undefined) {
            bot.SendMsg("\u041F\u0440\u0438\u0432\u0435\u0442. \u042F \u0431\u043E\u0442, \u043D\u043E \u0443 \u043C\u0435\u043D\u044F \u0447\u0442\u043E-\u0442\u043E \u0441\u043B\u043E\u043C\u0430\u043B\u043E\u0441\u044C.\u041E\u0434\u043D\u0430\u043A\u043E \u043F\u043E\u043A\u0430\u0436\u0443 \u0447\u0442\u043E \u043D\u0430\u0448\u0435\u043B \u0432 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0438: \n \u041D\u0430 \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u0443\u0440\u0435 \u043F\u043E\u0441\u043B\u0443\u0436\u0438\u0442 ".concat(el.Sound, ". \n \u041D\u0430 \u043F\u0435\u0440\u0432\u043E\u043C \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D\u0435: ").concat(el.FirstMicrophone, ". \n\u041D\u0430 \u0432\u0442\u043E\u0440\u043E\u043C \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D\u0435: ").concat(el.SecondMicrophone, ".\n         \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0434\u0438,\u0435\u0441\u043B\u0438 \u0443 \u0442\u0435\u0431\u044F \u043D\u0435\u0442 \u0442\u0430\u043A\u043E\u0439 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438."), chatID).then(function (r) {
                return logger_1.default.info(r);
            });
        }
        else {
            var msg_1 = "\u041F\u0440\u0438\u0432\u0435\u0442. \u042F \u0431\u043E\u0442 \u043D\u0430 \u0441\u0442\u0430\u0436\u0438\u0440\u043E\u0432\u043A\u0435. \u041F\u043E\u043A\u0430 \u044F \u0435\u0449\u0435 \u043D\u0435 \u0443\u0432\u0435\u0440\u0435\u043D \u0432 \u0441\u0435\u0431\u0435, \u043D\u043E \u0443\u0436\u0435 \u043C\u043E\u0433\u0443 \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0434\u0438\u0442\u044C, \u0447\u0442\u043E: \n <b>\u041D\u0430 \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u0443\u0440\u0435:</b> ".concat(el.Sound, " \n <b>\u041D\u0430 \u043F\u0435\u0440\u0432\u043E\u043C \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D\u0435:</b> ").concat(el.FirstMicrophone, " \n <b>\u041D\u0430 \u0432\u0442\u043E\u0440\u043E\u043C \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D\u0435:</b> ").concat(el.SecondMicrophone, " \n<b>\u041E\u0431\u0443\u0447\u0435\u043D\u0438\u0435 \u0437\u0430 \u043F\u0443\u043B\u044C\u0442\u043E\u043C: </b> ").concat(el.SoundLearner, "\n         \n \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0434\u0438,\u0435\u0441\u043B\u0438 \u0443 \u0442\u0435\u0431\u044F \u043D\u0435\u0442 \u0442\u0430\u043A\u043E\u0439 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438 <b><i>\u0437\u0430\u0440\u0430\u043D\u0435\u0435</i></b>.");
            bot.SendMsg(msg_1, chatID).then(function (r) {
                return logger_1.default.info(r + " send msg \"".concat(msg_1.substring(0, 10), "...\" for ").concat(chatID));
            });
        }
    });
}
exports.sendNotification = sendNotification;
function handleRow(row, bot, force) {
    var date = (0, moment_1.default)(row[1], "DD-MM-YYYY");
    if (date.isValid()) { // nolint,please: the most ugly code that I every write
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
        logger_1.default.warn("Got schedule for other date: ".concat(row[1]));
        return undefined;
    }
    else {
        console.log("Weird date ".concat(row[1]));
    }
}
function onThisWeek(date) {
    var today = (0, moment_1.default)();
    return date.week() == today.week();
}
