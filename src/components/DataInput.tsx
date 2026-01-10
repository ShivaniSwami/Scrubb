import React from 'react';

interface DataInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const DataInput: React.FC<DataInputProps> = ({ value, onChange, disabled }) => {
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // Allow paste to go through normally
        const pastedText = e.clipboardData.getData('text');
        if (pastedText) {
            e.preventDefault();
            onChange(pastedText);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Paste Data
                </h2>
                <span className="text-xs text-gray-500">
                    {value.length > 0 ? `${value.length.toLocaleString()} chars` : 'Paste text or JSON'}
                </span>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPaste={handlePaste}
                disabled={disabled}
                placeholder={`Paste your data here...\n\nSupported PII types:\n• Personal Names (detected by AI)\n• Email Addresses\n• IPv4 & IPv6 Addresses\n\nExample:\n{"user": "John Smith", "email": "john@company.com", "ip": "192.168.1.100"}`}
                className="flex-1 w-full p-4 rounded-xl bg-gray-900/50 border border-gray-700/50 
                   text-gray-200 placeholder-gray-500 font-mono text-sm
                   focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                   resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                spellCheck={false}
            />
        </div>
    );
};
