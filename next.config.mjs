// next.config.mjs - na Macu
/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '',
  poweredByHeader: false,
  compress: false,
  
  // ✅ PRIDANÉ: Force cache bust pre Safari
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // ✅ PRIDANÉ: Safari chunk loading fix
  experimental: {
    optimizeCss: false // Disable CSS optimization pre Safari
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
      
      // ✅ Safari specific fixes
      config.output.publicPath = '/_next/'
      config.output.crossOriginLoading = 'anonymous'
      
      // Force chunk loading strategy
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    }
    return config
  }
};

export default nextConfig;