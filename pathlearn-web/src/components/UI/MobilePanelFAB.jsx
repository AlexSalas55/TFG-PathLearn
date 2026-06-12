import { Compass, Edit3, Map } from 'lucide-react'

/** FAB en móvil: alterna panel lateral y mapa. */
export default function MobilePanelFAB({ open, onToggle, role, activeTab }) {
  const isStudent = role === 'student'
  const modeLabel = !isStudent
    ? 'Creador'
    : activeTab === 'discover'
      ? 'Descubrir'
      : 'Explorar'

  const ModeIcon = !isStudent ? Edit3 : activeTab === 'discover' ? Map : Compass

  return (
    <button
      type="button"
      onClick={onToggle}
      className="lg:hidden fixed bottom-4 right-4 z-[1100] flex items-center gap-2 pl-glass rounded-full shadow-2xl border border-slate-200/80 px-4 py-3 text-sm font-black text-slate-800 hover:bg-white/95 active:scale-[0.98] transition-all"
      aria-expanded={open}
      aria-label={open ? 'Ver mapa' : `Abrir panel: ${modeLabel}`}
    >
      {open ? (
        <>
          <Map className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>Ver mapa</span>
        </>
      ) : (
        <>
          <ModeIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>{modeLabel}</span>
        </>
      )}
    </button>
  )
}
