"use client";

import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Phone, MessageSquare, WifiOff } from "lucide-react";

interface EmergencyButtonProps {
    onActivate: () => void;
    status: "idle" | "activating" | "sending" | "calling" | "sms" | "offline" | "success";
    progress?: number; // 0-100 for visual feedback
}

export default function EmergencyButton({ onActivate, status }: EmergencyButtonProps) {
    const [holding, setHolding] = useState(false);
    const [fillPercent, setFillPercent] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const HOLD_DURATION = 3000; // 3 seconds to activate

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const startHolding = () => {
        if (status !== "idle") return;
        setHolding(true);
        startTimeRef.current = Date.now();

        // Haptic feedback start
        if (navigator.vibrate) navigator.vibrate(50);

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const percent = Math.min((elapsed / HOLD_DURATION) * 100, 100);
            setFillPercent(percent);

            if (percent >= 100) {
                completeHolding();
            }
        }, 16); // ~60fps
    };

    const stopHolding = () => {
        if (status !== "idle") return;
        setHolding(false);
        setFillPercent(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const completeHolding = () => {
        stopHolding();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]); // Success vibration
        onActivate();
    };

    const getStatusText = () => {
        switch (status) {
            case "idle": return "PRESS & HOLD";
            case "activating": return "ACTIVATING...";
            case "sending": return "SENDING ALERT...";
            case "calling": return "OPENING CALL...";
            case "sms": return "OPENING SMS...";
            case "offline": return "SAVED OFFLINE";
            case "success": return "HELP NOTIFIED";
            default: return "";
        }
    };

    const getBgColor = () => {
        switch (status) {
            case "success": return "bg-green-600";
            case "offline": return "bg-yellow-600";
            default: return "bg-red-600";
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                {/* Expanding Ring Animation when holding */}
                {holding && (
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
                )}

                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        opacity="0.2"
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="301.59" // 2 * pi * r (approx for 48%)
                        strokeDashoffset={301.59 * (1 - fillPercent / 100)}
                        className="transition-all duration-75 ease-linear"
                    />
                </svg>

                {/* Main Button */}
                <button
                    onPointerDown={startHolding}
                    onPointerUp={stopHolding}
                    onPointerLeave={stopHolding}
                    className={`w-full h-full rounded-full shadow-2xl flex flex-col items-center justify-center text-white transition-transform duration-100 ${holding ? "scale-95" : "scale-100"
                        } ${getBgColor()}`}
                >
                    {status === "idle" && <AlertTriangle size={64} className="mb-4" />}
                    {status === "calling" && <Phone size={64} className="mb-4 animate-pulse" />}
                    {status === "sms" && <MessageSquare size={64} className="mb-4 animate-pulse" />}
                    {status === "offline" && <WifiOff size={64} className="mb-4" />}

                    <span className="text-2xl font-black tracking-wider text-center px-4">
                        {getStatusText()}
                    </span>

                    {status === 'idle' && (
                        <span className="text-sm mt-2 opacity-80 font-medium">
                            KEEP HOLDING TO ALERT
                        </span>
                    )}
                </button>
            </div>

            {status !== "idle" && status !== "success" && (
                <div className="mt-8 text-center text-gray-600">
                    <p className="text-sm">Do not close the app.</p>
                    <p className="font-bold">System is escalating automatically.</p>
                </div>
            )}
        </div>
    );
}
