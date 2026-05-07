import { cn } from '../../utils/classnames'

const VARIANTS = {
  primary:
    'bg-slate-950 text-white hover:bg-slate-800 focus-visible:outline-slate-950',
  secondary:
    'bg-white text-slate-950 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-950',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-300',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600',
}

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  disabled,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
