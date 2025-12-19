import { test, expect } from '@playwright/test';
const BASE_API = process.env.BASE_API || 'http://localhost:8000/api';

test.describe('Mentara Test Taking E2E', () => {
  test('flow: start, keyboard, autosave, offline queue, submit', async ({ page, context }) => {
    await page.addInitScript(() => { window.localStorage.setItem('access_token', 'mock-token'); });
    await context.route(`${BASE_API}/exams/42/start/`, route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ attempt_id: 'attempt-uuid-123', expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), questions: [ { id: 101, type: 'mcq', statement: 'q1', choices: ['A','B','C','D'], time_est: 45 }, { id: 102, type: 'multi', statement: 'q2', choices: ['A','B','C','D'], time_est: 45 }, { id: 103, type: 'fib', statement: 'q3', choices: [], time_est: 30 }, ] }) });
    });
    await context.route(`${BASE_API}/attempts/attempt-uuid-123/resume/`, route => { route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answers: {}, times: {}, flagged: {} }) }); });
    await context.route(`${BASE_API}/attempts/attempt-uuid-123/save/`, route => { route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
    await context.route(`${BASE_API}/exams/42/submit/`, route => { route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total_score: 2, per_question: [{ question_id: 101, correct: true, score: 1 }, { question_id: 102, correct: true, score: 1 }], percentile: null }) }); });

    await page.goto('http://localhost:3000'); // adapt to your dev server
    // Render: simulate app mounting TestTakingPage
    // This E2E assumes router mounts TestTakingPage at /test/42
    await page.goto('http://localhost:3000/test/42');

    await expect(page.getByText('Question 1 of')).toBeVisible();
    await page.keyboard.press('1');
    await expect(page.getByLabel('Autosave status')).toContainText('Saved');
    await context.setOffline(true);
    await page.keyboard.press('N');
    await page.keyboard.press('2');
    await expect(page.getByLabel('Autosave status')).toContainText('Offline: queued');
    await context.setOffline(false);
    await page.waitForTimeout(6000);
    await expect(page.getByLabel('Autosave status')).toContainText('All saves synced');
    await page.keyboard.press('S');
    await page.getByRole('button', { name: /submit/i }).click();
    await expect(page.getByText('Results')).toBeVisible();
    await expect(page.getByText('Total Score: 2')).toBeVisible();
  });
});
