/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'engage.sitecore.com',
      },
      {
        protocol: 'https',
        hostname: 'delivery-sitecore.sitecorecontenthub.cloud',
      },
    ],
    // Allow SVG images from local files
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig

