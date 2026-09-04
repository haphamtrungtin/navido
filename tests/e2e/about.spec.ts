import { expect, test } from '@playwright/test';

const locales = ['vi', 'en', 'ko'] as const;
const themes = ['coffee', 'food', 'space', 'community'] as const;

for (const locale of locales) {
  test(`renders the localized About page for ${locale}`, async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    const response = await page.goto(`/${locale}/about`);

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveCount(1);

    for (const theme of themes) {
      await expect(page.locator(`[data-about-theme="${theme}"]`)).toHaveCount(
        1,
      );
    }

    const textOverflow = await page
      .locator('h1, h2, h3, p')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => node.scrollWidth > node.clientWidth).length,
      );
    expect(textOverflow).toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  });
}
