import Badge from '../common/Badge'
import {
  JOB_STATUS_BADGE_COLORS,
  JOB_STATUS_LABELS,
} from '../../constants/jobStatus'

function StatusBadge({ status, className }) {
  if (!status) return null
  return (
    <Badge
      className={`${JOB_STATUS_BADGE_COLORS[status] ?? ''} ${className ?? ''}`.trim()}
    >
      {JOB_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export default StatusBadge
