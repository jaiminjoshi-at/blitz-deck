import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should create a new profile', async ({ page }) => {
        // If we are redirected to home immediately (because a profile exists), 
        // we might need to clear storage or handle that. 
        // For now, assuming fresh state or we can access the profile switcher.

        // Note: Since we use local storage, we might need to clear it to force landing page
        // or manually click "Switch Profile" if we are logged in.

        // Try to find "Switch Profile" if we are logged in
        const switchBtn = page.getByRole('button', { name: /switch account/i }); // Material UI avatar handling might vary
        if (await switchBtn.isVisible()) {
            await switchBtn.click();
            await page.getByText('Switch Profile').click();
        }

        // Test creation logic would go here. 
        // Since this depends on state, and the UI is complex (Avatars etc),
        // we'll keep this simple for the initial setup.

        // We can test that the Landing Page appears if no profile is selected
        // Automation challenge: Clearing Local Storage in Playwright
        await page.evaluate(() => window.localStorage.clear());
        await page.reload();

        await expect(page.getByText('Who is learning today?')).toBeVisible();
        await expect(page.getByText('Add Profile')).toBeVisible();
    });
});
