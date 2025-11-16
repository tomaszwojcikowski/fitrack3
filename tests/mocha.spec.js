import { test, expect } from '@playwright/test';

test('Run in-browser Mocha unit tests', async ({ page }) => {
  // Listen for console messages
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  // Listen for page errors
  page.on('pageerror', err => console.error('Page error:', err.message));
  
  // 1. Go to the local URL for the test runner
  await page.goto('/test/test.html');
  
  // 2. Wait for Mocha to finish running all tests
  // Wait for the test run to complete (look for the stats that appear after run)
  await page.waitForSelector('.passes em', { timeout: 30000 });
  
  // Add a small delay to ensure all async tests have completed
  await page.waitForTimeout(2000);
  
  // 3. Check the "failures" count in the report
  const failuresElement = await page.locator('.failures em');
  const failures = await failuresElement.textContent();
  
  // 4. Get the passes count
  const passesElement = await page.locator('.passes em');
  const passes = await passesElement.textContent();
  
  console.log(`Mocha tests completed: ${passes} passes, ${failures} failures`);
  
  // 5. Assert that 0 failures were reported
  expect(failures).toBe('0');
  
  // 6. Also verify we have some passing tests
  expect(parseInt(passes)).toBeGreaterThan(0);
});
