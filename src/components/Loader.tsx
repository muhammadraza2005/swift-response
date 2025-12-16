import { Loader2 } from 'lucide-react';

interface LoaderProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    variant?: 'full' | 'inline';
}

export default function Loader({ className = '', size = 'md', text = 'Loading...', variant = 'full' }: LoaderProps) {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    if (variant === 'inline') {
        return (
            <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
                <Loader2 className={`${sizeClasses[size]} animate-spin`} />
                {text && <span className="text-sm font-medium">{text}</span>}
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center min-h-[50vh] gap-4 ${className}`}>
            <div className="relative">
                <div className="absolute inset-0 bg-[#008C5A] blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 className={`${sizeClasses[size]} text-[#008C5A] animate-spin relative z-10`} />
            </div>
            {text && (
                <p className="text-gray-500 font-medium animate-pulse">{text}</p>
            )}
        </div>
    );
}
