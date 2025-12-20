import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import Navigation from '@/components/Navigation';
import AuthGuard from '@/components/Auth/AuthGuard';
import SyncManager from '@/components/SyncManager';

export const metadata: Metadata = {
  title: 'BlitzDeck',
  description: 'Language Learning Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <SyncManager />
          <AuthGuard>
            <Navigation />
            {children}
          </AuthGuard>
        </ThemeRegistry>
      </body>
    </html>
  );
}
