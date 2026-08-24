// Component: Next.js Root Layout with Global Context Providers & Metadata

import React from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';
import { SettingsProvider } from '../context/SettingsContext';
import { OwnerSecurityProvider } from '../context/OwnerSecurityContext';
import { Analytics } from '@vercel/analytics/react';
import { CookieBanner } from '../components/ui/CookieBanner';
import { SmoothScroll } from '../components/ui/SmoothScroll';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://manageme-three.vercel.app'),
  title: {
    default: 'manageme — Study & Career Intelligence Workspace',
    template: '%s | manageme OS'
  },
  description: 'Multi-Asset Trading Terminal, Career CRM, Study Intelligence Engine & Visa Ledger in one unified spatial operating system.',
  themeColor: '#0B0C10',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'manageme — Study & Career Intelligence Workspace',
    description: 'Master your markets. Engineer your trajectory in one unified spatial operating system.',
    url: 'https://manageme-three.vercel.app',
    siteName: 'manageme',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'manageme OS Workspace Preview' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'manageme — Study & Career Intelligence Workspace',
    description: 'Master your markets. Engineer your trajectory in one unified spatial operating system.',
    images: ['/og-image.png'],
    creator: '@manageme'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-canvas text-primary antialiased min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <UserProvider>
                <SettingsProvider>
                  <OwnerSecurityProvider>
                    <SmoothScroll>
                      <div className="min-h-screen bg-canvas text-primary selection:bg-indigo-500 selection:text-white font-sans antialiased transition-colors duration-200">
                        {children}
                      </div>
                    </SmoothScroll>
                    <CookieBanner />
                    <Analytics />
                  </OwnerSecurityProvider>
                </SettingsProvider>
              </UserProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
