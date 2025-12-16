'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { Router } from 'lucide-react';

interface SOSButtonProps {
  userId: string;
  onSuccess?: () => void;
  className?: string; // Allow passing custom classes for positioning/sizing in different contexts
}

export default function SOSButton({ userId, onSuccess, className = '' }: SOSButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSOS = async () => {
    if (!userId) return;
    if (!confirm('Are you sure? This will instantly report a HIGH URGENCY emergency at your current location.')) {
      return;
    }

    setLoading(true);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Cannot send precise location.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Use a reverse geocoding approach or just save coordinates.
        // For SOS, we prioritize speed. We will save coordinates and a generic address string if we can't get one easily,
        // or just rely on the map component to handle lat/lng.
        // In the create page logic, we saw: location: { lat, lng, address }
        
        const locationData = {
          lat: latitude,
          lng: longitude,
          address: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)} (SOS Location)`
        };

        const { error } = await supabase.from('emergency_requests').insert({
          requester_id: userId,
          type: 'Medical', // Defaulting to Medical for SOS as it's often life threatening
          description: 'SOS - IMMEDIATE ASSISTANCE REQUIRED! User activated one-tap emergency.',
          location: locationData,
          status: 'pending'
        });

        if (error) {
          alert('Failed to send SOS: ' + error.message);
        } else {
          alert('SOS SIGNAL SENT! Help is on the way.');
          if (onSuccess) onSuccess();
          router.push('/dashboard');
        }
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        }
        alert(errorMessage);
        console.error('Geolocation Error:', { code: error.code, message: error.message });
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <button
      onClick={handleSOS}
      disabled={loading}
      className={`relative group bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-center overflow-hidden ${className || 'w-24 h-24 sm:w-32 sm:h-32'}`}
      title="Click for Immediate Help"
    >
      {/* Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping group-hover:animate-none"></span>
      
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-2xl sm:text-4xl font-black tracking-tighter">SOS</span>
        <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-1 opacity-90">Emergency</span>
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-red-800 flex items-center justify-center z-20">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
