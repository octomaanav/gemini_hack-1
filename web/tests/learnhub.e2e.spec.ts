import { test, expect } from '@playwright/test';

test('Braille + Story + Command Palette', async ({ page, request }) => {
  // Resolve a deterministic fixture route from the API (test-only endpoint).
  const apiBase = process.env.E2E_API_BASE || 'http://localhost:8000';
  const fixture = await request.get(`${apiBase}/api/test/fixture`);
  expect(fixture.ok()).toBeTruthy();
  const { route } = await fixture.json();
  expect(typeof route).toBe('string');

  await page.goto(route);

  // Story compile
  await page.getByRole('button', { name: 'Compile' }).click();
  await expect(page.getByRole('region', { name: 'Story mode player' })).toBeVisible({ timeout: 30_000 });

  // Braille preview
  await page.getByRole('button', { name: 'Generate Preview' }).click();
  await expect(page.getByText('Preview status:')).toBeVisible();
  await expect(page.locator('pre')).toBeVisible({ timeout: 30_000 });

  // Command palette toggles focus mode
  const isMac = (await page.evaluate(() => navigator.platform.toLowerCase().includes('mac'))) as boolean;
  await page.keyboard.press(isMac ? 'Meta+K' : 'Control+K');
  await page.getByRole('button', { name: 'focus mode on' }).click();

  await expect(page.locator('html')).toHaveAttribute('data-focus-mode', 'true');
});

