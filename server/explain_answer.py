import os

from anthropic import AsyncAnthropic

MODEL = os.environ.get("ANTHROPIC_EXPLAIN_MODEL")

SYSTEM_PROMPT = """You are a helpful tutor. Given a multiple-choice question, the learner's selected answer, and the correct answer, write a short, clear explanation (2–5 sentences).
If the selected answer matches the correct answer, explain why it is right.
If it does not match, explain why the selected answer is wrong and why the correct answer is right.
Base your reasoning only on the question and the answer texts provided. Do not invent facts beyond typical subject knowledge implied by the question."""


llm = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

async def generate_explanation(
    *,
    question_text: str,
    selected_text: str,
    correct_text: str,
    selected_is_correct: bool,
):
    user = (
        f"Question:\n{question_text}\n\n"
        f"Learner's selected answer:\n{selected_text}\n\n"
        f"Correct answer:\n{correct_text}\n\n"
        f"The learner's answer is {'correct' if selected_is_correct else 'incorrect'}."
    )
    async with llm.messages.stream(
        max_tokens=1000,
        model=MODEL,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user}],
    ) as stream:
        async for text in stream.text_stream:
            yield text
