import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const dynamic = 'force-dynamic';

export async function GET() {
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

    const status = {
        config: {
            sheetId: !!GOOGLE_SHEET_ID,
            email: !!GOOGLE_CLIENT_EMAIL,
            privateKey: !!GOOGLE_PRIVATE_KEY,
        },
        connection: 'pending',
        error: null as any,
    };

    if (!GOOGLE_SHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        return NextResponse.json({ ...status, message: 'Missing env vars' }, { status: 500 });
    }

    try {
        // Robustly handle private key newlines
        const privateKey = GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n');

        const serviceAccountAuth = new JWT({
            email: GOOGLE_CLIENT_EMAIL,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        status.connection = 'success';

        return NextResponse.json({
            ...status,
            title: doc.title,
            sheetCount: doc.sheetCount,
            message: 'Successfully connected to Google Sheets!'
        });

    } catch (error: any) {
        return NextResponse.json({
            ...status,
            connection: 'failed',
            error: error.message,
            details: error.response?.data || error.stack
        }, { status: 500 });
    }
}
