import TelegramBot, { Message } from 'node-telegram-bot-api';

const token = "6404196367:AAF7nALkn3jmmPxhf8FtNJ3ZsBdLUBGATDQ";

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/echo (.+)/, (msg: Message, match: RegExpMatchArray | null) => {
  const chatId = msg.chat.id;
  const resp = match ? match[1] : '';
  bot.sendMessage(chatId, resp);
});

bot.on('message', (msg: Message) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name || 'Unknown';
  const lastname = msg.from?.last_name || 'Unknown';
  
  bot.sendMessage(chatId, `Hello ${name} ${lastname}! How are you?`);
});