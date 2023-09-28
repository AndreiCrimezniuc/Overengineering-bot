import TgBot from "./src/services/telegram";
import {GetRows} from "./src/services/excelHandler";

require('dotenv').config()

function main() {
    const tgToken = process.env.TELEGRAM_TOKEN

    if (tgToken === undefined) {
        console.error("telegram token is not provided in .env")
        process.exit(1)
    }

    const tgBot = new TgBot(tgToken)
    tgBot.Run()

    console.log('Bot is started')

    const TestNote = GetRows('1btrFurxdm2LUVZIgwQZMhuS9ji7dpCZWheDM6UyiqK0', 'credentials.json').then((data) => {
        if (data != null) {
            console.log(data.data)
        } else {
            console.error('Here is nothing inside')
        }
    })
}

main()