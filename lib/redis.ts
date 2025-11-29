import { createClient } from 'redis';

// This will be loaded from .env.local
const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL;

let client: ReturnType<typeof createClient> | undefined;

async function getClient() {
    if (!client) {
        if (!REDIS_URL) {
            console.warn('Redis credentials missing. Skipping Redis connection.');
            return null;
        }
        client = createClient({
            url: REDIS_URL,
        });

        client.on('error', (err) => console.error('Redis Client Error', err));

        await client.connect();
    }
    return client;
}

export async function appendToRedis(row: {
    Name: string;
    'Date of Birth': string;
    'Time of Birth': string;
    'Place of Birth': string;
    Prompt: string;
}) {
    try {
        const redis = await getClient();
        if (!redis) return;

        // We'll store the logs as a list of JSON strings
        const key = 'zodiai:logs';
        const value = JSON.stringify(row);

        await redis.rPush(key, value);
        console.log('Successfully added row to Redis');
    } catch (error) {
        console.error('Error appending to Redis:', error);
    }
}
