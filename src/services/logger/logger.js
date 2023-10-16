"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('winston'), createLogger = _a.createLogger, transports = _a.transports, format = _a.format;
var combine = format.combine, timestamp = format.timestamp, printf = format.printf;
var logFormat = printf(function (_a) {
    var level = _a.level, message = _a.message, timestamp = _a.timestamp;
    return "".concat(timestamp, " ").concat(level, ": ").concat(message);
});
var logger = createLogger({
    format: combine(timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
        tz: 'local',
    }), logFormat),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs.log' }),
    ],
});
exports.default = logger;
