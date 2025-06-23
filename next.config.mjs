/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  
  // ✅ PRIDANÉ: Optimalizácie pre production
  swcMinify: true,
  
  // ✅ PRIDANÉ: Image optimalizácie
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // ✅ PRIDANÉ: Headers pre performance a security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  
  // ✅ PRIDANÉ: Experimental features pre performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  
  // ✅ PRIDANÉ: Webpack optimalizácie
  webpack: (config, { dev, isServer }) => {
    // Production optimalizácie
    if (!dev) {
      config.optimization.splitChunks.cacheGroups.vendor = {
        name: 'vendor',
        test: /[\\/]node_modules[\\/]/,
        chunks: 'all',
        priority: 10,
        reuseExistingChunk: true
      }
    }
    
    return config
  },
  
  // ✅ PRIDANÉ: Bundle analyzer support
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')()
      config.plugins.push(new BundleAnalyzerPlugin())
      return config
    }
  })
}

export default nextConfig