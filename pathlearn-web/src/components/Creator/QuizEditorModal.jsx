import { Save, X } from 'lucide-react'

export default function QuizEditorModal({
  open,
  quiz,
  poiLabel,
  movePoiId,
  regenLoading,
  regenError,
  quizDirty,
  quizSavedFlash,
  onClose,
  onUpdate,
  onSave,
  onRegenerate,
  onStartMovePoi,
  onCancelMovePoi,
}) {
  if (!open || !quiz) return null

  const q = quiz
  const options = Array.isArray(q.options) ? q.options : ['', '', '', '']

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center p-2 sm:p-4 pt-16 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-[min(760px,calc(100vw-1rem))] max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl my-4">
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Editar pregunta</div>
            <div className="text-base font-black text-slate-900 truncate">{poiLabel}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStartMovePoi?.(q.poi_id)}
              className={`px-3 py-2 rounded-xl border text-sm font-black transition-all ${
                movePoiId === q.poi_id
                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                  : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 text-slate-700'
              }`}
              title="Recolocar el punto en el mapa (haz click en el mapa)"
            >
              {movePoiId === q.poi_id ? 'Click en el mapa…' : 'Mover punto'}
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenLoading}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 text-slate-700 text-sm font-black disabled:opacity-60 disabled:cursor-not-allowed"
              title="Regenerar solo esta pregunta"
            >
              {regenLoading ? 'Regenerando…' : 'Regenerar pregunta'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-5 grid gap-4 max-h-[72vh] overflow-auto sidebar-scroll">
          {movePoiId === q.poi_id && (
            <div className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-xl p-3">
              Modo “Mover punto” activo. Haz click en el mapa para colocar este punto en la nueva posición.
              <button
                type="button"
                onClick={() => onCancelMovePoi?.()}
                className="ml-2 underline font-black"
              >
                Cancelar
              </button>
            </div>
          )}
          {regenError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              {regenError}
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-500">Contexto (solo si aplica)</label>
            <textarea
              value={q.context ?? ''}
              onChange={(e) => onUpdate({ context: e.target.value })}
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">Pregunta</label>
            <textarea
              value={q.question ?? ''}
              onChange={(e) => onUpdate({ question: e.target.value })}
              rows={3}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500">Opción {idx + 1}</label>
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.poi_id}`}
                      checked={Number(q.correct_answer) === idx}
                      onChange={() => onUpdate({ correct_answer: idx })}
                    />
                    Correcta
                  </label>
                </div>
                <input
                  value={opt ?? ''}
                  onChange={(e) => {
                    const nextOpts = [...options]
                    nextOpts[idx] = e.target.value
                    onUpdate({ options: nextOpts })
                  }}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">Explicación</label>
            <textarea
              value={q.explanation ?? ''}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              rows={3}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/60">
          <p className="text-xs text-slate-500 min-h-[1.25rem]">
            {quizSavedFlash
              ? <span className="font-bold text-emerald-700">Cambios guardados</span>
              : quizDirty
                ? 'Tienes cambios sin guardar'
                : 'Los cambios se aplican al pulsar guardar'}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={!quizDirty}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
