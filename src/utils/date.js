const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

const DATETIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function formatDate(value) {
  if (!value) return ''
  return DATE_FORMATTER.format(new Date(value))
}

export function formatDateTime(value) {
  if (!value) return ''
  return DATETIME_FORMATTER.format(new Date(value))
}

const UNITS = [
  { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: 'day', ms: 1000 * 60 * 60 * 24 },
  { unit: 'hour', ms: 1000 * 60 * 60 },
  { unit: 'minute', ms: 1000 * 60 },
  { unit: 'second', ms: 1000 },
]

export function formatRelative(value, now = Date.now()) {
  if (!value) return ''
  const diffMs = new Date(value).getTime() - now
  const absMs = Math.abs(diffMs)
  for (const { unit, ms } of UNITS) {
    if (absMs >= ms || unit === 'second') {
      return RELATIVE_FORMATTER.format(Math.round(diffMs / ms), unit)
    }
  }
  return ''
}

export function nowIso() {
  return new Date().toISOString()
}
