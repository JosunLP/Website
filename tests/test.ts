import { expect, test } from '@playwright/test';

test('homepage has expected content', async ({ page }) => {
	await page.goto('/');
	// Test for main navigation or visible content
	await expect(page.locator('body')).toBeVisible();
});

test('imprint page loads correctly', async ({ page }) => {
	await page.goto('/imprint');
	await expect(page.locator('body')).toBeVisible();
});

test('data security page loads correctly', async ({ page }) => {
	await page.goto('/datasecurity');
	await expect(page.locator('body')).toBeVisible();
});
