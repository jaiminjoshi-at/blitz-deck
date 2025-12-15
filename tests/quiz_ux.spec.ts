import { test, expect } from '@playwright/test';

test.describe('Quiz UX Refinements', () => {
    test.beforeEach(async ({ page }) => {
        // Mock state
        await page.addInitScript(() => {
            const mockState = {
                state: {
                    profiles: [{ id: 'test-user', name: 'Test User', avatar: '😎', xp: 0, streak: 0, lastLoginDate: '2025-01-01' }],
                    activeProfileId: 'test-user',
                    lessonStatus: {}
                },
                version: 0
            };
            window.localStorage.setItem('blitz-deck-storage', JSON.stringify(mockState));
        });
    });

    test('should allow retrying an incorrect answer', async ({ page }) => {
        await page.goto('/');
        await page.getByText('German for Beginners').click();

        // Start lesson
        const lessonItem = page.getByRole('listitem').filter({ hasText: 'Hallo!' });
        await lessonItem.click();

        // Question: "How do you say 'Hello' in German?"
        // Correct: "Hallo"
        // Wrong: "Auf Wiedersehen" (Goodbye)

        // 1. Select Wrong Answer
        await page.getByRole('button', { name: 'Auf Wiedersehen', exact: true }).click();

        // 2. Check Answer
        await page.getByRole('button', { name: 'Check Answer' }).click();

        // 3. Verify Error
        await expect(page.getByText('Incorrect, try again.')).toBeVisible();
        // The button text changes to "Try Again"
        await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();

        // 4. Select Correct Answer (Should be enabled)
        await page.getByRole('button', { name: 'Hallo', exact: true }).click();

        // 5. Verify "Try Again" changes back to "Check Answer" or just Verify click works
        // My code: button label is based on (!isCorrect). If I select correct, it doesn't know it's correct until I check.
        // But submitted resets to false on click. So button should say "Check Answer".
        await expect(page.getByRole('button', { name: 'Check Answer' })).toBeVisible();
        await expect(page.getByText('Incorrect, try again.')).toBeHidden();

        // 6. Submit Correct
        await page.getByRole('button', { name: 'Check Answer' }).click();
        await expect(page.getByText('Correct!')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    });

    test('should navigate home from pathway on back click', async ({ page }) => {
        await page.goto('/');
        await page.getByText('German for Beginners').click();

        // Verify we are on pathway
        await page.waitForURL(/\/pathway\//);
        expect(page.url()).toContain('/pathway/');

        // Click Back Button (Arrow Icon)
        await expect(page.getByLabel('back')).toBeVisible();
        await page.getByLabel('back').click();

        // Verify we are on Home
        // Use regex to match root path regardless of port
        await expect(page).toHaveURL(/localhost:\d+\/$/);
        await expect(page.getByText('German for Beginners')).toBeVisible();
    });
});
