import {
  MATCH_BAND,
  classifyMatch,
  DEFAULT_AUTO_PASS_THRESHOLD,
  DEFAULT_AUTO_REJECT_THRESHOLD,
} from '../../constants/screening'
import { cn } from '../../utils/classnames'

const BAR_COLORS = {
  [MATCH_BAND.HIGH]: 'bg-emerald-500',
  [MATCH_BAND.MID]: 'bg-amber-500',
  [MATCH_BAND.LOW]: 'bg-rose-500',
}

const TEXT_COLORS = {
  [MATCH_BAND.HIGH]: 'text-emerald-700',
  [MATCH_BAND.MID]: 'text-amber-700',
  [MATCH_BAND.LOW]: 'text-rose-700',
}

function MatchPercentBar({
  value,
  autoPass = DEFAULT_AUTO_PASS_THRESHOLD,
  autoReject = DEFAULT_AUTO_REJECT_THRESHOLD,
  className,
  showValue = true,
}) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0))
  const band = classifyMatch(safeValue, autoPass, autoReject)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-all', BAR_COLORS[band])}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      {showValue ? (
        <span className={cn('text-sm font-semibold tabular-nums', TEXT_COLORS[band])}>
          {safeValue}%
        </span>
      ) : null}
    </div>
  )
}

export default MatchPercentBar
