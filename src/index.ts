import TgBot from "./services/telegram";
import {GetRows as GetRowsFromExcel} from "./services/excelHandler";
import {GetConfig} from "./services/config/config";
import {ConvertRows, runOnTuesdayAndSaturday, sendNotification} from "./services/notifier/notifer";
import logger from "./services/logger/logger";
import moment from "moment/moment";
import {copyFileSync} from "fs";

require('dotenv').config()

async function main() {
    const config = GetConfig()
    if (config === undefined) {
        process.exit(1)
    }

    const tgBot = new TgBot(config.TelegramToken)

    const NotifyNow = async (force: boolean = false, chatID?:number) => {
        await GetRowsFromExcel(config.SpreadSheetID, 'credentials.json').then((data) => {
            if (data != null) {
                let rows = ConvertRows(data.data.values, tgBot, force) // toDo: Need to parse this data and add it in database and then pull it from database until we have actual data. Now we pull it every time
                sendNotification(rows, tgBot, force, chatID)
            } else {
                logger.info('Here is nothing inside')
            }
        })
    }

    tgBot.SetNotifyCallback(NotifyNow)
    tgBot.Run()

    logger.info('Bot is started')

    await runOnTuesdayAndSaturday(NotifyNow, tgBot)  //IDK weird of course, it needs to think about it
}

main()

