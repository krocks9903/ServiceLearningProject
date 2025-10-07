import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check if the page title is correct
  await expect(page).toHaveTitle(/Service Learning/);
  
  // Check if main content is visible
  await expect(page.locator('main')).toBeVisible();
});
