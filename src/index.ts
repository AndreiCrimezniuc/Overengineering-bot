import TgBot from "./services/telegram";
import {GetSpreadsheet as GetRowsFromExcel} from "./services/excelHandler";
import {GetConfig} from "./services/config/config";
import {
    MinisterScheduleFromRawRows,
    runOnTuesdayAndSaturday,
    ScheduleOptions,
    sendNotification,
    SpeakerScheduleFromRawRows
} from "./services/notifier/notifer";
import logger from "./services/logger/logger";

import moment from 'moment';
import 'moment/locale/ru'; // Import the Russian locale

require('dotenv').config()

const _credentialsFile = 'credentials.json'
const _ministersFilenameExcel = 'График распорядителей'

async function main() {
    const config = GetConfig()
    if (config === undefined) {
        process.exit(1)
    }

    const tgBot = new TgBot(config.TelegramToken)

    const NotifyNow = async (scheduleOptions: ScheduleOptions) => {
        try {
            const rawMinisters = await GetRowsFromExcel(config.MinisterSheetID, _ministersFilenameExcel, _credentialsFile)
            logger.info("Got data from Excel for ministers")

            const rawSpeakers = await GetRowsFromExcel(config.SpeakerSheetID, getSpeakerRange(), _credentialsFile)
            logger.info("Got data from Excel for ministers")

            if (rawMinisters == null || rawSpeakers == null) {
                logger.error("No data in excel fro ministers")

                return
            }

            sendNotification(
                SpeakerScheduleFromRawRows(rawSpeakers.data.values),
                MinisterScheduleFromRawRows(rawMinisters.data.values),
                tgBot,
                scheduleOptions)

        } catch (error) {
            logger.error("error fetching rows from excel:", error)

            return
        }
    }

    tgBot.SetNotifyCallback(NotifyNow)
    tgBot.Run()

    logger.info('Bot is started')

    await runOnTuesdayAndSaturday(NotifyNow, tgBot)
}

function getSpeakerRange(): string {
    moment.locale('ru');
    return moment().format('MMMM YYYY') + "!A1:H124";
}

main()

