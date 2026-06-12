import { Star, BookOpen, Compass, Map, Menu, Link2, LogOut, Activity, GraduationCap } from 'lucide-react'

const TABS = [
  { id: 'explore',  label: 'Explorar',   icon: Compass },
  { id: 'discover', label: 'Descubrir',  icon: Map     },
]

export default function Header({
  score,
  total,
  hasQuizzes,
  onShowSaved,
  activeTab,
  onTabChange,
  role = 'student',
  onOpenRoleMenu,
  onJoinSession,
  onLeaveSession,
  joinedSession = null,
  creatorOpenSessionsCount = 0,
  onOpenCreatorSessions,
  onOpenTutorial,
}) {
  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex items-center px-3 sm:px-6 z-[1000]">
      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 lg:min-w-[220px] flex-shrink-0">
        <button
          onClick={onOpenRoleMenu}
          className="w-10 h-10 rounded-xl border border-slate-200/60 bg-white/60 hover:bg-white hover:border-slate-300 flex items-center justify-center transition-all"
          aria-label="Abrir menú"
        >
          <Menu className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="pl-headline text-xl font-bold tracking-tight text-slate-900">PathLearn</span>
        </div>
        <span className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em] border-l border-slate-200 pl-3">
          TFG
        </span>
      </div>

      {/* Center tabs */}
      <div className="flex-1 flex justify-center">
        {role === 'student' ? (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
            {TABS.map(tab => {
              const Icon   = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 flex-shrink-0 ${
                    active
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-blue-500' : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center px-4 py-2 rounded-xl">
            <div className="leading-tight text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em]">Modo</div>
              <div className="text-sm font-black text-slate-900">Creador</div>
            </div>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-0 lg:min-w-[220px] justify-end flex-shrink-0">
        {role === 'creator' && (
          <button
            onClick={onOpenCreatorSessions}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/60 bg-white/60 hover:bg-white hover:border-slate-300 text-slate-600 transition-all text-xs font-semibold"
            title="Abrir sesiones"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sesiones abiertas:</span>
            <span className="font-black tabular-nums">{creatorOpenSessionsCount}</span>
          </button>
        )}
        {role === 'student' && (
          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/60 bg-white/60 hover:bg-white hover:border-blue-200 hover:text-blue-700 text-slate-600 transition-all text-xs font-semibold"
            title="Tutorial de la aplicación"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>
        )}
        {role === 'student' && (
          joinedSession?.session?.code ? (
            <button
              onClick={onLeaveSession}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200/80 bg-red-50/80 hover:bg-red-50 hover:border-red-300 text-red-700 transition-all text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          ) : (
            <button
              onClick={onJoinSession}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/60 bg-white/60 hover:bg-white hover:border-slate-300 text-slate-600 transition-all text-xs font-semibold"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unirse</span>
            </button>
          )
        )}
        {role === 'student' && hasQuizzes && (
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
            <Star className="w-3.5 h-3.5 text-blue-500" fill="currentColor" />
            <span className="text-sm font-black text-blue-700 tabular-nums">{score}</span>
            <span className="text-slate-400 text-xs font-normal">/ {total}</span>
          </div>
        )}
        {role === 'student' && (
          <button
            onClick={onShowSaved}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/60 bg-white/60 hover:bg-white hover:border-slate-300 text-slate-600 transition-all text-xs font-semibold"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guardados</span>
          </button>
        )}
      </div>
    </header>
  )
}
