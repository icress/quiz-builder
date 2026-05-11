export interface QuizSummary {
  id: string
  name: string
}

interface SidebarProps {
  quizzes: QuizSummary[]
  loading: boolean
  activeQuizId: string | null
  onSelectQuiz: (quizId: string) => void
  onNewTest: () => void
}

export function Sidebar({
  quizzes,
  loading,
  activeQuizId,
  onSelectQuiz,
  onNewTest,
}: SidebarProps) {
  return (
    <aside
      className="w-56 shrink-0 border-r border-gray-200 flex flex-col py-4 px-3 gap-2"
      aria-label="Quiz sidebar"
    >
      <h2 className="text-sm font-semibold text-gray-700 px-1">Quizzes</h2>
      <button
        type="button"
        className="w-full rounded-md py-2 px-2 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
        onClick={onNewTest}
      >
        New Quiz
      </button>
      <hr />
      {loading ? (
        <p className="text-xs text-gray-500 px-1">Loading…</p>
      ) : quizzes.length === 0 ? (
        <p className="text-xs text-gray-500 px-1">No saved quizzes yet.</p>
      ) : (
        <nav className="flex flex-col gap-0.5 overflow-y-auto min-h-0 flex-1">
          {quizzes.map((q) => (
            <button
              key={q.id}
              type="button"
              title={q.name}
              onClick={() => void onSelectQuiz(q.id)}
              className={
                'w-full text-left text-sm rounded-md px-2 py-2 truncate border border-transparent ' +
                (activeQuizId === q.id
                  ? 'bg-white border-gray-200 shadow-sm font-medium text-gray-900'
                  : 'text-white hover:bg-white/80 hover:text-black')
              }
            >
              {q.name}
            </button>
          ))}
        </nav>
      )}
    </aside>
  )
}
