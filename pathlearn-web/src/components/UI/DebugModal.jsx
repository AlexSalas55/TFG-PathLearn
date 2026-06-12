import { useState } from 'react'
import {
  X, Database, Brain, ChevronDown, ChevronRight,
  MapPin, Filter, FileText, MessageSquare, CheckSquare,
} from 'lucide-react'


function Badge({ children, color = 'slate' }) {
  const colors = {
    slate:  'bg-slate-100 text-slate-600',
    emerald:'bg-emerald-100 text-emerald-700',
    violet: 'bg-violet-100 text-violet-700',
    amber:  'bg-amber-100 text-amber-700',
    blue:   'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color] || colors.slate}`}>
      {children}
    </span>
  )
}

function Collapsible({ title, icon: Icon, count, defaultOpen = false, children, accentColor = 'slate' }) {
  const [open, setOpen] = useState(defaultOpen)
  const accent = {
    slate:  'text-slate-600',
    violet: 'text-violet-600',
    emerald:'text-emerald-600',
  }
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        {open
          ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${accent[accentColor] || accent.slate}`} />}
        <span className="text-sm font-semibold text-slate-700 flex-1">{title}</span>
        {count != null && (
          <span className="text-xs text-slate-400 font-medium">{count}</span>
        )}
      </button>
      {open && (
        <div className="border-t border-slate-200">{children}</div>
      )}
    </div>
  )
}

function CodeBlock({ content, maxHeight = '280px' }) {
  return (
    <pre
      className="text-xs font-mono text-slate-700 bg-slate-950 text-emerald-300 p-4 overflow-auto rounded-none leading-relaxed whitespace-pre-wrap break-words"
      style={{ maxHeight }}
    >
      {content}
    </pre>
  )
}

function POITable({ pois, label, color = 'slate' }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
        <Badge color={color}>{pois.length}</Badge>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {pois.map((poi, i) => (
          <div key={poi.id || i} className="flex items-start gap-3 px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-bold text-slate-300 w-5 text-right flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{poi.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {poi.type}/{poi.subtype}
                {poi.lat && (
                  <span className="ml-2 font-mono text-slate-300">
                    ({Number(poi.lat).toFixed(5)}, {Number(poi.lng).toFixed(5)})
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepOverpass({ step, index }) {
  return (
    <StepCard index={index} icon={Database} label="Consulta a OpenStreetMap" color="emerald">
      {/* Endpoint */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500">Servidor:</span>
        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono break-all">
          {step.endpoint}
        </code>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-b border-slate-100 flex gap-4 flex-wrap">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{step.allPOIs?.length ?? 0}</p>
          <p className="text-xs text-slate-400">Encontrados</p>
        </div>
        <div className="w-px bg-slate-200" />
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{step.selectedPOIs?.length ?? 0}</p>
          <p className="text-xs text-slate-400">Seleccionados</p>
        </div>
        {step.allPOIs?.length > step.selectedPOIs?.length && (
          <>
            <div className="w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">
                {step.allPOIs.length - step.selectedPOIs.length}
              </p>
              <p className="text-xs text-slate-400">Descartados</p>
            </div>
          </>
        )}
      </div>

      {/* POI tables */}
      <div className="divide-y divide-slate-100">
        {step.allPOIs?.length > 0 && (
          <Collapsible title="Todos los lugares encontrados" icon={MapPin} count={step.allPOIs.length}>
            <POITable pois={step.allPOIs} label="Encontrados (sin filtrar)" color="slate" />
          </Collapsible>
        )}
        {step.selectedPOIs?.length > 0 && (
          <Collapsible title="Lugares seleccionados para el quiz" icon={Filter} count={step.selectedPOIs.length} defaultOpen accentColor="emerald">
            <POITable pois={step.selectedPOIs} label="Seleccionados" color="emerald" />
          </Collapsible>
        )}
        {step.query && (
          <Collapsible title="Query Overpass QL enviada" icon={FileText}>
            <CodeBlock content={step.query} maxHeight="200px" />
          </Collapsible>
        )}
      </div>
    </StepCard>
  )
}

function StepGemini({ step, index }) {
  let prettyResponse = step.rawResponse
  try {
    prettyResponse = JSON.stringify(JSON.parse(step.rawResponse), null, 2)
  } catch { /* leave as-is */ }

  return (
    <StepCard index={index} icon={Brain} label="Generación de quizzes con IA" color="violet">
      {/* Model */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500">Modelo:</span>
        <code className="text-xs bg-violet-50 px-2 py-0.5 rounded text-violet-700 font-mono">
          {step.model}
        </code>
        {step.quizCount != null && (
          <Badge color="violet">{step.quizCount} preguntas generadas</Badge>
        )}
      </div>

      {/* Prompt + Response */}
      <div className="divide-y divide-slate-100">
        <Collapsible title="Prompt enviado a la IA" icon={MessageSquare} defaultOpen accentColor="violet">
          <CodeBlock content={step.prompt} maxHeight="300px" />
        </Collapsible>
        <Collapsible title="Respuesta de la IA (JSON)" icon={CheckSquare}>
          <CodeBlock content={prettyResponse} maxHeight="350px" />
        </Collapsible>
      </div>
    </StepCard>
  )
}

function StepGeminiAll({ step, index }) {
  let prettyResponse = step.rawResponse
  try {
    prettyResponse = JSON.stringify(JSON.parse(step.rawResponse), null, 2)
  } catch { /* leave as-is */ }

  return (
    <StepCard index={index} icon={Brain} label="POIs y quizzes generados íntegramente por IA" color="violet">
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-500">Modelo:</span>
        <code className="text-xs bg-violet-50 px-2 py-0.5 rounded text-violet-700 font-mono">
          {step.model}
        </code>
        <Badge color="amber">OpenStreetMap no disponible</Badge>
        <Badge color="violet">{step.poisGenerated?.length ?? 0} lugares generados</Badge>
      </div>

      {step.poisGenerated?.length > 0 && (
        <Collapsible title="Lugares generados por Gemini" icon={MapPin} count={step.poisGenerated.length} defaultOpen accentColor="violet">
          <POITable pois={step.poisGenerated} label="Generados por IA" color="violet" />
        </Collapsible>
      )}
      <div className="divide-y divide-slate-100">
        <Collapsible title="Prompt enviado a la IA" icon={MessageSquare} defaultOpen accentColor="violet">
          <CodeBlock content={step.prompt} maxHeight="300px" />
        </Collapsible>
        <Collapsible title="Respuesta de la IA (JSON)" icon={CheckSquare}>
          <CodeBlock content={prettyResponse} maxHeight="350px" />
        </Collapsible>
      </div>
    </StepCard>
  )
}

const STEP_COLORS = {
  emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-200', header: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  violet:  { bg: 'bg-violet-500',  ring: 'ring-violet-200',  header: 'bg-violet-50 border-violet-200',   text: 'text-violet-700'  },
  slate:   { bg: 'bg-slate-500',   ring: 'ring-slate-200',   header: 'bg-slate-50 border-slate-200',     text: 'text-slate-700'   },
}

function StepCard({ index, icon: Icon, label, color = 'slate', children }) {
  const c = STEP_COLORS[color] || STEP_COLORS.slate
  return (
    <div className="flex gap-4">
      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-full ${c.bg} ring-4 ${c.ring} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-bold">{index}</span>
        </div>
        <div className="w-px flex-1 bg-slate-200 mt-2" />
      </div>

      {/* Card */}
      <div className="flex-1 mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${c.header}`}>
          <Icon className={`w-4 h-4 ${c.text} flex-shrink-0`} />
          <h3 className={`text-sm font-bold ${c.text}`}>{label}</h3>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function DebugModal({ log, onClose }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[min(42rem,calc(100vw-1rem))] max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Trazabilidad de generación</h2>
              <p className="text-xs text-slate-400">Detalle completo del pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            {log.steps.map((step, i) => {
              if (step.type === 'overpass')   return <StepOverpass   key={i} step={step} index={i + 1} />
              if (step.type === 'gemini')     return <StepGemini     key={i} step={step} index={i + 1} />
              if (step.type === 'gemini-all') return <StepGeminiAll  key={i} step={step} index={i + 1} />
              return null
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
