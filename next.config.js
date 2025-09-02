/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'floodbar.vercel.app', 'floodbar.id']
    }
  },
  // Ensure all pages are properly generated
  generateEtags: false,
  // Force static paths to be included
  trailingSlash: false,
}

module.exports = nextConfig