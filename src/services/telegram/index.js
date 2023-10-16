"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../logger/logger");
var TelegramBot = require('node-telegram-bot-api');
var TgBot = /** @class */ (function () {
    function TgBot(token) {
        this.currentChatID = 0; // lame way to avoid handleRow weird move
        this.recurrentChatID = 1001459090928; //1001459090928
        this.bot = new TelegramBot(token, {
            polling: true
        });
        this.logger = logger_1.default;
    }
    TgBot.prototype.SetNotifyCallback = function (notify) {
        this.notifyCallback = notify;
    };
    TgBot.prototype.Run = function () {
        this.invokeEvents();
    };
    TgBot.prototype.SendMsg = function (text, chatID) {
        if (chatID === void 0) { chatID = this.currentChatID; }
        this.logger.info("sending msg \"".concat(text.slice(0, 15), "...\" to chatID ").concat(chatID));
        return this.bot.sendMessage(chatID, text, { parse_mode: 'HTML' });
    };
    TgBot.prototype.invokeEvents = function () {
        var _this = this;
        this.bot.onText(/\/force/, function (msg) {
            _this.logger.info("force schedule for id:".concat(msg.chat.id, " fistName:").concat(msg.chat.first_name));
            _this.currentChatID = msg.chat.id;
            _this.notifyCallback ? _this.notifyCallback(true) : _this.SendMsg("there is no notify callback", msg.chat.id);
        });
        this.bot.onText(/\/set/, function (msg) {
            _this.logger.info("set recurrent chatID ".concat(msg.chat.id));
            _this.recurrentChatID = msg.chat.id;
        });
    };
    TgBot.prototype.GetRecurrentChatID = function () {
        return this.recurrentChatID;
    };
    return TgBot;
}());
exports.default = TgBot;
