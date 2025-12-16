'use client';

import Link from 'next/link';
import { Newspaper } from 'lucide-react';

export default function NewsButton() {
  return (
    <Link
      href="/news"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="View Emergency News"
    >
      <div className="relative">
        {/* Pulse animation ring */}
        <div className="absolute inset-0 bg-[#008C5A] rounded-full animate-ping opacity-20"></div>
        
        {/* Main button */}
        <div className="relative w-14 h-14 bg-[#008C5A] hover:bg-[#006B47] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group-hover:scale-110 active:scale-95">
          <Newspaper className="w-6 h-6" />
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
            Emergency News
            <div className="absolute top-full right-6 -mt-1">
              <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
