import TgBot from "./src/services/telegram";
import {GetRows} from "./src/services/excelHandler";
import {GetConfig} from "./src/services/config/config";

require('dotenv').config()

async function main() {
    const config = GetConfig()
    if (config === undefined) {
        process.exit(1)
    }

    const tgBot = new TgBot(config.TelegramToken)

    tgBot.Run()

    console.log('Bot is started')

    const NotifyNow =  async () => {
        await GetRows(config.SpreadSheetID, 'credentials.json').then((data) => {
            if (data != null) {

                handleRowsFromExcel(data.data.values, tgBot)

            } else {
                console.error('Here is nothing inside')
            }
        })
    }

    await LoopUntilItsTime(NotifyNow)
}

main()

 async function LoopUntilItsTime(NotifyNow: () => void ) {
     while (true) {
         await new Promise(r => setTimeout(r, 9000));
         await NotifyNow()
     }
 }

function handleRowsFromExcel(names: string[][], bot: TgBot) {
    for (let i = 1; i<names.length; i++) {
        handleRow(names[i], bot)
        console.log(`Handlind ${i}`)
    }
}

function handleRow(row: string[], bot: TgBot) {
    if(!isNaN(Date.parse(row[1]))) {
        bot.SendMsg(`На пульте ${row[2]}. \n На первом микрофоне ${row[3]}. \nНа втором микрофоне ${row[4]}`).then((r) =>
            console.log(r)
        )
    } else {
        console.error(`DATAIS BROKEN${row[1]}`)
    }
}