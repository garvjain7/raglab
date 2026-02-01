# RAG Lab - Chunking Visualization

A visual, educational lab module that demonstrates how different chunking strategies break text differently in RAG (Retrieval-Augmented Generation) systems.

## Philosophy

> **Backend defines truth. Frontend visualizes truth. RAG Lab teaches truth.**

## Features

- **5 Chunking Strategies**: Fixed-size, Sentence-based, Paragraph-based, Recursive, and optional overlap for all
- **Interactive Visualization**: Color-coded chunks with overlap detection
- **Real-time Analysis**: Click any chunk to see detailed information
- **Educational Focus**: Learn correct mental models of chunking in RAG systems

## Architecture

```
Frontend (HTML/CSS/JS) → POST /chunk → FastAPI Backend
                                      ├─ Chunking Engine
                                      ├─ Strategy Resolver
                                      └─ Chunk Metadata Generator
```

## Project Structure

```
rag-lab-chunking/
├── frontend/
│   ├── index.html          # Main UI
│   ├── styles.css          # Styling
│   ├── script.js           # Frontend logic
│   ├── vercel.json         # Vercel config
│   └── .env.example        # API URL configuration
│
└── backend/
    ├── main.py             # FastAPI app
    ├── requirements.txt    # Python dependencies
    └── chunking/
        ├── __init__.py     # Module exports
        ├── base.py         # Abstract chunker
        ├── fixed.py        # Fixed-size chunking
        ├── sentence.py     # Sentence-based chunking
        ├── paragraph.py    # Paragraph-based chunking
        ├── recursive.py    # Recursive chunking
        └── utils.py        # Shared utilities
```

## Local Development

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Create `.env` file (optional, defaults to localhost:8000):
```bash
cp .env.example .env
```

3. Serve the frontend:
```bash
# Using Python
python -m http.server 3000

# Or using any static file server
npx serve -p 3000
```

Frontend will run on `http://localhost:3000`

## Deployment

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from frontend directory:
```bash
cd frontend
vercel
```

3. Set environment variable in Vercel dashboard:
   - Key: `VITE_API_URL`
   - Value: Your backend URL

### Backend (Multiple Options)

#### Option 1: Railway
1. Create new project on [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Railway auto-detects FastAPI

#### Option 2: Render
1. Create new Web Service on [Render](https://render.com)
2. Connect your repo
3. Set:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Option 3: Fly.io
1. Install flyctl
2. From backend directory:
```bash
fly launch
```

#### Option 4: AWS Lambda (with Mangum)
Add to requirements.txt:
```
mangum==0.17.0
```

Modify main.py:
```python
from mangum import Mangum
handler = Mangum(app)
```

## API Documentation

### Available Endpoints

```
POST /chunks/fixed       - Fixed-size chunking
POST /chunks/sentence    - Sentence-based chunking
POST /chunks/paragraph   - Paragraph-based chunking
POST /chunks/recursive   - Recursive chunking
```

### Example Request

```bash
POST /chunks/fixed

{
  "text": "Your text here...",
  "params": {
    "chunk_size": 100,
    "overlap": 20
  }
}
```

### Response Format

```json
{
  "original_text": "Your text here...",
  "strategy": "fixed",
  "params": {
    "chunk_size": 100,
    "overlap": 20
  },
  "index_type": "character",
  "chunks": [
    {
      "id": "chunk_1",
      "start": 0,
      "end": 100,
      "text": "...",
      "length": 100,
      "metadata": {}
    }
  ]
}
```

See **API_REFERENCE.md** for complete API documentation.

## Chunking Strategies

### 1. Fixed-Size
- **Parameters**: `chunk_size`, `overlap` (optional)
- **Logic**: Split text every N characters

### 2. Sentence-Based
- **Parameters**: `max_chunk_size`, `overlap` (optional)
- **Logic**: Split by sentences, merge until max size

### 3. Paragraph-Based
- **Parameters**: `max_chunk_size` (optional), `overlap` (optional)
- **Logic**: Split by blank lines (\n\n)

### 4. Recursive
- **Parameters**: `chunk_size`, `overlap`
- **Logic**: Hierarchical splitting (paragraph → line → sentence → word → character)

## Constraints

This is a **learning lab**, not a production RAG system. Therefore:

- ❌ No embeddings
- ❌ No vector databases
- ❌ No authentication
- ❌ No caching
- ❌ No async task queues
- ✅ Focus on correctness, clarity, and learning value

## Configuration

### Adjusting Word Limit

In `backend/main.py`, modify:
```python
if word_count > 10000:  # Change this number
    raise HTTPException(...)
```

In `frontend/script.js`, modify:
```javascript
if (words > 10000) {  // Change this number
    alert('Text exceeds limit');
}
```

### Adding New Strategies

1. Create new file in `backend/chunking/`
2. Extend `BaseChunker`
3. Implement `chunk()` method
4. Register in `backend/main.py` CHUNKERS dict
5. Add params config in `frontend/script.js` STRATEGY_PARAMS

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.