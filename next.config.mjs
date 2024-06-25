/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/scrapbook',
      },
    ]
  }
};

export default nextConfig;
