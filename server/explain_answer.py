import os

from openai import OpenAI

DEFAULT_MODEL = "gemma4:e4b"
MODEL = os.environ.get("OLLAMA_EXPLAIN_MODEL", DEFAULT_MODEL)

SYSTEM_PROMPT = """You are a helpful tutor. Given a multiple-choice question, the learner's selected answer, and the correct answer, write a short, clear explanation (2–5 sentences).
If the selected answer matches the correct answer, explain why it is right.
If it does not match, explain why the selected answer is wrong and why the correct answer is right.
Base your reasoning only on the question and the answer texts provided. Do not invent facts beyond typical subject knowledge implied by the question."""

_client: OpenAI | None = None


def _client_openai() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
    return _client


def generate_explanation(
    *,
    question_text: str,
    selected_text: str,
    correct_text: str,
    selected_is_correct: bool,
) -> str:
    user = (
        f"Question:\n{question_text}\n\n"
        f"Learner's selected answer:\n{selected_text}\n\n"
        f"Correct answer:\n{correct_text}\n\n"
        f"The learner's answer is {'correct' if selected_is_correct else 'incorrect'}."
    )
    response = _client_openai().chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user},
        ],
    )
    content = response.choices[0].message.content
    if not content:
        return ""
    return content.strip()
