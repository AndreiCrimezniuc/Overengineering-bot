const TelegramBot = require('node-telegram-bot-api');

class TgBot {
    private bot: typeof TelegramBot
    private recurrentMainChatID: number
    private notifyCallback: ((force: boolean) => void) | undefined

    constructor(token: string) {
        this.bot = new TelegramBot(token, {
            polling: true
        })
        this.recurrentMainChatID = 0 // idk, it needs to be fixed
    }

    public SetNotifyCallback(notify: (force: boolean) => void) {
        this.notifyCallback = notify
    }

    public Run() {
        this.invokeEvents()
    }

    public SendMsg(text: string, chatID: number = this.recurrentMainChatID,): Promise<typeof TelegramBot.Message> {
        console.log(`sending msg ${text} to chatID ${chatID}`)
        return this.bot.sendMessage(chatID, text, {parse_mode: 'HTML'});
    }

    private invokeEvents() {
        this.bot.onText(/\/force/, (msg) => {
            console.log(`force schedule for ${msg.chat.id} ${msg.chat.first_name}`)
            this.notifyCallback ? this.notifyCallback(true) : this.SendMsg("there is no notify callback", msg.chat.id)
        })

        this.bot.onText(/\/set/, (msg) => {
            console.log(`set chatID ${msg.chat.id}`)
            this.recurrentMainChatID = msg.chat.id
        })
    }
}

export default TgBot