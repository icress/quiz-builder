import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import { API_BASE } from '../src/api'
import type { QuestionType } from '../src/Question'

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const fiveQuestions: QuestionType[] = Array.from({ length: 5 }, (_, i) => ({
  id: `q-${i + 1}`,
  text: `Question ${i + 1}?`,
  options: [
    { id: `q${i + 1}-a`, option: 'Option A', is_correct: true },
    { id: `q${i + 1}-b`, option: 'Option B', is_correct: false },
  ],
}))

async function selectFirstOptionForEachQuestion(
  user: ReturnType<typeof userEvent.setup>,
  count: number,
) {
  const radios = screen.getAllByRole('radio')
  for (let i = 0; i < count; i++) {
    await user.click(radios[i * 2])
  }
}

function postQuizCalls() {
  return vi.mocked(fetch).mock.calls.filter(
    (call) =>
      typeof call[0] === 'string' &&
      call[0] === `${API_BASE}/quizzes` &&
      (call[1] as RequestInit | undefined)?.method === 'POST',
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('happy path: load questions, answer all, POST quiz and refresh list', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ questions: fiveQuestions }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(jsonResponse([]))

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Enter a topic'), 'Math')
    await user.click(screen.getByRole('button', { name: 'Get Questions' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument()
    })

    await selectFirstOptionForEachQuestion(user, 5)
    await user.click(screen.getByRole('button', { name: 'SUBMIT' }))

    await waitFor(() => {
      expect(postQuizCalls()).toHaveLength(1)
    })

    const [, init] = postQuizCalls()[0]
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body).toEqual({
      name: 'Math',
      questions: fiveQuestions.map((q) => ({
        id: q.id,
        content: q.text,
        options: q.options.map((opt) => ({
          id: opt.id,
          content: opt.option,
          selected: opt.id.endsWith('-a'),
          correct: opt.is_correct,
        })),
      })),
    })

    await waitFor(() => {
      expect(screen.getByText(/Score:/)).toBeInTheDocument()
    })

    expect(vi.mocked(fetch).mock.calls.filter((c) => c[0] === `${API_BASE}/quizzes`).length).toBeGreaterThanOrEqual(2)
  })

  it('does not POST quiz when submit clicked but not all questions are answered', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ questions: fiveQuestions }))

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Enter a topic'), 'Science')
    await user.click(screen.getByRole('button', { name: 'Get Questions' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument()
    })

    await selectFirstOptionForEachQuestion(user, 4)
    await user.click(screen.getByRole('button', { name: 'SUBMIT' }))

    await waitFor(() => {
      expect(
        screen.getByRole('img', { name: 'This question is unanswered' }),
      ).toBeInTheDocument()
    })

    expect(postQuizCalls()).toHaveLength(0)
    expect(vi.mocked(fetch).mock.calls).toHaveLength(2)
  })

  it('New Quiz in the sidebar resets to the question flow', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ questions: fiveQuestions }))

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Enter a topic'), 'History')
    await user.click(screen.getByRole('button', { name: 'Get Questions' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument()
    })

    const sidebar = screen.getByRole('complementary', { name: 'Quiz sidebar' })
    await user.click(within(sidebar).getByRole('button', { name: 'New Quiz' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get Questions' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'SUBMIT' })).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter a topic')).toHaveValue('')
  })

  it('NEW QUIZ after submit returns to the question flow', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ questions: fiveQuestions }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(jsonResponse([]))

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Enter a topic'), 'Art')
    await user.click(screen.getByRole('button', { name: 'Get Questions' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument()
    })

    await selectFirstOptionForEachQuestion(user, 5)
    await user.click(screen.getByRole('button', { name: 'SUBMIT' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'NEW QUIZ' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'NEW QUIZ' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Get Questions' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: 'SUBMIT' })).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter a topic')).toHaveValue('')
  })
})
