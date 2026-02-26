/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  // Allow larger file uploads in Server Actions (images and short videos)
  serverActions: {
    bodySizeLimit: "20mb"
  }
};

export default nextConfig;

