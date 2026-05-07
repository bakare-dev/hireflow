import { db } from './db'
import { simulateLatency } from '../utils/async'
import { newId } from '../utils/id'
import { nowIso } from '../utils/date'
import { isMeetLink } from '../utils/validators'
import { isScoresheetComplete } from '../utils/scoresheet'

export async function listInterviewSlots({ hiringManagerId } = {}) {
  await simulateLatency()
  return db.interviewSlots
    .filter((s) => (hiringManagerId ? s.hiringManagerId === hiringManagerId : true))
    .map((s) => ({ ...s }))
}

export async function getInterviewSlot(id) {
  await simulateLatency()
  const slot = db.interviewSlots.find((s) => s.id === id)
  if (!slot) throw new Error(`Interview slot not found: ${id}`)
  return { ...slot }
}

export async function getInterviewSlotByApplication(applicationId) {
  await simulateLatency()
  const slot = db.interviewSlots.find((s) => s.applicationId === applicationId)
  return slot ? { ...slot } : null
}

export async function createInterviewSlot({
  applicationId,
  hiringManagerId,
  scheduledAt,
  durationMinutes,
  meetLink,
}) {
  await simulateLatency()
  if (!isMeetLink(meetLink)) {
    throw new Error('A valid Google Meet URL is required.')
  }
  const slot = {
    id: newId('slot'),
    applicationId,
    hiringManagerId,
    scheduledAt,
    durationMinutes,
    meetLink,
    scoresheet: null,
    reviewSubmittedAt: null,
    createdAt: nowIso(),
  }
  db.interviewSlots.push(slot)
  return { ...slot }
}

export async function submitScoresheet(slotId, scoresheet) {
  await simulateLatency()
  if (!isScoresheetComplete(scoresheet)) {
    throw new Error(
      'Scoresheet incomplete — all five criteria, recommendation, and decision (with rejection reason if applicable) are required.',
    )
  }
  const idx = db.interviewSlots.findIndex((s) => s.id === slotId)
  if (idx === -1) throw new Error(`Interview slot not found: ${slotId}`)
  const next = {
    ...db.interviewSlots[idx],
    scoresheet,
    reviewSubmittedAt: nowIso(),
  }
  db.interviewSlots[idx] = next
  return { ...next }
}
