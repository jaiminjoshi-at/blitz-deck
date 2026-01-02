'use client';

import { useEffect } from 'react';
import { useProgressStore } from '@/lib/store';

export default function StoreInitializer({ userId, userName, userAvatar }: { userId: string, userName: string, userAvatar?: string }) {
    const syncUserSession = useProgressStore((state) => state.syncUserSession);
    const activeProfileId = useProgressStore((state) => state.activeProfileId);

    useEffect(() => {
        // Enforce sync if store is empty or mismatches current session
        // This handles cases where rehydration wipes the state or user switches
        if (userId && activeProfileId !== userId) {
            syncUserSession(userId, userName, userAvatar);
        }
    }, [userId, userName, userAvatar, syncUserSession, activeProfileId]);

    return null;
}
