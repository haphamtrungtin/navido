import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: process.env.SUPABASE_URL
      ? [
          new URL(
            '/storage/v1/object/public/menu-images/**',
            process.env.SUPABASE_URL,
          ),
        ]
      : [],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
