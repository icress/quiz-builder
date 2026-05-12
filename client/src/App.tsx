import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { API_BASE } from './api'
import type { QuestionType } from './Question'
import { Sidebar, type QuizSummary } from './Sidebar'
import { NewTest } from './NewTest'
import { Test } from './Test'

export { API_BASE } from './api'

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
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([])
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [showMissing, setShowMissing] = useState<boolean>(false)
  const [quizPersisted, setQuizPersisted] = useState(false)
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

  const onExplanation = useCallback((questionId: string, explanation: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, explanation } : q)),
    )
  }, [])

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
      setQuizPersisted(true)
    } finally {
      setSavedQuizLoading(false)
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
      .then((res) => {
        if (res.ok) {
          setQuizPersisted(true)
          void refreshSavedQuizzes()
        }
      })
      .catch(console.error)
  }

  const Reset = () => {
    setQuestions([])
    setSubmitted(false)
    setSelectedAnswers([])
    setTopic('')
    setShowMissing(false)
    setActiveSavedQuizId(null)
    setQuizPersisted(false)
  }

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
        {questions.length === 0 ? (
          <div className="flex flex-1 flex-col gap-4 items-center pt-4 px-4">
            <h1>Quiz Builder</h1>
            <NewTest 
              setQuestions={setQuestions} 
              setSubmitted={setSubmitted} 
              setShowMissing={setShowMissing} 
              setActiveSavedQuizId={setActiveSavedQuizId}
              setQuizPersisted={setQuizPersisted}
            />
          </div>
        ) : (
          <Test
            questions={questions}
            submitted={submitted}
            showMissing={showMissing}
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
            quizPersisted={quizPersisted}
            onExplanation={onExplanation}
            onSubmit={Submit}
            onReset={Reset}
          />
        )}
      </div>
    </div>
  )
}

export default App
