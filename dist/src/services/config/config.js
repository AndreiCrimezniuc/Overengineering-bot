"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetConfig = void 0;
function GetConfig() {
    const tgToken = process.env.TELEGRAM_TOKEN;
    if (tgToken === undefined) {
        console.error("telegram token is not provided in .env");
        return undefined;
    }
    const spreadSheetID = process.env.SPREAD_SHEET_ID;
    if (spreadSheetID === undefined) {
        console.error("spread sheet ID is not provided in .env");
        return undefined;
    }
    const speakerSheetID = process.env.SPEAKER_SHEET_ID;
    if (speakerSheetID === undefined) {
        console.error("speaker sheet ID is not provided in .env");
        return undefined;
    }
    return {
        TelegramToken: tgToken,
        MinisterSheetID: spreadSheetID,
        SpeakerSheetID: speakerSheetID,
        LogLevel: process.env.LOG_LEVEL || "info"
    };
}
exports.GetConfig = GetConfig;
//# sourceMappingURL=config.js.map