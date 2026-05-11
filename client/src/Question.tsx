import { useId, useState } from 'react'

export interface QuestionType {
  text: string
  options: {
    option: string
    is_correct: boolean
  }[]
}

export function Question(props: { question: QuestionType }) {
  const { question } = props
  const groupName = useId()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <fieldset
      style={{
        border: '1px solid var(--border, #ccc)',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        maxWidth: 560,
      }}
    >
      <legend style={{ fontWeight: 600, fontSize: '1.05rem', padding: '0 0.35rem' }}>
        {question.text}
      </legend>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
        {question.options.map((opt, index) => (
          <label
            key={`${index}-${opt.option}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name={groupName}
              value={opt.option}
              checked={selected === opt.option}
              onChange={() => setSelected(opt.option)}
              style={{ marginTop: '0.2rem' }}
            />
            <span>{opt.option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
