const TelegramBot = require('node-telegram-bot-api');

class TgBot {
    private bot: typeof TelegramBot
    private currentChatID: number
    private notifyCallback: ((force: boolean) => void) | undefined

    constructor(token: string) {
        this.bot = new TelegramBot(token, {
            polling: true
        })
        this.currentChatID = 1001459090928 // default non-sense value
    }

    public SetNotifyCallback(notify: (force: boolean) => void) {
        this.notifyCallback = notify
    }

    public Run() {
        this.invokeEvents()
    }

    public SendMsg(text: string, chatID: number = this.currentChatID,): Promise<typeof TelegramBot.Message> {
        return this.bot.sendMessage(chatID, text, { parse_mode: 'HTML'});
    }

    private invokeEvents() {
        this.bot.onText(/\/force/, (msg) => {
            console.log("trying to notify...")
            this.notifyCallback ? this.notifyCallback(true) : this.SendMsg("there is no notify callback", msg.chat.id)
        })

    }
}

export default TgBot