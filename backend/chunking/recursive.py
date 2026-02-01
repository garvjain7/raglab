from typing import List, Dict, Any
from .base import BaseChunker
from langchain_text_splitters import RecursiveCharacterTextSplitter


class RecursiveChunker(BaseChunker):
    """Recursive character text splitting"""
    
    def chunk(self, text: str, chunk_size: int = 500, overlap: int = 50, **params) -> List[Dict[str, Any]]:
        """
        Recursively split text by trying different separators
        
        Args:
            text: Input text
            chunk_size: Target chunk size
            overlap: Chunk overlap size
        """
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        text_chunks = splitter.split_text(text)
        chunks = []
        current_position = 0
        
        for i, chunk_text in enumerate(text_chunks):
            chunk_start = text.find(chunk_text, current_position)
            
            if chunk_start == -1:
                chunk_start = current_position
            
            chunk_end = chunk_start + len(chunk_text)
            
            chunk_obj = self.create_chunk_object(
                chunk_id=f"chunk_{i+1}",
                start=chunk_start,
                end=chunk_end,
                text=chunk_text
            )
            chunks.append(chunk_obj)
            
            current_position = chunk_start + 1
        
        return chunks