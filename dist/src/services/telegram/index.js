"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TelegramBot = require('node-telegram-bot-api');
class TgBot {
    constructor(token) {
        this.bot = new TelegramBot(token, {
            polling: true
        });
        this.recurrentMainChatID = 0;
    }
    SetNotifyCallback(notify) {
        this.notifyCallback = notify;
    }
    Run() {
        this.invokeEvents();
    }
    SendMsg(text, chatID = this.recurrentMainChatID) {
        console.log(`sending msg ${text} to chatID ${chatID}`);
        return this.bot.sendMessage(chatID, text, { parse_mode: 'HTML' });
    }
    invokeEvents() {
        this.bot.onText(/\/force/, (msg) => {
            console.log(`force schedule for ${msg.chat.id} ${msg.chat.first_name}`);
            this.notifyCallback ? this.notifyCallback(true) : this.SendMsg("there is no notify callback", msg.chat.id);
        });
        this.bot.onText(/\/set/, (msg) => {
            console.log(`set chatID ${msg.chat.id}`);
            this.recurrentMainChatID = msg.chat.id;
        });
    }
}
exports.default = TgBot;
//# sourceMappingURL=index.js.map