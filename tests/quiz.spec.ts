import { test, expect } from '@playwright/test';
import { loginAsLearner } from './helpers/auth';
import { db } from '@/lib/db';
import { userProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';

test.describe('Quiz Flow', () => {
    test.beforeEach(async () => {
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        if (learner) {
            await db.delete(userProgress).where(eq(userProgress.userId, learner.id));
        }
    });

    test('should navigate to pathway and start lesson', async ({ page }) => {
        // Find a pathway, unit, lesson, and questions assigned to the learner
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        
        if (!learner || !learner.assignedAdminId) {
            throw new Error('Learner or assigned instructor not found in database');
        }

        const pathway = await db.query.pathways.findFirst({
            where: (pathways, { eq, and }) => and(
                eq(pathways.creatorId, learner.assignedAdminId!),
                eq(pathways.published, true)
            ),
            with: {
                units: {
                    orderBy: (units, { asc }) => [asc(units.order)],
                    with: {
                        lessons: {
                            orderBy: (lessons, { asc }) => [asc(lessons.order)],
                            with: {
                                questions: {
                                    orderBy: (questions, { asc }) => [asc(questions.order)]
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!pathway || pathway.units.length === 0 || pathway.units[0].lessons.length === 0) {
            throw new Error('No assigned pathways, units, or lessons found in database for testing');
        }

        const unit = pathway.units[0];
        const lesson = unit.lessons[0];
        
        if (lesson.questions.length === 0) {
            throw new Error(`Seeded lesson "${lesson.title}" has no questions`);
        }
        
        const firstQuestion = lesson.questions[0];

        // Log in
        await loginAsLearner(page);

        // Click on the pathway card
        await page.getByText(pathway.title).click();

        // Verify we are on the pathway page
        await expect(page).toHaveURL(new RegExp(`/pathway/${pathway.id}`));
        await expect(page.getByRole('heading', { name: pathway.title })).toBeVisible();

        // Verify unit is visible
        await expect(page.getByText(unit.title)).toBeVisible();

        // Start the lesson
        const lessonItem = page.getByRole('listitem').filter({ hasText: lesson.title });
        await lessonItem.click();

        // Verify Lesson Page
        await expect(page).toHaveURL(new RegExp(`/pathway/${pathway.id}/(unit/[^/]+/)?lesson/${lesson.id}`));
        await expect(page.getByRole('heading', { name: lesson.title })).toBeVisible();

        // Verify the first quiz question prompt appears
        await expect(page.getByRole('heading', { name: firstQuestion.prompt })).toBeVisible({ timeout: 15000 });
    });
});
