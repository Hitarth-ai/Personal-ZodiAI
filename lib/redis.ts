import { createClient } from 'redis';

// This will be loaded from .env.local
const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL;

export async function appendToRedis(row: {
    Name: string;
    'Date of Birth': string;
    'Time of Birth': string;
    'Place of Birth': string;
    Prompt: string;
}) {
    if (!REDIS_URL) {
        console.warn('Redis credentials missing. Skipping Redis connection.');
        return;
    }

    const client = createClient({
        url: REDIS_URL,
        socket: {
            connectTimeout: 10000, // 10s timeout
        }
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    try {
        await client.connect();

        // We'll store the logs as a list of JSON strings
        const key = 'zodiai:logs';
        const value = JSON.stringify(row);

        await client.rPush(key, value);
        console.log('Successfully added row to Redis');
    } catch (error) {
        console.error('Error appending to Redis:', error);
    } finally {
        // Always disconnect to prevent hanging processes in serverless
        try {
            if (client.isOpen) {
                await client.disconnect();
            }
        } catch (e) {
            console.error('Error disconnecting Redis:', e);
        }
    }
}
