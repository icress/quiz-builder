import { useState } from 'react'
import type { Answer } from './App'

export interface QuestionType {
  id: string
  text: string
  options: OptionType[]
}

export interface OptionType {
  id: string
  option: string
  is_correct: boolean
}

export function Question(props: {submitted: boolean, showMissing: boolean, question: QuestionType, setSelectedAnswers: Function, selectedAnswers: Answer[] }) {
  const { question, setSelectedAnswers, selectedAnswers, submitted, showMissing } = props
  const [selected, setSelected] = useState<string | null>(null)

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
    console.log(selectedAnswers)
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

  return (
    <fieldset
      style={{
        border: `1px solid ${isMissing ? '#dc2626' : 'var(--border, #ccc)'}`,
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        maxWidth: 560,
      }}
    >
      <legend style={{ fontWeight: 600, fontSize: '1.05rem', padding: '0 0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{question.text}</span>
        {isMissing ? (
          <span
            role="img"
            aria-label="This question is unanswered"
            title="This question is unanswered"
            style={{
              color: '#fff',
              backgroundColor: '#dc2626',
              borderRadius: '9999px',
              width: '1.4rem',
              height: '1.4rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              lineHeight: 1,
            }}
          >
            !
          </span>
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
  )
}
