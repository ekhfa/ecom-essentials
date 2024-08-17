/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {},
  env: {
    API_URL: "http://localhost:3000/",
  },
};

module.exports = nextConfig;
