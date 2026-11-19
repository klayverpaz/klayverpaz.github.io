import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:8765' },
  webServer: { command: 'python3 -m http.server 8765 --bind 127.0.0.1', url: 'http://127.0.0.1:8765/', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
