from typing import List, Dict, Any
from .base import BaseChunker


class FixedChunker(BaseChunker):
    """Fixed-size character chunking"""
    
    def chunk(self, text: str, chunk_size: int = 100, overlap: int = 0, **params) -> List[Dict[str, Any]]:
        """
        Split text into fixed-size chunks
        
        Args:
            text: Input text
            chunk_size: Size of each chunk in characters
            overlap: Number of characters to overlap between chunks
        """
        chunks = []
        text_length = len(text)
        
        if overlap >= chunk_size:
            overlap = 0
        
        step = chunk_size - overlap
        position = 0
        chunk_num = 1
        
        while position < text_length:
            end = min(position + chunk_size, text_length)
            chunk_text = text[position:end]
            
            chunk_obj = self.create_chunk_object(
                chunk_id=f"chunk_{chunk_num}",
                start=position,
                end=end,
                text=chunk_text
            )
            chunks.append(chunk_obj)
            
            position += step
            chunk_num += 1
            
            if overlap == 0:
                position = end
        
        return chunks