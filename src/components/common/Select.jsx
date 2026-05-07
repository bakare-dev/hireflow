import { forwardRef, useId } from 'react'
import { cn } from '../../utils/classnames'

const Select = forwardRef(function Select(
  { label, hint, error, options = [], placeholder, className, id, ...rest },
  ref,
) {
  const reactId = useId()
  const selectId = id ?? reactId

  return (
    <div className="space-y-1">
      {label ? (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-800"
        >
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-900 transition focus:outline-none focus:ring-2',
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200',
          className,
        )}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
})

export default Select
