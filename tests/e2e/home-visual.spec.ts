import { expect, test } from '@playwright/test';

const locales = ['vi', 'en', 'ko'] as const;
const viewports = [
  { height: 900, name: 'desktop-1440x900', width: 1440 },
  { height: 1024, name: 'tablet-768x1024', width: 768 },
  { height: 844, name: 'mobile-390x844', width: 390 },
] as const;

for (const locale of locales) {
  for (const viewport of viewports) {
    test(`keeps ${locale} Home composed at ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const response = await page.goto(`/${locale}`, {
        waitUntil: 'networkidle',
      });

      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole('heading', { level: 1, name: 'NAVIDO' }),
      ).toBeInViewport();

      const images = page.locator('main img');
      await expect(images).toHaveCount(6);
      for (let index = 0; index < 6; index += 1) {
        const image = images.nth(index);
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate((element) => {
              const htmlImage = element as HTMLImageElement;
              return htmlImage.complete && htmlImage.naturalWidth > 0;
            }),
          )
          .toBe(true);
      }
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' }),
      );

      const metrics = await page.evaluate(() => {
        const main = document.querySelector('main');
        const sections = Array.from(main?.children ?? []);
        const images = Array.from(document.images);
        const heroBackground = getComputedStyle(
          sections[0]?.querySelector('div') ?? sections[0] ?? document.body,
        ).backgroundImage;

        return {
          documentScrollWidth: document.documentElement.scrollWidth,
          heroBackground,
          imageCount: images.length,
          loadedImageCount: images.filter(
            (image) => image.complete && image.naturalWidth > 0,
          ).length,
          mainSectionCount: sections.length,
          sectionScrollWidths: sections.map((section) => section.scrollWidth),
        };
      });

      expect(metrics.documentScrollWidth).toBeLessThanOrEqual(viewport.width);
      expect(metrics.mainSectionCount).toBe(4);
      expect(metrics.imageCount).toBe(6);
      expect(metrics.loadedImageCount).toBe(6);
      expect(metrics.heroBackground).toContain('home-cafe-interior.jpg');
      expect(
        metrics.sectionScrollWidths.every((width) => width <= viewport.width),
      ).toBe(true);

      const screenshot = await page.screenshot({
        path: `artifacts/visual-qa/home/${locale}-${viewport.name}.png`,
      });

      expect(screenshot.byteLength).toBeGreaterThan(30_000);
    });
  }
}
