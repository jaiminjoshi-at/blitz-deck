import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(DATA_DIR, 'storage.json');

export async function getStoragePath() {
    return STORAGE_FILE;
}

export async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

export async function saveState(state: any) {
    await ensureDataDir();
    await fs.writeFile(STORAGE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function loadState() {
    try {
        await ensureDataDir();
        const content = await fs.readFile(STORAGE_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
