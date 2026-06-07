import { test, expect } from '@playwright/test';
import { loginAsLearner } from './helpers/auth';
import { db } from '@/lib/db';
import { questions, userProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';

test.describe('Special Question Types', () => {
    test.beforeEach(async () => {
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        if (learner) {
            await db.delete(userProgress).where(eq(userProgress.userId, learner.id));
        }
    });

    test('should verify Ordering question type', async ({ page }) => {
        const q = await db.query.questions.findFirst({
            where: eq(questions.type, 'ordering'),
            with: { lesson: { with: { unit: true } } }
        });
        if (!q) throw new Error('No ordering question found in database');

        const lesson = q.lesson;
        const unit = lesson.unit;
        const pathwayId = unit.pathwayId;
        const data = q.data as { prompt: string; items: { id: string; text: string }[] };

        // Log in
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        await loginAsLearner(page);

        // Find question index within the lesson
        const allQuestions = await db.query.questions.findMany({
            where: eq(questions.lessonId, lesson.id),
            orderBy: (questions, { asc }) => [asc(questions.order)]
        });
        const qIndex = allQuestions.findIndex(item => item.id === q.id);

        // Set checkpoint in the database to prevent client state from being overwritten by server sync
        await db.insert(userProgress)
            .values({
                userId: learner!.id,
                lessonId: lesson.id,
                currentQuestionIndex: qIndex,
                score: 0,
                bestScore: 0,
                lastScore: 0,
                currentHistory: []
            })
            .onConflictDoUpdate({
                target: [userProgress.userId, userProgress.lessonId],
                set: { currentQuestionIndex: qIndex }
            });

        // Go to lesson page
        const url = `/pathway/${pathwayId}/lesson/${lesson.id}`;
        await page.goto(url);

        // Verify the question prompt is displayed
        await expect(page.locator(`text=${data.prompt}`)).toBeVisible({ timeout: 10000 });

        // Verify "Check Answer" button is visible
        await expect(page.locator('button:has-text("Check Answer")')).toBeVisible();

        // Click Check Answer (will submit default ordering)
        await page.click('button:has-text("Check Answer")');

        // Handle try again if the default order was incorrect
        if (await page.isVisible('button:has-text("Try Again")')) {
            await page.click('button:has-text("Try Again")');
        }
        await expect(page.locator('button:has-text("Check Answer")')).toBeVisible();
    });

    test('should verify Multiple Response question type', async ({ page }) => {
        const q = await db.query.questions.findFirst({
            where: eq(questions.type, 'multiple-response'),
            with: { lesson: { with: { unit: true } } }
        });
        if (!q) throw new Error('No multiple-response question found in database');

        const lesson = q.lesson;
        const unit = lesson.unit;
        const pathwayId = unit.pathwayId;
        const data = q.data as { prompt: string; options: string[]; correctAnswers: string[] };

        // Log in
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        await loginAsLearner(page);

        // Find question index
        const allQuestions = await db.query.questions.findMany({
            where: eq(questions.lessonId, lesson.id),
            orderBy: (questions, { asc }) => [asc(questions.order)]
        });
        const qIndex = allQuestions.findIndex(item => item.id === q.id);

        // Set checkpoint in the database
        await db.insert(userProgress)
            .values({
                userId: learner!.id,
                lessonId: lesson.id,
                currentQuestionIndex: qIndex,
                score: 0,
                bestScore: 0,
                lastScore: 0,
                currentHistory: []
            })
            .onConflictDoUpdate({
                target: [userProgress.userId, userProgress.lessonId],
                set: { currentQuestionIndex: qIndex }
            });

        // Go to lesson page
        const url = `/pathway/${pathwayId}/lesson/${lesson.id}`;
        await page.goto(url);

        // Verify the prompt
        await expect(page.locator(`text=${data.prompt}`)).toBeVisible({ timeout: 10000 });

        // Click all correct answers
        for (const answer of data.correctAnswers) {
            await page.click(`text=${answer}`, { force: true });
        }

        // Submit and check correction
        await page.click('button:has-text("Check Answer")');
        await expect(page.locator('text=Correct!')).toBeVisible();
    });

    test('should verify Categorize question type', async ({ page }) => {
        const q = await db.query.questions.findFirst({
            where: eq(questions.type, 'categorize'),
            with: { lesson: { with: { unit: true } } }
        });
        if (!q) throw new Error('No categorize question found in database');

        const lesson = q.lesson;
        const unit = lesson.unit;
        const pathwayId = unit.pathwayId;
        const data = q.data as { prompt: string; categories: string[]; items: { id: string; text: string }[] };

        // Log in
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        await loginAsLearner(page);

        // Find question index
        const allQuestions = await db.query.questions.findMany({
            where: eq(questions.lessonId, lesson.id),
            orderBy: (questions, { asc }) => [asc(questions.order)]
        });
        const qIndex = allQuestions.findIndex(item => item.id === q.id);

        // Set checkpoint in the database
        await db.insert(userProgress)
            .values({
                userId: learner!.id,
                lessonId: lesson.id,
                currentQuestionIndex: qIndex,
                score: 0,
                bestScore: 0,
                lastScore: 0,
                currentHistory: []
            })
            .onConflictDoUpdate({
                target: [userProgress.userId, userProgress.lessonId],
                set: { currentQuestionIndex: qIndex }
            });

        // Go to lesson page
        const url = `/pathway/${pathwayId}/lesson/${lesson.id}`;
        await page.goto(url);

        // Verify the prompt and categories
        await expect(page.locator(`text=${data.prompt}`)).toBeVisible({ timeout: 10000 });
        for (const cat of data.categories) {
            await expect(page.locator(`text=${cat}`)).toBeVisible();
        }

        // Verify items pool
        for (const item of data.items) {
            await expect(page.locator(`text=${item.text}`)).toBeVisible();
        }
    });
});
