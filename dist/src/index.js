"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const telegram_1 = tslib_1.__importDefault(require("./services/telegram"));
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
    tgBot.invokeEvents(config);
    logger_1.default.info('Bot is started');
    await (0, notifer_1.runOnTuesdayAndSaturday)(tgBot, config);
}
main();
//# sourceMappingURL=index.js.map