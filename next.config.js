/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove if empty, or add specific experimental features
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  // Remove the async headers() section - not needed for frontend
  // These CORS headers are for backend API, not frontend
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optional: Add rewrites if you want to proxy API calls through Next.js
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;