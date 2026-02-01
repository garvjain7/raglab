from typing import List, Dict, Any
from .base import BaseChunker


class ParagraphChunker(BaseChunker):
    """Paragraph-based chunking (split by blank lines)"""
    
    def chunk(self, text: str, max_chunk_size: int = None, overlap: int = 0, **params) -> List[Dict[str, Any]]:
        """
        Split text by paragraphs (blank lines)
        
        Args:
            text: Input text
            max_chunk_size: Optional maximum chunk size
            overlap: Number of characters to overlap
        """
        paragraphs = text.split('\n\n')
        chunks = []
        chunk_num = 1
        current_position = 0
        
        for para in paragraphs:
            if not para.strip():
                current_position += 2
                continue
            
            para_start = text.find(para, current_position)
            para_end = para_start + len(para)
            
            if max_chunk_size and len(para) > max_chunk_size:
                position = para_start
                while position < para_end:
                    chunk_end = min(position + max_chunk_size, para_end)
                    chunk_text = text[position:chunk_end]
                    
                    chunk_obj = self.create_chunk_object(
                        chunk_id=f"chunk_{chunk_num}",
                        start=position,
                        end=chunk_end,
                        text=chunk_text
                    )
                    chunks.append(chunk_obj)
                    chunk_num += 1
                    
                    if overlap > 0:
                        position = chunk_end - overlap
                    else:
                        position = chunk_end
            else:
                chunk_obj = self.create_chunk_object(
                    chunk_id=f"chunk_{chunk_num}",
                    start=para_start,
                    end=para_end,
                    text=para
                )
                chunks.append(chunk_obj)
                chunk_num += 1
            
            current_position = para_end + 2
        
        return chunks