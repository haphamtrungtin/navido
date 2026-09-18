import { expect, test } from '@playwright/test';

const locales = ['vi', 'en', 'ko'] as const;
const verifiedAddress =
  '23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh';
const localizedDaily = { vi: 'Mỗi ngày', en: 'Daily', ko: '매일' } as const;

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
    await expect(page.locator('[data-home-section]')).toHaveCount(4);
    await expect(page.getByRole('main').locator('img')).toHaveCount(6);

    const location = page.locator('[data-home-section="location-invitation"]');
    await expect(location).toContainText(verifiedAddress);
    await expect(location).toContainText('07:00–22:00');
    await expect(location).toContainText(localizedDaily[locale]);
    await expect(location.locator(`a[href="/${locale}/visit"]`)).toBeVisible();
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
