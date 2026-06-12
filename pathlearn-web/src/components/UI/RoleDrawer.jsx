import { X, User, PenSquare } from 'lucide-react'

export default function RoleDrawer({ open, role, onClose, onChangeRole }) {
  if (!open) return null

  const Item = ({ id, title, subtitle, Icon }) => {
    const active = role === id
    return (
      <button
        onClick={() => {
          onChangeRole(id)
          onClose()
        }}
        className={`w-full text-left p-4 rounded-2xl border transition-all ${
          active
            ? 'bg-white/80 border-blue-200 shadow-sm'
            : 'bg-white/60 border-slate-200/70 hover:bg-white/80 hover:border-blue-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              id === 'student' ? 'bg-blue-600' : 'bg-slate-900'
            } ${active ? 'ring-4 ring-blue-100' : 'ring-0'} flex-shrink-0`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className={`text-sm font-black ${active ? 'text-blue-800' : 'text-slate-900'}`}>{title}</div>
            <div className="text-xs text-slate-500 leading-snug mt-0.5">{subtitle}</div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[2000]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-500/10 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer */}
      <aside className="absolute left-0 top-0 h-full w-[min(380px,calc(100vw-0.5rem))] max-w-[96vw] pl-glass border-r border-slate-200/80 shadow-2xl p-4 sm:p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em]">Modo</div>
            <div className="text-lg font-black text-slate-900 tracking-tight">Seleccionar rol</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white/60 hover:bg-white flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <Item
            id="student"
            title="Alumno"
            subtitle="Modo libre"
            Icon={User}
          />
          <Item
            id="creator"
            title="Creador"
            subtitle="Crear, editar y publicar actividades"
            Icon={PenSquare}
          />
        </div>
      </aside>
    </div>
  )
}

