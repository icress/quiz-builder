import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Explanation } from '../src/Explanation'
import { API_BASE } from '../src/api'

function streamingResponse(chunks: string[]) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      for (const c of chunks) {
        controller.enqueue(encoder.encode(c))
      }
      controller.close()
    },
  })
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/plain' } })
}

describe('Explanation', () => {
  const questionId = 'q-123'

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the explanation text when provided', () => {
    const onExplanation = vi.fn()
    render(
      <Explanation
        questionId={questionId}
        explanation="  Because the answer follows from the definition.  "
        submitted
        quizPersisted
        onExplanation={onExplanation}
      />,
    )

    expect(screen.getByText(/Because the answer follows from the definition/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Explain' })).not.toBeInTheDocument()
  })

  it('shows Explain only when submitted, quiz persisted, and no explanation yet', () => {
    const onExplanation = vi.fn()
    const { rerender } = render(
      <Explanation
        questionId={questionId}
        explanation={null}
        submitted={false}
        quizPersisted
        onExplanation={onExplanation}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Explain' })).not.toBeInTheDocument()

    rerender(
      <Explanation
        questionId={questionId}
        explanation={null}
        submitted
        quizPersisted={false}
        onExplanation={onExplanation}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Explain' })).not.toBeInTheDocument()

    rerender(
      <Explanation
        questionId={questionId}
        explanation={null}
        submitted
        quizPersisted
        onExplanation={onExplanation}
      />,
    )
    expect(screen.getByRole('button', { name: 'Explain' })).toBeInTheDocument()

    rerender(
      <Explanation
        questionId={questionId}
        explanation="Already explained"
        submitted
        quizPersisted
        onExplanation={onExplanation}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Explain' })).not.toBeInTheDocument()
  })

  it('sends POST to explain URL with Accept text/plain when Explain is clicked', async () => {
    const onExplanation = vi.fn()
    vi.mocked(fetch).mockResolvedValueOnce(streamingResponse(['ok']))

    render(
      <Explanation
        questionId={questionId}
        explanation={null}
        submitted
        quizPersisted
        onExplanation={onExplanation}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Explain' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/questions/${questionId}/explain`, {
      method: 'POST',
      headers: { Accept: 'text/plain' },
    })
  })

  it('streams chunks to onExplanation and restores Explain label when done', async () => {
    const onExplanation = vi.fn()
    vi.mocked(fetch).mockResolvedValueOnce(streamingResponse(['part-a', 'part-b']))

    render(
      <Explanation
        questionId={questionId}
        explanation={null}
        submitted
        quizPersisted
        onExplanation={onExplanation}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Explain' }))
    expect(screen.getByRole('button', { name: 'Thinking…' })).toBeDisabled()

    await waitFor(() => {
      expect(onExplanation).toHaveBeenCalled()
    })

    expect(onExplanation).toHaveBeenCalledWith(questionId, 'part-a')
    expect(onExplanation).toHaveBeenCalledWith(questionId, 'part-b')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Explain' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Explain' })).not.toBeDisabled()
  })
})
