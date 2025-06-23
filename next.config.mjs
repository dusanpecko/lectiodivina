/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pre Nginx deployment
  output: 'standalone',
  
  // Asset handling
  assetPrefix: '',
  
  // Safari compatibility
  experimental: {
    esmExternals: 'loose'
  },
  
  // Optimizations
  poweredByHeader: false,
  compress: false, // Nginx bude kompresovať
  
  // Webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  }
};

export default nextConfig;