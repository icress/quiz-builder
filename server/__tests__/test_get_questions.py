"""Tests for get_questions.answer."""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

import get_questions


def _llm_json_with_five_questions() -> str:
    payload = {
        "questions": [
            {
                "text": f"Question {n}?",
                "options": [
                    {"option": "A - correct", "is_correct": True},
                    {"option": "B - wrong", "is_correct": False},
                    {"option": "C - wrong", "is_correct": False},
                    {"option": "D - wrong", "is_correct": False},
                ],
            }
            for n in range(1, 6)
        ]
    }
    return json.dumps(payload)


@pytest.mark.asyncio
async def test_answer_returns_five_questions_from_json():
    """LLM JSON with five questions is parsed and returned as five question objects."""
    mock_message = MagicMock()
    mock_message.content = _llm_json_with_five_questions()
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]

    with patch.object(
        get_questions.llm.chat.completions,
        "create",
        return_value=mock_response,
    ):
        result = await get_questions.answer("test topic")

    assert isinstance(result, dict)
    assert "questions" in result
    assert len(result["questions"]) == 5
