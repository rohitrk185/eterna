import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap", // Optimize font loading - show fallback until font loads
  preload: true, // Preload fonts for better performance
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap", // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: "Axiom Trade - Pulse",
  description: "Real-time token discovery and trading table",
  keywords: ["crypto", "tokens", "trading", "solana", "defi"],
  // Optimize for Lighthouse
  openGraph: {
    title: "Axiom Trade - Pulse",
    description: "Real-time token discovery and trading table",
    type: "website",
  },
  // Prevent indexing if needed (remove if you want SEO)
  robots: {
    index: true,
    follow: true,
  },
  // Performance optimizations
  other: {
    'x-dns-prefetch-control': 'on',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to external API for faster connection establishment */}
        <link rel="preconnect" href="https://public-api.birdeye.so" crossOrigin="anonymous" />
        {/* DNS prefetch for additional performance */}
        <link rel="dns-prefetch" href="https://public-api.birdeye.so" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
