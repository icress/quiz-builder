"""Tests for explain_answer.generate_explanation."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import explain_answer


async def _text_chunks(*parts: str):
    for p in parts:
        yield p


@pytest.mark.asyncio
async def test_generate_explanation_yields_streamed_text_chunks():
    """Yields each text segment from the Anthropic text_stream in order."""
    stream_obj = MagicMock()
    stream_obj.text_stream = _text_chunks("Why ", "A is correct.")

    mock_cm = MagicMock()
    mock_cm.__aenter__ = AsyncMock(return_value=stream_obj)
    mock_cm.__aexit__ = AsyncMock(return_value=None)

    with patch.object(explain_answer.llm.messages, "stream", return_value=mock_cm):
        with patch.object(explain_answer, "MODEL", "test-model"):
            parts = [
                t
                async for t in explain_answer.generate_explanation(
                    question_text="2+2=?",
                    selected_text="4",
                    correct_text="4",
                    selected_is_correct=True,
                )
            ]

    assert parts == ["Why ", "A is correct."]


@pytest.mark.asyncio
async def test_generate_explanation_passes_messages_and_model_to_stream():
    """Stream is invoked with system prompt, user payload, model, and max_tokens."""
    stream_obj = MagicMock()
    stream_obj.text_stream = _text_chunks("x")

    mock_cm = MagicMock()
    mock_cm.__aenter__ = AsyncMock(return_value=stream_obj)
    mock_cm.__aexit__ = AsyncMock(return_value=None)

    with patch.object(explain_answer.llm.messages, "stream", return_value=mock_cm) as stream_mock:
        with patch.object(explain_answer, "MODEL", "claude-test"):
            async for _ in explain_answer.generate_explanation(
                question_text="Capital of France?",
                selected_text="Paris",
                correct_text="Paris",
                selected_is_correct=True,
            ):
                pass

    stream_mock.assert_called_once()
    call_kw = stream_mock.call_args.kwargs
    assert call_kw["model"] == "claude-test"
    assert call_kw["max_tokens"] == 1000
    assert call_kw["system"] == explain_answer.SYSTEM_PROMPT
    assert len(call_kw["messages"]) == 1
    user_content = call_kw["messages"][0]["content"]
    assert "Capital of France?" in user_content
    assert "Paris" in user_content
    assert "The learner's answer is correct." in user_content


@pytest.mark.asyncio
async def test_generate_explanation_user_message_marks_incorrect_selection():
    """User message states incorrect when selected_is_correct is False."""
    stream_obj = MagicMock()
    stream_obj.text_stream = _text_chunks("ok")

    mock_cm = MagicMock()
    mock_cm.__aenter__ = AsyncMock(return_value=stream_obj)
    mock_cm.__aexit__ = AsyncMock(return_value=None)

    with patch.object(explain_answer.llm.messages, "stream", return_value=mock_cm) as stream_mock:
        with patch.object(explain_answer, "MODEL", "m"):
            async for _ in explain_answer.generate_explanation(
                question_text="Q?",
                selected_text="Wrong",
                correct_text="Right",
                selected_is_correct=False,
            ):
                pass

    user_content = stream_mock.call_args.kwargs["messages"][0]["content"]
    assert "Learner's selected answer:\nWrong" in user_content
    assert "Correct answer:\nRight" in user_content
    assert "The learner's answer is incorrect." in user_content
