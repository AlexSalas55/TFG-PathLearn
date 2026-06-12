export function getCorrectAnswerIndex(quiz) {
  if (!quiz) return null

  const optionCount = quiz.options?.length ?? 4
  const raw = quiz.correct_answer
  if (raw === null || raw === undefined) return null

  if (typeof raw === 'string') {
    const token = raw.trim().toUpperCase()
    const letterIndex = ['A', 'B', 'C', 'D'].indexOf(token)
    if (letterIndex >= 0) return letterIndex < optionCount ? letterIndex : null
  }

  const index = Number(raw)
  if (!Number.isFinite(index) || index < 0 || index >= optionCount) return null
  return index
}
