import { SCORESHEET_CRITERIA } from '../constants/scoresheet'

export function computeOverallScore(scoresheet) {
  if (!scoresheet) return 0
  const total = SCORESHEET_CRITERIA.reduce(
    (sum, { key }) => sum + (Number(scoresheet[key]) || 0),
    0,
  )
  return Number((total / SCORESHEET_CRITERIA.length).toFixed(2))
}

export function isScoresheetComplete(scoresheet) {
  if (!scoresheet) return false
  for (const { key } of SCORESHEET_CRITERIA) {
    const v = scoresheet[key]
    if (typeof v !== 'number' || v < 1 || v > 5) return false
  }
  if (!scoresheet.overallRecommendation?.trim()) return false
  if (!scoresheet.decision) return false
  if (scoresheet.decision === 'REJECT' && !scoresheet.rejectionReason?.trim()) {
    return false
  }
  return true
}
