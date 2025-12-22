import { test, expect } from '@playwright/test';

test('should verify Ordering, Multiple Response, and Categorize', async ({ page }) => {
    // 1. Visit the lesson page
    await page.goto('/lesson/lesson-oeffis');

    // Clear state to ensure we start at Q1
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await page.reload();

    // Wait for content (ensure profiles loaded)
    await page.waitForLoadState('networkidle');

    // Skip to the new questions (Index 5)
    await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('blitz-deck-storage') || '{}');
        const activeId = state.state?.activeProfileId;
        if (activeId) {
            const key = `${activeId}:lesson-oeffis`;
            if (!state.state.lessonStatus) state.state.lessonStatus = {};
            state.state.lessonStatus[key] = {
                currentQuestionIndex: 5,
                status: 'in-progress',
                currentScore: 0,
                history: []
            };
            localStorage.setItem('blitz-deck-storage', JSON.stringify(state));
        }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 1. ORDERING QUESTION (Assumed #1 now)
    await expect(page.locator('text=Arrange these U-Bahn stations')).toBeVisible({ timeout: 10000 });

    // Verify "Check Answer" is visible
    await expect(page.locator('button:has-text("Check Answer")')).toBeVisible();

    // Interact: Click Check Answer (likely fail)
    await page.click('button:has-text("Check Answer")');

    // Attempt skip (Fail 2x strategy)
    // Click Try Again if visible, or Check Answer again
    if (await page.isVisible('button:has-text("Try Again")')) {
        await page.click('button:has-text("Try Again")');
    }
    await page.click('button:has-text("Check Answer")');

    // Click Next
    await page.click('button:has-text("Next")');

    // 2. MULTIPLE RESPONSE (Assumed #2)
    await expect(page.locator('text=Which of these are valid ticket types')).toBeVisible();

    // Select correct ones
    await page.click('text=Jahreskarte (Annual Pass)');
    await page.click('text=24-Stunden-Karte (24h Ticket)');
    await page.click('text=Einzelfahrt (Single Ride)');

    // Submit
    await page.click('button:has-text("Check Answer")');
    await expect(page.locator('text=Correct!')).toBeVisible();

    // Next
    await page.click('button:has-text("Next")');

    // 3. CATEGORIZE (Assumed #3)
    await expect(page.locator('text=Categorize these transport lines')).toBeVisible();

    // Verify buckets
    await expect(page.locator('text=U-Bahn')).toBeVisible();
    await expect(page.locator('text=Bus')).toBeVisible();
    await expect(page.locator('text=Tram')).toBeVisible();

    // Verify items in pool (or somewhere)
    await expect(page.locator('text=U1')).toBeVisible();
    await expect(page.locator('text=13A')).toBeVisible();
});
