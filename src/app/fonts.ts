import { Noto_Sans, Noto_Sans_KR } from 'next/font/google';

const notoSans = Noto_Sans({
  display: 'swap',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-noto-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const notoSansKr = Noto_Sans_KR({
  display: 'swap',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-noto-sans-kr',
  weight: ['300', '400', '500', '600', '700'],
});

export const documentFontClassName = `${notoSans.variable} ${notoSansKr.variable}`;
