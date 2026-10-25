/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: { esmExternals: true }
}
module.exports = nextConfig
