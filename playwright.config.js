// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // 1. Directory where tests are located
  testDir: './tests',
  
  // 2. Timeout for each test
  timeout: 30000,
  
  // 3. Number of retries for failed tests
  retries: process.env.CI ? 2 : 0,
  
  // 4. Use all available CPUs in CI, 1 worker locally
  workers: process.env.CI ? '100%' : 1,
  
  // 5. Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  // 6. The magic: Start a web server before tests
  webServer: {
    // Command to start a simple static server
    command: 'npx http-server -p 8080 -c-1',
    // URL to poll
    url: 'http://localhost:8080',
    // Timeout for server to start
    timeout: 120000,
    // Reuse existing server in dev, start new in CI
    reuseExistingServer: !process.env.CI,
  },
  
  // 7. Base URL for all 'page.goto()' calls
  use: {
    baseURL: 'http://localhost:8080',
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    // Record video on failure
    video: 'retain-on-failure',
    // Trace on first retry
    trace: 'on-first-retry',
  },
  
  // 8. Browser projects to test
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
