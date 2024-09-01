"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSpreadsheet = void 0;
const googleapis_1 = require("googleapis");
async function CreateClient(credentials) {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: credentials,
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    });
    googleapis_1.google.options({
        auth: auth
    });
    return googleapis_1.google.sheets({ version: "v4" });
}
async function GetSpreadsheet(spreadsheetID, filename, credentials) {
    const client = await CreateClient(credentials);
    try {
        return client.spreadsheets.values.get({
            spreadsheetId: spreadsheetID,
            range: filename,
        });
    }
    catch (e) {
        console.error('Request is dead' + e);
        return null;
    }
}
exports.GetSpreadsheet = GetSpreadsheet;
//# sourceMappingURL=index.js.map