/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@skills-base/shared'],
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  //   async rewrites() {
  //     return [
  //       {
  //         source: '/api/:path*',
  //         destination: 'http://localhost:3001', // Adjust this to your API server
  //       },
  //     ];
  //   },
};

module.exports = nextConfig;
