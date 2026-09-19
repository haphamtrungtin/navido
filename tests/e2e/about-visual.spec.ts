import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';
import { format } from 'prettier';

type Locale = 'vi' | 'en' | 'ko';
type Viewport = Readonly<{ height: number; name: string; width: number }>;
type Bounds = Readonly<{
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}>;
type GridItem = Readonly<{
  copySpan: number;
  copyStart: number;
  imageSpan: number;
  imageStart: number;
}>;
type ThemePosition = Readonly<{
  copy: Bounds;
  domImageBeforeCopy: boolean;
  frame: Bounds;
  grid: Bounds;
  gridColumnGap: number;
  gridTracks: number[];
  horizontalGap: number;
  imageAboveCopy: boolean;
  imageLeftOfCopy: boolean;
  imageNaturalRatio: number;
  imageObjectFit: string;
  imageObjectPosition: string;
  imageRatio: number;
  verticalGap: number;
}>;
type IntroductionPosition = Readonly<{
  copy: Bounds;
  frame: Bounds;
  imageNaturalRatio: number;
  imageObjectFit: string;
  imageObjectPosition: string;
  imageRatio: number;
}>;
type LayoutContract = Readonly<{
  copyLeft: number;
  copyWidth: number;
  frameHeight: number;
  frameLeft: number;
  frameWidth: number;
  horizontalGap?: number;
}>;
type Metrics = Readonly<{
  captureScrollY: number;
  desktopHeaderMapsVisible: boolean;
  documentScrollWidth: number;
  mobileBarClearance: number | null;
  mobileBarVisible: boolean;
  imageCount: number;
  imageUrls: string[];
  introduction: IntroductionPosition;
  loadedImageCount: number;
  locale: Locale;
  screenshotBytes: number;
  sectionBounds: Bounds[];
  sectionOrder: string[];
  sectionPaddingTop: number[];
  sectionScrollWidths: number[];
  textBounds: Array<Readonly<{ rect: Bounds; section: Bounds }>>;
  textOverflowCount: number;
  themePositions: ThemePosition[];
  viewport: Viewport;
}>;

const locales: readonly Locale[] = ['vi', 'en', 'ko'];
const viewports: readonly Viewport[] = [
  { height: 900, name: 'desktop-1440x900', width: 1440 },
  { height: 1024, name: 'tablet-768x1024', width: 768 },
  { height: 844, name: 'mobile-390x844', width: 390 },
];
const themes = ['coffee', 'food', 'space', 'community'] as const;
const sectionOrder = ['introduction', ...themes] as const;
const approvedImageUrls = [
  '/images/stitch/about-street.jpg',
  '/images/stitch/about-pour-over.jpg',
  '/images/stitch/about-pastry.jpg',
  '/images/stitch/about-space.jpg',
  '/images/stitch/about-community.jpg',
] as const;
const expectedThemeRatios = [0.8, 1.25, 0.8, 1.25] as const;
const themeGrid: Record<Viewport['name'], readonly GridItem[]> = {
  'desktop-1440x900': [
    { copySpan: 4, copyStart: 8, imageSpan: 5, imageStart: 1 },
    { copySpan: 4, copyStart: 2, imageSpan: 5, imageStart: 7 },
    { copySpan: 4, copyStart: 8, imageSpan: 5, imageStart: 2 },
    { copySpan: 4, copyStart: 2, imageSpan: 6, imageStart: 7 },
  ],
  'tablet-768x1024': [
    { copySpan: 3, copyStart: 6, imageSpan: 4, imageStart: 1 },
    { copySpan: 3, copyStart: 1, imageSpan: 4, imageStart: 5 },
    { copySpan: 3, copyStart: 6, imageSpan: 4, imageStart: 1 },
    { copySpan: 3, copyStart: 1, imageSpan: 4, imageStart: 5 },
  ],
  'mobile-390x844': [
    { copySpan: 1, copyStart: 1, imageSpan: 1, imageStart: 1 },
    { copySpan: 1, copyStart: 1, imageSpan: 1, imageStart: 1 },
    { copySpan: 1, copyStart: 1, imageSpan: 1, imageStart: 1 },
    { copySpan: 1, copyStart: 1, imageSpan: 1, imageStart: 1 },
  ],
};
// These values are deliberately independent of the page's computed grid. They
// follow max-w-[1200px], px-5/md:px-6, 12/8/1 columns, and gap-12/gap-8 tokens.
const geometryContracts: Record<
  Viewport['name'],
  Readonly<{
    introduction: LayoutContract;
    themes: readonly LayoutContract[];
  }>
> = {
  'desktop-1440x900': {
    introduction: {
      copyLeft: 244,
      copyWidth: 352,
      frameHeight: 311,
      frameLeft: 744,
      frameWidth: 552,
    },
    themes: [
      {
        copyLeft: 844,
        copyWidth: 352,
        frameHeight: 565,
        frameLeft: 144,
        frameWidth: 452,
        horizontalGap: 248,
      },
      {
        copyLeft: 244,
        copyWidth: 352,
        frameHeight: 362,
        frameLeft: 744,
        frameWidth: 452,
        horizontalGap: 148,
      },
      {
        copyLeft: 844,
        copyWidth: 352,
        frameHeight: 565,
        frameLeft: 244,
        frameWidth: 452,
        horizontalGap: 148,
      },
      {
        copyLeft: 244,
        copyWidth: 352,
        frameHeight: 442,
        frameLeft: 744,
        frameWidth: 552,
        horizontalGap: 148,
      },
    ],
  },
  'tablet-768x1024': {
    introduction: {
      copyLeft: 24,
      copyWidth: 250,
      frameHeight: 246,
      frameLeft: 306,
      frameWidth: 438,
    },
    themes: [
      {
        copyLeft: 494,
        copyWidth: 250,
        frameHeight: 430,
        frameLeft: 24,
        frameWidth: 344,
        horizontalGap: 126,
      },
      {
        copyLeft: 24,
        copyWidth: 250,
        frameHeight: 275,
        frameLeft: 400,
        frameWidth: 344,
        horizontalGap: 126,
      },
      {
        copyLeft: 494,
        copyWidth: 250,
        frameHeight: 430,
        frameLeft: 24,
        frameWidth: 344,
        horizontalGap: 126,
      },
      {
        copyLeft: 24,
        copyWidth: 250,
        frameHeight: 275,
        frameLeft: 400,
        frameWidth: 344,
        horizontalGap: 126,
      },
    ],
  },
  'mobile-390x844': {
    introduction: {
      copyLeft: 20,
      copyWidth: 350,
      frameHeight: 197,
      frameLeft: 20,
      frameWidth: 350,
    },
    themes: [
      {
        copyLeft: 20,
        copyWidth: 350,
        frameHeight: 438,
        frameLeft: 20,
        frameWidth: 350,
      },
      {
        copyLeft: 20,
        copyWidth: 350,
        frameHeight: 280,
        frameLeft: 20,
        frameWidth: 350,
      },
      {
        copyLeft: 20,
        copyWidth: 350,
        frameHeight: 438,
        frameLeft: 20,
        frameWidth: 350,
      },
      {
        copyLeft: 20,
        copyWidth: 350,
        frameHeight: 280,
        frameLeft: 20,
        frameWidth: 350,
      },
    ],
  },
};
const outputDirectory = join(process.cwd(), 'artifacts', 'visual-qa', 'about');
const metrics: Metrics[] = [];

function expectedTracks(viewport: Viewport) {
  if (viewport.width >= 1024) return 12;
  if (viewport.width >= 768) return 8;
  return 1;
}

function composition(metric: Metrics) {
  return metric.themePositions
    .map((position) =>
      metric.viewport.width >= 768
        ? position.imageLeftOfCopy
          ? 'left'
          : 'right'
        : position.imageAboveCopy
          ? 'above'
          : 'below',
    )
    .join('/');
}

function expectNear(actual: number, expected: number, tolerance: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

test.afterAll(async () => {
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    join(outputDirectory, 'metrics.json'),
    await format(`${JSON.stringify(metrics, null, 2)}\n`, {
      filepath: 'metrics.json',
    }),
  );
  await writeFile(
    join(outputDirectory, 'comparison.md'),
    await format(
      `# About Visual QA

Generated by \`pnpm verify:about-visual\`. Desktop is compared against the approved Stitch editorial intent. Tablet is explicitly a derived eight-column layout, while mobile verifies the semantic image-before-copy reading sequence.

## Contracts

| Contract | Assertion |
| --- | --- |
| Sequence and sources | Introduction, coffee, food, space, community render in order with the five exact approved local image URLs |
| Frames and crops | Introduction and every theme frame match independent viewport dimensions, expected aspect ratios, cover rendering, and centered crop positions |
| Composition | Desktop and tablet use independently specified 12/8-column coordinates and negative-space gaps; mobile is one track |
| Copy and containment | Copy widths match their constrained grid spans; section and text rectangles remain inside the viewport and owning section |
| Mobile semantics | Each theme image precedes its copy in DOM order and rendered mobile order |
| Shell and capture | Shared header remains sticky and every full-page screenshot is captured at scroll position zero |

## Measurements

| Locale | Viewport | Theme composition | Images decoded | Capture scroll | Text overflow | Document width | Screenshot bytes |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: |
${metrics
  .map(
    (metric) =>
      `| ${metric.locale} | ${metric.viewport.name} | ${composition(metric)} | ${metric.loadedImageCount}/${metric.imageCount} | ${metric.captureScrollY} | ${metric.textOverflowCount} | ${metric.documentScrollWidth} | ${metric.screenshotBytes} |`,
  )
  .join('\n')}

## Comparison Notes

The geometry contracts are fixed expected measurements from the intended Tailwind container, gutter, grid, and gap tokens at 1440px, 768px, and 390px; they are not calculated from the live grid. Introduction and all theme images require a centered cover crop. Desktop preserves the intended asymmetry through independently measured image/copy positions and gaps. Tablet is a verified eight-column derivative of that placement. Mobile retains every theme in semantic image-before-copy order. The capture scroll position is zero for every artifact, so each screenshot begins at the shared shell and introduction.
`,
      { filepath: 'comparison.md' },
    ),
  );
});

for (const locale of locales) {
  for (const viewport of viewports) {
    test(`verifies ${locale} About at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const response = await page.goto(`/${locale}/about`, {
        waitUntil: 'networkidle',
      });

      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('[data-about-theme]')).toHaveCount(4);

      const images = page.locator('main img');
      await expect(images).toHaveCount(5);
      for (let index = 0; index < 5; index += 1) {
        const image = images.nth(index);
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

      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' }),
      );
      const headerTop = await page
        .locator('header')
        .evaluate((header) => Math.round(header.getBoundingClientRect().top));
      await page.evaluate(() =>
        window.scrollTo({ top: 480, behavior: 'instant' }),
      );
      expect(
        await page
          .locator('header')
          .evaluate((header) => Math.round(header.getBoundingClientRect().top)),
      ).toBe(headerTop);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' }),
      );
      await expect
        .poll(() => page.evaluate(() => Math.round(window.scrollY)))
        .toBe(0);

      const collected = await page.evaluate(() => {
        const toBounds = (rect: DOMRect): Bounds => ({
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
        });
        const main = document.querySelector('main');
        const sections = Array.from(
          main?.querySelectorAll<HTMLElement>(
            ':scope > [data-about-section]',
          ) ?? [],
        );
        const textNodes = Array.from(
          main?.querySelectorAll<HTMLElement>('h1, h2, h3, p') ?? [],
        );
        const pageImages = Array.from(main?.querySelectorAll('img') ?? []);
        const imageUrls = pageImages.map((image) => {
          const url = new URL(
            image.currentSrc || image.src,
            window.location.href,
          );
          return url.searchParams.get('url') ?? url.pathname;
        });
        const themePositions = Array.from(
          main?.querySelectorAll<HTMLElement>('[data-about-theme]') ?? [],
        ).map((theme) => {
          const grid = theme.querySelector<HTMLElement>('[data-about-grid]');
          const image = theme.querySelector<HTMLElement>(
            '[data-testid="editorial-image-frame"]',
          );
          const imageItem = image?.parentElement;
          const copy = theme.querySelector<HTMLElement>('[data-about-copy]');
          const body = copy?.querySelector<HTMLElement>('[data-about-body]');
          const imageRect = image?.getBoundingClientRect();
          const copyRect = copy?.getBoundingClientRect();
          const bodyRect = body?.getBoundingClientRect();
          const titleRect = copy?.querySelector('h2')?.getBoundingClientRect();
          const gridRect = grid?.getBoundingClientRect();
          const child = image?.querySelector('img');
          const gridStyle = grid ? getComputedStyle(grid) : null;
          const imageLeftOfCopy = Boolean(
            imageRect && copyRect && imageRect.left < copyRect.left,
          );

          return {
            copy: toBounds(copyRect ?? new DOMRect()),
            domImageBeforeCopy: Boolean(
              imageItem &&
              copy &&
              imageItem.compareDocumentPosition(copy) &
                Node.DOCUMENT_POSITION_FOLLOWING,
            ),
            frame: toBounds(imageRect ?? new DOMRect()),
            grid: toBounds(gridRect ?? new DOMRect()),
            gridColumnGap: Math.round(parseFloat(gridStyle?.columnGap ?? '0')),
            gridTracks: (gridStyle?.gridTemplateColumns ?? '')
              .split(' ')
              .filter(Boolean)
              .map((track) => parseFloat(track)),
            horizontalGap:
              imageRect && copyRect
                ? Math.round(
                    imageLeftOfCopy
                      ? copyRect.left - imageRect.right
                      : imageRect.left - copyRect.right,
                  )
                : 0,
            imageAboveCopy: Boolean(
              imageRect && copyRect && imageRect.bottom <= copyRect.top,
            ),
            imageLeftOfCopy,
            imageNaturalRatio:
              child && child.naturalHeight > 0
                ? child.naturalWidth / child.naturalHeight
                : 0,
            imageObjectFit: child ? getComputedStyle(child).objectFit : '',
            imageObjectPosition: child
              ? getComputedStyle(child).objectPosition
              : '',
            imageRatio: imageRect ? imageRect.width / imageRect.height : 0,
            verticalGap:
              bodyRect && titleRect
                ? Math.round(bodyRect.top - titleRect.bottom)
                : 0,
          };
        });
        const introduction = main?.querySelector<HTMLElement>(
          '[data-about-section="introduction"]',
        );
        const introductionFrame = introduction?.querySelector<HTMLElement>(
          '[data-testid="editorial-image-frame"]',
        );
        const introductionCopy =
          introduction?.querySelector<HTMLElement>('h1')?.parentElement;
        const introductionImage = introductionFrame?.querySelector('img');

        const headerMaps = document
          .querySelector('header nav')
          ?.parentElement?.querySelector<HTMLAnchorElement>(
            'a[href*="google.com/maps/search"]',
          );
        const mobileBar = document.querySelector<HTMLElement>(
          '[data-testid="mobile-conversion-bar"]',
        );
        const footerLinks =
          document.querySelectorAll<HTMLAnchorElement>('footer a');
        const finalFooterLink = footerLinks.item(footerLinks.length - 1);
        const shell = {
          desktopHeaderMapsVisible: Boolean(
            headerMaps && headerMaps.getClientRects().length > 0,
          ),
          mobileBarClearance:
            mobileBar && finalFooterLink
              ? Math.floor(
                  mobileBar.getBoundingClientRect().top -
                    (finalFooterLink.getBoundingClientRect().bottom -
                      Math.max(
                        0,
                        document.documentElement.scrollHeight -
                          window.innerHeight,
                      )),
                )
              : null,
          mobileBarVisible: Boolean(
            mobileBar && mobileBar.getClientRects().length > 0,
          ),
        };

        return {
          ...shell,
          captureScrollY: Math.round(window.scrollY),
          documentScrollWidth: document.documentElement.scrollWidth,
          imageCount: pageImages.length,
          imageUrls,
          introduction: {
            copy: toBounds(
              introductionCopy?.getBoundingClientRect() ?? new DOMRect(),
            ),
            frame: toBounds(
              introductionFrame?.getBoundingClientRect() ?? new DOMRect(),
            ),
            imageNaturalRatio:
              introductionImage && introductionImage.naturalHeight > 0
                ? introductionImage.naturalWidth /
                  introductionImage.naturalHeight
                : 0,
            imageObjectFit: introductionImage
              ? getComputedStyle(introductionImage).objectFit
              : '',
            imageObjectPosition: introductionImage
              ? getComputedStyle(introductionImage).objectPosition
              : '',
            imageRatio: introductionFrame
              ? introductionFrame.getBoundingClientRect().width /
                introductionFrame.getBoundingClientRect().height
              : 0,
          },
          loadedImageCount: pageImages.filter(
            (image) => image.complete && image.naturalWidth > 0,
          ).length,
          sectionBounds: sections.map((section) =>
            toBounds(section.getBoundingClientRect()),
          ),
          sectionOrder: sections.map(
            (section) => section.dataset.aboutSection ?? '',
          ),
          sectionPaddingTop: sections.map((section) =>
            Math.round(parseFloat(getComputedStyle(section).paddingTop)),
          ),
          sectionScrollWidths: sections.map((section) => section.scrollWidth),
          textBounds: textNodes.map((node) => {
            const section = node.closest<HTMLElement>('[data-about-section]');
            return {
              rect: toBounds(node.getBoundingClientRect()),
              section: toBounds(
                section?.getBoundingClientRect() ?? new DOMRect(),
              ),
            };
          }),
          textOverflowCount: textNodes.filter(
            (node) => node.scrollWidth > node.clientWidth,
          ).length,
          themePositions,
        };
      });

      const layout = themeGrid[viewport.name];
      const contract = geometryContracts[viewport.name];
      const tolerance = viewport.width < 768 ? 2 : 3;

      if (!layout || !contract) {
        throw new Error(`Missing viewport contract for ${viewport.name}`);
      }

      expect(collected.captureScrollY).toBe(0);
      expect(collected.sectionOrder).toEqual(sectionOrder);
      expect(collected.imageUrls).toEqual(approvedImageUrls);
      expect(collected.loadedImageCount).toBe(5);
      expect(collected.textOverflowCount).toBe(0);
      expect(collected.documentScrollWidth).toBeLessThanOrEqual(viewport.width);
      expect(collected.desktopHeaderMapsVisible).toBe(viewport.width >= 768);
      expect(collected.mobileBarVisible).toBe(viewport.width < 768);
      if (viewport.width < 768) {
        expect(collected.mobileBarClearance).toBeGreaterThanOrEqual(0);
      } else {
        expect(collected.mobileBarClearance).toBeNull();
      }
      expect(
        collected.sectionPaddingTop.every(
          (padding) => padding >= (viewport.width < 768 ? 70 : 110),
        ),
      ).toBe(true);
      expect(
        collected.sectionBounds.every(
          (section, index) =>
            section.left >= -tolerance &&
            section.right <= viewport.width + tolerance &&
            (collected.sectionScrollWidths[index] ?? Infinity) <=
              viewport.width,
        ),
      ).toBe(true);
      expect(
        collected.textBounds.every(
          ({ rect, section }) =>
            rect.left >= -tolerance &&
            rect.right <= viewport.width + tolerance &&
            rect.top >= section.top - tolerance &&
            rect.bottom <= section.bottom + tolerance,
        ),
      ).toBe(true);

      expectNear(
        collected.introduction.copy.left,
        contract.introduction.copyLeft,
        tolerance,
      );
      expectNear(
        collected.introduction.copy.width,
        contract.introduction.copyWidth,
        tolerance,
      );
      expectNear(
        collected.introduction.frame.left,
        contract.introduction.frameLeft,
        tolerance,
      );
      expectNear(
        collected.introduction.frame.width,
        contract.introduction.frameWidth,
        tolerance,
      );
      expectNear(
        collected.introduction.frame.height,
        contract.introduction.frameHeight,
        tolerance,
      );
      expectNear(collected.introduction.imageRatio, 16 / 9, 0.02);
      expect(collected.introduction.imageObjectFit).toBe('cover');
      expect(collected.introduction.imageObjectPosition).toBe('50% 50%');
      expect(
        Math.abs(
          collected.introduction.imageRatio -
            collected.introduction.imageNaturalRatio,
        ),
      ).toBeGreaterThan(0.05);

      for (const [index, position] of collected.themePositions.entries()) {
        const expected = layout?.[index];
        const geometry = contract.themes[index];
        const expectedRatio = expectedThemeRatios[index];

        if (!expected || !geometry || !expectedRatio) {
          throw new Error(`Missing expected theme geometry for index ${index}`);
        }

        expect(position.gridTracks).toHaveLength(expectedTracks(viewport));
        expectNear(position.frame.left, geometry.frameLeft, tolerance);
        expectNear(position.frame.width, geometry.frameWidth, tolerance);
        expectNear(position.frame.height, geometry.frameHeight, tolerance);
        expectNear(position.copy.left, geometry.copyLeft, tolerance);
        expectNear(position.copy.width, geometry.copyWidth, tolerance);
        expectNear(position.imageRatio, expectedRatio, 0.02);
        expect(position.imageObjectFit).toBe('cover');
        expect(position.imageObjectPosition).toBe('50% 50%');
        expect(
          Math.abs(position.imageRatio - position.imageNaturalRatio),
        ).toBeGreaterThan(0.05);
        expect(position.verticalGap).toBeGreaterThanOrEqual(20);
        expect(position.domImageBeforeCopy).toBe(true);

        if (viewport.width >= 768) {
          expectNear(
            position.horizontalGap,
            geometry.horizontalGap ?? 0,
            tolerance,
          );
          expect(
            Math.abs(
              position.frame.left +
                position.frame.width / 2 -
                (position.copy.left + position.copy.width / 2),
            ),
          ).toBeGreaterThan(position.grid.width * 0.25);
          expect(position.imageLeftOfCopy).toBe(index % 2 === 0);
        } else {
          expect(position.imageAboveCopy).toBe(true);
        }
      }

      const screenshot = await page.screenshot({
        fullPage: true,
        path: join(outputDirectory, `${locale}-${viewport.name}.png`),
      });
      expect(screenshot.byteLength).toBeGreaterThan(50_000);
      metrics.push({
        ...collected,
        locale,
        screenshotBytes: screenshot.byteLength,
        viewport,
      });
    });
  }
}
