import { NextResponse } from 'next/server';
import { createClient } from 'redis';

export const dynamic = 'force-dynamic';

export async function GET() {
    const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL;

    const status = {
        envVarPresent: !!REDIS_URL,
        envVarLength: REDIS_URL ? REDIS_URL.length : 0,
        connectionStatus: 'pending',
        error: null as any,
    };

    if (!REDIS_URL) {
        return NextResponse.json({ ...status, message: 'REDIS_URL is missing' }, { status: 500 });
    }

    try {
        const client = createClient({
            url: REDIS_URL,
            socket: {
                connectTimeout: 5000, // 5s timeout
            }
        });

        client.on('error', (err) => {
            console.error('Redis Client Error', err);
            status.error = err.message;
        });

        await client.connect();
        status.connectionStatus = 'connected';

        // Try a ping
        const ping = await client.ping();

        await client.disconnect();

        return NextResponse.json({ ...status, pingResult: ping, message: 'Successfully connected to Redis!' });
    } catch (error: any) {
        return NextResponse.json({
            ...status,
            connectionStatus: 'failed',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
