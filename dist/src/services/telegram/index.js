"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const logger_1 = tslib_1.__importDefault(require("../logger/logger"));
const TelegramBot = require('node-telegram-bot-api');
class TgBot {
    constructor(token) {
        this.currentChatID = 0;
        this.recurrentChatID = -1001459090928;
        this.bot = new TelegramBot(token, {
            polling: true
        });
        this.logger = logger_1.default;
    }
    SetNotifyCallback(notify) {
        this.notifyCallback = notify;
    }
    Run() {
        this.invokeEvents();
    }
    SendMsg(text, chatID = this.currentChatID) {
        this.logger.info(`sending msg "${text.slice(0, 15)}..." to chatID ${chatID}`);
        return this.bot.sendMessage(chatID, text, { parse_mode: 'HTML' });
    }
    invokeEvents() {
        this.bot.onText(/\/force/, (msg) => {
            this.logger.info(`force schedule for id:${msg.chat.id} fistName:${msg.chat.first_name}`);
            this.currentChatID = msg.chat.id;
            this.notifyCallback ? this.notifyCallback(true) : this.SendMsg("there is no notify callback", msg.chat.id);
        });
        this.bot.onText(/\/set/, (msg) => {
            this.logger.info(`set recurrent chatID ${msg.chat.id}`);
            this.recurrentChatID = msg.chat.id;
        });
    }
    GetRecurrentChatID() {
        return this.recurrentChatID;
    }
}
exports.default = TgBot;
//# sourceMappingURL=index.js.map