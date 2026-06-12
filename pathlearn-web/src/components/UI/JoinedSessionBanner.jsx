export default function JoinedSessionBanner({ session, onNavigate }) {
  if (!session?.code) return null

  const activity = session.activity || {}
  const title = activity.title || 'Sesión'

  return (
    <button
      type="button"
      onClick={onNavigate}
      className="fixed left-1/2 top-[calc(4rem+0.625rem)] z-[850] flex max-w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-400/50 bg-blue-600/90 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md backdrop-blur-sm transition-colors hover:bg-blue-700/90"
      aria-label="Ir a la actividad de esta sesión"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">Live</span>
      <span className="text-blue-200/90" aria-hidden="true">·</span>
      <span className="truncate">{title}</span>
    </button>
  )
}
