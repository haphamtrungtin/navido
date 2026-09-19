import type { Locale } from '@/i18n/types';

export const siteName = 'NAVIDO';

export const navigationItems = [
  { href: '/', key: 'home' },
  { href: '/menu', key: 'menu' },
  { href: '/roastery', key: 'roastery' },
  { href: '/our-space', key: 'ourSpace' },
  { href: '/about', key: 'about' },
  { href: '/visit', key: 'visit' },
] as const;

export type NavigationKey = (typeof navigationItems)[number]['key'];

export type NavigationCopy = Record<NavigationKey, string> & {
  call: string;
  closeMenu: string;
  directions: string;
  language: string;
  openMenu: string;
  primary: string;
  roastery: string;
};

export type FooterCopy = Readonly<{
  address: string;
  daily: string;
  email: string;
  facebook: string;
  grabFood: string;
  hours: string;
  instagram: string;
  maps: string;
  phone: string;
  zalo: string;
}>;

export const localeOptions: ReadonlyArray<
  Readonly<{ code: Locale; label: string }>
> = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
  { code: 'ko', label: 'KO' },
];
