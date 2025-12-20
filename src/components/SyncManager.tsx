'use client';

import { useEffect, useRef } from 'react';
import { useProgressStore } from '@/lib/store';

const DEBOUNCE_MS = 2000;

export default function SyncManager() {
    const syncWithServer = useProgressStore((state) => state.syncWithServer);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    // CRITICAL: Prevent saving until we have successfully pulled from server
    const isSyncedRef = useRef(false);

    useEffect(() => {
        // 1. Initial Pull on mount
        const init = async () => {
            // We can maybe add error handling here? 
            // If sync fails, do we enable saving? 
            // Yes, if offline, we should still allow local work.
            // But for now, await it.
            await syncWithServer();

            // UNBLOCK saving now that we have the latest state (or confirmed offline)
            isSyncedRef.current = true;
        };
        init();

        // 2. Subscribe to changes for Push
        const unsubscribe = useProgressStore.subscribe((state) => {
            // BLOCK: Do not save if we haven't synced yet.
            // This prevents overwriting server data with initial empty client state.
            if (!isSyncedRef.current) {
                return;
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(async () => {
                try {
                    // Extract only data properties to save
                    const dataToSave = {
                        profiles: state.profiles,
                        activeProfileId: state.activeProfileId,
                        lessonStatus: state.lessonStatus
                    };

                    await fetch('/api/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataToSave),
                    });
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }, DEBOUNCE_MS);
        });

        return () => {
            unsubscribe();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [syncWithServer]);

    return null;
}
