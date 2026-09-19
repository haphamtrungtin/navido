import { expect, test } from '@playwright/test';

import { businessProfile } from '../../src/lib/business-profile';
import { conversionLinks } from '../../src/lib/conversion-links';

const locales = ['vi', 'en', 'ko'] as const;

for (const locale of locales) {
  test(`renders localized Roastery conversion page for ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    const response = await page.goto(`/${locale}/roastery`);

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-roastery-section="hero"]')).toBeVisible();
    await expect(
      page.locator('[data-roastery-section="process"]'),
    ).toBeVisible();
    await expect(page.locator('[data-commerce-control]')).toHaveCount(0);
    await expect(page.locator('main')).toContainText(businessProfile.address);

    await expect(
      page.locator(
        '[data-roastery-section="hero"] a[href="/' + locale + '/visit"]',
      ),
    ).toHaveCount(1);
    await expect(
      page.locator(`main a[href="${conversionLinks.maps}"]`),
    ).toHaveCount(2);
    await expect(
      page.locator(`main a[href="${conversionLinks.call}"]`),
    ).toHaveCount(1);
  });
}
