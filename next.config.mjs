/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: false, // Vypneme strict mode pre lepší performance s framer-motion
  
  // ✅ Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://lectio.one',
  },
  
  // ✅ Image optimalizácie
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'unnijykbupxguogrkolj.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.sk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'images.sk',
        port: '',
        pathname: '/**',
      },
      // Všeobecné patterns pre časté image hosting služby
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      // Placeholder image služby
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      }
    ],
    // Pre admin rozhranie môžeme povoliť aj všetky hostname (menej bezpečné ale praktické)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  
  // ✅ Headers pre performance a security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://*.supabase.co",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://*.stripe.com https://*.upstash.io wss://*.supabase.co",
              "frame-src 'self' https://*.stripe.com",
              "media-src 'self' https://*.supabase.co blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.stripe.com",
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
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
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
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
  
  // ✅ Compiler optimalizácie
  compiler: {
    // removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // ✅ Experimental features pre performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@supabase/supabase-js'],
  },
  
  // ✅ Webpack optimalizácie - opravené
  webpack: (config, { dev }) => {
    // Bundle analyzer support
    if (process.env.ANALYZE === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
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