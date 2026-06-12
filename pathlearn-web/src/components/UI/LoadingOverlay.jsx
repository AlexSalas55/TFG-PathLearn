import { Search, Sparkles, MapPin } from 'lucide-react'

const STEPS = {
  pois: {
    icon: Search,
    title: 'Buscando lugares',
    subtitle: 'Explorando la zona seleccionada…',
  },
  quizzes: {
    icon: Sparkles,
    title: 'Generando preguntas',
    subtitle: null,
  },
  'ai-all': {
    icon: Sparkles,
    title: 'Generando el quiz',
    subtitle: 'Preparando lugares y preguntas…',
  },
  'route-gen': {
    icon: Sparkles,
    title: 'Generando la ruta',
    subtitle: 'Creando paradas y preguntas…',
  },
  'route-verify': {
    icon: MapPin,
    title: 'Ubicando paradas',
    subtitle: 'Colocando los puntos en el mapa…',
  },
}

export default function LoadingOverlay({ step, poisCount }) {
  const cfg = STEPS[step] || STEPS.pois
  const Icon = cfg.icon
  const subtitle = step === 'quizzes'
    ? `Preparando ${poisCount} pregunta${poisCount !== 1 ? 's' : ''}…`
    : cfg.subtitle

  return (
    <div className="absolute inset-0 z-[1150] bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 px-8 py-7 text-center max-w-[260px]">

        <div className="relative w-14 h-14 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <h3 className="font-black text-slate-800 text-sm tracking-tight mb-1">{cfg.title}</h3>
        {subtitle && <p className="text-xs text-slate-400 leading-relaxed">{subtitle}</p>}

        <div className="mt-5 flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
