const blockedHostPatterns = [
  /(^|\.)vercel\.app$/i,
  /(^|\.)localhost$/i,
  /^127(?:\.\d{1,3}){3}$/,
  /^0\.0\.0\.0$/,
] as const;

export function getConfiguredSiteUrl(value = process.env.NEXT_PUBLIC_SITE_URL) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== 'https:' ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      blockedHostPatterns.some((pattern) => pattern.test(url.hostname))
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}
