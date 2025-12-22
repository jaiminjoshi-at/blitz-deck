'use server';

import { ContentManager } from "@/lib/content/contentManager";
import { PathwayImportSchema } from "@/lib/content/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const contentManager = new ContentManager();

export async function saveDraftPathway(data: z.infer<typeof PathwayImportSchema>) {
    try {
        await contentManager.saveDraftPathway(data);
    } catch (error) {
        console.error("Failed to save draft:", error);
        return { success: false, error: 'Failed to save content.' };
    }

    revalidatePath('/creator');
    redirect('/creator');
}

export async function publishPathway(packId: string, pathwayId: string) {
    try {
        await contentManager.publishPathway(packId, pathwayId);
        revalidatePath('/creator');
        revalidatePath('/'); // Update home page as well
        return { success: true };
    } catch (error) {
        console.error("Failed to publish:", error);
        return { success: false, error: 'Failed to publish content.' };
    }
}

export async function deletePathway(packId: string, pathwayId: string) {
    try {
        await contentManager.deletePathway(packId, pathwayId);
        revalidatePath('/creator');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete:", error);
        return { success: false, error: 'Failed to delete content.' };
    }
}
