
import * as dotenv from "dotenv";
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: ".env.local" });

// Helper types matching the JSON structure
type JsonLesson = {
    id: string;
    title: string;
    description: string;
    content?: string; // or learning_content
    questions: any[];
}

async function readJson<T>(filePath: string): Promise<T | null> {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(content) as T;
    } catch (error) {
        return null;
    }
}

async function main() {
    // Dynamic import to ensure env vars are loaded before db connection
    const { db } = await import("../src/lib/db");
    // Import schema tables
    const { users, pathways, units, lessons, questions } = await import("../src/db/schema");
    // Import eq for deletions
    const { eq } = await import("drizzle-orm");

    console.log("🌱 Starting seed...");

    // 1. Clean Database (Optional: safer to truncate or delete all for clean state in dev)
    console.log("🧹 Cleaning old data...");
    await db.delete(questions);
    await db.delete(lessons);
    await db.delete(units);
    await db.delete(pathways);
    await db.delete(users);

    // 2. Create Users
    console.log("👤 Creating users...");
    const [admin] = await db.insert(users).values({
        email: "admin@test.com",
        name: "Test Admin",
        password: "password", // MVP: plaintext
        role: "admin",
    }).returning();

    const [learner] = await db.insert(users).values({
        email: "learner@test.com",
        name: "Test Learner",
        password: "password",
        role: "learner",
        assignedAdminId: admin.id,
    }).returning();

    console.log(`✅ Admin: ${admin.email}`);
    console.log(`✅ Learner: ${learner.email}`);

    // 3. Load Content from Files
    console.log("📚 Loading content...");
    const contentDir = path.join(process.cwd(), 'src', 'content', 'packs');

    if (!fs.existsSync(contentDir)) {
        console.warn("⚠️ Content directory not found, skipping content seed.");
        process.exit(0);
    }

    const packDirs = await fs.promises.readdir(contentDir);

    for (const packDirName of packDirs) {
        const packPath = path.join(contentDir, packDirName);
        const stat = await fs.promises.stat(packPath);
        if (!stat.isDirectory()) continue;

        const packMetadata = await readJson<{ pathways: string[] }>(path.join(packPath, 'metadata.json'));
        if (!packMetadata) continue;

        for (const pathwayId of packMetadata.pathways) {
            const pathwayPath = path.join(packPath, pathwayId);
            if (!fs.existsSync(pathwayPath)) continue;

            const pathwayMeta = await readJson<{
                title: string;
                description: string;
                units: string[]
            }>(path.join(pathwayPath, 'metadata.json'));

            if (!pathwayMeta) continue;

            // Insert Pathway
            const [pathwayRecord] = await db.insert(pathways).values({
                creatorId: admin.id,
                title: pathwayMeta.title,
                description: pathwayMeta.description,
                published: true, // Auto-publish for seeded content
            }).returning();

            console.log(`  ➡️ Inserted Pathway: ${pathwayMeta.title}`);

            // Insert Units
            let unitOrder = 0;
            for (const unitId of pathwayMeta.units) {
                const unitPath = path.join(pathwayPath, unitId);
                const unitMeta = await readJson<{
                    title: string;
                    description: string;
                    lessons: string[];
                }>(path.join(unitPath, 'metadata.json'));

                if (!unitMeta) continue;

                const [unitRecord] = await db.insert(units).values({
                    pathwayId: pathwayRecord.id,
                    title: unitMeta.title,
                    description: unitMeta.description,
                    order: unitOrder++,
                }).returning();

                // Insert Lessons
                let lessonOrder = 0;
                for (const lessonId of unitMeta.lessons) {
                    const lessonData = await readJson<JsonLesson>(path.join(unitPath, `${lessonId}.json`));
                    if (!lessonData) continue;

                    const [lessonRecord] = await db.insert(lessons).values({
                        unitId: unitRecord.id,
                        title: lessonData.title,
                        description: lessonData.description,
                        learningContent: lessonData.content || "", // Fallback
                        order: lessonOrder++,
                    }).returning();

                    // Insert Questions
                    let questionOrder = 0;
                    if (lessonData.questions && Array.isArray(lessonData.questions)) {
                        for (const q of lessonData.questions) {
                            await db.insert(questions).values({
                                lessonId: lessonRecord.id,
                                type: q.type || 'multiple-choice',
                                prompt: q.question || q.prompt || "Question",
                                data: q, // Store raw JSON for now
                                order: questionOrder++,
                            });
                        }
                    }
                }
            }
        }
    }

    console.log("🎉 Seed complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
