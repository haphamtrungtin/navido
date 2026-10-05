import 'server-only';

export function getSupabaseServerEnv(): {
  url: string;
  publishableKey: string;
} {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error('Supabase is unavailable');
  try {
    const parsed = new URL(url);
    if (
      !['https:', 'http:'].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password
    )
      throw new Error();
  } catch {
    throw new Error('Supabase is unavailable');
  }
  return { url, publishableKey };
}
