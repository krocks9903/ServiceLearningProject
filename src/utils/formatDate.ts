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

/**
 * Converts a datetime string (without timezone) to UTC ISO string,
 * treating the input as EST/EDT (America/New_York timezone)
 * @param dateTimeString - Datetime string in format "YYYY-MM-DDTHH:mm" (no timezone)
 * @returns ISO string in UTC
 */
export function convertESTToUTC(dateTimeString: string): string {
  if (!dateTimeString) return dateTimeString
  
  // Parse the datetime string (format: "YYYY-MM-DDTHH:mm")
  const [datePart, timePart] = dateTimeString.split('T')
  if (!datePart || !timePart) {
    // If no time part, just return as-is (date only)
    return dateTimeString
  }
  
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  
  // Create a date string in EST/EDT format
  const estDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
  
  // Determine if DST is in effect for this date
  // DST in US: 2nd Sunday in March to 1st Sunday in November
  const isDST = isDateInDST(year, month, day)
  const timezoneOffset = isDST ? '-04:00' : '-05:00' // EDT is UTC-4, EST is UTC-5
  
  // Create date with EST/EDT timezone and convert to UTC
  const dateWithTimezone = new Date(`${estDateStr}${timezoneOffset}`)
  return dateWithTimezone.toISOString()
}

/**
 * Determines if a date is in Daylight Saving Time for EST/EDT (America/New_York)
 * DST in US: 2nd Sunday in March to 1st Sunday in November
 */
function isDateInDST(year: number, month: number, day: number): boolean {
  // DST is roughly March (3) to November (11)
  if (month < 3 || month > 11) return false
  if (month > 3 && month < 11) return true
  
  // For March: DST starts on 2nd Sunday
  if (month === 3) {
    const secondSunday = getNthSunday(year, 3, 2)
    return day >= secondSunday
  }
  
  // For November: DST ends on 1st Sunday
  if (month === 11) {
    const firstSunday = getNthSunday(year, 11, 1)
    return day < firstSunday
  }
  
  return false
}

/**
 * Gets the date of the Nth Sunday in a given month
 */
function getNthSunday(year: number, month: number, n: number): number {
  // month is 1-12
  const firstDay = new Date(year, month - 1, 1)
  const firstDayOfWeek = firstDay.getDay() // 0 = Sunday
  const daysUntilFirstSunday = (7 - firstDayOfWeek) % 7
  const firstSunday = 1 + daysUntilFirstSunday
  return firstSunday + (n - 1) * 7
}

/**
 * Converts a UTC ISO string to EST/EDT datetime string for DatePicker
 * @param utcISOString - ISO string in UTC (from database)
 * @returns Datetime string in format "YYYY-MM-DDTHH:mm" in EST/EDT
 */
export function convertUTCToEST(utcISOString: string): string {
  if (!utcISOString) return utcISOString
  
  // Parse the UTC date
  const utcDate = new Date(utcISOString)
  
  // Format the date in America/New_York timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  
  // Format the date parts
  const parts = formatter.formatToParts(utcDate)
  const year = parts.find(p => p.type === 'year')?.value || ''
  const month = parts.find(p => p.type === 'month')?.value || ''
  const day = parts.find(p => p.type === 'day')?.value || ''
  const hour = parts.find(p => p.type === 'hour')?.value || ''
  const minute = parts.find(p => p.type === 'minute')?.value || ''
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

/**
 * Formats a UTC ISO date string to EST/EDT time string for display
 * @param utcISOString - ISO string in UTC (from database)
 * @returns Time string formatted in EST/EDT (e.g., "2:00 PM")
 */
export function formatTimeInEST(utcISOString: string): string {
  if (!utcISOString) return ''
  
  const utcDate = new Date(utcISOString)
  
  return utcDate.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

