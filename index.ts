import TgBot from "./src/services/telegram";
import {GetRows} from "./src/services/excelHandler";
import {GetConfig} from "./src/services/config/config";
import {handleRowsFromExcel, runOnTuesdayAndSaturday} from "./src/services/notifier/notifer";

require('dotenv').config()

async function main() {
    const config = GetConfig()
    if (config === undefined) {
        process.exit(1)
    }

    const tgBot = new TgBot(config.TelegramToken)

    const NotifyNow = async () => {
        await GetRows(config.SpreadSheetID, 'credentials.json').then((data) => {
            if (data != null) {

                handleRowsFromExcel(data.data.values, tgBot) // toDo: Need to parse this data and add it in database and then pull it from database until we have actual data. Now we pull it every time

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



