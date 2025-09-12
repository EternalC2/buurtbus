import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

export const metadata: Metadata = {
  title: 'Buurtbus Connect',
  description: 'De buurtbus, altijd dichtbij.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background shadow-lg sm:my-4 sm:rounded-lg">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
