from openai import OpenAI
import json


MODEL = 'gemma4:e4b'

RETRIEVAL_K = 3

SYSTEM_PROMPT = """
You are a quiz builder that generates questions for a specific topic that will be provided by the user.
You will generate 5 questions for this topic.
Each question will be multiple choice with 4 options.
You will generate one correct answer and three incorrect answers.
Return only the questions in a JSON object with the following format:
{{
    "questions": [
        {
            "text": "question text",
            "options": [
                {{
                    "option": "option text 1",
                    "is_correct": true
                }},
                {{
                    "option": "option text 2",
                    "is_correct": false
                }},
                {{
                    "option": "option text 3",
                    "is_correct": false
                }},
                {{
                    "option": "option text 4",
                    "is_correct": false
                }}
            ]
        }
    ],
    ...
}}
"""

llm = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

async def answer(topic: str):
    response = llm.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Generate 5 questions for the topic: " + topic}
        ],
        response_format={"type": "json_object"}
    )
    response_content = response.choices[0].message.content
    print(response_content)
    questions = json.loads(response_content)
    print(questions)
    return questions
