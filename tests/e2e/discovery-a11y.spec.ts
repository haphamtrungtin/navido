import { expect, test } from '@playwright/test';

const locales = ['vi', 'en', 'ko'] as const;
const pages = ['about', 'menu', 'our-space', 'roastery', 'visit'] as const;

for (const locale of locales) {
  test.describe(`${locale} discovery and accessibility contract`, () => {
    for (const pageName of pages) {
      test(`${pageName} exposes crawlable, accessible output`, async ({
        page,
      }) => {
        const response = await page.goto(`/${locale}/${pageName}`);

        expect(response?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('title')).toHaveCount(1);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
          'content',
          /.+/,
        );
        await expect(
          page.locator('script#navido-local-business-schema'),
        ).toHaveCount(1);

        const audit = await page.evaluate(() => {
          const schema = document.querySelector<HTMLScriptElement>(
            '#navido-local-business-schema',
          );
          const images = [...document.images];
          const externalLinks = [
            ...document.querySelectorAll<HTMLAnchorElement>(
              'a[target="_blank"]',
            ),
          ];

          return {
            imageAlts: images.map((image) => image.alt.trim()),
            schemaType: schema
              ? JSON.parse(schema.textContent ?? '{}')['@type']
              : null,
            safeExternalLinks: externalLinks.every((link) =>
              link.rel.split(/\s+/).includes('noreferrer'),
            ),
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: window.innerWidth,
          };
        });

        expect(audit.schemaType).toBe('CafeOrCoffeeShop');
        expect(audit.imageAlts.every(Boolean)).toBe(true);
        expect(audit.safeExternalLinks).toBe(true);
        expect(audit.scrollWidth).toBeLessThanOrEqual(audit.viewportWidth);
      });
    }
  });
}
