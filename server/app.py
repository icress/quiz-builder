from __future__ import annotations

import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from get_questions import answer
from pydantic import BaseModel
from sqlalchemy import desc, select, text
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, Option, Question, Quiz
from schemas import (
    QuizDetailResponse,
    QuizListItem,
    QuizOptionOut,
    QuizQuestionOut,
    SaveQuizRequest,
    SaveQuizResponse,
    SelectedAnswerOut,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)


class GetQuestionsRequest(BaseModel):
    topic: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/get-questions")
async def getQuestions(request: GetQuestionsRequest):
    return await answer(request.topic)


@app.get("/quizzes", response_model=list[QuizListItem])
def list_quizzes(db: Session = Depends(get_db)):
    quizzes = db.scalars(select(Quiz).order_by(desc(text("rowid")))).all()
    return [QuizListItem(id=q.id, name=q.name) for q in quizzes]


@app.get("/quizzes/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    quiz = db.get(Quiz, quiz_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.scalars(
        select(Question).where(Question.quiz_id == quiz_id).order_by(text("rowid"))
    ).all()

    question_outs: list[QuizQuestionOut] = []
    selected_answers: list[SelectedAnswerOut] = []

    for q in questions:
        options = db.scalars(
            select(Option).where(Option.question_id == q.id).order_by(text("rowid"))
        ).all()
        option_outs = [
            QuizOptionOut(id=o.id, option=o.content, is_correct=o.is_correct)
            for o in options
        ]
        question_outs.append(
            QuizQuestionOut(id=q.id, text=q.content, options=option_outs)
        )
        for o in options:
            if o.is_selected:
                selected_answers.append(
                    SelectedAnswerOut(
                        question_id=q.id,
                        option_id=o.id,
                        is_correct=o.is_correct,
                    )
                )
                break

    return QuizDetailResponse(
        id=quiz.id,
        name=quiz.name,
        questions=question_outs,
        selected_answers=selected_answers,
    )


@app.post("/quizzes", response_model=SaveQuizResponse)
def create_quiz(request: SaveQuizRequest, db: Session = Depends(get_db)):
    quiz_id = str(uuid.uuid4())
    quiz = Quiz(id=quiz_id, name=request.name)
    db.add(quiz)
    for q in request.questions:
        db.add(Question(id=q.id, content=q.content, quiz_id=quiz_id))
        for o in q.options:
            db.add(
                Option(
                    id=o.id,
                    content=o.content,
                    is_selected=o.selected,
                    is_correct=o.correct,
                    question_id=q.id,
                )
            )
    db.commit()
    return SaveQuizResponse(quiz_id=quiz_id)