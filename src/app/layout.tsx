
"use client";

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// export const metadata: Metadata = {
//   title: 'GGK',
//   description: 'gauw, geel en knus!',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true);
    // Apply high-contrast theme if it's set in localStorage
    const isHighContrast = localStorage.getItem('high-contrast-mode') === 'true';
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  }, [])

  return (
    <html lang="nl">
      <head>
        <title>GGK</title>
        <meta name="description" content="gauw, geel en knus!" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background shadow-lg sm:my-4 sm:rounded-lg">
          <div className={cn(!isMounted && 'opacity-0')}>
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
