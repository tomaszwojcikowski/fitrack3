import { test, expect } from '@playwright/test';

test.describe('Database Error Handling', () => {
  
  test('should handle database unavailability gracefully', async ({ page }) => {
    // Override IndexedDB to simulate it being unavailable (like in private browsing mode)
    await page.addInitScript(() => {
      // Simulate private browsing mode by making IndexedDB unavailable
      Object.defineProperty(window, 'indexedDB', {
        get: () => undefined,
        configurable: true
      });
    });
    
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForTimeout(2000);
    
    // Check that error banner is visible
    const banner = page.locator('.db-error-banner');
    await expect(banner).toBeVisible();
    
    // Check that error message is displayed
    const bannerText = await banner.textContent();
    expect(bannerText).toContain('Database');
    
    // The app should still load and display the home page
    await expect(page.locator('h1')).toContainText('Welcome to FiTrack3');
    
    // Stats should show 0 exercises (since database is not available)
    const exerciseCount = await page.locator('.stat-card').first().locator('.stat-value').textContent();
    expect(exerciseCount).toBe('0');
  });
  
  test('should work normally when IndexedDB is available', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load and database to be seeded
    await page.waitForTimeout(2000);
    
    // Check that error banner is NOT visible
    const banner = page.locator('.db-error-banner');
    await expect(banner).not.toBeVisible();
    
    // The app should load normally
    await expect(page.locator('h1')).toContainText('Welcome to FiTrack3');
    
    // Stats should show exercises (database working)
    const exerciseCount = await page.locator('.stat-card').first().locator('.stat-value').textContent();
    expect(parseInt(exerciseCount)).toBeGreaterThan(0);
  });
  
  test('should display user-friendly error message on mobile device', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    
    const page = await context.newPage();
    
    // Override IndexedDB to simulate private browsing mode on iOS
    await page.addInitScript(() => {
      Object.defineProperty(window, 'indexedDB', {
        get: () => undefined,
        configurable: true
      });
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check that error banner is visible on mobile
    const banner = page.locator('.db-error-banner');
    await expect(banner).toBeVisible();
    
    // Error banner should be properly styled and visible on mobile
    const bannerBox = await banner.boundingBox();
    expect(bannerBox.width).toBeGreaterThan(300); // Should span most of mobile width
    
    await context.close();
  });
});
