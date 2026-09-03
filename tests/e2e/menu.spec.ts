import { expect, test } from '@playwright/test';

const locales = [
  { code: 'vi', title: 'Thực đơn' },
  { code: 'en', title: 'Menu' },
  { code: 'ko', title: '메뉴' },
] as const;

for (const locale of locales) {
  test(`renders the normalized menu for ${locale.code}`, async ({ page }) => {
    const response = await page.goto(`/${locale.code}/menu`);

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale.code);
    await expect(
      page.getByRole('heading', { level: 1, name: locale.title }),
    ).toHaveCount(1);
    await expect(page.locator('[data-menu-item]')).toHaveCount(130);
    await expect(page.getByText('ITEM_TYPE-MVIF', { exact: true })).toHaveCount(
      0,
    );
  });
}

test('keeps long menu item labels within their rows', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/menu');

  const overflow = await page
    .locator('[data-menu-item-name]')
    .evaluateAll((labels) =>
      labels.some((label) => label.scrollWidth > label.clientWidth + 1),
    );

  expect(overflow).toBe(false);
});
