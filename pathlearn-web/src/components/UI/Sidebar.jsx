import {
  MapPin, SlidersHorizontal, Zap, Trophy,
  CheckCircle, XCircle, ChevronRight, Loader2,
  AlertCircle, Save, Compass, BookOpen, FlaskConical, X,
} from 'lucide-react'
import GenerationInfo from './GenerationInfo'

const MODES = [
  {
    id:       'explorer',
    label:    'Sencillo',
    icon:     Compass,
    desc:     'Datos y hechos básicos del lugar',
    color:    'text-sky-600',
    activeBg: 'bg-white text-sky-700 shadow-sm',
  },
  {
    id:       'historian',
    label:    'Intermedio',
    icon:     BookOpen,
    desc:     'Contexto histórico y causas',
    color:    'text-violet-600',
    activeBg: 'bg-white text-violet-700 shadow-sm',
  },
  {
    id:       'analyst',
    label:    'Razonamiento',
    icon:     FlaskConical,
    desc:     'Razonamiento crítico',
    color:    'text-amber-600',
    activeBg: 'bg-white text-amber-700 shadow-sm',
  },
]

const TYPE_META = {
  historic: { emoji: '🏛️', label: 'Histórico',  color: 'bg-amber-100 text-amber-700'   },
  tourism:  { emoji: '🗺️', label: 'Turístico',  color: 'bg-sky-100 text-sky-700'       },
  amenity:  { emoji: '⛪',  label: 'Cultural',   color: 'bg-violet-100 text-violet-700' },
  building: { emoji: '🏰', label: 'Edificio',   color: 'bg-orange-100 text-orange-700' },
  leisure:  { emoji: '🌿', label: 'Ocio',        color: 'bg-emerald-100 text-emerald-700' },
  other:    { emoji: '📍', label: 'Otro',        color: 'bg-slate-100 text-slate-500'   },
}

function PanelLabel({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 mb-2">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px bg-slate-100 my-3" />
}

function POIThumb({ imageUrl, emoji }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-slate-100"
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
      />
    )
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-xl">
      {emoji}
    </div>
  )
}

export default function Sidebar({
  selectedLocation,
  locationName,
  pois,
  quizzes,
  answers,
  radius,
  onRadiusChange,
  quizMode,
  onModeChange,
  onGenerate,
  onResetExplore,
  loading,
  error,
  onPOIClick,
  score,
  total,
  quizFailed,
  generationMeta,
  onShowDebug,
  hasDebug,
  onSaveQuiz,
  canSave,
  poiImages,
  mobileOpen = false,
  onMobileToggle,
}) {
  const hasLocation   = !!selectedLocation
  const hasPOIs       = pois.length > 0
  const hasQuizzes    = total > 0
  const answeredCount = Object.keys(answers).length
  const allAnswered   = hasQuizzes && answeredCount === total
  const progress      = hasQuizzes ? (answeredCount / total) * 100 : 0
  const activeMode    = MODES.find(m => m.id === quizMode)

  const panelAsideClass = `
    pl-glass border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden
    transition-transform duration-300 z-[900]
    fixed inset-x-0 top-16 bottom-0 w-full rounded-none
    ${mobileOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
    lg:pointer-events-auto lg:translate-x-0 lg:absolute lg:top-[5.5rem] lg:bottom-6 lg:left-auto lg:right-6 lg:w-96 lg:max-w-[92vw] lg:rounded-2xl lg:z-[800]
  `.replace(/\s+/g, ' ').trim()

  return (
    <aside className={panelAsideClass}>

      <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex-shrink-0">
        {!hasLocation ? (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 mb-1">Selecciona una ubicación</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Haz clic en el mapa para elegir un punto y explorar los lugares de interés cercanos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onMobileToggle?.(false)}
              className="lg:hidden flex-shrink-0 w-10 h-10 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-white flex items-center justify-center text-slate-600"
              aria-label="Ver mapa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-slate-900 leading-tight truncate">{locationName}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {selectedLocation.lat.toFixed(4)}° N,&nbsp;{selectedLocation.lng.toFixed(4)}° E
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 ring-4 ring-blue-100" />
                <button
                  type="button"
                  onClick={() => onMobileToggle?.(false)}
                  className="lg:hidden w-10 h-10 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-white flex items-center justify-center text-slate-600"
                  aria-label="Ver mapa"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {!hasQuizzes && (
        <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <PanelLabel>Rango de exploración</PanelLabel>
            <span className="text-xs font-black text-blue-600 tabular-nums">
              {radius >= 1000 ? `${(radius / 1000).toFixed(1)} KM` : `${radius} M`}
            </span>
          </div>
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={radius}
            onChange={e => onRadiusChange(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none bg-slate-200 cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-slate-400">200 M</span>
            <span className="text-[10px] text-slate-400">2 KM</span>
          </div>
        </div>
      )}

      {!hasQuizzes ? (
        <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <PanelLabel>Modo de quiz</PanelLabel>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {MODES.map(mode => {
              const Icon    = mode.icon
              const active  = quizMode === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  disabled={loading}
                  title={mode.desc}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] font-bold transition-all duration-150 ${
                    active ? mode.activeBg : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? mode.color : ''}`} />
                  {mode.label}
                </button>
              )
            })}
          </div>
          {/* Active mode description */}
          <p className="text-[10px] text-slate-400 mt-2 text-center leading-snug">
            {activeMode?.desc}
          </p>
        </div>
      ) : (
        <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <PanelLabel>Quiz</PanelLabel>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/70 border border-slate-200 rounded-full px-3 py-1">
              {activeMode?.label || '—'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Progreso</span>
            </div>
            <span className="text-xs font-black text-slate-700 tabular-nums">
              {answeredCount}/{total}
            </span>
          </div>
          <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {generationMeta && (
        <GenerationInfo meta={generationMeta} onShowDebug={onShowDebug} hasDebug={hasDebug} />
      )}

      <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0 space-y-2">
        {!hasQuizzes ? (
          <button
            onClick={() => {
              if (mobileOpen) onMobileToggle?.(false)
              onGenerate?.()
            }}
            disabled={!hasLocation || loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
              text-white font-bold rounded-xl transition-colors
              flex items-center justify-center gap-2 text-sm tracking-wide uppercase"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {loading ? 'Generando…' : 'Generar quiz'}
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                if (mobileOpen) onMobileToggle?.(false)
                onGenerate?.()
              }}
              disabled={!hasLocation || loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
                text-white font-bold rounded-xl transition-colors
                flex items-center justify-center gap-2 text-sm tracking-wide uppercase"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {loading ? 'Generando…' : 'Regenerar quiz'}
            </button>

            <button
              onClick={onResetExplore}
              disabled={loading}
              className="w-full py-2 border border-slate-200 hover:border-slate-300 hover:bg-white/70
                text-slate-600 font-semibold rounded-xl transition-all
                flex items-center justify-center gap-2 text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Cambiar zona
            </button>
          </>
        )}

        {canSave && (
          <button
            onClick={onSaveQuiz}
            className="w-full py-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50
              text-slate-600 hover:text-blue-700 font-semibold rounded-xl transition-all
              flex items-center justify-center gap-2 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar quiz
          </button>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll">
        {hasPOIs ? (
          <div className="px-6 pb-6 pt-3">
            <Divider />
            <PanelLabel>Nearby POIs ({pois.length})</PanelLabel>
            <div className="space-y-2">
              {pois.map(poi => {
                const answer  = answers[poi.id]
                const hasQuiz = !!quizzes[poi.id]
                const meta    = TYPE_META[poi.type] || TYPE_META.other
                const imgUrl  = poiImages?.[poi.id]

                return (
                  <button
                    key={poi.id}
                    onClick={() => hasQuiz && onPOIClick(poi)}
                    disabled={!hasQuiz}
                    className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 ${
                      hasQuiz
                        ? 'hover:bg-blue-50 cursor-pointer group'
                        : 'cursor-default opacity-60'
                    }`}
                  >
                    {/* Thumbnail */}
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentNode.querySelector('.poi-fallback-thumb')?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-xl bg-slate-100 items-center justify-center flex-shrink-0 text-xl ${imgUrl ? 'hidden poi-fallback-thumb' : 'flex'}`}>
                      {meta.emoji}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate leading-snug ${hasQuiz ? 'text-slate-800 group-hover:text-blue-700' : 'text-slate-500'}`}>
                        {poi.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                        {meta.label}{poi.subtype ? ` · ${poi.subtype.replace(/_/g, ' ')}` : ''}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      {answer ? (
                        answer.correct
                          ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                          : <XCircle className="w-4 h-4 text-red-400" />
                      ) : hasQuiz ? (
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                      ) : quizFailed ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-300" />
                      ) : (
                        <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {hasLocation
                  ? 'Pulsa "Generar quiz" para descubrir lugares cercanos'
                  : 'Selecciona un punto en el mapa para empezar'}
              </p>
            </div>
          )
        )}
      </div>
    </aside>
  )
}
