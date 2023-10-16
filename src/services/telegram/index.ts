import {Logger} from "winston";
import logger from "../logger/logger";

const TelegramBot = require('node-telegram-bot-api');

class TgBot { // toDo: add try catch for all requests
    private bot: typeof TelegramBot
    private notifyCallback: ((force: boolean) => void) | undefined
    private currentChatID: number = 0 // lame way to avoid handleRow weird move
    private recurrentChatID: number = 1001459090928 //1001459090928
    public logger: Logger

    constructor(token: string) {
        this.bot = new TelegramBot(token, {
            polling: true
        })

        this.logger = logger
    }

    public SetNotifyCallback(notify: (force: boolean) => void) {
        this.notifyCallback = notify
    }

    public Run() {
        this.invokeEvents()
    }

    public SendMsg(text: string, chatID: number = this.currentChatID): Promise< typeof TelegramBot.Message> {
        this.logger.info(`sending msg "${text.slice(0, 15)}..." to chatID ${chatID}`)

        return this.bot.sendMessage(chatID, text, {parse_mode: 'HTML'});
    }

    private invokeEvents() {
        this.bot.onText(/\/force/, (msg) => {
            this.logger.info(`force schedule for id:${msg.chat.id} fistName:${msg.chat.first_name}`)
            this.currentChatID = msg.chat.id
            this.notifyCallback ? this.notifyCallback(true) : this.SendMsg("there is no notify callback", msg.chat.id)
        })

        this.bot.onText(/\/set/, (msg) => { // to keep in runtime bot for main chat
            this.logger.info(`set recurrent chatID ${msg.chat.id}`)
            this.recurrentChatID = msg.chat.id
        })
    }

    public GetRecurrentChatID(): number {
        return this.recurrentChatID
    }
}

export default TgBot