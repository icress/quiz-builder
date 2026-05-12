import { useState } from 'react'
import { API_BASE } from './api'

export function Explanation(props: {
  questionId: string
  explanation?: string | null
  submitted: boolean
  quizPersisted: boolean
  onExplanation: (questionId: string, explanation: string) => void
}) {
  const { questionId, explanation, submitted, quizPersisted, onExplanation } = props
  const [explainLoading, setExplainLoading] = useState(false)

  const requestExplanation = async () => {
    setExplainLoading(true)
    try {
      const response = await fetch(`${API_BASE}/questions/${questionId}/explain`, {
        method: 'POST',
        headers: { Accept: 'text/plain' },
      })
      if (!response.ok || !response.body) {
        return
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone
        const chunk = decoder.decode(value || new Uint8Array(), { stream: !done })

        if (chunk) {
          onExplanation(questionId, chunk)
        }
      }
    } finally {
      setExplainLoading(false)
    }
  }

  const showExplain =
    submitted && quizPersisted && !explanation?.trim()

  return (
    <>
      {explanation?.trim() ? (
        <p
          style={{
            marginTop: '0.75rem',
            padding: '0.65rem 0.85rem',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            borderRadius: 8,
            border: '1px solid var(--border, #e2e8f0)',
          }}
        >
          {explanation}
        </p>
      ) : null}
      {showExplain ? (
        <button
          type="button"
          disabled={explainLoading}
          onClick={() => void requestExplanation()}
          className='bg-white border-gray-200 shadow-sm font-medium text-gray-900 w-auto p-2 rounded-md'
        >
          {explainLoading ? 'Thinking…' : 'Explain'}
        </button>
      ) : null}
    </>
  )
}
