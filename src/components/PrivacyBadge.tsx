import React from 'react';

export type ModelStatus = 'loading' | 'ready' | 'error';

interface PrivacyBadgeProps {
    status: ModelStatus;
    progress?: number;
    error?: string;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ status, progress, error }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'loading':
                return {
                    bgClass: 'bg-amber-500/20',
                    textClass: 'text-amber-400',
                    borderClass: 'border-amber-500/50',
                    dotClass: 'bg-amber-400',
                    label: progress !== undefined ? `Loading AI Model... ${Math.round(progress)}%` : 'Loading AI Model...',
                    icon: (
                        <svg className="w-4 h-4 spinner" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    )
                };
            case 'ready':
                return {
                    bgClass: 'bg-emerald-500/20',
                    textClass: 'text-emerald-400',
                    borderClass: 'border-emerald-500/50',
                    dotClass: 'bg-emerald-400 pulse-glow',
                    label: '🔒 Secure & Offline',
                    icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    )
                };
            case 'error':
                return {
                    bgClass: 'bg-red-500/20',
                    textClass: 'text-red-400',
                    borderClass: 'border-red-500/50',
                    dotClass: 'bg-red-400',
                    label: error || 'Model Failed to Load',
                    icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bgClass} ${config.borderClass} transition-all`}
        >
            <span className={config.textClass}>
                {config.icon}
            </span>
            <span className={`text-sm font-medium ${config.textClass}`}>
                {config.label}
            </span>
        </div>
    );
};
