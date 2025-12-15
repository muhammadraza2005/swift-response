import React from 'react';
import { Zap, Shield } from 'lucide-react';

interface LogoProps {
    className?: string;
    variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark' }) => {
    const isLight = variant === 'light';

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex items-center justify-center w-8 h-8">
                <Shield
                    className={`w-8 h-8 ${isLight ? 'text-white' : 'text-[#008C5A]'} fill-current opacity-20`}
                    strokeWidth={1.5}
                />
                <Zap
                    className={`absolute w-5 h-5 ${isLight ? 'text-white' : 'text-[#008C5A]'} fill-current`}
                    strokeWidth={0}
                />
            </div>
            <span className={`font-bold text-xl tracking-tight ${isLight ? 'text-white' : 'text-[#008C5A]'}`}>
                Swift<span className={isLight ? 'text-emerald-200' : 'text-gray-800'}>Response</span>
            </span>
        </div>
    );
};

export default Logo;
