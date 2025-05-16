import './theme.css';
import '@coinbase/onchainkit/styles.css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import React from 'react';
import { SharedLayout } from './components/SharedLayout';
import { Toaster } from 'react-hot-toast';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    description:
      "Join The SaveUp Saving Challenge",
    other: {
      "fc:frame": JSON.stringify({
        version: process.env.NEXT_PUBLIC_VERSION,
        imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL,
            splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>
          <SharedLayout>{children}</SharedLayout>
          <Toaster position="top-center" toastOptions={{
            style: {
              background: '#F9FAFB', // Snow White
              color: '#333333', // Charcoal
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            },
            success: {
              style: {
                borderLeft: '4px solid #1DB954', // Success/Positive Emerald Green
              },
              iconTheme: {
                primary: '#1DB954',
                secondary: '#FFFFFF',
              },
            },
            error: {
              style: {
                borderLeft: '4px solid #FF6B6B', // Error/Warning Coral Red
              },
              iconTheme: {
                primary: '#FF6B6B',
                secondary: '#FFFFFF',
              },
            },
            loading: {
              style: {
                borderLeft: '4px solid #FCA311', // Accent Soft Yellow
              },
            },
          }} />
        </Providers>
      </body>
    </html>
  );
}
