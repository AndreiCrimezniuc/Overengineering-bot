type Config = {
    TelegramToken: string
    MinisterSheetID: string
    SpeakerSheetID: string
}

function GetConfig(): Config | undefined {
    const tgToken = process.env.TELEGRAM_TOKEN

    if (tgToken === undefined) {
        console.error("telegram token is not provided in .env")
        return undefined
    }

    const spreadSheetID = process.env.SPREAD_SHEET_ID

    if (spreadSheetID === undefined) {
        console.error("spread sheet ID is not provided in .env")
        return undefined
    }
    const speakerSheetID = process.env.SPEAKER_SHEET_ID

    if (speakerSheetID === undefined) {
        console.error("speaker sheet ID is not provided in .env")
        return undefined
    }

    return {
        TelegramToken: tgToken,
        MinisterSheetID: spreadSheetID,
        SpeakerSheetID: speakerSheetID
    }
}

export {
    GetConfig
}