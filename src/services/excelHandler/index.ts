import {google} from 'googleapis'
import {GaxiosResponse} from "gaxios/build/src/common";

interface SheetValues<T> {
    [row: string | number]: T[]
}

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
    console.log("Get Rows not is runned?")

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


// async function CreateNote(spreadsheetID: string, values: SheetValues<any>[]) {
//     const client = await CreateClient()
//
//     try {
//         const metaData = await client.spreadsheets.get({
//             spreadsheetID
//         });
//
//         const getRows = await client.spreadsheets.values.get({
//             spreadsheetID,
//             range: "List1"
//         })
//
//         await client.spreadsheets.values.append({
//             spreadsheetID,
//             range: "List1!A:B",
//             valueInputOption: "USER_ENTERED", // Corrected value
//             resource: {
//                 values: values
//             }
//         });
//
//         return getRows.data;
//     } catch (error) {
//         console.error("Error retrieving spreadsheet data:", error);
//         //idk how to handle error in node. Seems like we need just throw and catch when call GetNote
//     }
// }

export {
    // CreateNote,
    GetRows
}