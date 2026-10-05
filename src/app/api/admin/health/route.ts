import { getAdminAccess } from '@/features/admin-auth/access';
export const dynamic = 'force-dynamic';
export async function GET() {
  const access = await getAdminAccess();
  const statuses = {
    allowed: 200,
    unauthenticated: 401,
    forbidden: 403,
    unavailable: 503,
  };
  return Response.json(
    { status: access.status === 'allowed' ? 'ok' : access.status },
    {
      status: statuses[access.status],
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}
