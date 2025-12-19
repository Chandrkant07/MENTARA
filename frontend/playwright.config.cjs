const path = require('path');
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: path.join(__dirname, 'tests'),
  testMatch: ['**/*.spec.{js,ts,mjs,cjs}'],
  timeout: 60_000,
  retries: 0,
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  use: {
    baseURL: process.env.PW_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
