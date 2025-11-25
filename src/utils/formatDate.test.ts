import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatDate, formatDateRange, getRelativeTime } from './formatDate'

describe('formatDate', () => {
  beforeEach(() => {
    // Mock current date to ensure consistent tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDate - short format', () => {
    it('should format a date string in short format', () => {
      // Use date with explicit time to avoid timezone issues
      const result = formatDate('2024-01-15T12:00:00', 'short')
      expect(result).toBe('Jan 15, 2024')
    })

    it('should format a Date object in short format', () => {
      // Use date with explicit time to avoid timezone issues
      const date = new Date('2024-03-20T12:00:00')
      const result = formatDate(date, 'short')
      expect(result).toBe('Mar 20, 2024')
    })

    it('should return empty string for null', () => {
      const result = formatDate(null, 'short')
      expect(result).toBe('')
    })

    it('should return empty string for undefined', () => {
      const result = formatDate(undefined, 'short')
      expect(result).toBe('')
    })

    it('should return empty string for invalid date', () => {
      const result = formatDate('invalid-date', 'short')
      expect(result).toBe('')
    })
  })

  describe('formatDate - long format', () => {
    it('should format a date in long format', () => {
      // Use date with explicit time to avoid timezone issues
      const result = formatDate('2024-01-15T12:00:00', 'long')
      expect(result).toContain('January')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('formatDate - datetime format', () => {
    it('should format a date with time', () => {
      const result = formatDate('2024-01-15T14:30:00', 'datetime')
      expect(result).toContain('Jan 15, 2024')
      expect(result).toContain('2:30')
    })
  })

  describe('formatDate - iso format', () => {
    it('should format a date in ISO format', () => {
      const result = formatDate('2024-01-15T14:30:00Z', 'iso')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('formatDate - default format', () => {
    it('should use short format by default', () => {
      // Use date with explicit time to avoid timezone issues
      const result = formatDate('2024-01-15T12:00:00')
      expect(result).toBe('Jan 15, 2024')
    })
  })
})

describe('formatDateRange', () => {
  it('should format a date range with different dates', () => {
    // Use dates with explicit times to avoid timezone issues
    const result = formatDateRange('2024-01-15T12:00:00', '2024-01-20T12:00:00')
    expect(result).toBe('Jan 15, 2024 - Jan 20, 2024')
  })

  it('should return single date when start and end are the same', () => {
    // Use date with explicit time to avoid timezone issues
    const result = formatDateRange('2024-01-15T12:00:00', '2024-01-15T12:00:00')
    expect(result).toBe('Jan 15, 2024')
  })

  it('should return empty string for invalid dates', () => {
    const result = formatDateRange('invalid', '2024-01-15')
    expect(result).toBe('')
  })
})

describe('getRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "just now" for very recent past', () => {
    const pastDate = new Date('2024-01-15T11:59:55Z')
    const result = getRelativeTime(pastDate)
    expect(result).toBe('just now')
  })

  it('should return minutes ago for recent past', () => {
    const pastDate = new Date('2024-01-15T11:45:00Z')
    const result = getRelativeTime(pastDate)
    expect(result).toBe('15 minutes ago')
  })

  it('should return hours ago for past hours', () => {
    const pastDate = new Date('2024-01-15T09:00:00Z')
    const result = getRelativeTime(pastDate)
    expect(result).toBe('3 hours ago')
  })

  it('should return days ago for past days', () => {
    const pastDate = new Date('2024-01-13T12:00:00Z')
    const result = getRelativeTime(pastDate)
    expect(result).toBe('2 days ago')
  })

  it('should return future time for future dates', () => {
    const futureDate = new Date('2024-01-15T13:00:00Z')
    const result = getRelativeTime(futureDate)
    expect(result).toBe('in 1 hours')
  })
})

