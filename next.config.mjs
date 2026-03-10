/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mjml', 'mjml-core'],
  },
}

export default nextConfig
