import type { Dispatch, SetStateAction } from 'react'
import type { Answer } from './App'
import { Question, type QuestionType } from './Question'

export interface TestProps {
  questions: QuestionType[]
  submitted: boolean
  showMissing: boolean
  selectedAnswers: Answer[]
  setSelectedAnswers: Dispatch<SetStateAction<Answer[]>>
  onSubmit: () => void
  onReset: () => void
}

export function Test({
  questions,
  submitted,
  showMissing,
  selectedAnswers,
  setSelectedAnswers,
  onSubmit,
  onReset,
}: TestProps) {
  const total = questions.length
  const correctCount =
    submitted && total > 0
      ? selectedAnswers.filter((a) => a.isCorrect).length
      : null

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex flex-1 flex-col gap-4 items-center pt-4 px-4">
        <h1>Quiz Builder</h1>
        <div className="flex flex-col gap-2 items-center w-full max-w-xl">
          {questions.map((question) => (
            <Question
              submitted={submitted}
              showMissing={showMissing}
              setSelectedAnswers={setSelectedAnswers}
              key={question.id}
              question={question}
              selectedAnswers={selectedAnswers}
            />
          ))}
          {questions.length === 5 && !submitted ? (
            <button
              className="bg-slate-200 w-sm rounded-md center"
              type="button"
              onClick={onSubmit}
            >
              SUBMIT
            </button>
          ) : null}
        </div>
      </div>
      {correctCount !== null ? (
        <footer
          className="mt-auto w-full border-t border-gray-200 py-4 text-center text-lg font-medium flex flex-col gap-2 items-center justify-center"
          role="status"
          aria-live="polite"
        >
          Score: {correctCount} / {total}
          <button
            className="bg-slate-200 w-sm rounded-md center"
            type="button"
            onClick={onReset}
          >
            NEW QUIZ
          </button>
        </footer>
      ) : null}
    </div>
  )
}
