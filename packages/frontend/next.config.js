/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@skills-base/shared'],
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    // Add an alias for static assets
    config.resolve.alias['@assets'] = path.join(__dirname, 'src/assets');

    // Prevent client-side bundling of server-only modules
    if (!isServer) {
      // Exclude server-only modules from client-side bundles
      config.resolve.alias['winston'] = false;
      config.resolve.alias['winston-loki'] = false;
      config.resolve.alias['snappy'] = false;

      // Add additional fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        zlib: false,
        snappy: false,
      };
    }

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
