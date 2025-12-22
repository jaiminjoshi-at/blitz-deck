import { ContentPack, Pathway, Unit, Lesson } from './types';
import * as fs from 'fs';
import * as path from 'path';
import { PATHS } from '../constants';

export async function loadContentPack(id: string): Promise<ContentPack | null> {
    const packs = await getAllContentPacks();
    return packs.find(p => p.id === id) || null;
}

// Helper to read JSON safely
async function readJson<T>(filePath: string): Promise<T | null> {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(content) as T;
    } catch (error) {
        console.warn(`Failed to read JSON at ${filePath}`, error);
        return null;
    }
}

export async function getAllContentPacks(options: { includeDrafts?: boolean } = {}): Promise<ContentPack[]> {
    const contentDir = path.isAbsolute(PATHS.CONTENT_DIR)
        ? PATHS.CONTENT_DIR
        : path.join(process.cwd(), PATHS.CONTENT_DIR);

    if (!fs.existsSync(contentDir)) {
        console.warn(`Content directory not found: ${contentDir}`);
        return [];
    }

    const packDirs = await fs.promises.readdir(contentDir);
    const packs: ContentPack[] = [];

    for (const packDirName of packDirs) {
        const packPath = path.join(contentDir, packDirName);
        const stat = await fs.promises.stat(packPath);

        if (!stat.isDirectory()) continue;

        const packMetadata = await readJson<{
            id: string; version: string; language: string; pathways: string[]
        }>(path.join(packPath, 'metadata.json'));

        if (!packMetadata) continue;

        const pathways: Pathway[] = [];

        for (const pathwayId of packMetadata.pathways) {
            const pathwayPath = path.join(packPath, pathwayId);
            // Verify directory exists
            if (!fs.existsSync(pathwayPath)) continue;

            const pathwayMetadata = await readJson<{
                id: string; title: string; description: string; icon?: string; units: string[]; status?: 'draft' | 'published'
            }>(path.join(pathwayPath, 'metadata.json'));

            if (!pathwayMetadata) continue;

            // Filter out drafts unless explicitly included
            if (pathwayMetadata.status === 'draft' && !options.includeDrafts) continue;

            const units: Unit[] = [];

            for (const unitId of pathwayMetadata.units) {
                const unitPath = path.join(pathwayPath, unitId);
                if (!fs.existsSync(unitPath)) continue;

                const unitMetadata = await readJson<{
                    id: string; title: string; description: string; lessons: string[]
                }>(path.join(unitPath, 'metadata.json'));

                if (!unitMetadata) continue;

                const lessons: Lesson[] = [];

                for (const lessonId of unitMetadata.lessons) {
                    const lesson = await readJson<Lesson>(path.join(unitPath, `${lessonId}.json`));
                    if (lesson) lessons.push(lesson);
                }

                units.push({
                    ...unitMetadata,
                    lessons
                });
            }

            pathways.push({
                ...pathwayMetadata,
                units
            });
        }

        // Only add pack if it has pathways (after filtering)
        if (pathways.length > 0) {
            packs.push({
                id: packMetadata.id,
                version: packMetadata.version,
                language: packMetadata.language,
                pathways
            });
        }
    }

    return packs;
}
