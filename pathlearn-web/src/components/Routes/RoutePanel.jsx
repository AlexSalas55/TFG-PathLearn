import { useEffect, useState } from 'react'
import {
  Clock, MapPin, Zap, CheckCircle, XCircle,
  ChevronRight, Loader2, AlertCircle, Trophy,
  Brain, ScrollText, Server, ChevronDown, ChevronUp, Save, X,
} from 'lucide-react'
import { fetchPOIImage } from '../../services/wikipediaService'
import { CATEGORY_COLORS } from '../../data/routesData'

function RouteThumbnail({ query, title }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!query) return
    fetchPOIImage(query).then(u => u && setUrl(u))
  }, [query])

  if (!url) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center">
        <span className="text-3xl opacity-30">🗺️</span>
      </div>
    )
  }
  return (
    <img
      src={url}
      alt={title}
      className="w-full h-full object-cover"
      onError={e => { e.currentTarget.style.display = 'none' }}
    />
  )
}

function RouteCard({ route, selected, onSelect }) {
  const categoryColor = CATEGORY_COLORS[route.category] || 'bg-slate-100 text-slate-600'

  return (
    <button
      onClick={() => onSelect(route)}
      className={`w-full text-left rounded-xl overflow-hidden border-2 transition-all duration-150 ${
        selected
          ? 'border-blue-500 shadow-md shadow-blue-100'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      {/* Thumbnail */}
      <div className="h-28 relative overflow-hidden bg-slate-100">
        <RouteThumbnail query={route.thumbnailQuery} title={route.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-sm font-black text-white leading-tight drop-shadow">{route.title}</h3>
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 bg-white">
        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mb-2">{route.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor}`}>
            {route.category}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <MapPin className="w-2.5 h-2.5" /> {route.stops} paradas
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="w-2.5 h-2.5" /> {route.duration}
          </span>
        </div>
      </div>
    </button>
  )
}

function PanelLabel({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 mb-2">
      {children}
    </p>
  )
}

function RouteGenerationInfo({ meta, onShowLog, hasLog }) {
  if (!meta) return null
  const [open, setOpen] = useState(false)

  const time = new Date(meta.generatedAt).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const allVerified = meta.aiCount === 0

  return (
    <div className="mx-6 mt-3 mb-1 rounded-xl border border-slate-200/70 bg-white/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
            AI Model Core
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasLog && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShowLog?.() }}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-700 uppercase tracking-wide transition-colors"
              title="Ver prompt y respuesta"
            >
              <ScrollText className="w-3 h-3" />
              Log
            </button>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pt-3 pb-3 space-y-1.5 border-t border-slate-200/60">
          {meta.model && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Brain className="w-3 h-3" /> Modelo
              </span>
              <span className="text-[10px] font-mono text-slate-600 font-semibold truncate max-w-[150px]">
                {meta.model}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Server className="w-3 h-3" /> Coords.
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              allVerified
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
              {allVerified
                ? `${meta.nominatimCount} vía Nominatim`
                : `${meta.nominatimCount} OSM · ${meta.aiCount} IA`
              }
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3" /> Paradas
            </span>
            <span className="text-[11px] font-bold text-slate-600">{meta.totalPOIs}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" /> Hora
            </span>
            <span className="text-[11px] text-slate-500">{time}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RoutePanel({
  routes,
  selectedRoute,
  onSelectRoute,
  onGenerate,
  onSaveRoute,
  canSaveRoute,
  loading,
  loadingStep,
  error,
  routeActive,
  routeWaypoints,
  routeQuizzes,
  routeAnswers,
  onWaypointClick,
  score,
  total,
  routeMeta,
  onShowDebug,
  hasDebug,
  mobileOpen = false,
  onMobileToggle,
}) {
  const hasWaypoints  = routeWaypoints.length > 0
  const answeredCount = Object.keys(routeAnswers).length
  const allAnswered   = total > 0 && answeredCount === total
  const progress      = total > 0 ? (answeredCount / total) * 100 : 0

  const panelAsideClass = `
    pl-glass border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden
    transition-transform duration-300 z-[900]
    fixed inset-x-0 top-16 bottom-0 w-full rounded-none
    ${mobileOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
    lg:pointer-events-auto lg:translate-x-0 lg:absolute lg:top-[5.5rem] lg:bottom-6 lg:left-auto lg:right-6 lg:w-96 lg:max-w-[92vw] lg:rounded-2xl lg:z-[800]
  `.replace(/\s+/g, ' ').trim()

  return (
    <aside className={panelAsideClass}>

      <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <PanelLabel>Rutas de aprendizaje</PanelLabel>
            <p className="text-xs text-slate-400 leading-relaxed">
              Selecciona una ruta temática y genera las preguntas para recorrerla.
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
      </div>

      {selectedRoute && (
        <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0 space-y-2">
          {!routeActive ? (
            <button
              onClick={() => {
                if (mobileOpen) onMobileToggle?.(false)
                onGenerate?.()
              }}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm tracking-wide uppercase"
            >
              {loading
                ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadingStep === 'verifying' ? 'Ubicando paradas…' : 'Generando ruta…'}
                  </>
                : <><Zap className="w-4 h-4" /> Generar ruta</>
              }
            </button>
          ) : (
            <>
              <button
                onClick={onGenerate}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm tracking-wide uppercase"
              >
                {loading
                  ? <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {loadingStep === 'verifying' ? 'Ubicando paradas…' : 'Regenerando ruta…'}
                    </>
                  : <><Zap className="w-4 h-4" /> Regenerar ruta</>
                }
              </button>

              {canSaveRoute && (
                <button
                  onClick={onSaveRoute}
                  disabled={loading}
                  className="w-full py-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50
                    text-slate-600 hover:text-blue-700 font-semibold rounded-xl transition-all
                    flex items-center justify-center gap-2 text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar ruta
                </button>
              )}

              <div className="flex items-center justify-between mb-1 mt-1">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-blue-500" />
                  <PanelLabel>Progreso de la ruta</PanelLabel>
                </div>
                <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                  {answeredCount}/{total}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {allAnswered && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mt-1">
                  <span className="text-xs font-bold text-blue-800">¡Ruta completada!</span>
                  <span className="text-xs font-black text-blue-600">{score}/{total}</span>
                </div>
              )}
              <button
                onClick={() => onSelectRoute(null)}
                className="w-full py-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl text-xs font-semibold transition-all"
              >
                Cambiar ruta
              </button>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      )}

      {routeActive && (
        <RouteGenerationInfo meta={routeMeta} onShowLog={onShowDebug} hasLog={hasDebug} />
      )}

      {routeActive && hasWaypoints && (
        <div className="flex-1 overflow-y-auto sidebar-scroll px-5 py-3">
          <PanelLabel>Paradas ({routeWaypoints.length})</PanelLabel>
          <div className="space-y-1.5">
            {routeWaypoints.map((poi, index) => {
              const answer  = routeAnswers[poi.id]
              const hasQuiz = !!routeQuizzes[poi.id]

              return (
                <button
                  key={poi.id}
                  onClick={() => hasQuiz && onWaypointClick(poi)}
                  disabled={!hasQuiz}
                  className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                    hasQuiz
                      ? 'hover:bg-blue-50 cursor-pointer group'
                      : 'cursor-default opacity-60'
                  }`}
                >
                  {/* Step number bubble */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black border-2 border-white shadow ${
                    answer
                      ? answer.correct ? 'bg-emerald-500 text-white' : 'bg-red-400 text-white'
                      : hasQuiz ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {answer
                      ? answer.correct ? '✓' : '✗'
                      : index + 1
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${hasQuiz ? 'text-slate-800 group-hover:text-blue-700' : 'text-slate-400'}`}>
                      {poi.name}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-none mt-0.5 capitalize">
                      {poi.subtype?.replace(/_/g, ' ') || poi.type}
                    </p>
                  </div>

                  {hasQuiz && !answer && (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 flex-shrink-0" />
                  )}
                  {!hasQuiz && (
                    <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!routeActive && (
        <div className="flex-1 overflow-y-auto sidebar-scroll px-5 py-4">
          <div className="grid gap-3">
            {routes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                selected={selectedRoute?.id === route.id}
                onSelect={onSelectRoute}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
