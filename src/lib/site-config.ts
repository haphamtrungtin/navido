import type { Locale } from '@/i18n/types';

export const siteName = 'NAVIDO';

export const navigationItems = [
  { href: '/', key: 'home' },
  { href: '/menu', key: 'menu' },
  { href: '/our-space', key: 'ourSpace' },
  { href: '/about', key: 'about' },
  { href: '/visit', key: 'visit' },
] as const;

export type NavigationKey = (typeof navigationItems)[number]['key'];

export type NavigationCopy = Record<NavigationKey, string> & {
  closeMenu: string;
  language: string;
  openMenu: string;
  primary: string;
};

export type FooterCopy = Readonly<{
  informationPending: string;
}>;

export const localeOptions: ReadonlyArray<
  Readonly<{ code: Locale; label: string }>
> = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
  { code: 'ko', label: 'KO' },
];
