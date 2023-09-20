const {google} = require('googleapis');

interface SheetValues<T> {
    [row: string | number]: T[]
}

async function CreateClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    });

    const client = await auth.getClient();

    return google.sheets({version: "v4", auth: client});
}

async function GetNote(spreadsheetID: string) {
    const client = await CreateClient();

    try {
        const metaData = await client.spreadsheets.get({
            spreadsheetID
        });

        const getRows = await client.spreadsheets.values.get({
            spreadsheetID,
            range: "List1"
        })

        return getRows.data;
    } catch (error) {
        console.error("Error retrieving spreadsheet data:", error);
        //idk how to handle error in node. Seems like we need just throw and catch when call GetNote
    }
}

async function CreateNote(spreadsheetID: string, values: SheetValues<any>[]) {
    const client = await CreateClient()

    try {
        const metaData = await client.spreadsheets.get({
            spreadsheetID
        });

        const getRows = await client.spreadsheets.values.get({
            spreadsheetID,
            range: "List1"
        })

        await client.spreadsheets.values.append({
            spreadsheetID,
            range: "List1!A:B",
            valueInputOption: "USER_ENTERED", // Corrected value
            resource: {
                values: values
            }
        });

        return getRows.data;
    } catch (error) {
        console.error("Error retrieving spreadsheet data:", error);
        //idk how to handle error in node. Seems like we need just throw and catch when call GetNote
    }
}

export module.exports = {
    CreateNote,
    GetNote
}