import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle } from 'lucide-react'

const TOOLTIP_Z = 3500
const GAP = 8
const MIN_SPACE = 72

function computePlacement(rect) {
  const spaceAbove = rect.top
  const spaceBelow = window.innerHeight - rect.bottom
  return spaceAbove >= MIN_SPACE || spaceAbove >= spaceBelow ? 'top' : 'bottom'
}

/** Etiqueta con tooltip de ayuda (portal para no quedar bajo el mapa). */
export default function FieldLabel({ children, hint, className = '' }) {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState('top')
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const tooltipId = useId()

  const updatePosition = useCallback(() => {
    const el = btnRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nextPlacement = computePlacement(rect)
    setPlacement(nextPlacement)
    setCoords({
      top: nextPlacement === 'top' ? rect.top - GAP : rect.bottom + GAP,
      left: rect.left + rect.width / 2,
    })
  }, [])

  const show = useCallback(() => {
    updatePosition()
    setOpen(true)
  }, [updatePosition])

  const hide = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  const tooltip =
    open &&
    createPortal(
      <div
        id={tooltipId}
        role="tooltip"
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          zIndex: TOOLTIP_Z,
          transform: placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        }}
        className="relative pointer-events-none w-[min(240px,calc(100vw-3rem))] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] leading-snug text-slate-600 shadow-lg"
      >
        {hint}
        {placement === 'top' ? (
          <>
            <span
              className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-white"
              aria-hidden
            />
            <span
              className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-[6px] border-transparent border-t-slate-200"
              aria-hidden
            />
          </>
        ) : (
          <>
            <span
              className="absolute left-1/2 bottom-full -translate-x-1/2 border-[5px] border-transparent border-b-white"
              aria-hidden
            />
            <span
              className="absolute left-1/2 bottom-full mb-px -translate-x-1/2 border-[6px] border-transparent border-b-slate-200"
              aria-hidden
            />
          </>
        )}
      </div>,
      document.body,
    )

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-xs font-bold text-slate-500">{children}</span>
      <button
        ref={btnRef}
        type="button"
        tabIndex={0}
        className="flex items-center justify-center rounded-full text-slate-400 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:text-blue-600 transition-colors"
        aria-label={`Ayuda: ${children}`}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <HelpCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.25} />
      </button>
      {tooltip}
    </div>
  )
}
