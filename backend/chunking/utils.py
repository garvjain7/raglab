def count_words(text: str) -> int:
    """Count words in text"""
    return len(text.split())


def validate_params(strategy: str, params: dict) -> dict:
    """Validate and set default parameters for each strategy"""
    
    defaults = {
        "fixed": {"chunk_size": 100, "overlap": 0},
        "sentence": {"max_chunk_size": 500, "overlap": 0},
        "paragraph": {"max_chunk_size": None, "overlap": 0},
        "recursive": {"chunk_size": 500, "overlap": 50}
    }
    
    if strategy not in defaults:
        raise ValueError(f"Unknown strategy: {strategy}")
    
    validated = defaults[strategy].copy()
    validated.update(params)
    
    return validated