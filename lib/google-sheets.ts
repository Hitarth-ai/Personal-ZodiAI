import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// These will be loaded from .env.local
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newlines in env var

export async function appendToGoogleSheet(row: {
    Name: string;
    'Date of Birth': string;
    'Time of Birth': string;
    'Place of Birth': string;
    Prompt: string;
}) {
    if (!GOOGLE_SHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        console.warn('Google Sheets credentials missing. Skipping sheet upload.');
        return;
    }

    try {
        // Robustly handle private key newlines (fixes Vercel env var issues)
        const privateKey = GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n');

        const serviceAccountAuth = new JWT({
            email: GOOGLE_CLIENT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);

        await doc.loadInfo(); // loads document properties and worksheets

        const sheet = doc.sheetsByIndex[0]; // use the first sheet

        // Check if headers exist, if not add them
        try {
            await sheet.loadHeaderRow();
            if (sheet.headerValues.length === 0) {
                throw new Error('No headers');
            }
        } catch (e) {
            await sheet.setHeaderRow(['Name', 'Date of Birth', 'Time of Birth', 'Place of Birth', 'Prompt']);
        }

        await sheet.addRow(row);
        console.log('Successfully added row to Google Sheet');
    } catch (error) {
        console.error('Error appending to Google Sheet:', error);
    }
}
