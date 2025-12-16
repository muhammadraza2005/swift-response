"use client";

import { useState, useEffect } from "react";
import EmergencyButton from "@/components/emergency-button";
import { channelManager } from "@/services/channel-manager";

type EmergencyStatus = "idle" | "activating" | "sending" | "calling" | "sms" | "offline" | "success";

export default function EmergencyPage() {
    const [status, setStatus] = useState<EmergencyStatus>("idle");
    const [geoError, setGeoError] = useState<string | null>(null);

    // Initialize ChannelManager (Load ID)
    useEffect(() => {
        // Optional: Pre-warm LocalForage or ID generation
    }, []);

    // Handle Visibility Change (Return from Call/SMS)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // User returned to app
                if (status === 'calling') {
                    // If we were calling, and user came back, we assume flow continues or checks
                    // For stricter flow: Auto-escalate to SMS? 
                    // Or prompt? The plan implies "Automatic" -> "The moment the button is pressed... fixed sequence"
                    // If Call failed, user would return. We escalate to SMS.
                    console.log('Returned from Call. Escalating to SMS...');
                    triggerSMSFallback();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [status]);

    const triggerSMSFallback = async () => {
        setStatus('sms');
        // Short delay to show UI change
        setTimeout(async () => {
            const location = await getCurrentLocation();
            channelManager.initiateSMS(location);
        }, 1500);
    };

    const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => {
                    console.warn('Geolocation failed:', err);
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    };

    const handleActivate = async () => {
        setStatus("sending");

        // 1. Get GPS (Best effort, don't block too long)
        const location = await getCurrentLocation();

        // 2. Trigger Channel Manager
        const result = await channelManager.triggerEmergency(location);

        if (result.status === 'success') {
            setStatus("success");
        } else if (result.step === 'call') {
            setStatus("calling");
            // The initiateCall() in manager ALREADY opened the link.
            // We are now waiting for user to return or completion.
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Pulse Effect for Urgency */}
            <div className="absolute inset-0 bg-red-50 opacity-0 animate-pulse pointer-events-none" />

            <header className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
                <h1 className="text-xl font-bold text-gray-800">Swift Response</h1>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-medium text-gray-500">SYSTEM READY</span>
                </div>
            </header>

            <div className="z-10 w-full max-w-md">
                <EmergencyButton onActivate={handleActivate} status={status} />
            </div>

            {status === 'success' && (
                <div className="mt-8 p-4 bg-green-100 text-green-800 rounded-lg text-center animate-in fade-in slide-in-from-bottom">
                    <p className="font-bold text-lg">Help is on the way.</p>
                    <p className="text-sm">Responders have received your location.</p>
                </div>
            )}

            {/* Instructions Overlay if needed, currently kept minimal as per "No Forms" rule */}
        </main>
    );
}
