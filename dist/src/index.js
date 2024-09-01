"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const telegram_1 = tslib_1.__importDefault(require("./services/telegram"));
const excelHandler_1 = require("./services/excelHandler");
const config_1 = require("./services/config/config");
const notifer_1 = require("./services/notifier/notifer");
const logger_1 = tslib_1.__importDefault(require("./services/logger/logger"));
const moment_1 = tslib_1.__importDefault(require("moment"));
require("moment/locale/ru");
require('dotenv').config();
const _credentialsFile = 'credentials.json';
const _ministersFilenameExcel = 'График распорядителей';
async function main() {
    const config = (0, config_1.GetConfig)();
    if (config === undefined) {
        process.exit(1);
    }
    const tgBot = new telegram_1.default(config.TelegramToken);
    const NotifyNow = async (scheduleOptions) => {
        try {
            const rawMinisters = await (0, excelHandler_1.GetSpreadsheet)(config.MinisterSheetID, _ministersFilenameExcel, _credentialsFile);
            logger_1.default.info("Got data from Excel for ministers");
            const rawSpeakers = await (0, excelHandler_1.GetSpreadsheet)(config.SpeakerSheetID, getSpeakerRange(), _credentialsFile);
            logger_1.default.info("Got data from Excel for ministers");
            if (rawMinisters == null || rawSpeakers == null) {
                logger_1.default.error("No data in excel fro ministers");
                return;
            }
            (0, notifer_1.sendNotification)((0, notifer_1.SpeakerScheduleFromRawRows)(rawSpeakers.data.values), (0, notifer_1.MinisterScheduleFromRawRows)(rawMinisters.data.values), tgBot, scheduleOptions);
        }
        catch (error) {
            logger_1.default.error("error fetching rows from excel:", error);
            return;
        }
    };
    tgBot.SetNotifyCallback(NotifyNow);
    tgBot.Run();
    logger_1.default.info('Bot is started');
    await (0, notifer_1.runOnTuesdayAndSaturday)(NotifyNow, tgBot);
}
function getSpeakerRange() {
    moment_1.default.locale('ru');
    return (0, moment_1.default)().format('MMMM YYYY') + "!A1:H124";
}
main();
//# sourceMappingURL=index.js.map