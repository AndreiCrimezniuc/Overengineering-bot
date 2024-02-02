import {google} from 'googleapis'
import {GaxiosResponse} from "gaxios/build/src/common";

async function CreateClient(credentials: string) {
    const auth = new google.auth.GoogleAuth({
        keyFile: credentials,
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    });

    const client = await auth.getClient();
    google.options(
        {
            auth: auth
        }
    )

    return google.sheets({version: "v4"});
}

async function GetRows(spreadsheetID: string, credentials: string): Promise<GaxiosResponse | null> {
    const client = await CreateClient(credentials);

    try {
        const metaData = client.spreadsheets.get({
            spreadsheetId: spreadsheetID
        })
    } catch (e) {
        console.error('Request is dead'  + e)
        return null
    }

    const rows = client.spreadsheets.values.get({
        spreadsheetId: spreadsheetID,
        range: "График распорядителей"
    })

    return rows
}

export {
    GetRows
}