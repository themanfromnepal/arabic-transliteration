import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Tablet breakpoint QA. 1024px is the `lg:` boundary in the design, and the range between the
    // 768px and 1024px breakpoints is where layout regressions hide. Every spec runs at both widths.
    {
      name: 'tablet-1024',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
