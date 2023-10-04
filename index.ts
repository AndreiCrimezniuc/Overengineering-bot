import TgBot from "./src/services/telegram";
import {GetRows} from "./src/services/excelHandler";

require('dotenv').config()

async function main() {
    const tgToken = process.env.TELEGRAM_TOKEN

    if (tgToken === undefined) {
        console.error("telegram token is not provided in .env")
        process.exit(1)
    }

    const tgBot = new TgBot(tgToken)
    tgBot.Run()

    console.log('Bot is started')
    const sheetID = '1Lf6DOhvbrKjpYIdGU-FMwRhBeNqBMkttQuxojPm47D8'

    const TestNote =  async () => {
        console.log("Test not is runned?")
        await GetRows(sheetID, 'credentials.json').then((data) => {
            if (data != null) {

                sendNotification(data.data.values, tgBot)

            } else {
                console.error('Here is nothing inside')
            }
        })
    }

    while(true) {
        await new Promise(r => setTimeout(r, 9000));
        console.log('Trying to run TestNote')
        await TestNote()
    }
}

main()

function sendNotification(names: string[][], bot: TgBot) {
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