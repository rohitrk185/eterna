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
    // Increase cache TTL for better performance (1 day)
    minimumCacheTTL: 86400,
    // Disable image optimization for problematic external images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
      {
        source: '/_next/static/css/:path*.css',
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
  
  // Target modern browsers to reduce legacy polyfills
  // Next.js uses SWC which respects browserslist config in package.json
  // This reduces bundle size by not including polyfills for modern JS features
};

export default nextConfig;
