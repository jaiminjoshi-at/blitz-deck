import { ContentPack } from './types';
import germanBasics from '@/content/packs/german-basics.json';
import germanAdvanced from '@/content/packs/german-advanced.json';

// In a real app, this might load from a file system or API
// For now, we import the JSON directly to simulate loading
const contentPacks: Record<string, ContentPack> = {
    'german-basics': germanBasics as ContentPack,
    'german-advanced': germanAdvanced as ContentPack,
};

export async function loadContentPack(id: string): Promise<ContentPack | null> {
    // Simulate async loading
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(contentPacks[id] || null);
        }, 100);
    });
}

export async function getAllContentPacks(): Promise<ContentPack[]> {
    return Object.values(contentPacks);
}
