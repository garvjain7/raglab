from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any, List
import os

from chunking import (
    FixedChunker,
    SentenceChunker,
    ParagraphChunker,
    RecursiveChunker,
    count_words,
    validate_params
)

app = FastAPI(title="RAG Lab - Chunking Visualization API")

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")
STATIC_DIR = os.path.join(FRONTEND_DIR, "static")

# Serve static assets
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Serve index.html
@app.get("/", include_in_schema=False)
def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

# -----------------------------
# API Schemas
# -----------------------------
class ChunkRequest(BaseModel):
    text: str
    params: Dict[str, Any] = {}

class ChunkResponse(BaseModel):
    original_text: str
    strategy: str
    params: Dict[str, Any]
    index_type: str = "character"
    chunks: List[Dict[str, Any]]

# -----------------------------
# Chunkers
# -----------------------------
CHUNKERS = {
    "fixed": FixedChunker(),
    "sentence": SentenceChunker(),
    "paragraph": ParagraphChunker(),
    "recursive": RecursiveChunker()
}

# -----------------------------
# API Routes (PREFIXED)
# -----------------------------
@app.get("/api", include_in_schema=False)
def api_root():
    return {"strategies": list(CHUNKERS.keys())}

@app.post("/api/chunks/{strategy}", response_model=ChunkResponse)
def chunk_text(strategy: str, request: ChunkRequest):
    if strategy not in CHUNKERS:
        raise HTTPException(status_code=404, detail="Unknown strategy")

    if count_words(request.text) > 10000:
        raise HTTPException(status_code=400, detail="Text exceeds 10,000 words")

    params = validate_params(strategy, request.params)
    chunks = CHUNKERS[strategy].chunk(request.text, **params)

    return ChunkResponse(
        original_text=request.text,
        strategy=strategy,
        params=params,
        chunks=chunks
    )

# -----------------------------
# Local Dev
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
