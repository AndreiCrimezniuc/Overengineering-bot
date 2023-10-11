const TelegramBot = require('node-telegram-bot-api');

class TgBot { // toDo: add try catch for all requests
    private bot: typeof TelegramBot
    private notifyCallback: ((force: boolean) => void) | undefined
    private currentChatID: number  = 0 // lame way to avoid handleRow weird move

    constructor(token: string) {
        this.bot = new TelegramBot(token, {
            polling: true
        })
    }

    public SetNotifyCallback(notify: (force: boolean) => void) {
        this.notifyCallback = notify
    }

    public Run() {
        this.invokeEvents()
    }

    public SendMsg(text: string, chatID: number = this.currentChatID): Promise<typeof TelegramBot.Message> {
        console.log(`sending msg ${text} to chatID ${chatID}`)
        return this.bot.sendMessage(chatID, text, {parse_mode: 'HTML'});
    }

    private invokeEvents() {
        this.bot.onText(/\/force/, (msg) => {
            console.log(`force schedule for ${msg.chat.id} ${msg.chat.first_name}`)
            this.currentChatID = msg.chat.id
            this.notifyCallback ? this.notifyCallback(true) : this.SendMsg("there is no notify callback", msg.chat.id)
            this.currentChatID = 0
        })

        this.bot.onText(/\/set/, (msg) => {
            console.log(`set chatID ${msg.chat.id}`)
            this.currentChatID = msg.chat.id
        })
    }
}

export default TgBot