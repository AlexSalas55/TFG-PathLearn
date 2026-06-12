import { useState } from 'react'
import {
  X, BookOpen, Trash2, Play, MapPin, Brain, Database,
  Calendar, HardDrive, AlertTriangle, Search,
} from 'lucide-react'
import {
  getAllSaved,
  deleteSaved,
  deleteAllSaved,
  getStorageUsageKB,
  getAllSavedRoutes,
  deleteSavedRoute,
  deleteAllSavedRoutes,
  getRoutesStorageUsageKB,
} from '../../services/storageService'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function SourceBadge({ source }) {
  if (source === 'ai') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
        <Brain className="w-2.5 h-2.5" /> IA
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
      <Database className="w-2.5 h-2.5" /> OSM
    </span>
  )
}

function QuizCard({ record, onLoad, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const meta = record.generationMeta || {}

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all">
      <div className="px-4 py-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-stone-800 truncate leading-snug">{record.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-stone-400">
            <Calendar className="w-3 h-3" />
            {formatDate(record.savedAt)}
          </div>
        </div>
        <SourceBadge source={meta.poiSource} />
      </div>

      <div className="px-4 pb-3 border-t border-stone-50 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
          <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
          <span className="truncate">{record.locationName || `${record.location?.lat?.toFixed(4)}, ${record.location?.lng?.toFixed(4)}`}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-stone-400">
          <span><span className="font-bold text-stone-600">{record.pois?.length ?? 0}</span> POIs</span>
          <span><span className="font-bold text-stone-600">{Object.keys(record.quizzes ?? {}).length}</span> preguntas</span>
          <span>Radio: <span className="font-bold text-stone-600">{record.radius}m</span></span>
        </div>
      </div>

      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => onLoad(record)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Cargar
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-2 border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => onDelete(record.id)}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
            >Sí</button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-lg transition-colors"
            >No</button>
          </div>
        )}
      </div>
    </div>
  )
}

function RouteCard({ record, onLoad, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const meta = record.generationMeta || {}
  const route = record.route || {}

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all">
      <div className="px-4 py-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-stone-800 truncate leading-snug">{record.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-stone-400">
            <Calendar className="w-3 h-3" />
            {formatDate(record.savedAt)}
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          Ruta
        </span>
      </div>

      <div className="px-4 pb-3 border-t border-stone-50 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
          <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
          <span className="truncate">{route.title ? `${route.title}${route.city ? ` · ${route.city}` : ''}` : 'Ruta guardada'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-stone-400">
          <span><span className="font-bold text-stone-600">{record.pois?.length ?? 0}</span> paradas</span>
          <span><span className="font-bold text-stone-600">{Object.keys(record.quizzes ?? {}).length}</span> preguntas</span>
        </div>
      </div>

      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => onLoad(record)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Cargar
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-2 border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => onDelete(record.id)}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
            >Sí</button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-lg transition-colors"
            >No</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SavedQuizzesModal({ onLoadQuiz, onLoadRoute, onClose }) {
  const [tab, setTab] = useState('quizzes') // 'quizzes' | 'routes'
  const [quizRecords, setQuizRecords] = useState(() => getAllSaved())
  const [routeRecords, setRouteRecords] = useState(() => getAllSavedRoutes())
  const [search, setSearch] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const activeRecords = tab === 'quizzes' ? quizRecords : routeRecords
  const filtered = activeRecords.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.locationName?.toLowerCase().includes(search.toLowerCase()) ||
    r.route?.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.route?.city?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id) => {
    if (tab === 'quizzes') {
      deleteSaved(id)
      setQuizRecords(getAllSaved())
    } else {
      deleteSavedRoute(id)
      setRouteRecords(getAllSavedRoutes())
    }
  }

  const handleClearAll = () => {
    if (tab === 'quizzes') {
      deleteAllSaved()
      setQuizRecords([])
    } else {
      deleteAllSavedRoutes()
      setRouteRecords([])
    }
    setConfirmClear(false)
  }

  const storageKB = tab === 'quizzes' ? getStorageUsageKB() : getRoutesStorageUsageKB()

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-[min(36rem,calc(100vw-1rem))] max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">

        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 tracking-tight">Guardados</h2>
              <p className="text-[10px] text-stone-400 font-mono">{activeRecords.length} guardados · {storageKB} KB</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-3 pb-2 bg-white flex-shrink-0">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => { setTab('quizzes'); setConfirmClear(false) }}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'quizzes' ? 'bg-white text-blue-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => { setTab('routes'); setConfirmClear(false) }}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tab === 'routes' ? 'bg-white text-blue-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Rutas
            </button>
          </div>
        </div>

        {activeRecords.length > 3 && (
          <div className="px-5 py-3 border-b border-stone-200 bg-white flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o ubicación…"
                className="w-full pl-9 pr-3 py-2 text-sm border-2 border-stone-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors bg-white"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <BookOpen className="w-6 h-6 text-stone-300" />
              </div>
              <p className="text-sm font-bold text-stone-500">
                {search ? 'Sin resultados' : (tab === 'quizzes' ? 'Aún no hay quizzes guardados' : 'Aún no hay rutas guardadas')}
              </p>
              {!search && (
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed max-w-[220px] mx-auto">
                  {tab === 'quizzes'
                    ? 'Genera un quiz y pulsa "Guardar quiz" para archivarlo aquí'
                    : 'Genera una ruta y pulsa "Guardar ruta" para archivarla aquí'}
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {tab === 'quizzes'
                ? filtered.map(record => (
                    <QuizCard
                      key={record.id}
                      record={record}
                      onLoad={(r) => { onLoadQuiz(r); onClose() }}
                      onDelete={handleDelete}
                    />
                  ))
                : filtered.map(record => (
                    <RouteCard
                      key={record.id}
                      record={record}
                      onLoad={(r) => { onLoadRoute(r); onClose() }}
                      onDelete={handleDelete}
                    />
                  ))
              }
            </div>
          )}
        </div>

        {activeRecords.length > 0 && (
          <div className="px-5 py-3 border-t border-stone-200 bg-white flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
              <HardDrive className="w-3 h-3" />
              <span>Almacenado en el navegador (localStorage)</span>
            </div>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-red-500 transition-colors font-semibold"
              >
                <Trash2 className="w-3 h-3" />
                Borrar todo
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-600 font-bold">¿Borrar todos?</span>
                <button onClick={handleClearAll} className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-red-600">Sí</button>
                <button onClick={() => setConfirmClear(false)} className="text-xs bg-stone-200 text-stone-600 px-2.5 py-1 rounded-lg font-bold hover:bg-stone-300">No</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
