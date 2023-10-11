"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TelegramBot = require('node-telegram-bot-api');
class TgBot {
    constructor(token) {
        this.currentChatID = 0;
        this.bot = new TelegramBot(token, {
            polling: true
        });
    }
    SetNotifyCallback(notify) {
        this.notifyCallback = notify;
    }
    Run() {
        this.invokeEvents();
    }
    SendMsg(text, chatID = this.currentChatID) {
        console.log(`sending msg ${text} to chatID ${chatID}`);
        return this.bot.sendMessage(chatID, text, { parse_mode: 'HTML' });
    }
    invokeEvents() {
        this.bot.onText(/\/force/, (msg) => {
            console.log(`force schedule for ${msg.chat.id} ${msg.chat.first_name}`);
            this.currentChatID = msg.chat.id;
            this.notifyCallback ? this.notifyCallback(true) : this.SendMsg("there is no notify callback", msg.chat.id);
            this.currentChatID = 0;
        });
        this.bot.onText(/\/set/, (msg) => {
            console.log(`set chatID ${msg.chat.id}`);
            this.currentChatID = msg.chat.id;
        });
    }
}
exports.default = TgBot;
//# sourceMappingURL=index.js.map