import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from './src/i18n/routing';
import { isLocale } from './src/i18n/types';
import { updateAdminSession } from './src/lib/supabase/update-session';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path === '/api/admin' ||
    path.startsWith('/api/admin/')
  ) {
    return updateAdminSession(request);
  }
  const firstPathSegment = request.nextUrl.pathname.split('/')[1];

  if (firstPathSegment && !isLocale(firstPathSegment)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ],
};
