import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHAT_HISTORY_FILE = path.join(DATA_DIR, 'zodiai_data.json');

export interface ChatLog {
    id: string;
    timestamp: string;
    birthDetails?: {
        name: string;
        date?: string; // DD/MM/YYYY
        time?: string; // HH:mm
        place: string;
        day?: string;
        month?: string;
        year?: string;
        hour?: string;
        minute?: string;
    };
    messages: {
        role: 'user' | 'assistant';
        content: string;
        isGenerated: boolean; // true if assistant, false if user
        timestamp: string;
    }[];
}

async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

async function readChatLogs(): Promise<ChatLog[]> {
    await ensureDataDir();
    try {
        const data = await fs.readFile(CHAT_HISTORY_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is invalid, return empty array
        return [];
    }
}

async function writeChatLogs(logs: ChatLog[]) {
    await ensureDataDir();
    await fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}

import { stringify } from 'csv-stringify/sync';

const CSV_FILE = path.join(DATA_DIR, 'zodiai_data.csv');

async function appendToCSV(logEntry: {
    userName: string;
    birthPlace: string;
    birthDate: string;
    birthTime: string;
    prompt: string;
}) {
    await ensureDataDir();

    const fileExists = await fs.access(CSV_FILE).then(() => true).catch(() => false);

    const columns = [
        'Name',
        'Date of Birth',
        'Time of Birth',
        'Place of Birth',
        'Prompt'
    ];

    if (!fileExists) {
        const header = stringify([columns], { header: false });
        await fs.writeFile(CSV_FILE, header, 'utf-8');
    }

    // Prepare row based on columns order
    const row = [
        logEntry.userName,
        logEntry.birthDate,
        logEntry.birthTime,
        logEntry.birthPlace,
        logEntry.prompt
    ];

    const csvRow = stringify([row], { header: false });
    await fs.appendFile(CSV_FILE, csvRow, 'utf-8');
}

import { appendToGoogleSheet } from './google-sheets';
import { appendToRedis } from './redis';

export async function saveChatLog(chatId: string, message: ChatLog['messages'][0], birthDetails?: ChatLog['birthDetails']) {
    const logs = await readChatLogs();
    let chatIndex = logs.findIndex(log => log.id === chatId);

    if (chatIndex === -1) {
        // New chat session
        const newLog: ChatLog = {
            id: chatId,
            timestamp: new Date().toISOString(),
            messages: [],
        };
        logs.push(newLog);
        chatIndex = logs.length - 1;
    }

    // Update birth details if provided (and not already set, or overwrite?)
    // Let's overwrite to keep it fresh if user updates it
    if (birthDetails) {
        logs[chatIndex].birthDetails = { ...logs[chatIndex].birthDetails, ...birthDetails };
    }

    // Add message
    logs[chatIndex].messages.push(message);

    await writeChatLogs(logs);

    // --- Save to CSV, Google Sheets & Redis (ONLY User Prompts) ---
    if (message.role === 'user') {
        const currentLog = logs[chatIndex];
        const bd = currentLog.birthDetails;

        const logData = {
            userName: bd?.name || 'Unknown',
            birthPlace: bd?.place || 'Unknown',
            birthDate: bd ? (bd.date || `${bd.day}/${bd.month}/${bd.year}`) : 'Unknown',
            birthTime: bd ? (bd.time || `${bd.hour}:${bd.minute}`) : 'Unknown',
            prompt: message.content
        };

        const formattedRow = {
            Name: logData.userName,
            'Date of Birth': logData.birthDate,
            'Time of Birth': logData.birthTime,
            'Place of Birth': logData.birthPlace,
            Prompt: logData.prompt
        };

        // 1. Local CSV
        await appendToCSV(logData);

        // 2. Google Sheet
        await appendToGoogleSheet(formattedRow);

        // 3. Redis
        await appendToRedis(formattedRow);
    }
}

export async function getChatLog(chatId: string): Promise<ChatLog | undefined> {
    const logs = await readChatLogs();
    return logs.find(log => log.id === chatId);
}
