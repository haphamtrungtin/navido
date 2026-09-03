import { expect, test } from '@playwright/test';

const locales = ['vi', 'en', 'ko'] as const;

for (const locale of locales) {
  test(`renders the complete localized Home page for ${locale}`, async ({
    page,
  }) => {
    const response = await page.goto(`/${locale}`);

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: 'NAVIDO' }),
    ).toHaveCount(1);
    await expect(
      page.locator(`a[href="/${locale}/menu"]`).first(),
    ).toBeVisible();
    await expect(
      page.locator(`a[href="/${locale}/visit"]`).first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-home-section="signature-highlights"]'),
    ).toBeVisible();
  });

  for (const destination of ['menu', 'visit'] as const) {
    test(`serves the ${destination} CTA destination for ${locale}`, async ({
      page,
    }) => {
      const response = await page.goto(`/${locale}/${destination}`);

      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByRole('main')).toBeVisible();
    });
  }
}
