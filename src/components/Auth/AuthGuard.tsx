'use client';

import * as React from 'react';
import { useProgressStore } from '@/lib/store';
import LandingPage from './LandingPage';
import Box from '@mui/material/Box';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const activeProfileId = useProgressStore((state) => state.activeProfileId);

    // Safety check for hydration
    const [hydrated, setHydrated] = React.useState(false);
    React.useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) {
        return null; // Or a loading spinner
    }

    if (!activeProfileId) {
        return <LandingPage />;
    }

    return <>{children}</>;
}
