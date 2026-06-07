import { test, expect } from '@playwright/test';
import { loginAsLearner } from './helpers/auth';
import { db } from '@/lib/db';

test.describe('Smoke Tests', () => {
    test('should load the home page and redirect to login if unauthenticated', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(/\/login/);
        await expect(page.getByRole('heading', { name: 'BlitzDeck' })).toBeVisible();
        await expect(page.getByText('Sign in to continue your learning journey')).toBeVisible();
    });

    test('should display assigned pathway cards on dashboard', async ({ page }) => {
        // Query the database to find expected pathways for the learner's instructor
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        
        if (!learner || !learner.assignedAdminId) {
            throw new Error('Learner or assigned instructor not found in database');
        }
        
        const expectedPathways = await db.query.pathways.findMany({
            where: (pathways, { eq, and }) => and(
                eq(pathways.creatorId, learner.assignedAdminId!),
                eq(pathways.published, true)
            )
        });
        
        // Log in and go to dashboard
        await loginAsLearner(page);
        
        // Verify dashboard header elements
        await expect(page.getByRole('heading', { name: 'Learner Dashboard' })).toBeVisible();
        await expect(page.getByText(`Welcome back, ${learner.name}`)).toBeVisible();
        
        // Verify assigned pathway cards match the database records
        const pathwayCards = page.getByTestId('pathway-card');
        if (expectedPathways.length > 0) {
            await expect(pathwayCards.first()).toBeVisible();
            const count = await pathwayCards.count();
            expect(count).toBe(expectedPathways.length);
            
            for (const pathway of expectedPathways) {
                await expect(page.getByText(pathway.title)).toBeVisible();
            }
        } else {
            await expect(page.getByText("Your instructor hasn't assigned any content yet.")).toBeVisible();
        }
    });
});
