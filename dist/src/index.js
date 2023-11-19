"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const telegram_1 = tslib_1.__importDefault(require("./services/telegram"));
const excelHandler_1 = require("./services/excelHandler");
const config_1 = require("./services/config/config");
const notifer_1 = require("./services/notifier/notifer");
const logger_1 = tslib_1.__importDefault(require("./services/logger/logger"));
require('dotenv').config();
async function main() {
    const config = (0, config_1.GetConfig)();
    if (config === undefined) {
        process.exit(1);
    }
    const tgBot = new telegram_1.default(config.TelegramToken);
    const scheduleOptions = {
        audioMinistersOn: true,
        stewardsOn: true,
        force: false,
        debugChatID: tgBot.debugChatID
    };
    const NotifyNow = async (scheduleOptions) => {
        await (0, excelHandler_1.GetRows)(config.SpreadSheetID, 'credentials.json').then((data) => {
            if (data != null) {
                let rows = (0, notifer_1.ConvertRows)(data.data.values);
                (0, notifer_1.sendNotification)(rows, tgBot, scheduleOptions);
            }
            else {
                logger_1.default.info('Here is nothing inside');
            }
        });
    };
    tgBot.SetNotifyCallback(NotifyNow);
    tgBot.Run();
    logger_1.default.info('Bot is started');
    await (0, notifer_1.runOnTuesdayAndSaturday)(NotifyNow, tgBot);
}
main();
//# sourceMappingURL=index.js.map