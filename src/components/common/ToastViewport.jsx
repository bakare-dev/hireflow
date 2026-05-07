import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dismissToast, selectToasts } from '../../store/slices/uiSlice'
import { cn } from '../../utils/classnames'

const TONES = {
  info: 'bg-slate-900 text-white',
  success: 'bg-emerald-600 text-white',
  error: 'bg-rose-600 text-white',
}

function ToastViewport() {
  const dispatch = useDispatch()
  const toasts = useSelector(selectToasts)

  useEffect(() => {
    if (!toasts.length) return undefined
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), t.durationMs ?? 4000),
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, dispatch])

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto rounded-md px-4 py-2 text-sm shadow-lg',
            TONES[t.tone] ?? TONES.info,
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

export default ToastViewport
