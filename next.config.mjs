/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  
  // ✅ Image optimalizácie
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // ✅ Headers pre performance a security
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
  
  // ✅ Turbopack nastavenia (presunute z experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  
  // ✅ Experimental features pre performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  
  // ✅ Webpack optimalizácie - opravené
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer support
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false
      }))
    }
    
    // Production optimalizácie
    if (!dev) {
      // Bezpečné nastavenie optimization objektu
      config.optimization = config.optimization || {}
      config.optimization.splitChunks = config.optimization.splitChunks || {}
      config.optimization.splitChunks.cacheGroups = config.optimization.splitChunks.cacheGroups || {}
      
      // Teraz môžeme bezpečne nastaviť vendor
      config.optimization.splitChunks.cacheGroups.vendor = {
        name: 'vendor',
        test: /[\\/]node_modules[\\/]/,
        chunks: 'all',
        priority: 10,
        reuseExistingChunk: true
      }
    }
    
    return config
  }
}

export default nextConfig