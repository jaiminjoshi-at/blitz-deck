import { PathwayImportSchema, LessonImportSchema } from './schemas';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { PATHS } from '../constants';

type PathwayImport = z.infer<typeof PathwayImportSchema>;

export class ContentManager {
    private contentDir: string;

    constructor() {
        this.contentDir = path.isAbsolute(PATHS.CONTENT_DIR)
            ? PATHS.CONTENT_DIR
            : path.join(process.cwd(), PATHS.CONTENT_DIR);
    }

    private slugify(text: string): string {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '')             // Trim - from end of text
            .substring(0, 50);              // Limit length
    }

    private generateId(text?: string): string {
        if (text) return this.slugify(text);
        return Math.random().toString(36).substring(2, 9);
    }

    async saveDraftPathway(importData: any, packId: string = 'user-generated-content'): Promise<string> {
        // 1. Validate Schema
        const validated = PathwayImportSchema.parse(importData);

        // 2. Prepare Directory Structure
        const packDir = path.join(this.contentDir, packId);

        // Ensure Pack exists
        if (!fs.existsSync(packDir)) {
            await fs.promises.mkdir(packDir, { recursive: true });
            // Create minimal pack metadata if missing
            await fs.promises.writeFile(path.join(packDir, 'metadata.json'), JSON.stringify({
                id: packId,
                version: "0.0.1",
                language: "en",
                pathways: []
            }, null, 2));
        }

        const pathwayId = validated.id || this.slugify(validated.title);
        const pathwayDir = path.join(packDir, pathwayId);
        await fs.promises.mkdir(pathwayDir, { recursive: true });

        // 3. Save Pathway Metadata
        const pathwayMetadata = {
            id: pathwayId,
            title: validated.title,
            description: validated.description,
            status: 'draft',
            units: validated.units.map(u => u.id || this.slugify(u.title))
        };

        await fs.promises.writeFile(path.join(pathwayDir, 'metadata.json'), JSON.stringify(pathwayMetadata, null, 2));

        // 4. Save Units andLessons
        for (const unit of validated.units) {
            const unitId = unit.id || this.slugify(unit.title);
            const unitDir = path.join(pathwayDir, unitId);
            await fs.promises.mkdir(unitDir, { recursive: true });

            const unitMetadata = {
                id: unitId,
                title: unit.title,
                description: unit.description || '',
                lessons: unit.lessons.map(l => {
                    return l.id || this.slugify(l.title);
                })
            };
            await fs.promises.writeFile(path.join(unitDir, 'metadata.json'), JSON.stringify(unitMetadata, null, 2));

            for (const lesson of unit.lessons) {
                const lessonId = lesson.id || this.slugify(lesson.title);

                // Fix missing IDs in questions
                const fixedQuestions = lesson.questions.map((q, idx) => ({
                    ...q,
                    id: q.id || `q_${idx}_${Date.now()}`,
                    // Fix cloze segments missing IDs
                    ...(q.type === 'cloze' ? {
                        segments: q.segments.map((s, sIdx) => ({ ...s, id: s.id || `s_${sIdx}` }))
                    } : {})
                }));

                const lessonData = {
                    ...lesson,
                    id: lessonId,
                    questions: fixedQuestions
                };

                await fs.promises.writeFile(path.join(unitDir, `${lessonId}.json`), JSON.stringify(lessonData, null, 2));
            }
        }

        // 5. Update Pack Metadata
        const packMetaPath = path.join(packDir, 'metadata.json');
        const packMeta = JSON.parse(await fs.promises.readFile(packMetaPath, 'utf-8'));

        if (!packMeta.pathways.includes(pathwayId)) {
            packMeta.pathways.push(pathwayId);
            await fs.promises.writeFile(packMetaPath, JSON.stringify(packMeta, null, 2));
        }

        return pathwayId;
    }

    // ... publishPathway kept as is
    async updatePathwayStatus(packId: string, pathwayId: string, status: 'draft' | 'published'): Promise<void> {
        const packDir = path.join(this.contentDir, packId);
        const pathwayMetaPath = path.join(packDir, pathwayId, 'metadata.json');

        if (!fs.existsSync(pathwayMetaPath)) {
            throw new Error("Pathway not found");
        }

        const meta = JSON.parse(await fs.promises.readFile(pathwayMetaPath, 'utf-8'));
        meta.status = status;
        await fs.promises.writeFile(pathwayMetaPath, JSON.stringify(meta, null, 2));
    }

    async publishPathway(packId: string, pathwayId: string): Promise<void> {
        return this.updatePathwayStatus(packId, pathwayId, 'published');
    }

    async deletePathway(packId: string, pathwayId: string): Promise<void> {
        const packDir = path.join(this.contentDir, packId);
        const pathwayDir = path.join(packDir, pathwayId);

        // 1. Check existence
        if (!fs.existsSync(pathwayDir)) {
            throw new Error("Pathway not found");
        }

        // 2. Remove directory recursively
        await fs.promises.rm(pathwayDir, { recursive: true, force: true });

        // 3. Update Parent Pack Metadata
        const packMetaPath = path.join(packDir, 'metadata.json');
        if (fs.existsSync(packMetaPath)) {
            const packMeta = JSON.parse(await fs.promises.readFile(packMetaPath, 'utf-8'));
            packMeta.pathways = packMeta.pathways.filter((id: string) => id !== pathwayId);
            await fs.promises.writeFile(packMetaPath, JSON.stringify(packMeta, null, 2));
        }
    }
}
