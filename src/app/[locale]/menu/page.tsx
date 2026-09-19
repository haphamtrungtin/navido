import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/container';
import { CategoryNavigation } from '@/features/menu/components/category-navigation';
import { MenuCategory } from '@/features/menu/components/menu-category';
import { MenuEditorialImage } from '@/features/menu/components/menu-editorial-image';
import { formatPriceVnd } from '@/features/menu/domain/normalize';
import {
  featuredMenuItemIds,
  getMenuCategoryPresentation,
} from '@/features/menu/domain/presentation';
import type { MenuItem } from '@/features/menu/domain/types';
import { localMenuRepository } from '@/features/menu/repository/local-menu-repository';
import { getLocalizedValue, isLocale, type Locale } from '@/i18n/types';
import { businessProfile } from '@/lib/business-profile';
import { buildPageMetadata } from '@/lib/metadata';

export const dynamic = 'force-static';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const metadata = await getTranslations({ locale, namespace: 'Metadata' });
  return buildPageMetadata({
    description: metadata('menu.description'),
    locale,
    page: 'menu',
    siteUrl: businessProfile.siteUrl,
    title: metadata('menu.title'),
  });
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const menu = await getTranslations({ locale, namespace: 'Menu' });
  const categories = localMenuRepository.getCategories();
  const allItems = categories.flatMap((category) =>
    localMenuRepository.getItemsByCategory(category.id),
  );
  const itemsById = new Map(allItems.map((item) => [item.id, item]));
  const featuredItems = featuredMenuItemIds.flatMap((id) => {
    const item = itemsById.get(id);
    return item ? [item] : [];
  });

  return (
    <main>
      <Container
        className="pb-14 pt-12 md:pb-20 md:pt-20"
        data-menu-introduction
      >
        <section className="grid items-end gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <span className="mb-4 block text-xs uppercase text-[var(--navido-muted-ink)]">
              {menu('eyebrow')}
            </span>
            <h1 className="text-5xl font-light leading-none md:text-7xl">
              {menu('title')}
            </h1>
          </div>
          <p className="max-w-md text-base leading-7 text-[var(--navido-muted-ink)] md:col-span-5 md:text-lg md:leading-8">
            {menu('introduction')}
          </p>
        </section>

        <MenuEditorialImage
          alt={menu('images.counter')}
          aspect="16 / 5"
          className="mt-14 hidden md:block"
          desktopSrc="/images/navido/space/navido_space_warm_coffee_taste_corner_01.webp"
        />
      </Container>

      <div className="sticky top-20 z-20 border-y border-[var(--navido-rule)] bg-[color:rgb(252_249_241_/_96%)] backdrop-blur-sm md:hidden">
        <Container>
          <CategoryNavigation
            categories={categories}
            label={menu('categoryNavigation')}
            locale={locale}
            variant="mobile"
          />
        </Container>
      </div>

      <Container
        className="hidden border-y border-[var(--navido-rule)] py-16 md:block md:py-20"
        data-menu-picks
      >
        <section>
          <div className="mb-12 flex items-end justify-between gap-8">
            <div>
              <span className="mb-2 block text-xs uppercase text-[var(--navido-muted-ink)]">
                {menu('picks.eyebrow')}
              </span>
              <h2 className="text-4xl font-light leading-tight">
                {menu('picks.title')}
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[var(--navido-muted-ink)]">
              {menu('picks.body')}
            </p>
          </div>

          <div className="grid grid-cols-12 items-start gap-8">
            <div className="col-span-3 space-y-10">
              {featuredItems.slice(0, 2).map((item) => (
                <FeaturedItem item={item} key={item.id} locale={locale} />
              ))}
            </div>
            <div className="col-span-3">
              <MenuEditorialImage
                alt={menu('images.avocado')}
                aspect="4 / 5"
                desktopSrc="/images/navido/menu/navido_menu_avocado_coffee_specialty_01.avif"
              />
            </div>
            <div className="col-span-3 space-y-10">
              {featuredItems.slice(2).map((item) => (
                <FeaturedItem item={item} key={item.id} locale={locale} />
              ))}
            </div>
            <div className="col-span-3 pt-24">
              <MenuEditorialImage
                alt={menu('images.phin')}
                aspect="4 / 5"
                desktopSrc="/images/navido/coffee/navido_coffee_table_setting_01.jpg"
              />
            </div>
          </div>
        </section>
      </Container>

      <Container className="grid gap-y-12 pb-[var(--section-gap)] pt-14 md:grid-cols-12 md:gap-x-12 md:pt-24">
        <aside className="hidden md:col-span-3 md:block">
          <div className="sticky top-28 border-t border-[var(--navido-rule)] pt-6">
            <span className="mb-5 block text-[11px] uppercase text-[var(--navido-muted-ink)]">
              {menu('index')}
            </span>
            <CategoryNavigation
              categories={categories}
              label={menu('categoryNavigation')}
              locale={locale}
              variant="desktop"
            />
          </div>
        </aside>

        <div className="space-y-16 md:col-span-9 md:space-y-24">
          {categories.map((category, index) => (
            <div key={category.id}>
              <MenuCategory
                category={category}
                chapter={getMenuCategoryPresentation(category.id).chapter}
                index={index}
                items={localMenuRepository.getItemsByCategory(category.id)}
                locale={locale}
                media={getCategoryMedia(category.id, menu)}
              />

              {category.id === 'coffee' ? (
                <MenuEditorialImage
                  alt={menu('images.table')}
                  aspect="16 / 6"
                  className="mt-20 hidden md:block"
                  desktopSrc="/images/navido/coffee/navido_coffee_table_setting_01.jpg"
                />
              ) : null}

              {category.id === 'phin' ? (
                <div className="mt-10 hidden grid-cols-2 gap-6 md:grid">
                  <MenuEditorialImage
                    alt={menu('images.phin')}
                    aspect="4 / 3"
                    desktopSrc="/images/navido/coffee/navido_coffee_table_setting_01.jpg"
                  />
                  <MenuEditorialImage
                    alt={menu('images.pastries')}
                    aspect="4 / 3"
                    desktopSrc="/images/navido/bakery/navido_bakery_pastries_and_drinks_01.jpeg"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}

function FeaturedItem({
  item,
  locale,
}: Readonly<{ item: MenuItem; locale: Locale }>) {
  return (
    <article
      className="border-t border-[var(--navido-rule)] pt-4"
      data-menu-feature
    >
      <h3 className="text-lg font-normal leading-7">
        {getLocalizedValue(item.name, locale)}
      </h3>
      <p className="mt-2 text-xs tabular-nums text-[var(--navido-muted-ink)]">
        {formatPriceVnd(item.priceVnd, locale)}
      </p>
    </article>
  );
}

function getCategoryMedia(
  categoryId: string,
  menu: Awaited<ReturnType<typeof getTranslations>>,
) {
  if (categoryId === 'signature') {
    return (
      <MenuEditorialImage
        alt={menu('images.avocado')}
        aspect="4 / 5"
        desktopSrc="/images/navido/menu/navido_menu_avocado_coffee_specialty_01.avif"
        eager
        mobileSrc="/images/navido/menu/navido_menu_avocado_coffee_specialty_01.avif"
      />
    );
  }
  if (categoryId === 'brew-coffee') {
    return (
      <MenuEditorialImage
        alt={menu('images.pourOver')}
        aspect="4 / 5"
        desktopSrc="/images/navido/coffee/navido_coffee_table_setting_01.jpg"
        mobileSrc="/images/navido/coffee/navido_coffee_table_setting_01.jpg"
        eager
      />
    );
  }
  if (categoryId === 'brunch') {
    return (
      <MenuEditorialImage
        alt={menu('images.brunch')}
        aspect="4 / 5"
        desktopSrc="/images/navido/menu/navido_menu_brunch_photographed_01.jpg"
        mobileSrc="/images/navido/menu/navido_menu_brunch_photographed_01.jpg"
        eager
      />
    );
  }
  return undefined;
}
