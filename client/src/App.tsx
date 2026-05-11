import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { Question } from './Question'
import type { QuestionType } from './Question'
import { Sidebar, type QuizSummary } from './Sidebar'

const API_BASE = 'http://localhost:8000'

export interface Answer {
  questionId: string
  isCorrect: boolean
  optionId: string
}

interface QuizDetail {
  id: string
  name: string
  questions: QuestionType[]
  selectedAnswers: Answer[]
}

function App() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([])
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [showMissing, setShowMissing] = useState<boolean>(false)
  const [savedQuizzes, setSavedQuizzes] = useState<QuizSummary[]>([])
  const [savedListLoading, setSavedListLoading] = useState(true)
  const [activeSavedQuizId, setActiveSavedQuizId] = useState<string | null>(null)
  const [savedQuizLoading, setSavedQuizLoading] = useState(false)

  const refreshSavedQuizzes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/quizzes`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        return
      }
      const data: QuizSummary[] = await response.json()
      setSavedQuizzes(data)
    } catch {
      // ignore network errors for sidebar
    } finally {
      setSavedListLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshSavedQuizzes()
  }, [refreshSavedQuizzes])

  const loadSavedQuiz = async (quizId: string) => {
    setSavedQuizLoading(true)
    setActiveSavedQuizId(quizId)
    setShowMissing(false)
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        return
      }
      const data: QuizDetail = await response.json()
      setTopic(data.name)
      setQuestions(data.questions)
      setSelectedAnswers(data.selectedAnswers)
      setSubmitted(true)
    } finally {
      setSavedQuizLoading(false)
    }
  }

  const getQuestions = async () => {
    setLoading(true)
    setQuestions([])
    setSubmitted(false)
    setShowMissing(false)
    setActiveSavedQuizId(null)
    try {
      const response = await fetch(`${API_BASE}/get-questions`, {
        method: 'POST',
        body: JSON.stringify({ topic }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      const data = await response.json()
      setQuestions(data.questions)
    } finally {
      setLoading(false)
    }
  }

  const Submit = () => {
    const allAnswered = questions.every((q) =>
      selectedAnswers.some((a) => a.questionId === q.id)
    )
    if (!allAnswered) {
      setShowMissing(true)
      return
    }
    setShowMissing(false)
    setSubmitted(true)
    setActiveSavedQuizId(null)

    const payload = {
      name: topic,
      questions: questions.map((q) => {
        const ans = selectedAnswers.find((a) => a.questionId === q.id)!
        return {
          id: q.id,
          content: q.text,
          options: q.options.map((opt) => ({
            id: opt.id,
            content: opt.option,
            selected: ans.optionId === opt.id,
            correct: opt.is_correct,
          })),
        }
      }),
    }
    void fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => (res.ok ? refreshSavedQuizzes() : undefined))
      .catch(console.error)
  }

  const Reset = () => {
    setQuestions([])
    setSubmitted(false)
    setSelectedAnswers([])
    setTopic('')
    setShowMissing(false)
    setActiveSavedQuizId(null)
  }

  const total = questions.length
  const correctCount =
    submitted && total > 0
      ? selectedAnswers.filter((a) => a.isCorrect).length
      : null

  return (
    <div className="min-h-screen flex">
      <Sidebar
        quizzes={savedQuizzes}
        loading={savedListLoading}
        activeQuizId={activeSavedQuizId}
        onSelectQuiz={loadSavedQuiz}
        onNewTest={Reset}
      />
      <div className="flex flex-1 flex-col min-w-0 relative">
        {savedQuizLoading ? (
          <div
            className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center pointer-events-none"
            role="status"
            aria-live="polite"
          >
            <span className="text-sm text-gray-600">Loading quiz…</span>
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-4 items-center pt-4 px-4">
          <h1>Quiz Builder</h1>
          {questions.length === 0 ? (
            <div className="flex flex-col gap-2 items-center">
              <input
                className="w-sm border-2 border-gray-300 rounded-md p-2"
                type="text"
                placeholder="Enter a topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button
                disabled={loading}
                className={
                  'btn bg-blue-500 w-auto rounded-md p-4 text-white' +
                  (loading ? ' opacity-50 cursor-not-allowed' : '')
                }
                type="button"
                onClick={getQuestions}
              >
                Get Questions
              </button>
              {loading ? (
                <div className="quiz-loading" role="status" aria-live="polite">
                  <span className="quiz-loading__spinner" aria-hidden />
                  <span className="quiz-loading__label">Loading questions…</span>
                </div>
              ) : null}
            </div>
          ) : null}
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
                onClick={Submit}
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
              onClick={Reset}
            >
              NEW QUIZ
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  )
}

export default App
