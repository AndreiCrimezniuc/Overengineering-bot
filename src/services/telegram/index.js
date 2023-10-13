"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_telegram_bot_api_1 = require("node-telegram-bot-api");
var TgBot = /** @class */ (function () {
    function TgBot(token) {
        this.bot = new node_telegram_bot_api_1.default(token, {
            polling: true
        });
        this.currentChatID = 947727005; // default non-sense value
    }
    TgBot.prototype.SetNotifyCallback = function (notify) {
        this.notifyCallback = notify;
    };
    TgBot.prototype.Run = function () {
        this.invokeEvents();
    };
    TgBot.prototype.SendMsg = function (text, chatID) {
        if (chatID === void 0) { chatID = this.currentChatID; }
        return this.bot.sendMessage(chatID, text);
    };
    TgBot.prototype.invokeEvents = function () {
        var _this = this;
        this.bot.onText(/\/start/, function (msg) {
            _this.currentChatID = msg.chat.id;
        });
        this.bot.onText(/\/force/, function (msg) {
            console.log("trying to notify...");
            _this.notifyCallback ? _this.notifyCallback() : _this.SendMsg("there is no notify callback");
        });
        this.bot.on('message', function (msg) {
            if (_this.currentChatID === undefined) {
                var chatId = msg.chat.id;
                _this.currentChatID = msg.chat.id;
                _this.bot.sendMessage(chatId, "I'm listening you now ".concat(_this.currentChatID));
            }
        });
    };
    return TgBot;
}());
exports.default = TgBot;
