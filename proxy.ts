import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './src/i18n/routing';
import { isLocale } from './src/i18n/types';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const firstPathSegment = request.nextUrl.pathname.split('/')[1];

  if (firstPathSegment && !isLocale(firstPathSegment)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
