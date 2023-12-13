import TgBot from "./services/telegram";
import {GetRows as GetRowsFromExcel} from "./services/excelHandler";
import {GetConfig} from "./services/config/config";
import {ConvertRows, runOnTuesdayAndSaturday, ScheduleOptions, sendNotification} from "./services/notifier/notifer";
import logger from "./services/logger/logger";

require('dotenv').config()

async function main() {
    const config = GetConfig()
    if (config === undefined) {
        process.exit(1)
    }

    const tgBot = new TgBot(config.TelegramToken)

    const scheduleOptions: ScheduleOptions = {
        audioMinistersOn: true,
        stewardsOn: true,
        force: false,
        debugChatID: tgBot.debugChatID
    }

    const NotifyNow = async (scheduleOptions: ScheduleOptions) => {
        await GetRowsFromExcel(config.SpreadSheetID, 'credentials.json').then((data) => {
            if (data != null) {
                let rows = ConvertRows(data.data.values)
                sendNotification(rows, tgBot, scheduleOptions)
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

