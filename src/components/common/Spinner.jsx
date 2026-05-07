import { cn } from '../../utils/classnames'

function Spinner({ className }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export default Spinner
