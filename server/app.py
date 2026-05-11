from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from get_questions import answer
from pydantic import BaseModel

app = FastAPI()

class GetQuestionsRequest(BaseModel):
    topic: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/get-questions')
async def getQuestions(request: GetQuestionsRequest):
    return await answer(request.topic)