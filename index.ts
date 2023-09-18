import TgBot from "./src/services/telegram";

require('dotenv').config()

function main() {
    const tgToken =  process.env.TELEGRAM_TOKEN

    if (tgToken === undefined){
        console.error("telegram token is not provided in .env")
        process.exit(1)
    }

    const tgBot = new TgBot(tgToken)
    tgBot.Run()
}

main()