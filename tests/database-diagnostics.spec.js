import { test, expect } from '@playwright/test';

test.describe('Database Diagnostics', () => {
  
  test('should retrieve database version correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the database to initialize
    await page.waitForTimeout(1000);
    
    // Navigate to settings
    await page.evaluate(() => {
      const navBar = document.querySelector('nav-bar');
      if (navBar && navBar.shadowRoot) {
        const settingsLink = navBar.shadowRoot.querySelector('[data-view="settings"]');
        if (settingsLink) {
          settingsLink.click();
        }
      }
    });
    
    // Wait for GSAP animation to complete
    await page.waitForTimeout(600);
    
    // Wait for diagnostics to load (they load automatically when navigating to settings)
    await page.waitForTimeout(1500);
    
    // Check that the database version is displayed and is not "unknown"
    const versionElement = page.locator('.diagnostics-container .diagnostic-item:has-text("Database Name") .diagnostic-value');
    await expect(versionElement).toBeVisible();
    
    const versionText = await versionElement.textContent();
    console.log('Database version text:', versionText);
    
    // Verify that the version is NOT "unknown"
    expect(versionText).not.toContain('unknown');
    
    // Verify that the version contains a number (e.g., "WorkoutAppDB (v3)")
    expect(versionText).toMatch(/v\d+/);
  });
  
  test('should show database status as available', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the database to initialize
    await page.waitForTimeout(1000);
    
    // Navigate to settings
    await page.evaluate(() => {
      const navBar = document.querySelector('nav-bar');
      if (navBar && navBar.shadowRoot) {
        const settingsLink = navBar.shadowRoot.querySelector('[data-view="settings"]');
        if (settingsLink) {
          settingsLink.click();
        }
      }
    });
    
    // Wait for GSAP animation and diagnostics to load
    await page.waitForTimeout(2000);
    
    // Check that database status is shown as available
    const statusBadge = page.locator('.diagnostic-item:has-text("Database Status") .status-badge');
    await expect(statusBadge).toBeVisible();
    
    const statusText = await statusBadge.textContent();
    expect(statusText).toContain('Available');
    
    // Verify it has the success class
    await expect(statusBadge).toHaveClass(/status-success/);
  });
  
  test('should display table counts in diagnostics', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the database to initialize
    await page.waitForTimeout(1000);
    
    // Navigate to settings
    await page.evaluate(() => {
      const navBar = document.querySelector('nav-bar');
      if (navBar && navBar.shadowRoot) {
        const settingsLink = navBar.shadowRoot.querySelector('[data-view="settings"]');
        if (settingsLink) {
          settingsLink.click();
        }
      }
    });
    
    // Wait for GSAP animation and diagnostics to load
    await page.waitForTimeout(2000);
    
    // Check that data records are displayed
    const dataRecordsElement = page.locator('.diagnostic-item:has-text("Data Records") .diagnostic-value');
    await expect(dataRecordsElement).toBeVisible();
    
    const dataRecordsText = await dataRecordsElement.textContent();
    console.log('Data records text:', dataRecordsText);
    
    // Verify that it contains exercise counts
    expect(dataRecordsText).toContain('Exercises:');
    expect(dataRecordsText).toContain('Templates:');
    expect(dataRecordsText).toContain('Programs:');
  });
  
  test('should refresh diagnostics when button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the database to initialize
    await page.waitForTimeout(1000);
    
    // Navigate to settings
    await page.evaluate(() => {
      const navBar = document.querySelector('nav-bar');
      if (navBar && navBar.shadowRoot) {
        const settingsLink = navBar.shadowRoot.querySelector('[data-view="settings"]');
        if (settingsLink) {
          settingsLink.click();
        }
      }
    });
    
    // Wait for GSAP animation and initial diagnostics to load
    await page.waitForTimeout(2000);
    
    // Get the initial version text
    const versionElement = page.locator('.diagnostics-container .diagnostic-item:has-text("Database Name") .diagnostic-value');
    const initialVersionText = await versionElement.textContent();
    
    // Click the refresh button
    await page.click('button:has-text("Refresh Diagnostics")');
    
    // Wait for refresh to complete
    await page.waitForTimeout(1000);
    
    // Get the new version text
    const newVersionText = await versionElement.textContent();
    
    // Version should still not be "unknown"
    expect(newVersionText).not.toContain('unknown');
    expect(newVersionText).toMatch(/v\d+/);
  });
});
