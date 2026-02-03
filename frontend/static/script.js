// Configuration
const API_URL = CONFIG.API_URL;

// Sample text for demonstration
const SAMPLE_TEXT = `Artificial intelligence is transforming the world. Machine learning algorithms can now recognize patterns in data that humans might miss.

Deep learning has revolutionized computer vision and natural language processing. Neural networks with multiple layers can learn hierarchical representations of data.

Large language models like GPT have demonstrated impressive capabilities in text generation. These models are trained on vast amounts of text data from the internet.

However, AI systems still face significant challenges. They can be biased, lack common sense reasoning, and struggle with tasks that humans find easy.

The future of AI depends on solving these fundamental problems. Researchers are working on making AI systems more robust, interpretable, and aligned with human values.`;

// Strategy parameter configurations
const STRATEGY_PARAMS = {
    fixed: [
        { name: 'chunk_size', label: 'Chunk Size', type: 'number', default: 100, min: 10, max: 5000 },
        { name: 'overlap', label: 'Chunk Overlap Size', type: 'number', default: 0, min: 0, max: 500 }
    ],
    sentence: [
        { name: 'max_chunk_size', label: 'Max Chunk Size', type: 'number', default: 500, min: 50, max: 5000 },
        { name: 'overlap', label: 'Chunk Overlap Size', type: 'number', default: 0, min: 0, max: 500 }
    ],
    paragraph: [
        { name: 'max_chunk_size', label: 'Max Chunk Size (optional)', type: 'number', default: 1000, min: 100, max: 10000 },
        { name: 'overlap', label: 'Chunk Overlap Size', type: 'number', default: 0, min: 0, max: 500 }
    ],
    recursive: [
        { name: 'chunk_size', label: 'Chunk Size', type: 'number', default: 500, min: 50, max: 5000 },
        { name: 'overlap', label: 'Overlap', type: 'number', default: 50, min: 0, max: 500 }
    ]
};

// AI-like Insights (Hardcoded but contextual)
const STRATEGY_INSIGHTS = {
    fixed: {
        lowChunks: "With fixed-size chunking and small chunk sizes, you get many uniform pieces. Notice how some chunks might break mid-sentence? This is the trade-off for predictability.",
        highChunks: "Smaller chunks mean more granular search, but you might lose context. In RAG systems, this can lead to fragmented answers.",
        withOverlap: "Great! Overlap ensures that context isn't lost at boundaries. Even if a sentence is split, the overlap preserves the full meaning.",
        default: "Fixed-size chunking is splitting your text like a ruler—every chunk is exactly N characters. Simple, but sometimes breaks sentences awkwardly."
    },
    sentence: {
        lowChunks: "Sentence-based chunking created fewer, more meaningful chunks. Each chunk respects sentence boundaries, preserving complete thoughts.",
        highChunks: "More chunks with sentence-based strategy means shorter sentences in your text. Notice how semantic meaning stays intact in each chunk?",
        withOverlap: "Sentence overlap is powerful—it ensures that consecutive sentences share context, making retrieval more accurate in RAG systems.",
        default: "Sentence-based chunking respects language structure. Each chunk ends at a sentence boundary, keeping ideas complete and searchable."
    },
    paragraph: {
        lowChunks: "Paragraph chunking creates larger, topic-focused chunks. Perfect for when you want to preserve entire arguments or narratives.",
        highChunks: "Your text has many short paragraphs, resulting in more chunks. Each chunk represents a complete topic or idea.",
        withOverlap: "With paragraph overlap, consecutive topics share context. This helps RAG systems understand relationships between ideas.",
        default: "Paragraph-based chunking keeps complete topics together. Chunks are larger but maintain full context for each subject discussed."
    },
    recursive: {
        lowChunks: "Recursive chunking adapted to your text's structure, creating chunks that respect natural boundaries. Notice the mix of sizes?",
        highChunks: "The recursive strategy found many natural split points in your text. It tried paragraphs first, then sentences, then characters.",
        withOverlap: "Recursive chunking with overlap is the most adaptive approach. It preserves structure while ensuring no context is lost between chunks.",
        default: "Recursive chunking is the smartest strategy—it tries to split at paragraphs, falls back to sentences, and only breaks on characters as a last resort."
    }
};

// DOM Elements
const inputText = document.getElementById('inputText');
const wordCount = document.getElementById('wordCount');
const strategySelect = document.getElementById('strategy');
const paramsContainer = document.getElementById('paramsContainer');
const generateBtn = document.getElementById('generateBtn');
const resultsSection = document.getElementById('resultsSection');
const visualizationContainer = document.getElementById('visualizationContainer');
const chunkInfo = document.getElementById('chunkInfo');
const chunkCountDisplay = document.getElementById('chunkCount');
const showOverlapToggle = document.getElementById('showOverlapToggle');
const trySampleBtn = document.getElementById('trySampleBtn');
const sampleTextPanel = document.getElementById('sampleTextPanel');
const sampleTextContent = document.getElementById('sampleTextContent');
const copySampleBtn = document.getElementById('copySampleBtn');
const textInputContainer = document.getElementById('textInputContainer');

// State
let currentChunks = [];
let currentText = '';
let showOverlap = true;
let currentStrategy = 'fixed';

// Initialize
function init() {
    updateWordCount();
    renderParams();
    setupEventListeners();
    sampleTextContent.textContent = SAMPLE_TEXT;
    updateStrategyHint(); // Show initial hint
    showWelcomeIfFirstVisit();
}

// Show welcome tooltip on first visit
function showWelcomeIfFirstVisit() {
    const hasVisited = localStorage.getItem('raglab_visited');
    const welcomeTooltip = document.getElementById('welcomeTooltip');
    
    if (!hasVisited && welcomeTooltip) {
        welcomeTooltip.style.display = 'block';
        localStorage.setItem('raglab_visited', 'true');
    } else if (welcomeTooltip) {
        welcomeTooltip.style.display = 'none';
    }
}

function setupEventListeners() {
    inputText.addEventListener('input', updateWordCount);
    strategySelect.addEventListener('change', () => {
        renderParams();
        updateStrategyHint();
    });
    generateBtn.addEventListener('click', generateChunks);
    showOverlapToggle.addEventListener('change', generateChunks);
    trySampleBtn.addEventListener('click', toggleSamplePanel);
    copySampleBtn.addEventListener('click', copySampleText);
}

function updateWordCount() {
    const text = inputText.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCount.textContent = `${words} words`;
    
    if (words > 10000) {
        wordCount.style.color = '#e53e3e';
    } else {
        wordCount.style.color = '#718096';
    }
}

function toggleSamplePanel() {
    const isHidden = sampleTextPanel.classList.contains('hidden');
    
    if (isHidden) {
        sampleTextPanel.classList.remove('hidden');
        textInputContainer.classList.add('with-sample');
        trySampleBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Hide Sample
        `;
    } else {
        sampleTextPanel.classList.add('hidden');
        textInputContainer.classList.remove('with-sample');
        trySampleBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            Try Sample Text
        `;
    }
}

function copySampleText() {
    inputText.value = SAMPLE_TEXT;
    updateWordCount();
    
    copySampleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
    `;
    setTimeout(() => {
        copySampleBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy & Use This Text
        `;
    }, 2000);
}

// Update strategy hint based on selection
function updateStrategyHint() {
    const strategy = strategySelect.value;
    currentStrategy = strategy;
    
    // Hide all hints
    document.querySelectorAll('.hint-text').forEach(hint => {
        hint.classList.add('hidden');
    });
    
    // Show selected strategy hint
    const activeHint = document.querySelector(`[data-strategy="${strategy}"]`);
    if (activeHint) {
        activeHint.classList.remove('hidden');
    }
}

function renderParams() {
    const strategy = strategySelect.value;
    const params = STRATEGY_PARAMS[strategy];
    
    paramsContainer.innerHTML = '';
    
    params.forEach(param => {
        const group = document.createElement('div');
        group.className = 'param-group';
        
        const label = document.createElement('label');
        label.textContent = param.label;
        label.htmlFor = param.name;
        
        const input = document.createElement('input');
        input.type = param.type;
        input.id = param.name;
        input.name = param.name;
        input.value = param.default;
        
        if (param.min !== undefined) input.min = param.min;
        if (param.max !== undefined) input.max = param.max;
        
        group.appendChild(label);
        group.appendChild(input);
        paramsContainer.appendChild(group);
    });
}

function getParams() {
    const strategy = strategySelect.value;
    const paramConfigs = STRATEGY_PARAMS[strategy];
    const params = {};

    paramConfigs.forEach(config => {
        const input = document.getElementById(config.name);
        const value = parseInt(input.value);

        if (config.name === 'overlap') {
            const enableOverlap = showOverlapToggle.checked;
            params[config.name] = enableOverlap ? (isNaN(value) ? 0 : value) : 0;
        } else {
            if (!isNaN(value) && value > 0) {
                params[config.name] = value;
            }
        }
    });

    return params;
}

// Update AI insight based on results
function updateAIInsight(chunkCount, hasOverlap) {
    const insightText = document.getElementById('insightText');
    const insights = STRATEGY_INSIGHTS[currentStrategy];
    
    let message;
    
    if (hasOverlap) {
        message = insights.withOverlap;
    } else if (chunkCount <= 5) {
        message = insights.lowChunks;
    } else if (chunkCount > 15) {
        message = insights.highChunks;
    } else {
        message = insights.default;
    }
    
    insightText.textContent = message;
}

async function generateChunks() {
    const text = inputText.value.trim();
    
    if (!text) {
        alert('Please enter some text to chunk');
        return;
    }
    
    const words = text.split(/\s+/).length;
    if (words > 10000) {
        alert('Text exceeds 10,000 word limit');
        return;
    }
    
    const strategy = strategySelect.value;
    const params = getParams();
    
    generateBtn.innerHTML = `
        <span class="btn-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            </svg>
        </span>
        <span class="btn-text">Processing...</span>
    `;
    generateBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/api/chunks/${strategy}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                params
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Chunking failed');
        }
        
        const data = await response.json();
        currentChunks = data.chunks;
        currentText = data.original_text;
        
        renderVisualization();
        resultsSection.classList.remove('hidden');
        chunkCountDisplay.textContent = `${currentChunks.length} chunks`;
        
        // Update AI insight
        updateAIInsight(currentChunks.length, showOverlapToggle.checked);
        
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error('Chunking error:', error);
    } finally {
        generateBtn.innerHTML = `
            <span class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
            </span>
            <span class="btn-text">Generate Chunks</span>
            <div class="btn-shine"></div>
        `;
        generateBtn.disabled = false;
    }
}

function renderVisualization() {
    visualizationContainer.innerHTML = '';
    
    const ranges = currentChunks.map((chunk, index) => ({
        start: chunk.start,
        end: chunk.end,
        index,
        id: chunk.id
    }));
    
    ranges.sort((a, b) => a.start - b.start);
    
    let position = 0;
    const elements = [];
    
    while (position < currentText.length) {
        const activeRanges = ranges.filter(r => r.start <= position && r.end > position);
        
        if (activeRanges.length === 0) {
            const nextStart = ranges.find(r => r.start > position)?.start || currentText.length;
            const text = currentText.slice(position, nextStart);
            elements.push({ type: 'text', content: text });
            position = nextStart;
        } else {
            const nearestEnd = Math.min(...activeRanges.map(r => r.end));
            const text = currentText.slice(position, nearestEnd);
            
            elements.push({
                type: 'chunk',
                content: text,
                ranges: activeRanges,
                start: position,
                end: nearestEnd
            });
            
            position = nearestEnd;
        }
    }
    
    elements.forEach(element => {
        if (element.type === 'text') {
            const textNode = document.createTextNode(element.content);
            visualizationContainer.appendChild(textNode);
        } else {
            const span = document.createElement('span');
            span.textContent = element.content;
            span.className = 'chunk-highlight';
            
            const primaryRange = element.ranges[0];
            const colorClass = `chunk-color-${primaryRange.index % 10}`;
            span.classList.add(colorClass);
            
            if (element.ranges.length > 1 && showOverlap) {
                span.classList.add('overlap-indicator');
            }
            
            span.dataset.chunkIndices = element.ranges.map(r => r.index).join(',');
            span.dataset.start = element.start;
            span.dataset.end = element.end;
            
            span.addEventListener('click', () => showChunkDetails(element.ranges));
            
            visualizationContainer.appendChild(span);
        }
    });
}

function showChunkDetails(ranges) {
    document.querySelectorAll('.chunk-highlight').forEach(el => {
        el.classList.remove('active');
    });
    
    const primaryChunk = currentChunks[ranges[0].index];
    
    let html = `
        <p><strong>Chunk ID:</strong> ${primaryChunk.id}</p>
        <p><strong>Position:</strong> ${primaryChunk.start} - ${primaryChunk.end}</p>
        <p><strong>Length:</strong> ${primaryChunk.length} characters</p>
        <p><strong>Text Preview:</strong></p>
        <p style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; margin-top: 8px; border: 1px solid rgba(148, 163, 184, 0.2);">
            ${primaryChunk.text.substring(0, 200)}${primaryChunk.text.length > 200 ? '...' : ''}
        </p>
    `;
    
    if (ranges.length > 1) {
        html += `<p style="margin-top: 12px;"><strong>Overlapping with:</strong> ${ranges.slice(1).map(r => currentChunks[r.index].id).join(', ')}</p>`;
        html += `<p style="margin-top: 8px; padding: 10px; background: rgba(236, 72, 153, 0.1); border-left: 3px solid #ec4899; border-radius: 4px; font-size: 0.875rem;"><strong>💡 Insight:</strong> This overlap means these chunks share context, improving retrieval accuracy in RAG systems!</p>`;
    }
    
    chunkInfo.innerHTML = html;
    
    document.querySelectorAll('.chunk-highlight').forEach(el => {
        const indices = el.dataset.chunkIndices.split(',').map(Number);
        if (indices.includes(ranges[0].index)) {
            el.classList.add('active');
        }
    });
}

function toggleOverlap() {
    showOverlap = showOverlapToggle.checked;
    if (currentChunks.length > 0) {
        renderVisualization();
    }
}

// Initialize app
init();
