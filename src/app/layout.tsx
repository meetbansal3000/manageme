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
  title: 'manageme — Study & Career Intelligence Workspace',
  description: 'Multi-Asset Trading Terminal, Career CRM & Visa Ledger.',
  openGraph: {
    title: 'manageme — Study & Career Intelligence Workspace',
    description: 'Master your markets. Engineer your trajectory in one unified spatial operating system.',
    url: 'https://manageme-app.vercel.app',
    siteName: 'manageme',
    images: [{ url: '/icon-512.png', width: 512, height: 512 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'manageme — Study & Career Intelligence Workspace',
    description: 'Master your markets. Engineer your trajectory in one unified spatial operating system.',
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
                <div className="min-h-screen bg-black text-white selection:bg-[#0052FF] selection:text-white font-sans antialiased">
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
