import pytest
from unittest.mock import MagicMock, AsyncMock
import numpy as np
import sys

# Mock heavy ML dependencies before they are imported by the app
mock_torch = MagicMock()
mock_open_clip = MagicMock()

sys.modules["torch"] = mock_torch
sys.modules["open_clip"] = mock_open_clip
sys.modules["torch.nn"] = MagicMock()
sys.modules["torch.utils"] = MagicMock()
sys.modules["torchvision"] = MagicMock()
sys.modules["torchvision.transforms"] = MagicMock()

@pytest.fixture
def mock_openai_client():
    client = MagicMock()
    client.chat = MagicMock()
    client.chat.completions = MagicMock()
    client.chat.completions.create = AsyncMock()
    return client

@pytest.fixture
def mock_clip_service():
    service = MagicMock()
    service.encode_text = AsyncMock(return_value=[0.1] * 512)
    service.encode_image = AsyncMock(return_value=[0.2] * 512)
    service.encode_batch = AsyncMock(return_value=([ [0.1]*512 ], [ [0.2]*512 ]))
    return service

@pytest.fixture
def mock_redis_client():
    client = AsyncMock()
    client.get = AsyncMock(return_value=None)
    client.set = AsyncMock(return_value=True)
    return client
