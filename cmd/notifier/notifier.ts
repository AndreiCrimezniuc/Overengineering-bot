import { CreateNote, GetNote }  from "../../src/services/excelHandler";

function getSpreedSheetID() {
    const spreadSheetID = process.env.SPREADSHEETID
    if (spreadSheetID === undefined) {
        console.error("telegram token is not provided in .env")
        process.exit(1)
    }
    return spreadSheetID;
}

function main() {
    const spreadSheetID = getSpreedSheetID();

    const spreedSheetNode = GetNote(spreadSheetID)
}

main()