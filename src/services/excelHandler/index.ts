import {google} from 'googleapis'

interface SheetValues<T> {
    [row: string | number]: T[]
}

async function CreateClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
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

async function GetRows(spreadsheetID: string) {
    const client = await CreateClient();

    try {
        const metaData = client.spreadsheets.get({
            spreadsheetId: spreadsheetID
        })
    } catch (e) {
        console.error(e)
        return null
    }

    const getRows = client.spreadsheets.values.get({
        spreadsheetID,
        range: "List1"
    })

    return getRows.data;
}

catch
(error)
{
    console.error("Error retrieving spreadsheet data:", error);
    //idk how to handle error in node. Seems like we need just throw and catch when call GetNote
}
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
    CreateNote
    // GetNote
}