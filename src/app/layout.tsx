
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import 'dotenv/config';
import { FirebaseClientProvider } from '@/firebase';
import { ServiceWorkerRegister } from '@/components/common/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'ATLAS: Your Life, Reborn',
  description: 'A revolutionary application that gamifies human existence.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ATLAS',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen">
        <FirebaseClientProvider>
          <ServiceWorkerRegister />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
