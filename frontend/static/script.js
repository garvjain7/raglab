// Configuration
// const API_URL = window.location.hostname === 'localhost' 
//     ? 'http://localhost:8000' 
//     : (import.meta.env?.VITE_API_URL || 'http://localhost:8000');

// Same-origin API (served by FastAPI)
// const API_URL = '';


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
        { name: 'overlap', label: 'Overlap (optional)', type: 'number', default: 0, min: 0, max: 500 }
    ],
    sentence: [
        { name: 'max_chunk_size', label: 'Max Chunk Size', type: 'number', default: 500, min: 50, max: 5000 },
        { name: 'overlap', label: 'Overlap (optional)', type: 'number', default: 0, min: 0, max: 500 }
    ],
    paragraph: [
        { name: 'max_chunk_size', label: 'Max Chunk Size (optional)', type: 'number', default: 1000, min: 100, max: 10000 },
        { name: 'overlap', label: 'Overlap (optional)', type: 'number', default: 0, min: 0, max: 500 }
    ],
    recursive: [
        { name: 'chunk_size', label: 'Chunk Size', type: 'number', default: 500, min: 50, max: 5000 },
        { name: 'overlap', label: 'Overlap', type: 'number', default: 50, min: 0, max: 500 }
    ]
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

// Initialize
function init() {
    updateWordCount();
    renderParams();
    setupEventListeners();
    sampleTextContent.textContent = SAMPLE_TEXT;
}

function setupEventListeners() {
    inputText.addEventListener('input', updateWordCount);
    strategySelect.addEventListener('change', renderParams);
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
        trySampleBtn.textContent = '✕ Hide Sample';
    } else {
        sampleTextPanel.classList.add('hidden');
        textInputContainer.classList.remove('with-sample');
        trySampleBtn.textContent = '📝 Try Sample Text';
    }
}

function copySampleText() {
    inputText.value = SAMPLE_TEXT;
    updateWordCount();
    
    copySampleBtn.textContent = '✓ Copied!';
    setTimeout(() => {
        copySampleBtn.textContent = '📋 Copy & Use This Text';
    }, 2000);
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
    
    generateBtn.textContent = '⏳ Processing...';
    generateBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/chunks/${strategy}`, {
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
        
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error('Chunking error:', error);
    } finally {
        generateBtn.textContent = '🚀 Generate Chunks';
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
        <p style="background: #f7fafc; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; margin-top: 8px;">
            ${primaryChunk.text.substring(0, 200)}${primaryChunk.text.length > 200 ? '...' : ''}
        </p>
    `;
    
    if (ranges.length > 1) {
        html += `<p style="margin-top: 12px;"><strong>Overlapping with:</strong> ${ranges.slice(1).map(r => currentChunks[r.index].id).join(', ')}</p>`;
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