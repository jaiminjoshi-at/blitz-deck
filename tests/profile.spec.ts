import { test, expect } from '@playwright/test';
import { loginAsLearner } from './helpers/auth';
import { db } from '@/lib/db';

test.describe('Profile Management', () => {
    test('should allow editing profile name', async ({ page }) => {
        const learner = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, 'learner@test.com')
        });
        
        if (!learner) {
            throw new Error('Learner not found in database');
        }

        // Log in
        await loginAsLearner(page);
        
        // Navigate to edit profile page
        await page.goto('/profile');
        
        // Verify input field contains current name
        const nameInput = page.getByLabel('Your Name');
        await expect(nameInput).toHaveValue(learner.name || '');
        
        // Update profile name
        const updatedName = 'Updated Test Learner';
        await nameInput.fill(updatedName);
        
        // Save changes
        await page.click('button:has-text("Save Changes")');
        
        // Verify success snackbar
        await expect(page.getByText('Profile saved successfully!')).toBeVisible();
    });
});
