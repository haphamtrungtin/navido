import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

type Viewport = Readonly<{ height: number; name: string; width: number }>;
type Metric = Readonly<{
  locale: string;
  viewport: Viewport;
  imageCount: number;
  loadedImageCount: number;
  documentScrollWidth: number;
  screenshotBytes: number;
}>;

const locales = ['vi', 'en', 'ko'] as const;
const viewports: readonly Viewport[] = [
  { height: 900, name: 'desktop-1440x900', width: 1440 },
  { height: 1024, name: 'tablet-768x1024', width: 768 },
  { height: 844, name: 'mobile-390x844', width: 390 },
];
const outputDirectory = join(
  process.cwd(),
  'artifacts',
  'visual-qa',
  'roastery',
);
const metrics: Metric[] = [];

test.afterAll(async () => {
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    join(outputDirectory, 'metrics.json'),
    `${JSON.stringify(metrics, null, 2)}\n`,
  );
});

for (const locale of locales) {
  for (const viewport of viewports) {
    test(`verifies ${locale} Roastery at ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const response = await page.goto(`/${locale}/roastery`, {
        waitUntil: 'networkidle',
      });

      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(
        page.locator('[data-roastery-section="hero"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-roastery-section="process"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-roastery-section="visit"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-roastery-media-status="temporary"]'),
      ).toHaveCount(1);

      const images = page.locator('main img');
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate((element) => {
              const nativeImage = element as HTMLImageElement;
              return nativeImage.complete && nativeImage.naturalWidth > 0;
            }),
          )
          .toBe(true);
      }

      const measured = await page.evaluate(() => ({
        documentScrollWidth: document.documentElement.scrollWidth,
        imageCount: document.querySelectorAll('main img').length,
        loadedImageCount: Array.from(
          document.querySelectorAll('main img'),
        ).filter(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ).length,
      }));

      expect(measured.imageCount).toBe(2);
      expect(measured.loadedImageCount).toBe(2);
      expect(measured.documentScrollWidth).toBeLessThanOrEqual(viewport.width);

      const screenshot = await page.screenshot({
        path: join(outputDirectory, `${locale}-${viewport.name}.png`),
      });
      expect(screenshot.byteLength).toBeGreaterThan(30_000);
      metrics.push({
        ...measured,
        locale,
        screenshotBytes: screenshot.byteLength,
        viewport,
      });
    });
  }
}
