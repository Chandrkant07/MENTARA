// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PW_BASE_URL || 'http://127.0.0.1:3000';
const API_BASE = process.env.PW_API_BASE || 'http://127.0.0.1:8000/api';

test.describe('Student smoke', () => {
  test('login and load student dashboard + exams list', async ({ page, request }) => {
    /** @type {Array<string>} */ const consoleErrors = [];
    /** @type {Array<string>} */ const pageErrors = [];
    /** @type {Array<string>} */ const requestFailures = [];

    page.on('pageerror', (err) => pageErrors.push(String(err)));
    page.on('requestfailed', (req) => {
      const failure = req.failure();
      requestFailures.push(`${req.method()} ${req.url()} -> ${failure ? failure.errorText : 'FAILED'}`);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Preflight backend
    const resp = await request.get(`${API_BASE}/health/`, { timeout: 5000 });
    expect(resp.ok(), `Backend not reachable at ${API_BASE}/health/`).toBeTruthy();

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });

    await page.locator('#username').fill('student');
    await page.locator('#password').fill('student123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 15000 });

    // Exams list route exists and renders
    await page.goto(`${BASE_URL}/exams`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Available Exams/i)).toBeVisible({ timeout: 15000 });

    // If there is a Start button, click it, submit immediately, and ensure results load.
    const startLinks = page.getByRole('link', { name: /^Start$/ });
    const startCount = await startLinks.count();
    if (startCount > 0) {
      page.on('dialog', async (dialog) => {
        // Accept the "unanswered questions" confirmation
        await dialog.accept();
      });

      await startLinks.first().click();
      await expect(page).toHaveURL(/\/test\//, { timeout: 15000 });

      // Wait for the submit button to appear, then submit.
      const submitBtn = page.getByRole('button', { name: /Submit Test/i });
      await expect(submitBtn).toBeVisible({ timeout: 20000 });
      await submitBtn.click();

      // Should navigate to results
      await expect(page).toHaveURL(/\/results\//, { timeout: 20000 });
      await expect(page.getByText(/Test Results/i)).toBeVisible({ timeout: 20000 });
    }

    expect(pageErrors, `Page errors:\n${pageErrors.join('\n')}`).toEqual([]);
    expect(consoleErrors, `Console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
    expect(requestFailures, `Request failures:\n${requestFailures.join('\n')}`).toEqual([]);
  });
});
