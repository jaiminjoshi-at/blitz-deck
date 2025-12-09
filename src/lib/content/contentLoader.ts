import { ContentPack } from './types';
import fs from 'fs';
import path from 'path';
import { PATHS } from '../constants';

// This function scans the content directory for JSON files
export async function getAllContentPacks(): Promise<ContentPack[]> {
    const contentDir = path.isAbsolute(PATHS.CONTENT_DIR)
        ? PATHS.CONTENT_DIR
        : path.join(process.cwd(), PATHS.CONTENT_DIR);

    if (!fs.existsSync(contentDir)) {
        console.warn(`Content directory not found: ${contentDir}`);
        return [];
    }

    const files = await fs.promises.readdir(contentDir);
    const packs: ContentPack[] = [];

    for (const file of files) {
        if (file.endsWith('.json')) {
            try {
                const filePath = path.join(contentDir, file);
                const fileContent = await fs.promises.readFile(filePath, 'utf-8');
                const pack = JSON.parse(fileContent) as ContentPack;
                packs.push(pack);
            } catch (error) {
                console.error(`Error processing content pack ${file}:`, error);
            }
        }
    }

    return packs;
}

export async function loadContentPack(id: string): Promise<ContentPack | null> {
    const packs = await getAllContentPacks();
    return packs.find(p => p.id === id) || null;
}
