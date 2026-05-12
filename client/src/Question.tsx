import { useState } from 'react'
import type { Answer } from './App'
import { API_BASE } from './api'

export interface QuestionType {
  id: string
  text: string
  options: OptionType[]
  explanation?: string | null
}

export interface OptionType {
  id: string
  option: string
  is_correct: boolean
}

export function Question(props: {
  submitted: boolean
  showMissing: boolean
  question: QuestionType
  setSelectedAnswers: Function
  selectedAnswers: Answer[]
  quizPersisted: boolean
  onExplanation: (questionId: string, explanation: string) => void
}) {
  const {
    question,
    setSelectedAnswers,
    selectedAnswers,
    submitted,
    showMissing,
    quizPersisted,
    onExplanation,
  } = props
  const [selected, setSelected] = useState<string | null>(null)
  const [explainLoading, setExplainLoading] = useState(false)

  const selectAnswer = (answer: OptionType) => {
    const selectedAnswer: Answer = {
      questionId: question.id,
      isCorrect: answer.is_correct,
      optionId: answer.id
    }
    setSelected(answer.option)
    const previousAnswer = selectedAnswers.find((item) => item.questionId === question.id)
    if (previousAnswer) {
      setSelectedAnswers(selectedAnswers.map((item) => item.questionId === selectedAnswer.questionId ? selectedAnswer : item))
    } else {
      setSelectedAnswers([...selectedAnswers, selectedAnswer])
    }
  }

  const requestExplanation = async () => {
    setExplainLoading(true)
    try {
      const response = await fetch(`${API_BASE}/questions/${question.id}/explain`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        return
      }
      const data: { explanation: string } = await response.json()
      onExplanation(question.id, data.explanation)
    } finally {
      setExplainLoading(false)
    }
  }

  const answerForQuestion = selectedAnswers.find((a) => a.questionId === question.id)
  const isMissing = showMissing && !answerForQuestion

  const feedbackClassName = (opt: OptionType) => {
    if (!submitted || !answerForQuestion) {
      return undefined
    }

    const isSelected = answerForQuestion.optionId === opt.id
    const userWasCorrect = answerForQuestion.isCorrect

    if (userWasCorrect) {
      return isSelected && opt.is_correct ? 'bg-green-400/40' : undefined
    }

    if (opt.is_correct) {
      return 'bg-green-400/40'
    }
    if (isSelected) {
      return 'bg-red-400/40'
    }
    return undefined
  }

  const showExplain =
    submitted && quizPersisted && !question.explanation?.trim()

  return (
    <div style={{ marginBottom: '1.25rem', maxWidth: 560 }}>
    <fieldset
      style={{
        border: `1px solid ${isMissing ? '#dc2626' : 'var(--border, #ccc)'}`,
        borderRadius: 8,
        padding: '1rem 1.25rem',
        maxWidth: 560,
      }}
    >
      <legend style={{ fontWeight: 600, fontSize: '1.05rem', padding: '0 0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{question.text}</span>
        {isMissing ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            width={24}
            height={24}
            role="img"
            aria-label="This question is unanswered"
            style={{ color: '#dc2626', flexShrink: 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        ) : null}
      </legend>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
        {question.options.map((opt, index) => (
          <label
            key={`${index}-${opt.option}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              cursor: submitted ? 'default' : 'pointer',
              padding: '0.45rem 0.5rem',
              borderRadius: 6,
              border: '1px solid transparent',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
            className={feedbackClassName(opt)}
          >
            <input
              type="radio"
              name={question.id}
              value={opt.option}
              checked={answerForQuestion ? answerForQuestion.optionId === opt.id : selected === opt.option}
              disabled={submitted}
              onChange={() => selectAnswer(opt)}
              style={{ marginTop: '0.2rem' }}
            />
            <span>{opt.option}</span>
          </label>
        ))}
      </div>
    </fieldset>
    {question.explanation?.trim() ? (
      <p
        style={{
          marginTop: '0.75rem',
          padding: '0.65rem 0.85rem',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          background: 'var(--explanation-bg, #f8fafc)',
          borderRadius: 8,
          border: '1px solid var(--border, #e2e8f0)',
        }}
      >
        {question.explanation}
      </p>
    ) : null}
    {showExplain ? (
      <button
        type="button"
        disabled={explainLoading}
        onClick={() => void requestExplanation()}
        style={{
          marginTop: '0.65rem',
          padding: '0.4rem 0.85rem',
          fontSize: '0.9rem',
          borderRadius: 6,
          border: '1px solid var(--border, #ccc)',
          background: explainLoading ? '#e2e8f0' : '#fff',
          cursor: explainLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {explainLoading ? '…' : 'Explain'}
      </button>
    ) : null}
    </div>
  )
}
