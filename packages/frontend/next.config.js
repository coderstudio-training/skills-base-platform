/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@skills-base/shared'],
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: config => {
    // Add an alias for static assets
    config.resolve.alias['@assets'] = path.join(__dirname, 'src/assets'); // Local assets
    return config;
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
