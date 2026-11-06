"""Ollama Local LLM Provider using direct HTTP API."""
import json
from typing import Any, Dict, List, Optional
import httpx

from app.ai.providers.base import BaseLLMProvider, LLMMessage, LLMResponse, ToolCall
from app.core.errors import AppException


class OllamaProvider(BaseLLMProvider):
    """Ollama local models provider with tool support."""

    def __init__(self, model: str = "llama3.1", base_url: str = "http://localhost:11434"):
        super().__init__(model=model, api_key="", base_url=base_url.rstrip("/"))

    async def generate(
        self,
        messages: List[LLMMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.0,
    ) -> LLMResponse:
        url = f"{self.base_url}/api/chat"

        ollama_messages: List[Dict[str, Any]] = []
        for m in messages:
            msg_dict: Dict[str, Any] = {"role": m.role, "content": m.content or ""}
            ollama_messages.append(msg_dict)

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": ollama_messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if tools:
            payload["tools"] = tools

        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code != 200:
                    raise AppException(f"Ollama error ({resp.status_code}): {resp.text}")
                data = resp.json()
            except httpx.ConnectError:
                raise AppException(f"Could not connect to Ollama at {self.base_url}. Ensure Ollama is running.")

        msg = data.get("message", {})
        tool_calls: List[ToolCall] = []
        for tc in msg.get("tool_calls", []):
            fn = tc.get("function", {})
            args = fn.get("arguments", {})
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except Exception:
                    args = {}
            tool_calls.append(
                ToolCall(
                    id=f"ollama_{fn.get('name', 'tool')}",
                    name=fn.get("name", ""),
                    arguments=args,
                )
            )

        return LLMResponse(
            content=msg.get("content"),
            tool_calls=tool_calls,
            finish_reason="tool_calls" if tool_calls else "stop",
            provider="ollama",
            model=self.model,
        )
