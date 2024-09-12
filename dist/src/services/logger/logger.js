"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { createLogger, transports, format } = require('winston');
const { combine, timestamp, printf } = format;
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
const logger = createLogger({
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
//# sourceMappingURL=logger.js.map