import { cn } from '../../utils/classnames'

function Card({ className, children, ...rest }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return (
    <div
      className={cn(
        'border-t border-slate-100 px-5 py-3 text-sm text-slate-600',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default Card
