"""Google Gemini LLM Provider using Gemini's OpenAI-compatible HTTP API."""
from typing import Any, Dict, List, Optional

from app.ai.providers.base import LLMMessage, LLMResponse
from app.ai.providers.openai import OpenAIProvider
from app.core.errors import AppException


GEMINI_OPENAI_COMPAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"


class GeminiProvider(OpenAIProvider):
    """Google Gemini provider with native tool calling."""

    def __init__(self, model: str = "gemini-2.5-flash", api_key: str = "", base_url: str = ""):
        super().__init__(
            model=model or "gemini-2.5-flash",
            api_key=api_key,
            base_url=base_url or GEMINI_OPENAI_COMPAT_URL,
        )

    async def generate(
        self,
        messages: List[LLMMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.0,
    ) -> LLMResponse:
        if not self.api_key:
            raise AppException("Gemini API key is not configured. Set GEMINI_API_KEY in backend/.env.")

        resp = await super().generate(messages=messages, tools=tools, temperature=temperature)
        resp.provider = "gemini"
        return resp
