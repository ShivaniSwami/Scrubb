import React from 'react';

interface DetectedEntities {
    names: string[];
    emails: string[];
    ips: string[];
}

interface DataOutputProps {
    value: string;
    detectedEntities?: DetectedEntities;
    isProcessing?: boolean;
}

export const DataOutput: React.FC<DataOutputProps> = ({ value, detectedEntities, isProcessing }) => {
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(value);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const totalDetected = detectedEntities
        ? detectedEntities.names.length + detectedEntities.emails.length + detectedEntities.ips.length
        : 0;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sanitized Output
                </h2>
                {value && (
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                       bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg
                       border border-gray-700 transition-all hover:border-gray-600"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                    </button>
                )}
            </div>

            <div className="flex-1 relative">
                <pre
                    className="h-full w-full p-4 rounded-xl bg-gray-900/50 border border-gray-700/50 
                     text-gray-200 font-mono text-sm whitespace-pre-wrap overflow-auto"
                >
                    {isProcessing ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <svg className="w-8 h-8 spinner text-cyan-400" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Anonymizing with local AI...</span>
                            </div>
                        </div>
                    ) : value ? (
                        value
                    ) : (
                        <span className="text-gray-500">Anonymized data will appear here...</span>
                    )}
                </pre>
            </div>

            {/* Detection Summary */}
            {totalDetected > 0 && !isProcessing && (
                <div className="mt-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <p className="text-xs font-medium text-gray-400 mb-2">Detected & Replaced:</p>
                    <div className="flex flex-wrap gap-2">
                        {detectedEntities!.names.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 8a6 6 0 1112 0A6 6 0 016 8zm2 10a3 3 0 00-3 3 1 1 0 11-2 0 5 5 0 015-5h8a5 5 0 015 5 1 1 0 11-2 0 3 3 0 00-3-3H8z" />
                                </svg>
                                {detectedEntities!.names.length} name{detectedEntities!.names.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {detectedEntities!.emails.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {detectedEntities!.emails.length} email{detectedEntities!.emails.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {detectedEntities!.ips.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/20 text-orange-400 text-xs">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                {detectedEntities!.ips.length} IP{detectedEntities!.ips.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
