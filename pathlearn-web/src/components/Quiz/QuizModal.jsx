import { useState } from 'react'
import { X, MapPin, CheckCircle, XCircle, ChevronRight } from 'lucide-react'

const TYPE_LABELS = {
  historic: 'Histórico',
  tourism:  'Turístico',
  amenity:  'Cultural',
  building: 'Edificio',
  leisure:  'Ocio',
  other:    'Punto de interés',
}

export default function QuizModal({ poi, quiz, answer, imageUrl, onAnswer, onClose }) {
  const [selected, setSelected] = useState(answer?.selected ?? null)
  const [imgError, setImgError] = useState(false)
  const isAnswered = answer !== undefined
  const hasImage   = !!imageUrl && !imgError
  const correctIndex = Number(quiz.correct_answer)

  const handleSubmit = () => {
    if (selected === null) return
    onAnswer(poi.id, selected)
  }

  const getState = (index) => {
    if (!isAnswered) return selected === index ? 'selected' : 'idle'
    if (index === correctIndex) return 'correct'
    if (index === answer.selected && !answer.correct) return 'wrong'
    return 'dim'
  }

  const OPTION_BASE = 'group relative flex items-center justify-between p-5 rounded-lg bg-slate-50 border border-slate-200 transition-all active:scale-[0.98]'
  const OPTION_STYLES = {
    idle:     `${OPTION_BASE} hover:border-blue-400 hover:bg-blue-50 cursor-pointer`,
    selected: `${OPTION_BASE} border-blue-600 bg-blue-50 ring-2 ring-blue-300 cursor-pointer`,
    correct:  `${OPTION_BASE} border-emerald-300 bg-emerald-100 cursor-default`,
    wrong:    `${OPTION_BASE} border-red-300 bg-red-100 cursor-default`,
    dim:      `${OPTION_BASE} opacity-60 cursor-default`,
  }

  const LETTERS = ['A', 'B', 'C', 'D']

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-slate-500/10 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[calc(100vw-1rem)] sm:max-w-3xl overflow-hidden rounded-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-h-[90vh] sm:max-h-[86vh] flex flex-col">

        {hasImage ? (
          <div className="relative h-48 sm:h-64 flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-white" />
            <img
              src={imageUrl}
              alt={poi.name}
              onError={() => setImgError(true)}
              className="relative w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full border border-slate-200 shadow-sm">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-700">
                {poi.lat?.toFixed(4)}° N, {poi.lng?.toFixed(4)}° E
              </span>
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-lg border border-slate-200 bg-white/80 hover:bg-white flex items-center justify-center text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-6 left-8">
              <span className="text-[10px] uppercase tracking-[0.2rem] text-blue-600 font-bold">
                Expedición actual
              </span>
              <h2 className="pl-headline text-3xl font-bold tracking-tight text-slate-900 mt-1">
                {poi.name}
              </h2>
            </div>

            <span className="absolute bottom-3 right-3 text-[9px] text-white/40">
              © Wikipedia
            </span>
          </div>
        ) : (
          <div className="relative flex-shrink-0 bg-white border-b border-slate-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-[0.2rem] text-blue-600 font-bold">
                    Expedición actual
                  </span>
                  <h2 className="pl-headline text-2xl font-bold tracking-tight text-slate-900 mt-1 truncate">
                    {poi.name}
                  </h2>
                  <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span className="tabular-nums">
                      {poi.lat?.toFixed(4)}° N, {poi.lng?.toFixed(4)}° E
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{TYPE_LABELS[poi.type] || 'Punto de interés'}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-6 sm:pb-8">
            {quiz.context && (
              <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase tracking-[0.2rem] text-slate-500 font-bold">
                  Contexto
                </div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {quiz.context}
                </div>
              </div>
            )}

            <div className="rounded-2xl border p-5 sm:p-6 bg-white border-slate-200">
              <div className="text-slate-900 text-sm sm:text-base leading-relaxed mb-5">
                <span className="font-semibold">{quiz.question}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {quiz.options.map((option, index) => {
                  const state = getState(index)
                  return (
                    <button
                      key={index}
                      onClick={() => !isAnswered && setSelected(index)}
                      disabled={isAnswered}
                      className={OPTION_STYLES[state]}
                    >
                      <div className="min-w-0">
                        <div className="flex items-start gap-3">
                          <span className="pl-headline text-xs font-bold text-slate-400 flex-shrink-0">
                            {LETTERS[index]}
                          </span>
                          <span className={`pl-headline text-sm sm:text-base font-bold transition-colors leading-snug break-words ${
                            state === 'idle' ? 'text-slate-700 group-hover:text-blue-700' :
                              state === 'selected' ? 'text-blue-800' :
                                state === 'correct' ? 'text-emerald-800' :
                                  state === 'wrong' ? 'text-red-800' : 'text-slate-400'
                          }`}>
                            {option}
                          </span>
                        </div>
                      </div>
                      {!isAnswered && (
                        <ChevronRight className="w-5 h-5 text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      {isAnswered && index === correctIndex && (
                        <CheckCircle className="absolute top-2 right-2 w-3.5 h-3.5 text-emerald-600" />
                      )}
                      {isAnswered && index === answer.selected && !answer.correct && (
                        <XCircle className="absolute top-2 right-2 w-3.5 h-3.5 text-red-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {isAnswered && (
              <div className={`mt-6 p-4 rounded-xl border-l-4 ${
                answer.correct ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'
              }`}>
                <p className={`text-sm font-bold mb-1.5 ${answer.correct ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {answer.correct ? '¡Correcto!' : 'No era esa…'}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">{quiz.explanation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pb-7 flex-shrink-0 border-t border-slate-100 pt-5 bg-white">
          {!isAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm tracking-wide uppercase"
            >
              Confirmar respuesta
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Volver al mapa
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
