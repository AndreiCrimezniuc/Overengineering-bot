import TgBot from "./services/telegram";
import {Config, GetConfig} from "./services/config/config";
import {runOnTuesdayAndSaturday,} from "./services/notifier/notifer";
import logger from "./services/logger/logger";

require('dotenv').config()

async function main() {
    const config: Config | undefined = GetConfig()
    if (config === undefined) {
        process.exit(1)
    }

    const tgBot = new TgBot(config.TelegramToken)

    tgBot.invokeEvents(config)

    logger.info('Bot is started')

    await runOnTuesdayAndSaturday(tgBot, config)  //IDK weird of course, it needs to think about it
}

main()

