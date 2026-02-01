from typing import List, Dict, Any
from .base import BaseChunker
import nltk

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)


class SentenceChunker(BaseChunker):
    """Sentence-based chunking"""
    
    def chunk(self, text: str, max_chunk_size: int = 500, overlap: int = 0, **params) -> List[Dict[str, Any]]:
        """
        Split text into sentence-based chunks
        
        Args:
            text: Input text
            max_chunk_size: Maximum size of each chunk
            overlap: Number of characters to overlap
        """
        sentences = nltk.sent_tokenize(text)
        chunks = []
        chunk_num = 1
        
        current_chunk = ""
        current_start = 0
        
        for i, sentence in enumerate(sentences):
            sentence_start = text.find(sentence, current_start)
            
            if len(current_chunk) + len(sentence) <= max_chunk_size:
                current_chunk += sentence
            else:
                if current_chunk:
                    chunk_end = current_start + len(current_chunk)
                    chunk_obj = self.create_chunk_object(
                        chunk_id=f"chunk_{chunk_num}",
                        start=current_start,
                        end=chunk_end,
                        text=current_chunk
                    )
                    chunks.append(chunk_obj)
                    chunk_num += 1
                    
                    if overlap > 0:
                        overlap_start = max(0, chunk_end - overlap)
                        current_start = overlap_start
                        current_chunk = text[overlap_start:sentence_start] + sentence
                    else:
                        current_start = sentence_start
                        current_chunk = sentence
                else:
                    current_chunk = sentence
        
        if current_chunk:
            chunk_end = current_start + len(current_chunk)
            chunk_obj = self.create_chunk_object(
                chunk_id=f"chunk_{chunk_num}",
                start=current_start,
                end=chunk_end,
                text=current_chunk
            )
            chunks.append(chunk_obj)
        
        return chunks