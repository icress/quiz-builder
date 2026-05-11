import { useState } from 'react'
import './App.css'
import { Question } from './Question'
import type { QuestionType } from './Question'

export interface Answer {
  questionId: string
  isCorrect: boolean
  optionId: string
}

function App() {
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([])
  const [submitted, setSubmitted] = useState<boolean>(false)

  const getQuestions = async () => {
    setLoading(true)
    setQuestions([])
    setSubmitted(false)
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
      setQuestions(data.questions)
    } finally {
      setLoading(false)
    }
  }

  const Submit = () => {
    if (selectedAnswers.length < 5) {
      console.log('MISSING ANSWERS')
    } else {
      const score = `${selectedAnswers.filter(answer => answer.isCorrect).length} / 5`
      console.log(score)
    }
    setSubmitted(true)
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
        <Question submitted={submitted} setSelectedAnswers={setSelectedAnswers} key={question.text} question={question} selectedAnswers={selectedAnswers} />
      ))}
      {
        questions.length === 5 ? <button onClick={Submit}>SUBMIT</button> : null
      }
    </>
  )
}

export default App
