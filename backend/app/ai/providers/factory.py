"""LLM Provider Factory configured exclusively for Groq."""
from typing import Optional
from app.ai.providers.base import BaseLLMProvider
from app.ai.providers.groq import GroqProvider
from app.ai.providers.mock import MockProvider
from app.core.config import settings


def get_llm_provider(
    provider_name: Optional[str] = None,
    model_name: Optional[str] = None,
) -> BaseLLMProvider:
    """Instantiate Groq LLM provider."""
    model = model_name or settings.LLM_MODEL or "openai/gpt-oss-120b"

    if settings.GROQ_API_KEY:
        return GroqProvider(model=model, api_key=settings.GROQ_API_KEY)

    return MockProvider(model="mock-analyst")
