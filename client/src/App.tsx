import { useState } from 'react'
import './App.css'
import { Question } from './Question'
import type { QuestionType } from './Question'

function App() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [loading, setLoading] = useState(false)

  const getQuestions = async () => {
    setLoading(true)
    setQuestions([])
    try {
      const response = await fetch('http://localhost:8000/get-questions', {
        method: 'POST',
        body: JSON.stringify({ topic }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      const data = await response.json()
      console.log(data)
      setQuestions(data.questions)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>Quiz Builder</h1>
      <input type="text" placeholder="Enter a topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <button type="button" onClick={getQuestions} disabled={loading}>
        Get Questions
      </button>
      {loading ? (
        <div className="quiz-loading" role="status" aria-live="polite">
          <span className="quiz-loading__spinner" aria-hidden />
          <span className="quiz-loading__label">Loading questions…</span>
        </div>
      ) : null}
      {questions.map((question) => (
        <Question key={question.text} question={question} />
      ))}
    </>
  )
}

export default App
