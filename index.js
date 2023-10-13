"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const telegram_1 = tslib_1.__importDefault(require("./src/services/telegram"));
const excelHandler_1 = require("./src/services/excelHandler");
const config_1 = require("./src/services/config/config");
const notifer_1 = require("./src/services/notifier/notifer");
require('dotenv').config();
async function main() {
    const config = (0, config_1.GetConfig)();
    if (config === undefined) {
        process.exit(1);
    }
    const tgBot = new telegram_1.default(config.TelegramToken);
    const NotifyNow = async () => {
        await (0, excelHandler_1.GetRows)(config.SpreadSheetID, 'credentials.json').then((data) => {
            if (data != null) {
                (0, notifer_1.handleRowsFromExcel)(data.data.values, tgBot);
            }
            else {
                console.error('Here is nothing inside');
            }
        });
    };
    tgBot.SetNotifyCallback(NotifyNow);
    tgBot.Run();
    console.log('Bot is started');
    await (0, notifer_1.runOnTuesdayAndSaturday)(NotifyNow);
}
main();
//# sourceMappingURL=index.js.map