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
  call: string;
  closeMenu: string;
  directions: string;
  language: string;
  openMenu: string;
  primary: string;
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

export type VisitBusinessConfig = Readonly<{
  address: string | null;
  hours: string | null;
  phone: string | null;
  mapsUrl: string | null;
  grabUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  siteUrl: string | null;
}>;

export const initialVisitBusinessConfig: VisitBusinessConfig = {
  address: null,
  hours: null,
  phone: null,
  mapsUrl: null,
  grabUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  siteUrl: null,
};

export const localeOptions: ReadonlyArray<
  Readonly<{ code: Locale; label: string }>
> = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
  { code: 'ko', label: 'KO' },
];
