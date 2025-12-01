import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

    const status = {
        sheetId: {
            present: !!GOOGLE_SHEET_ID,
            value: GOOGLE_SHEET_ID ? `${GOOGLE_SHEET_ID.substring(0, 5)}...` : null
        },
        email: {
            present: !!GOOGLE_CLIENT_EMAIL,
            value: GOOGLE_CLIENT_EMAIL
        },
        privateKey: {
            present: !!GOOGLE_PRIVATE_KEY,
            length: GOOGLE_PRIVATE_KEY ? GOOGLE_PRIVATE_KEY.length : 0,
            hasBeginMarker: GOOGLE_PRIVATE_KEY ? GOOGLE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY') : false,
            hasEndMarker: GOOGLE_PRIVATE_KEY ? GOOGLE_PRIVATE_KEY.includes('END PRIVATE KEY') : false,
            // Check for literal \n characters which might indicate copy-paste error
            hasLiteralNewlines: GOOGLE_PRIVATE_KEY ? GOOGLE_PRIVATE_KEY.includes('\\n') : false,
        }
    };

    return NextResponse.json(status);
}
