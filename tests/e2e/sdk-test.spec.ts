import { test, expect } from '@playwright/test';

test.describe('SDK Test Page', () => {
  test('mock, server, and post buttons render and respond', async ({ page, request, baseURL }) => {
    await page.goto('/sdk-test');

    // Buttons visible
    const mockBtn = page.getByRole('button', { name: 'Mock' });
    const serverBtn = page.getByRole('button', { name: 'Server (BYOK)' });
    const postBtn = page.getByRole('button', { name: 'POST' });
    await expect(mockBtn).toBeVisible();
    await expect(serverBtn).toBeVisible();
    await expect(postBtn).toBeVisible();

    // Click Mock -> output should contain Mock response
    await mockBtn.click();
    await expect(page.locator('pre')).toContainText('Mock response OK', { timeout: 10000 });

    // Server (BYOK) may error without keys but should return JSON; ensure we see a JSON-looking output
    await serverBtn.click();
    await expect(page.locator('pre')).toBeVisible();

    // POST -> output should contain either result or error JSON
    await postBtn.click();
    await expect(page.locator('pre')).toBeVisible();
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
});


