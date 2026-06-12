import { useState } from 'react'
import { ChevronDown, ChevronUp, Database, Brain, Filter, Clock, ScrollText, Server, Compass, BookOpen, FlaskConical } from 'lucide-react'

const SOURCE_CONFIG = {
  overpass: { label: 'OpenStreetMap', badge: 'bg-transparent text-emerald-700 border-transparent', icon: Database },
  ai:       { label: 'IA Generativa', badge: 'bg-violet-100 text-violet-700 border-violet-200',   icon: Brain    },
}

const MODE_CONFIG = {
  explorer:  { label: 'Sencillo',     badge: 'bg-sky-100 text-sky-700 border-sky-200',          icon: Compass      },
  historian: { label: 'Intermedio',   badge: 'bg-violet-100 text-violet-700 border-violet-200', icon: BookOpen     },
  analyst:   { label: 'Razonamiento', badge: 'bg-amber-100 text-amber-700 border-amber-200',    icon: FlaskConical },
}

export default function GenerationInfo({ meta, onShowDebug, hasDebug }) {
  if (!meta) return null
  const [open, setOpen] = useState(false)

  const srcCfg = SOURCE_CONFIG[meta.poiSource] || SOURCE_CONFIG.ai
  const SrcIcon = srcCfg.icon

  const shortEndpoint = meta.endpoint
    ? meta.endpoint.replace('https://', '').split('/')[0]
    : null

  const poisLabel = meta.poiSource === 'overpass' && meta.totalFound > meta.poisSelected
    ? `${meta.poisSelected} / ${meta.totalFound} POIs`
    : `${meta.poisSelected} POIs`

  const time = meta.generatedAt
    ? new Date(meta.generatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

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
            Detalles de generación
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasDebug && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShowDebug?.() }}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-700 uppercase tracking-wide transition-colors"
              title="Ver trazabilidad (prompt / respuesta)"
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
        {/* Source badge */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <SrcIcon className="w-3 h-3" /> Fuente
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${srcCfg.badge}`}>
            {srcCfg.label}
          </span>
        </div>

        {/* Model */}
        {meta.model && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Brain className="w-3 h-3" /> Modelo
            </span>
            <span className="text-[10px] font-mono text-slate-600 font-semibold truncate max-w-[140px]">
              {meta.model}
            </span>
          </div>
        )}

        {/* POI count */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Filter className="w-3 h-3" /> POIs
          </span>
          <span className="text-[11px] font-bold text-slate-600">{poisLabel}</span>
        </div>

        {/* Endpoint */}
        {shortEndpoint && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Server className="w-3 h-3" /> Servidor
            </span>
            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[160px]">{shortEndpoint}</span>
          </div>
        )}

        {/* Quiz mode */}
        {meta.quizMode && MODE_CONFIG[meta.quizMode] && (() => {
          const mc = MODE_CONFIG[meta.quizMode]
          const MIcon = mc.icon
          return (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <MIcon className="w-3 h-3" /> Modo
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mc.badge}`}>
                {mc.label}
              </span>
            </div>
          )
        })()}

        {/* Time */}
        {time && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" /> Hora
            </span>
            <span className="text-[11px] text-slate-500">{time}</span>
          </div>
        )}
        </div>
      )}
    </div>
  )
}
