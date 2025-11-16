import { test, expect } from '@playwright/test';

test('Run in-browser Mocha unit tests', async ({ page }) => {
  // 1. Go to the local URL for the test runner
  await page.goto('/test/test.html');
  
  // 2. Wait for Mocha to finish
  // We poll the DOM for the '#mocha-stats' element
  await page.waitForSelector('.failures', { timeout: 30000 });
  
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
