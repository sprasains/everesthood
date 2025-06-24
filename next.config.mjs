import nextPwa from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["newsapi.org", "hypebeast.com", "dazeddigital.com", "nylon.com"],
  },
  experimental: {
    serverActions: true,
  },
};

const withPwa = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPwa(nextConfig);
