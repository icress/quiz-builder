import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Sidebar, type QuizSummary } from '../src/Sidebar'

describe('Sidebar', () => {
  it('displays all previous quiz names', () => {
    const quizzes: QuizSummary[] = [
      { id: '1', name: 'Algebra Basics' },
      { id: '2', name: 'World History' },
      { id: '3', name: 'JavaScript Fundamentals' },
    ]

    render(
      <Sidebar
        quizzes={quizzes}
        loading={false}
        activeQuizId={null}
        onSelectQuiz={vi.fn()}
        onNewTest={vi.fn()}
      />,
    )

    const nav = screen.getByRole('navigation')
    for (const quiz of quizzes) {
      expect(
        within(nav).getByRole('button', { name: quiz.name }),
      ).toBeInTheDocument()
    }
  })
})
