
"use client";

import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { useEffect, useState } from 'react';

// export const metadata: Metadata = {
//   title: 'Buurtbus Connect',
//   description: 'De buurtbus, altijd dichtbij.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <html lang="nl">
      <head>
        <title>Buurtbus Connect</title>
        <meta name="description" content="De buurtbus, altijd dichtbij." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background shadow-lg sm:my-4 sm:rounded-lg">
          {isClient ? children : null}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
