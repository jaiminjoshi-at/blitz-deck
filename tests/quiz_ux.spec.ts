import { test, expect } from '@playwright/test';
import { loginAsLearner } from './helpers/auth';
import { db } from '@/lib/db';
import { questions, userProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';

test.describe('Quiz UX Refinements', () => {
    test.beforeEach(async () => {
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        if (learner) {
            await db.delete(userProgress).where(eq(userProgress.userId, learner.id));
        }
    });

    test('should allow retrying an incorrect answer', async ({ page }) => {
        // Query the database to find a multiple-choice question, along with its full hierarchy
        const mcQuestion = await db.query.questions.findFirst({
            where: eq(questions.type, 'multiple-choice'),
            with: {
                lesson: {
                    with: {
                        unit: {
                            with: {
                                pathway: true
                            }
                        }
                    }
                }
            }
        });

        if (!mcQuestion) {
            throw new Error('No multiple-choice question found in database for testing');
        }

        const lesson = mcQuestion.lesson;
        const unit = lesson.unit;
        const pathway = unit.pathway;
        
        // Extract options and correct answer
        const data = mcQuestion.data as { options: string[]; correctAnswer: string };
        const correctAnswer = data.correctAnswer;
        const incorrectAnswer = data.options.find(opt => opt !== correctAnswer);
        
        if (!incorrectAnswer) {
            throw new Error(`Multiple choice question "${mcQuestion.prompt}" does not have at least one incorrect option`);
        }

        // Log in and start lesson
        await loginAsLearner(page);
        await page.getByText(pathway.title).click();
        
        // Wait for pathway page to load and render unit title to prevent race conditions
        await expect(page).toHaveURL(new RegExp(`/pathway/${pathway.id}`));
        await expect(page.getByText(unit.title)).toBeVisible();
        
        const lessonItem = page.getByRole('listitem').filter({ hasText: lesson.title });
        await lessonItem.click();

        // Wait for the quiz to be hydrated and stable
        await expect(page.getByText(/Question \d+ of \d+/)).toBeVisible({ timeout: 15000 });

        // 1. Select Wrong Answer
        await page.getByRole('button', { name: incorrectAnswer, exact: true }).click();

        // 2. Check Answer
        await page.getByRole('button', { name: 'Check Answer' }).click();

        // 3. Verify Error
        await expect(page.getByText('Incorrect, try again.')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();

        // 4. Select Correct Answer
        await page.getByRole('button', { name: correctAnswer, exact: true }).click();

        // 5. Verify "Try Again" changes back to "Check Answer"
        await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible();
        await expect(page.getByText('Incorrect, try again.')).toBeHidden();

        // 6. Submit Correct
        await page.getByRole('button', { name: 'Check Answer' }).click();
        await expect(page.getByText('Correct!')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    });

    test('should navigate home from pathway on back click', async ({ page }) => {
        // Query database to find a pathway
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
            )
        });

        if (!pathway) {
            throw new Error('No pathway found in database for testing back-click navigation');
        }

        await loginAsLearner(page);
        await page.getByText(pathway.title).click();

        // Verify we are on pathway page
        await page.waitForURL(new RegExp(`/pathway/${pathway.id}`));
        expect(page.url()).toContain(`/pathway/${pathway.id}`);

        // Click Back Button (Arrow Icon)
        await expect(page.getByLabel('back')).toBeVisible();
        await page.getByLabel('back').click();

        // Verify we are redirected back to the dashboard/home page
        await expect(page).toHaveURL(/localhost:\d+(\/dashboard|\/)?$/);
        await expect(page.getByText(pathway.title)).toBeVisible();
    });
});
