import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Mock a logged-in user
        await page.addInitScript(() => {
            const mockState = {
                state: {
                    profiles: [{ id: 'test-user', name: 'Test User', avatar: '😎', xp: 0, streak: 0, lastLoginDate: '2025-01-01' }],
                    activeProfileId: 'test-user',
                    lessonStatus: {}
                },
                version: 0
            };
            window.localStorage.setItem('lingo-pro-storage', JSON.stringify(mockState));
        });
    });

    test('should load the home page and display title', async ({ page }) => {
        await page.goto('/');

        // Check for the main title
        await expect(page.getByRole('heading', { name: 'LingoPro' })).toBeVisible();

        // Check for the welcome data
        await expect(page.getByText('Welcome to your language learning journey')).toBeVisible();
    });

    test('should display pathway cards', async ({ page }) => {
        await page.goto('/');

        // Check for specific pathways
        await expect(page.getByText('German for Beginners')).toBeVisible();
        await expect(page.getByText('German Mastery')).toBeVisible();
    });
});
