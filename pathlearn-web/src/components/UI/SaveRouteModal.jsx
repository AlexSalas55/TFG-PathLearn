import { useState } from 'react'
import { X, Save, MapPin, Brain } from 'lucide-react'

export default function SaveRouteModal({ route, generationMeta, poisCount, onSave, onClose }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre no puede estar vacío.')
      return
    }
    setSaving(true)
    try {
      onSave(name.trim())
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Save className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-black text-stone-900 tracking-tight">Guardar ruta</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <span className="flex items-center gap-1.5 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-medium truncate max-w-[200px]">
                {route?.title ? `${route.title}${route.city ? ` · ${route.city}` : ''}` : '—'}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-600">
              <Brain className="w-3.5 h-3.5 text-violet-500" />
              <span>IA Generativa</span>
            </span>
            <span className="text-stone-500">
              <span className="font-bold text-stone-700">{poisCount}</span> paradas
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400 mb-2">
              Nombre de la ruta
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder={route?.title ? `Ej: ${route.title}` : 'Ej: Ruta por Barcelona'}
              autoFocus
              maxLength={80}
              className="w-full px-3.5 py-2.5 border-2 border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-gray-900 transition-colors"
            />
            {error
              ? <p className="text-xs text-red-500 mt-1.5">{error}</p>
              : <p className="text-[10px] text-stone-400 mt-1.5 text-right">{name.length}/80</p>
            }
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-stone-200 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

