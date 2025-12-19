// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PW_BASE_URL || 'http://127.0.0.1:3000';
const API_BASE = process.env.PW_API_BASE || 'http://127.0.0.1:8000/api';

test.describe('Teacher smoke', () => {
  test('login and load teacher dashboard with students', async ({ page, request }) => {
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

    await page.locator('#username').fill('teacher');
    await page.locator('#password').fill('teacher123');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to teacher dashboard
    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 15000 });

    try {
      // Basic visible content checks
      await expect(page.getByText(/Teacher Dashboard/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: /Students/i })).toBeVisible({ timeout: 10000 });

      expect(pageErrors, `Page errors:\n${pageErrors.join('\n')}`).toEqual([]);
      expect(consoleErrors, `Console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
      expect(requestFailures, `Request failures:\n${requestFailures.join('\n')}`).toEqual([]);
    } catch (err) {
      const url = page.url();
      let bodyText = '';
      let html = '';
      try {
        bodyText = await page.locator('body').innerText();
      } catch {}
      try {
        html = await page.content();
      } catch {}

      console.log('--- Teacher smoke debug ---');
      console.log('URL:', url);
      if (pageErrors.length) console.log('Page errors:\n' + pageErrors.join('\n'));
      if (consoleErrors.length) console.log('Console errors:\n' + consoleErrors.join('\n'));
      if (requestFailures.length) console.log('Request failures:\n' + requestFailures.join('\n'));
      if (bodyText) console.log('Body text (first 800 chars):\n' + bodyText.slice(0, 800));

      if (html) {
        test.info().attach('page.html', { body: html, contentType: 'text/html' });
      }
      if (bodyText) {
        test.info().attach('body.txt', { body: bodyText, contentType: 'text/plain' });
      }

      throw err;
    }
  });
});
