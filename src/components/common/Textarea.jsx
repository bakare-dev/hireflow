import { forwardRef, useId } from 'react'
import { cn } from '../../utils/classnames'

const Textarea = forwardRef(function Textarea(
  { label, hint, error, rows = 4, className, id, ...rest },
  ref,
) {
  const reactId = useId()
  const textareaId = id ?? reactId

  return (
    <div className="space-y-1">
      {label ? (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-slate-800"
        >
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2',
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
})

export default Textarea
