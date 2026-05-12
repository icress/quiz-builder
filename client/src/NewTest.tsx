import { useState } from 'react'
import { API_BASE } from './App'

export function NewTest(props: { setQuestions: Function, setSubmitted: Function, setShowMissing: Function, setActiveSavedQuizId: Function }) {
  const { setQuestions, setSubmitted, setShowMissing, setActiveSavedQuizId } = props
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
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
  )
}