import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import Navigation from '@/components/Navigation';
import SessionProvider from '@/components/Auth/SessionProvider';
import { auth } from "@/auth";
import StoreInitializer from "@/components/StoreInitializer";
import SyncManager from '@/components/SyncManager';

export const metadata: Metadata = {
  title: 'BlitzDeck',
  description: 'Language Learning Platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <SessionProvider>
            {session?.user && (
              <>
                <StoreInitializer
                  userId={session.user.id || ''}
                  userName={session.user.name || 'User'}
                  userAvatar={session.user.image || ''}
                />
                <SyncManager />
              </>
            )}
            <Navigation />
            {children}
          </SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
