/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize production builds
  swcMinify: true,
  
  // Enable React strict mode for better performance
  reactStrictMode: true,
  
  images: {
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Allow images from external domains (Birdeye API, token logos)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum quality for optimization
    minimumCacheTTL: 60,
  },
  
  // Optimize bundle
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-popover', 
      '@radix-ui/react-dialog', 
      '@radix-ui/react-tooltip',
      '@radix-ui/react-slot',
      'framer-motion',
      'lucide-react',
    ],
  },
  
  // Optimize CSS output
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Optimize production builds
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles
};

export default nextConfig;
