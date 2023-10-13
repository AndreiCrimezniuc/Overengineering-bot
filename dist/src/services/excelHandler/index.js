"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRows = void 0;
const googleapis_1 = require("googleapis");
async function CreateClient(credentials) {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: credentials,
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    });
    const client = await auth.getClient();
    googleapis_1.google.options({
        auth: auth
    });
    return googleapis_1.google.sheets({ version: "v4" });
}
async function GetRows(spreadsheetID, credentials) {
    const client = await CreateClient(credentials);
    try {
        const metaData = client.spreadsheets.get({
            spreadsheetId: spreadsheetID
        });
    }
    catch (e) {
        console.error('Request is dead' + e);
        return null;
    }
    const rows = client.spreadsheets.values.get({
        spreadsheetId: spreadsheetID,
        range: "График распорядителей"
    });
    return rows;
}
exports.GetRows = GetRows;
//# sourceMappingURL=index.js.map