import { test, expect } from '@playwright/test';

test.describe('SDK Test Page', () => {
  test('buttons render', async ({ page }) => {
    await page.goto('/sdk-test');

    await expect(page.getByRole('button', { name: 'Mock' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Server (BYOK)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stream SSE' })).toBeVisible();
  });

  test('provider health endpoint returns structured JSON', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/api/provider-health`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toHaveProperty('ok');
    expect(json).toHaveProperty('results');
  });

  test('edge mock endpoint returns ok', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/api/sdk-test-edge?mock=1`);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toEqual({ ok: true, provider: 'mock', message: 'Edge OK' });
  });

  test('stream endpoint returns SSE lines', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/api/sdk-stream`);
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain('data: response');
    expect(text).toContain('data: done');
  });
});


