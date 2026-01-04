import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import Navigation from '@/components/Navigation';
import SessionProvider from '@/components/Auth/SessionProvider';
import { auth } from "@/auth";
import StoreInitializer from "@/components/StoreInitializer";
import SyncManager from '@/components/SyncManager';
import BFCacheBuster from '@/components/BFCacheBuster';
import Box from '@mui/material/Box';

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
      <body style={{ display: 'flex', flexDirection: 'column' }}>
        <BFCacheBuster />
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
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative' // Ensure stacking context
              }}
            >
              {children}
            </Box>
          </SessionProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
