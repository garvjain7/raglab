from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseChunker(ABC):
    """Abstract base class for all chunking strategies"""
    
    @abstractmethod
    def chunk(self, text: str, **params) -> List[Dict[str, Any]]:
        """
        Chunk the text and return list of chunk objects with boundaries
        
        Returns:
            List of dicts with keys: id, start, end, text, length, metadata
        """
        pass
    
    def create_chunk_object(self, chunk_id: str, start: int, end: int, text: str, metadata: Dict = None) -> Dict[str, Any]:
        """Helper to create standardized chunk object"""
        return {
            "id": chunk_id,
            "start": start,
            "end": end,
            "text": text,
            "length": len(text),
            "metadata": metadata or {}
        }