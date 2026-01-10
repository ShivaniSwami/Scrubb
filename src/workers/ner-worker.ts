import { pipeline, TokenClassificationPipeline } from '@huggingface/transformers';

interface WorkerMessage {
    type: 'init' | 'process';
    text?: string;
}

interface WorkerResponse {
    type: 'init-progress' | 'init-complete' | 'init-error' | 'result' | 'error';
    progress?: number;
    entities?: Array<{
        entity: string;
        word: string;
        start: number;
        end: number;
        score: number;
    }>;
    error?: string;
}

let nerPipeline: TokenClassificationPipeline | null = null;

// Initialize the NER pipeline
async function initPipeline() {
    try {
        nerPipeline = await pipeline(
            'token-classification',
            'Xenova/bert-base-NER',
            {
                progress_callback: (progress: { progress: number }) => {
                    const response: WorkerResponse = {
                        type: 'init-progress',
                        progress: progress.progress || 0
                    };
                    self.postMessage(response);
                }
            }
        );

        const response: WorkerResponse = { type: 'init-complete' };
        self.postMessage(response);
    } catch (error) {
        const response: WorkerResponse = {
            type: 'init-error',
            error: error instanceof Error ? error.message : 'Failed to load model'
        };
        self.postMessage(response);
    }
}

// Process text through NER
async function processText(text: string) {
    if (!nerPipeline) {
        const response: WorkerResponse = {
            type: 'error',
            error: 'Model not initialized'
        };
        self.postMessage(response);
        return;
    }

    try {
        const results = await nerPipeline(text);

        // Transform results to our format
        const entities = (results as Array<{
            entity: string;
            word: string;
            start: number;
            end: number;
            score: number;
        }>).map(r => ({
            entity: r.entity,
            word: r.word,
            start: r.start,
            end: r.end,
            score: r.score
        }));

        const response: WorkerResponse = {
            type: 'result',
            entities
        };
        self.postMessage(response);
    } catch (error) {
        const response: WorkerResponse = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Processing failed'
        };
        self.postMessage(response);
    }
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const { type, text } = event.data;

    switch (type) {
        case 'init':
            await initPipeline();
            break;
        case 'process':
            if (text) {
                await processText(text);
            }
            break;
    }
};
