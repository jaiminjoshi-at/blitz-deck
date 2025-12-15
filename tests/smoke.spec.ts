import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Mock a logged-in user
        await page.addInitScript(() => {
            const mockState = {
                state: {
                    profiles: [{ id: 'test-user', name: 'Test User', avatar: '😎', lastLoginDate: '2025-01-01' }],
                    activeProfileId: 'test-user',
                    lessonStatus: {}
                },
                version: 0
            };
            window.localStorage.setItem('blitz-deck-storage', JSON.stringify(mockState));
        });
    });

    test('should load the home page and display title', async ({ page }) => {
        await page.goto('/');

        // Check for the main title
        await expect(page.getByRole('heading', { name: 'BlitzDeck' })).toBeVisible();

        // Check for the welcome data
        await expect(page.getByText('Build it. Deck it. Know it.')).toBeVisible();
    });

    test('should display pathway cards', async ({ page }) => {
        await page.goto('/');

        // Check for at least one pathway card
        const pathwayCards = page.getByTestId('pathway-card');
        await expect(pathwayCards.first()).toBeVisible();

        // Optional: Check that we have a reasonable amount (e.g. > 0)
        const count = await pathwayCards.count();
        expect(count).toBeGreaterThan(0);
    });
});
