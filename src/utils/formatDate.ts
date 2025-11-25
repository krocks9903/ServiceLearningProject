/**
 * Formats a date string or Date object to a readable format
 * @param date - Date string or Date object
 * @param format - Format type: 'short', 'long', 'datetime', or 'iso'
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: 'short' | 'long' | 'datetime' | 'iso' = 'short'
): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'datetime':
      return dateObj.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    case 'iso':
      return dateObj.toISOString()
    default:
      return dateObj.toLocaleDateString()
  }
}

/**
 * Formats a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date
): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return ''
  }

  const startFormatted = formatDate(start, 'short')
  const endFormatted = formatDate(end, 'short')

  if (startFormatted === endFormatted) {
    return startFormatted
  }

  return `${startFormatted} - ${endFormatted}`
}

/**
 * Gets relative time string (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to compare
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (Math.abs(diffSecs) < 60) {
    return diffSecs < 0 ? 'just now' : 'in a moment'
  }
  if (Math.abs(diffMins) < 60) {
    return diffMins < 0
      ? `${Math.abs(diffMins)} minutes ago`
      : `in ${diffMins} minutes`
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours < 0
      ? `${Math.abs(diffHours)} hours ago`
      : `in ${diffHours} hours`
  }
  return diffDays < 0
    ? `${Math.abs(diffDays)} days ago`
    : `in ${diffDays} days`
}

