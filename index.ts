import TgBot from "./src/services/telegram";
const { CreateNote, GetNote } = require('./src/services/excelHandler');

require('dotenv').config()

function main() {
    const tgToken =  process.env.TELEGRAM_TOKEN

    if (tgToken === undefined) {
        console.error("telegram token is not provided in .env")
        process.exit(1)
    }

    const tgBot = new TgBot(tgToken)
    tgBot.Run()

    const TestNote = GetNote('1btrFurxdm2LUVZIgwQZMhuS9ji7dpCZWheDM6UyiqK0')
    console.log(TestNote)
}

main()