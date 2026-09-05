import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { CategoryNavigation } from '@/features/menu/components/category-navigation';
import { MenuCategory } from '@/features/menu/components/menu-category';
import { localMenuRepository } from '@/features/menu/repository/local-menu-repository';
import { isLocale } from '@/i18n/types';
import { buildPageMetadata } from '@/lib/metadata';
import { initialVisitBusinessConfig } from '@/lib/site-config';

export const dynamic = 'force-static';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const metadata = await getTranslations({ locale, namespace: 'Metadata' });

  return buildPageMetadata({
    description: metadata('menu.description'),
    locale,
    page: 'menu',
    siteUrl: initialVisitBusinessConfig.siteUrl,
    title: metadata('menu.title'),
  });
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const menu = await getTranslations({ locale, namespace: 'Menu' });
  const categories = localMenuRepository.getCategories();

  return (
    <main>
      <Container className="pb-14 pt-16 sm:pb-20 sm:pt-24">
        <h1 className="max-w-2xl text-4xl font-light leading-tight sm:text-5xl">
          {menu('title')}
        </h1>
      </Container>

      <div className="sticky top-20 z-20 border-y border-[var(--navido-rule)] bg-[var(--navido-paper)] md:hidden">
        <Container className="py-0">
          <CategoryNavigation
            categories={categories}
            label={menu('title')}
            locale={locale}
          />
        </Container>
      </div>

      <Container className="grid gap-y-12 pb-[var(--section-gap)] md:grid-cols-[minmax(10rem,1fr)_minmax(0,3fr)] md:gap-x-16">
        <aside className="hidden md:block">
          <div className="sticky top-28">
            <CategoryNavigation
              categories={categories}
              label={menu('title')}
              locale={locale}
            />
          </div>
        </aside>

        <div className="space-y-16 sm:space-y-20">
          {categories.map((category, index) => (
            <div key={category.id}>
              <MenuCategory
                category={category}
                items={localMenuRepository.getItemsByCategory(category.id)}
                locale={locale}
              />
              {index === 2 ? (
                <EditorialImage
                  alt=""
                  aspect="16 / 7"
                  className="mt-16"
                  sizes="(min-width: 768px) 72vw, 100vw"
                  src="/images/stitch/menu-latte-book.jpg"
                />
              ) : null}
              {index === 8 ? (
                <EditorialImage
                  alt=""
                  aspect="16 / 7"
                  className="mt-16"
                  sizes="(min-width: 768px) 72vw, 100vw"
                  src="/images/stitch/menu-espresso-extraction.jpg"
                />
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
