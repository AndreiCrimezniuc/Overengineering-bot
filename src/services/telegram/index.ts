import TelegramBot from 'node-telegram-bot-api';

class TgBot {
    private bot: TelegramBot
    private currentChatID: number
    private notifyCallback: ((force: boolean) => void) | undefined

    constructor(token: string) {
        this.bot = new TelegramBot(token, {
            polling: true
        })
        this.currentChatID = 947727005 // default non-sense value
    }

    public SetNotifyCallback(notify: (force: boolean) => void) {
        this.notifyCallback = notify
    }

    public Run() {
        this.invokeEvents()
    }

    public SendMsg(text: string, chatID: number = this.currentChatID,): Promise<TelegramBot.Message> {
        return this.bot.sendMessage(chatID, text, { parse_mode: 'HTML'});
    }

    private invokeEvents() {
        this.bot.onText(/\/start/, (msg) => {
            this.currentChatID = msg.chat.id
        })

        this.bot.onText(/\/force/, (msg) => {
            console.log("trying to notify...")
            this.notifyCallback ? this.notifyCallback(true) : this.SendMsg("there is no notify callback")
        })

        this.bot.on('message', (msg) => {
            if (this.currentChatID === undefined) {
                const chatId = msg.chat.id;
                this.currentChatID = msg.chat.id
                this.bot.sendMessage(chatId, `I'm listening you now ${this.currentChatID}`);
            }
        });


    }
}

export default TgBot