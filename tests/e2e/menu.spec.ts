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
    await expect(page.locator('[data-menu-introduction]')).toHaveCount(1);
    await expect(page.locator('[data-menu-introduction] img')).toHaveAttribute(
      'loading',
      'lazy',
    );
    await expect(page.locator('[data-menu-picks]')).toHaveCount(1);
    await expect(page.locator('[data-menu-feature]')).toHaveCount(4);
    await expect(page.locator('[data-menu-editorial-image]')).toHaveCount(9);
    await expect(page.locator('[data-menu-chapter="signature"]')).toHaveCount(
      1,
    );
    await expect(page.locator('[data-menu-chapter="compact"]')).toHaveCount(1);
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

test('follows the mobile Stitch media sequence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/menu');

  await expect(page.locator('[data-menu-editorial-image]:visible')).toHaveCount(
    3,
  );
  await expect(
    page.locator('[data-menu-editorial-image]:visible img:visible').first(),
  ).toHaveAttribute('loading', 'eager');
  await expect(
    page.locator('[data-menu-editorial-image]:visible img:visible').first(),
  ).toHaveAttribute('sizes', 'calc(100vw - 40px)');
  await expect(
    page.locator(
      '[data-menu-editorial-image] [data-testid="editorial-image-frame"]:visible',
    ),
  ).toHaveCount(3);
  await expect(page.locator('[data-menu-picks]')).toBeHidden();
  await expect(page.locator('[data-menu-mobile-category-nav]')).toBeVisible();
  await expect(page.locator('[data-menu-desktop-category-nav]')).toBeHidden();

  for (const categoryId of ['signature', 'brew-coffee', 'brunch']) {
    const category = page.locator(`#${categoryId}`);
    const imageTop = await category
      .locator('[data-menu-editorial-image]:visible')
      .evaluate((element) => element.getBoundingClientRect().top);
    const firstItemTop = await category
      .locator('[data-menu-item]')
      .first()
      .evaluate((element) => element.getBoundingClientRect().top);

    expect(imageTop).toBeLessThan(firstItemTop);
  }
});
