import { test, expect } from '@playwright/test';

test.describe('FiTrack3 Web Application', () => {
  
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads and contains the app title
    await expect(page.locator('h1')).toContainText('Welcome to FiTrack3');
    
    // Check that the navigation bar is present
    const navBar = page.locator('nav-bar');
    await expect(navBar).toBeAttached();
  });
  
  test('should navigate to exercise library', async ({ page }) => {
    await page.goto('/');
    
    // Click on the Library navigation link using evaluate which returns inside shadow DOM
    await page.evaluate(() => {
      const navBar = document.querySelector('nav-bar');
      const shadowRoot = navBar.shadowRoot;
      const libraryLink = shadowRoot.querySelector('[data-view="library"]');
      libraryLink.click();
    });
    
    // Wait for the library view heading to appear
    await expect(page.locator('h1')).toContainText('Exercise Library', { timeout: 10000 });
  });
  
  test('should display seeded exercises in the library', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to library using the button
    await page.click('text=Browse Exercises');
    
    // Wait for exercises to load
    await page.waitForTimeout(1000);
    
    // Check that exercise cards are displayed
    const exerciseCards = page.locator('exercise-card');
    const count = await exerciseCards.count();
    
    expect(count).toBeGreaterThan(0);
  });
  
  test('should filter exercises by muscle group', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to library
    await page.click('text=Browse Exercises');
    await page.waitForTimeout(500);
    
    // Get initial count
    const initialCards = await page.locator('exercise-card').count();
    
    // Select a specific muscle group
    await page.selectOption('select#muscle-filter', 'Legs');
    await page.waitForTimeout(500);
    
    // Get filtered count
    const filteredCards = await page.locator('exercise-card').count();
    
    // Filtered count should be less than or equal to initial count
    expect(filteredCards).toBeLessThanOrEqual(initialCards);
    expect(filteredCards).toBeGreaterThan(0);
  });
  
  test('should show all exercises when "All" filter is selected', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to library
    await page.click('text=Browse Exercises');
    await page.waitForTimeout(500);
    
    // Get initial count
    const initialCards = await page.locator('exercise-card').count();
    
    // Select a specific muscle group first
    await page.selectOption('select#muscle-filter', 'Chest');
    await page.waitForTimeout(500);
    
    // Now select "All" again
    await page.selectOption('select#muscle-filter', 'All');
    await page.waitForTimeout(500);
    
    // Get count after selecting "All"
    const allCards = await page.locator('exercise-card').count();
    
    // Should be back to the initial count
    expect(allCards).toBe(initialCards);
  });
  
  test('should display exercise stats on home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for data to load
    await page.waitForTimeout(1000);
    
    // Check that stat cards are present
    const statCards = page.locator('.stat-card');
    const count = await statCards.count();
    
    expect(count).toBe(3);
    
    // Check that the exercise count is displayed and greater than 0
    const exerciseCountText = await page.locator('.stat-card').first().locator('.stat-value').textContent();
    const exerciseCount = parseInt(exerciseCountText);
    
    expect(exerciseCount).toBeGreaterThan(0);
  });
  
  test('should navigate between different views', async ({ page }) => {
    await page.goto('/');
    
    // Start at home
    await expect(page.locator('h1')).toContainText('Welcome to FiTrack3');
    
    // Navigate to workout
    await page.click('text=Start Workout');
    await expect(page.locator('h1')).toContainText('Start Workout', { timeout: 10000 });
    
    // Navigate to library via nav bar
    await page.evaluate(() => {
      const navBar = document.querySelector('nav-bar');
      const shadowRoot = navBar.shadowRoot;
      const libraryLink = shadowRoot.querySelector('[data-view="library"]');
      libraryLink.click();
    });
    await expect(page.locator('h1')).toContainText('Exercise Library', { timeout: 10000 });
    
    // Navigate back to home via nav bar
    await page.evaluate(() => {
      const navBar = document.querySelector('nav-bar');
      const shadowRoot = navBar.shadowRoot;
      const homeLink = shadowRoot.querySelector('[data-view="home"]');
      homeLink.click();
    });
    await expect(page.locator('h1')).toContainText('Welcome to FiTrack3', { timeout: 10000 });
  });
});
