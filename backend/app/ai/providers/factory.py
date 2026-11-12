"""LLM Provider Factory."""
from typing import Optional
from app.ai.providers.base import BaseLLMProvider
from app.ai.providers.claude import ClaudeProvider
from app.ai.providers.gemini import GeminiProvider
from app.ai.providers.mock import MockProvider
from app.ai.providers.ollama import OllamaProvider
from app.ai.providers.openai import OpenAIProvider
from app.core.config import settings


def get_llm_provider(
    provider_name: Optional[str] = None,
    model_name: Optional[str] = None,
) -> BaseLLMProvider:
    """Instantiate configured LLM provider."""
    provider = (provider_name or settings.LLM_PROVIDER or "anthropic").lower()
    model = model_name or settings.LLM_MODEL

    if provider == "anthropic":
        if settings.ANTHROPIC_API_KEY:
            return ClaudeProvider(model=model or "claude-3-5-sonnet-20241022", api_key=settings.ANTHROPIC_API_KEY)
        # Fall back to MockProvider if no API key is configured
        return MockProvider(model="mock-analyst")

    elif provider == "openai":
        if settings.OPENAI_API_KEY:
            return OpenAIProvider(model=model or "gpt-4o", api_key=settings.OPENAI_API_KEY)
        return MockProvider(model="mock-analyst")

    elif provider == "gemini":
        if settings.GEMINI_API_KEY:
            return GeminiProvider(model=model or "gemini-2.5-flash", api_key=settings.GEMINI_API_KEY)
        return MockProvider(model="mock-analyst")

    elif provider == "ollama":
        return OllamaProvider(
            model=model or "llama3.1",
            base_url=settings.OLLAMA_BASE_URL or "http://localhost:11434",
        )

    elif provider == "mock":
        return MockProvider(model="mock-analyst")

    return MockProvider(model="mock-analyst")

