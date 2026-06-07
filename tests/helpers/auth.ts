import { Page } from '@playwright/test';

export async function loginAsLearner(page: Page) {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'learner@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
}

export async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
}
