
import nextPwa from "next-pwa";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "newsapi.org",
      "hypebeast.com",
      "dazeddigital.com",
      "nylon.com",
      "images.unsplash.com"
    ],
  },
  experimental: {
    webpackBuildWorker: true // Add this to enable parallel builds
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      events: require.resolve('events/'),
      util: require.resolve('util/'),
      buffer: require.resolve('buffer/'),
      url: require.resolve('url/'),
      assert: require.resolve('assert/'),
    };
    return config;
  },
};

const withPwa = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPwa(nextConfig);
