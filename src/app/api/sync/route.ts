
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = 'force-dynamic';

// GET: Fetch all progress for the current user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            console.warn('[API/Sync] Unauthorized - No session user ID');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const progressRecords = await db.select().from(userProgress).where(eq(userProgress.userId, session.user.id));

        // Transform DB records back to store format if needed, or Store adapts.
        // Store expects a map of lessonId -> Progress.
        // Current Store uses a complex nested structure { pathwayId: { unitId: { lessonId: ... } } }
        // We might need to simplify the store or map it here.
        // For MVP, let's just return the list and let the store handle it, OR update store to be flatter.
        // Actually, looking at Store, it syncs the WHOLE state. That's inefficient.
        // Let's make the store just sync "completed lessons".

        // Mapping DB records to the Store's expected "completedLessons" format would be complex.
        // Better Strategy: Update Store to sync specific lesson completions.

        return NextResponse.json(progressRecords);
    } catch (error) {
        console.error('Failed to load state:', error);
        return NextResponse.json({ error: 'Failed to load state' }, { status: 500 });
    }
}

// POST: Save a completed lesson
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { lessonId, score, bestScore, lastScore, bestTime, lastTime } = body;

        if (!lessonId) {
            // If body is the huge state object, ignore it or handle it. 
            // We want to move to granular updates.
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Helper to safely convert numbers to integers
        const safeInt = (val: unknown) => typeof val === 'number' ? Math.round(val) : undefined;
        const safeIntDefault = (val: unknown, def = 0) => typeof val === 'number' ? Math.round(val) : def;

        // Upsert progress
        await db.insert(userProgress).values({
            userId: session.user.id,
            lessonId: lessonId,
            score: safeIntDefault(score),
            bestScore: safeInt(bestScore),
            lastScore: safeInt(lastScore),
            bestTime: safeInt(bestTime),
            lastTime: safeInt(lastTime),
            completedAt: new Date(),
        })
            .onConflictDoUpdate({
                target: [userProgress.userId, userProgress.lessonId],
                set: {
                    score: safeIntDefault(score),
                    bestScore: safeInt(bestScore),
                    lastScore: safeInt(lastScore),
                    bestTime: safeInt(bestTime),
                    lastTime: safeInt(lastTime),
                    completedAt: new Date()
                }
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save state:', error);
        return NextResponse.json({ error: 'Failed to save state' }, { status: 500 });
    }
}
