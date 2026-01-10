import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import { PrivacyBadge } from './components/PrivacyBadge';
import type { ModelStatus } from './components/PrivacyBadge';
import { DataInput } from './components/DataInput';
import { DataOutput } from './components/DataOutput';
import { anonymizeText, isJsonLike, formatOutput } from './lib/anonymizer';
import type { NerEntity } from './lib/anonymizer';

function App() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>('loading');
  const [modelProgress, setModelProgress] = useState<number>(0);
  const [modelError, setModelError] = useState<string>();

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedEntities, setDetectedEntities] = useState<{
    names: string[];
    emails: string[];
    ips: string[];
  }>();

  const workerRef = useRef<Worker | null>(null);

  // Initialize the worker
  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('./workers/ner-worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Handle messages from worker
    workerRef.current.onmessage = (event) => {
      const { type, progress, entities, error } = event.data;

      switch (type) {
        case 'init-progress':
          setModelProgress(progress || 0);
          break;
        case 'init-complete':
          setModelStatus('ready');
          setModelProgress(100);
          break;
        case 'init-error':
          setModelStatus('error');
          setModelError(error);
          break;
        case 'result':
          handleNerResult(entities || []);
          break;
        case 'error':
          console.error('Worker error:', error);
          setIsProcessing(false);
          break;
      }
    };

    // Initialize NER pipeline
    workerRef.current.postMessage({ type: 'init' });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Store pending text for processing
  const pendingTextRef = useRef<string>('');
  const wasJsonRef = useRef<boolean>(false);

  // Handle NER result
  const handleNerResult = useCallback((entities: NerEntity[]) => {
    const text = pendingTextRef.current;
    const wasJson = wasJsonRef.current;

    const result = anonymizeText(text, entities);
    const formattedOutput = wasJson
      ? formatOutput(result.anonymizedText, true)
      : result.anonymizedText;

    setOutputText(formattedOutput);
    setDetectedEntities(result.detectedEntities);
    setIsProcessing(false);
  }, []);

  // Process the input text
  const handleAnonymize = useCallback(() => {
    if (!inputText.trim() || modelStatus !== 'ready') return;

    setIsProcessing(true);
    setOutputText('');
    setDetectedEntities(undefined);

    const wasJson = isJsonLike(inputText);
    pendingTextRef.current = inputText;
    wasJsonRef.current = wasJson;

    // Send text to worker for NER processing
    workerRef.current?.postMessage({ type: 'process', text: inputText });
  }, [inputText, modelStatus]);

  // Clear all data
  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
    setDetectedEntities(undefined);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center p-1.5">
                <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                  <g stroke="white" strokeWidth="3" strokeLinecap="round">
                    <line x1="16" y1="16" x2="16" y2="32" />
                    <line x1="24" y1="12" x2="24" y2="36" />
                    <line x1="32" y1="16" x2="32" y2="32" />
                  </g>
                  <circle cx="38" cy="12" r="3" fill="white" opacity="0.8" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Scrubb</h1>
                <p className="text-xs text-gray-500">Paste. Purge. Protect.</p>
              </div>
            </div>
            <PrivacyBadge
              status={modelStatus}
              progress={modelProgress}
              error={modelError}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)] min-h-[500px]">
          {/* Input Panel */}
          <div className="glass rounded-2xl p-5">
            <DataInput
              value={inputText}
              onChange={setInputText}
              disabled={isProcessing}
            />
          </div>

          {/* Output Panel */}
          <div className="glass rounded-2xl p-5">
            <DataOutput
              value={outputText}
              detectedEntities={detectedEntities}
              isProcessing={isProcessing}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleClear}
            disabled={!inputText && !outputText}
            className="px-6 py-3 rounded-xl font-medium text-gray-300
                       bg-gray-800 hover:bg-gray-700 border border-gray-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all hover:border-gray-600"
          >
            Clear
          </button>
          <button
            onClick={handleAnonymize}
            disabled={!inputText.trim() || modelStatus !== 'ready' || isProcessing}
            className="px-8 py-3 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-cyan-500 to-purple-600 
                       hover:from-cyan-400 hover:to-purple-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:hover:from-cyan-500 disabled:hover:to-purple-600
                       shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40
                       transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="w-5 h-5 spinner" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Anonymize
              </>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            All processing happens locally in your browser. No data is ever sent to any server.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
