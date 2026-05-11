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
    setSubmitted(true)
  }

  const Reset = () => {
    setQuestions([])
    setSubmitted(false)
    setSelectedAnswers([])
    setTopic('')
    setShowMissing(false)
  }

  const correctCount =
    submitted && questions.length === 5
      ? selectedAnswers.filter((a) => a.isCorrect).length
      : null

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col gap-4 items-center pt-4 px-4">
        <h1>Quiz Builder</h1>
        {questions.length === 0 ? (
          <div className='flex flex-col gap-2 items-center'>
            <input className='w-sm border-2 border-gray-300 rounded-md p-2' type="text" placeholder="Enter a topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <button disabled={loading} className={'btn bg-blue-500 w-auto rounded-md p-4 text-white' + (loading ? ' opacity-50 cursor-not-allowed' : '')} type="button" onClick={getQuestions}>
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
            questions.length === 5 && !submitted ? 
            <button 
              className='bg-slate-200 w-sm rounded-md center' 
              onClick={Submit}>
                {'SUBMIT'}
            </button> 
            : null
          }
        </div>
      </div>
      {correctCount !== null ? (
        <footer
          className="mt-auto w-full border-t border-gray-200 py-4 text-center text-lg font-medium flex flex-col gap-2 items-center justify-center"
          role="status"
          aria-live="polite"
        >
          Score: {correctCount} / 5
          <button className='bg-slate-200 w-sm rounded-md center' onClick={Reset}>
            {'NEW TEST'}
          </button>
        </footer>
      ) : null}
    </div>
  )
}

export default App
