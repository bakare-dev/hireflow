import Badge from '../common/Badge'
import { STAGE_BADGE_COLORS, STAGE_LABELS } from '../../constants/stages'

function StageBadge({ stage, className }) {
  if (!stage) return null
  return (
    <Badge className={`${STAGE_BADGE_COLORS[stage] ?? ''} ${className ?? ''}`.trim()}>
      {STAGE_LABELS[stage] ?? stage}
    </Badge>
  )
}

export default StageBadge
