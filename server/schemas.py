from pydantic import BaseModel, ConfigDict, Field, field_validator


class SaveQuizOption(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    content: str
    selected: bool
    correct: bool


class SaveQuizQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    content: str
    options: list[SaveQuizOption]

    @field_validator("options")
    @classmethod
    def exactly_one_selected(cls, v: list[SaveQuizOption]) -> list[SaveQuizOption]:
        selected_count = sum(1 for o in v if o.selected)
        if selected_count != 1:
            raise ValueError("each question must have exactly one selected option")
        return v


class SaveQuizRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    questions: list[SaveQuizQuestion]


class SaveQuizResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    quiz_id: str = Field(serialization_alias="quizId")


class QuizListItem(BaseModel):
    id: str
    name: str


class QuizOptionOut(BaseModel):
    id: str
    option: str
    is_correct: bool


class QuizQuestionOut(BaseModel):
    id: str
    text: str
    options: list[QuizOptionOut]


class SelectedAnswerOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    question_id: str = Field(serialization_alias="questionId")
    option_id: str = Field(serialization_alias="optionId")
    is_correct: bool = Field(serialization_alias="isCorrect")


class QuizDetailResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    questions: list[QuizQuestionOut]
    selected_answers: list[SelectedAnswerOut] = Field(
        serialization_alias="selectedAnswers"
    )
