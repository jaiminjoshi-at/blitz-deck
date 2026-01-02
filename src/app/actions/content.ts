'use server';


import { PathwayImportSchema } from "@/lib/content/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { users, pathways, units, lessons, questions } from "@/db/schema";

export async function saveDraftPathway(data: z.infer<typeof PathwayImportSchema>) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        // 1. Create Pathway
        const [pathway] = await db.insert(pathways).values({
            creatorId: userId,
            title: data.title,
            description: data.description,
            published: false
        }).returning();

        // 2. Create Units
        if (data.units) {
            for (let i = 0; i < data.units.length; i++) {
                const u = data.units[i];
                const [unit] = await db.insert(units).values({
                    pathwayId: pathway.id,
                    title: u.title,
                    description: u.description || "",
                    order: i
                }).returning();

                // 3. Create Lessons
                if (u.lessons) {
                    for (let j = 0; j < u.lessons.length; j++) {
                        const l = u.lessons[j];
                        // 'content' from schema maps to 'learningContent' in DB
                        const [lesson] = await db.insert(lessons).values({
                            unitId: unit.id,
                            title: l.title,
                            learningContent: l.content || "",
                            order: j,
                            description: ""
                        }).returning();

                        // 4. Create Questions
                        if (l.questions) {
                            for (let k = 0; k < l.questions.length; k++) {
                                const q = l.questions[k];
                                await db.insert(questions).values({
                                    lessonId: lesson.id,
                                    type: q.type,
                                    prompt: q.prompt,
                                    data: q, // Store the whole question object as JSONB
                                    order: k
                                });
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Failed to save draft:", error);
        return { success: false, error: 'Failed to save content.' };
    }

    revalidatePath('/admin/content');
    redirect('/admin/content');
}

export async function publishPathway(packId: string, pathwayId: string) {
    try {
        // Toggle published status
        await db.update(pathways)
            .set({ published: true })
            .where(eq(pathways.id, pathwayId));

        revalidatePath('/admin/content');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to publish:", error);
        return { success: false, error: 'Failed to publish content.' };
    }
}

export async function deletePathway(packId: string, pathwayId: string) {
    try {
        await db.delete(pathways).where(eq(pathways.id, pathwayId));
        revalidatePath('/admin/content');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete:", error);
        return { success: false, error: 'Failed to delete content.' };
    }
}
