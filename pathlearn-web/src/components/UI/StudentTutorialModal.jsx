import { ChevronLeft, ChevronRight, Compass, Map, X } from 'lucide-react'

import { useState } from 'react'

const WELCOME_ICON_SRC = '/tutorial/pathlearn-welcome.png'

function TutorialWelcomeIcon() {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return (
      <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
        <Compass className="w-10 h-10 text-white" />
      </div>
    )
  }

  return (
    <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg shadow-blue-200/50">
      <img
        src={WELCOME_ICON_SRC}
        alt=""
        className="w-full h-full object-contain"
        onError={() => setUseFallback(true)}
      />
    </div>
  )
}

function StepLayout({ children }) {
  return (
    <div className="flex flex-col items-center gap-5 max-w-lg mx-auto w-full text-center">
      {children}
    </div>
  )
}

function TutorialTips({ items }) {
  return (
    <div className="w-full max-w-md mx-auto rounded-xl bg-slate-50 border border-slate-100 px-5 py-4 text-center">
      <div className="flex flex-col">
        {items.map((item, index) => (
          <div key={index}>
            {index > 0 && <div className="my-2.5 h-px w-12 mx-auto bg-slate-200" aria-hidden />}
            <p className="m-0 text-sm text-slate-600 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const STEPS = [
  { id: 'welcome', title: 'Bienvenida' },
  { id: 'explore', title: 'Explorar' },
  { id: 'discover', title: 'Descubrir' },
  { id: 'map', title: 'El mapa' },
]

function MockHeaderTabs({ active }) {
  const tabs = [
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'discover', label: 'Descubrir', icon: Map },
  ]
  return (
    <div className="flex items-center justify-center bg-slate-100 p-1.5 rounded-xl gap-1 max-w-sm mx-auto">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold ${
              isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-500' : ''}`} />
            {tab.label}
          </div>
        )
      })}
    </div>
  )
}

function SimpleMarkersHint() {
  const items = [
    { n: 1, done: false },
    { n: 2, done: true },
    { n: 3, done: false },
  ]
  return (
    <div className="flex flex-col items-center gap-6 w-full py-2">
      <div className="flex items-center justify-center gap-4">
        {items.map((item, i) => (
          <div key={item.n} className="flex items-center gap-4">
            <div
              className={`w-11 h-11 shrink-0 rounded-full border-[3px] border-white shadow-md flex items-center justify-center text-sm font-black ${
                item.done ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {item.n}
            </div>
            {i < items.length - 1 && <div className="w-8 h-0.5 bg-slate-300 rounded" />}
          </div>
        ))}
      </div>
      <p className="text-center text-base text-slate-600 max-w-md leading-relaxed">
        ¡Un detalle muy importante! Cada círculo en el mapa es un <span className="font-bold text-slate-800">lugar distinto</span> con su propia pregunta exclusiva. 
        <br/><br/>
        ¡Asegúrate de <span className="font-bold text-blue-600">pulsar en cada punto del mapa</span> para descubrir todos los lugares!
      </p>
    </div>
  )
}

function StepContent({ stepId }) {
  switch (stepId) {
    case 'welcome':
      return (
        <StepLayout>
          <TutorialWelcomeIcon />
          <div className="space-y-4">
            <p className="text-lg text-slate-700 leading-relaxed">
              Bienvenido a <span className="font-bold text-slate-900">PathLearn</span>, una nueva forma de aprender explorando el mundo real. Convierte tu entorno en un tablero: descubre lugares de interés y ponte a prueba mientras paseas.
            </p>
            <p className="text-base text-slate-500 leading-relaxed">
              En el menú superior podrás cambiar entre modo <span className="font-semibold text-slate-700">Explorar</span> y <span className="font-semibold text-slate-700">Descubrir</span>.
              También puedes <span className="font-semibold text-slate-700">Unirte</span> a una actividad con el código de tu profesor, o revisar tus quizzes <span className="font-semibold text-slate-700">Guardados</span>.
            </p>
          </div>
        </StepLayout>
      )

    case 'explore':
      return (
        <StepLayout>
          <MockHeaderTabs active="explore" />
          <p className="text-lg text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Aprende a tu ritmo.</span> Elige cualquier punto en el mapa para descubrir qué hay a tu alrededor.
          </p>
          <TutorialTips
            items={[
              <>
                Abre el panel lateral y pulsa en <span className="font-bold text-slate-800">Generar quiz</span>.
              </>,
              <>Escoge el reto que prefieras: nivel Sencillo, Intermedio o Razonamiento.</>,
              <>Buscaremos hasta 10 lugares cercanos y crearemos una pregunta para cada uno.</>,
            ]}
          />
        </StepLayout>
      )

    case 'discover':
      return (
        <StepLayout>
          <MockHeaderTabs active="discover" />
          <p className="text-lg text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Rutas temáticas.</span> ¿Prefieres que te guiemos? Selecciona un tema concreto y sigue el recorrido paso a paso.
          </p>
          <TutorialTips
            items={[
              <>
                Elige una de las rutas del panel y pulsa en <span className="font-bold text-slate-800">Generar ruta</span>.
              </>,
              <>El sistema te marcará un orden sugerido (1, 2, 3...).</>,
              <>Haz clic en cada parada para desvelar su secreto y avanzar en la historia.</>,
            ]}
          />
        </StepLayout>
      )

    case 'map':
      return (
        <StepLayout>
          <SimpleMarkersHint />
        </StepLayout>
      )

    default:
      return null
  }
}

export default function StudentTutorialModal({ open, onClose }) {
  const [stepIndex, setStepIndex] = useState(0)

  if (!open) return null

  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const goNext = () => {
    if (isLast) onClose?.()
    else setStepIndex(i => i + 1)
  }

  const goPrev = () => setStepIndex(i => Math.max(0, i - 1))

  const handleClose = () => {
    setStepIndex(0)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/30" onClick={handleClose} aria-hidden />
      <div
        className="relative w-full max-w-[min(42rem,calc(100vw-2rem))] min-h-[min(420px,70vh)] max-h-[min(88vh,720px)] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
      >
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.14em]">Tutorial</div>
            <div id="tutorial-title" className="text-2xl font-black text-slate-900 mt-0.5">
              {step.title}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {stepIndex + 1} / {STEPS.length}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center shrink-0"
            aria-label="Cerrar tutorial"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="px-6 sm:px-8 pt-3 flex justify-center gap-2 shrink-0">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStepIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === stepIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Paso: ${s.title}`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto sidebar-scroll px-6 sm:px-8 py-6 sm:py-8 min-h-0">
          <StepContent stepId={step.id} />
        </div>

        <div className="px-6 sm:px-8 py-5 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-black transition-all"
          >
            {isLast ? '¡Empezar!' : 'Siguiente'}
            {!isLast && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}