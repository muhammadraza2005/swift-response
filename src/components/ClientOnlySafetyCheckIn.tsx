'use client';

import dynamic from 'next/dynamic';

// Dynamically import SafetyCheckIn with no SSR
const SafetyCheckIn = dynamic(() => import('./SafetyCheckIn'), {
    ssr: false,
});

export default function ClientOnlySafetyCheckIn() {
    return <SafetyCheckIn />;
}
