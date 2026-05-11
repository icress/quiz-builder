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
  const [showMissing, setShowMissing] = useState<boolean>(false)

  const getQuestions = async () => {
    setLoading(true)
    setQuestions([])
    setSubmitted(false)
    setShowMissing(false)
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
    const allAnswered = questions.every((q) =>
      selectedAnswers.some((a) => a.questionId === q.id)
    )
    if (!allAnswered) {
      setShowMissing(true)
      return
    }
    setShowMissing(false)
    const score = `${selectedAnswers.filter(answer => answer.isCorrect).length} / 5`
    console.log(score)
    setSubmitted(true)
  }

  const Reset = () => {
    setQuestions([])
    setSubmitted(false)
    setSelectedAnswers([])
    setTopic('')
    setShowMissing(false)
  }

  return (
    <>
      <h1>Quiz Builder</h1>
      {questions.length === 0 ? (
        <div className='flex flex-col gap-2 items-center'>
          <input className='w-sm border-2 border-gray-300 rounded-md p-2' type="text" placeholder="Enter a topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <button className='btn bg-blue-500 w-sm rounded-md' type="button" onClick={getQuestions} disabled={loading}>
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
      <div className='flex flex-col gap-2 items-center'>
        {questions.map((question) => (
          <Question submitted={submitted} showMissing={showMissing} setSelectedAnswers={setSelectedAnswers} key={question.text} question={question} selectedAnswers={selectedAnswers} />
        ))}
        {
          questions.length === 5 ? 
          <button 
            className='bg-slate-200 w-sm rounded-md center' 
            onClick={submitted ? Reset : Submit}>
              {submitted ? 'NEW TEST' : 'SUBMIT'}
            </button> 
          : null
        }
      </div>
    </>
  )
}

export default App
