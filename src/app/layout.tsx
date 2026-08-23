// Component: Next.js Root Layout with Global Context Providers & Metadata

import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';
import { SettingsProvider } from '../context/SettingsContext';
import { OwnerSecurityProvider } from '../context/OwnerSecurityContext';
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
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <SettingsProvider>
              <OwnerSecurityProvider>
                <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-primary)] selection:text-white font-sans antialiased transition-colors duration-200">
                  {children}
                </div>
              </OwnerSecurityProvider>
            </SettingsProvider>
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
