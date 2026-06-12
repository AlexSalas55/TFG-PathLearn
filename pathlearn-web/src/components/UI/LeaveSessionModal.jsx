import { X } from 'lucide-react'

export default function LeaveSessionModal({ open, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center p-2 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-[min(420px,calc(100vw-1rem))] bg-white border border-slate-200 rounded-2xl shadow-xl my-auto">
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Sesión</div>
            <div className="text-lg font-black text-slate-900">Salir de la sesión</div>
            <div className="text-sm text-slate-500 mt-1">
              ¿Estás seguro de que quieres salir? Se quitará la actividad del mapa y del panel.
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-5 flex items-center gap-2">
          <button
            onClick={() => {
              onConfirm?.()
              onClose()
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-all"
          >
            Salir
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
  )
}
