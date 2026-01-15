import pytest
from unittest.mock import MagicMock, AsyncMock
import json
from app.services.parse_service import ParseService
from app.models import ParsedPrompt

@pytest.mark.asyncio
async def test_parse_prompt_success(mock_openai_client, mock_redis_client):
    service = ParseService()
    service.client = mock_openai_client
    service.redis_client = mock_redis_client
    
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps({
            "aesthetic": "minimalist",
            "budget": 1000,
            "size": "M",
            "gender": "male",
            "categories": ["top"]
        })))
    ]
    mock_openai_client.chat.completions.create.return_value = mock_response
    
    # Ensure Redis client is set so caching logic runs
    service.redis_client = mock_redis_client
    mock_redis_client.setex = AsyncMock(return_value=True)
    
    parsed, cached = await service.parse_prompt("minimalist outfit for male size M under 1000")
    
    assert parsed.aesthetic == "minimalist"
    assert parsed.budget == 1000
    assert not cached
    mock_redis_client.setex.assert_called()

@pytest.mark.asyncio
async def test_parse_prompt_fallback(mock_openai_client, mock_redis_client):
    service = ParseService()
    service.client = mock_openai_client
    service.redis_client = mock_redis_client
    
    # Simulate API failure
    mock_openai_client.chat.completions.create.side_effect = Exception("API Error")
    
    parsed, cached = await service.parse_prompt("something random 500")
    
    assert parsed.budget == 500
    assert not cached
