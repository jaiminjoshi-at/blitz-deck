import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
    test('should navigate to pathway and start lesson', async ({ page }) => {
        // Mock a user profile so we can access content
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

        await page.goto('/');

        // Click on German for Beginners
        await page.getByText('German for Beginners').click();

        // Verify we are on pathway page
        await expect(page.getByRole('heading', { name: 'German for Beginners' })).toBeVisible();

        // Expand Unit 1 (should be default expanded, but let's check visibility)
        await expect(page.getByText('Greetings and Introductions')).toBeVisible();

        // Start first lesson
        const lessonItem = page.getByRole('listitem').filter({ hasText: 'Hallo!' });
        await lessonItem.getByRole('button', { name: 'Start' }).click();

        // Verify Lesson Page
        await expect(page.getByRole('heading', { name: 'Hallo!' })).toBeVisible();

        // Verify Quiz Question appears
        await expect(page.getByText("How do you say 'Hello' in German?")).toBeVisible();
    });
});
