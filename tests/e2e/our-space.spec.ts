import { expect, test } from '@playwright/test';

const locales = ['vi', 'en', 'ko'] as const;
const stories = [
  'morning-light',
  'quiet-table',
  'downstairs',
  'upstairs',
] as const;

for (const locale of locales) {
  test(`renders the localized Our Space page for ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    const response = await page.goto(`/${locale}/our-space`);

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveCount(1);

    for (const story of stories) {
      await expect(page.locator(`[data-space-story="${story}"]`)).toHaveCount(
        1,
      );
    }

    await expect(
      page.locator(`[data-space-callout] a[href="/${locale}/visit"]`),
    ).toHaveCount(1);

    const overflow = await page
      .locator('h1, h2, h3, p')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => node.scrollWidth > node.clientWidth).length,
      );
    expect(overflow).toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  });
}
