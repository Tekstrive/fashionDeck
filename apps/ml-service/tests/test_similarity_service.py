import pytest
import numpy as np
from app.services.similarity_service import SimilarityService

def test_calculate_coherence():
    service = SimilarityService()
    
    # Identical vectors (perfect coherence)
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    score = service.calculate_coherence([v1, v2])
    assert score == 1.0
    
    # Orthogonal vectors (poor coherence)
    v3 = [1.0, 0.0, 0.0]
    v4 = [0.0, 1.0, 0.0]
    score = service.calculate_coherence([v3, v4])
    assert score < 0.5 # Should be penalized
    
    # Single item
    assert service.calculate_coherence([[1, 0]]) == 1.0
