'use client';

import { useEffect } from 'react';

/**
 * BFCacheBuster
 * 
 * Chrome and Firefox act aggressively with the Back/Forward Cache (bfcache),
 * often ignoring 'Cache-Control: no-store' headers.
 * 
 * This component listens for the 'pageshow' event. If the event.persisted
 * flag is true, it means the page was restored from cache. In this case,
 * we force a reload to ensure authentication checks run again.
 */
export default function BFCacheBuster() {
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                window.location.reload();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    return null;
}
