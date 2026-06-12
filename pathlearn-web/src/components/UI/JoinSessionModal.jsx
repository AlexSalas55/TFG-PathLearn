import { useState } from 'react'
import { X, Hash, User } from 'lucide-react'

export default function JoinSessionModal({ open, onClose, onJoin }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center p-2 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-[min(520px,calc(100vw-1rem))] max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl my-auto">
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Alumno</div>
            <div className="text-lg font-black text-slate-900">Unirse con código</div>
            <div className="text-sm text-slate-500 mt-1">Introduce tu nombre y el código de la actividad.</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-5 grid gap-3">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500">Tu nombre</label>
            <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200">
              <User className="w-4 h-4 text-slate-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Alex"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">Código</label>
            <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200">
              <Hash className="w-4 h-4 text-slate-400" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej. AB12CD"
                className="w-full outline-none text-sm tracking-widest font-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={async () => {
                try {
                  setError(null)
                  await onJoin?.({ code, name })
                  onClose()
                } catch (e) {
                  setError(e.message || 'No se pudo unir.')
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all"
            >
              Unirse
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-sm transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

