import TelegramBot, {Message} from 'node-telegram-bot-api';

class TgBot {
    private bot: TelegramBot
    private currentChatID: number

    constructor(token: string) {
        this.bot = new TelegramBot(token, {
            polling: true
        })
        this.currentChatID = 947727005 // default non-sense value
    }

    public Run() {
        this.invokeEvents()
    }

    public SendMsg( text: string,chatID: number = this.currentChatID,):Promise<TelegramBot.Message> {
        return this.bot.sendMessage(chatID, text);
    }

    private invokeEvents() {
        this.bot.onText(/\/start/, (msg) => {
            this.currentChatID = msg.chat.id
        })

        this.bot.on('message', (msg) => {
            const chatId = msg.chat.id;

            // send a message to the chat acknowledging receipt of their message
            this.bot.sendMessage(chatId, `I have ${this.currentChatID}`);
        });
    }
}

export default TgBot