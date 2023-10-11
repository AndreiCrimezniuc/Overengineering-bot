import TgBot from "./services/telegram";
import {GetRows} from "./services/excelHandler";
import {GetConfig} from "./services/config/config";
import {GetRowsFromExcel, runOnTuesdayAndSaturday} from "./services/notifier/notifer";

require('dotenv').config()

async function main() {
    const config = GetConfig()
    if (config === undefined) {
        process.exit(1)
    }

    const tgBot = new TgBot(config.TelegramToken)

    const NotifyNow = async (force: boolean = false) => {
        await GetRows(config.SpreadSheetID, 'credentials.json').then((data) => {
            if (data != null) {
                console.log(data.data.values)
                GetRowsFromExcel(data.data.values, tgBot, force) // toDo: Need to parse this data and add it in database and then pull it from database until we have actual data. Now we pull it every time
            } else {
                console.error('Here is nothing inside')
            }
        })
    }

    tgBot.SetNotifyCallback(NotifyNow)
    tgBot.Run()

    console.log('Bot is started')

    await runOnTuesdayAndSaturday(NotifyNow) // idk weird of course, it needs to think about it
}

main()



