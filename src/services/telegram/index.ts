import TelegramBot, {Message} from 'node-telegram-bot-api';

class TgBot {
    private bot: TelegramBot

    constructor(token: string) {
        this.bot = new TelegramBot(token, {
            polling: true
        })
    }

    public Run() {
        this.invokeEvents()
    }

    private invokeEvents() {
        this.bot.onText(/\/echo (.+)/, (msg: Message, match: RegExpMatchArray | null) => {
            const chatId = msg.chat.id;
            const resp = match ? match[1] : '';
            this.bot.sendMessage(chatId, resp);
        });

        this.bot.on('message', (msg: Message) => {
            const chatId = msg.chat.id;
            const name = msg.from?.first_name || 'Unknown';
            const lastname = msg.from?.last_name || 'Unknown';

            this.bot.sendMessage(chatId, `Hello ${name} ${lastname}! How are you?`);
        });
    }
}

export default TgBot