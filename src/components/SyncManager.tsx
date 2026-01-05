'use client';

import { useEffect } from 'react';
import { useProgressStore } from '@/lib/store';

export default function SyncManager() {
    const syncWithServer = useProgressStore((state) => state.syncWithServer);
    const activeProfileId = useProgressStore((state) => state.activeProfileId);

    useEffect(() => {
        // 1. Initial Pull on mount (wait for profile)
        if (!activeProfileId) return;

        const init = async () => {
            await syncWithServer();
        };
        init();

        return () => {
            // Cleanup if needed
        };
    }, [syncWithServer, activeProfileId]);

    return null;
}
