import {google} from 'googleapis'
import {GaxiosResponse} from "gaxios/build/src/common";

async function CreateClient(credentials: string) {
    const auth = new google.auth.GoogleAuth({
        keyFile: credentials,
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    });

    google.options(
        {
            auth: auth
        }
    )

    return google.sheets({version: "v4"});
}

async function GetSpreadsheet(spreadsheetID: string, filename:string, credentials: string): Promise<GaxiosResponse | null> {
    const client = await CreateClient(credentials);

    try {
        return client.spreadsheets.values.get({
            spreadsheetId: spreadsheetID,
            range: filename,
        })
    } catch (e) {
        console.error('Request is dead'  + e)
        return null
    }
}

export {
    GetSpreadsheet
}