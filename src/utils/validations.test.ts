import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidDate,
  isFutureDate,
  isPastDate,
  validateRequiredFields,
} from './validations'

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('invalid@.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })

  it('should handle whitespace by trimming', () => {
    expect(isValidEmail('  test@example.com  ')).toBe(true)
  })

  it('should return false for null or undefined', () => {
    expect(isValidEmail(null as any)).toBe(false)
    expect(isValidEmail(undefined as any)).toBe(false)
  })
})

describe('validatePassword', () => {
  it('should return valid for strong passwords', () => {
    const result = validatePassword('StrongPass123')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should return errors for weak passwords', () => {
    const result = validatePassword('weak')
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should require minimum length', () => {
    const result = validatePassword('Short1', 8)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must be at least 8 characters long')
  })

  it('should require uppercase letter', () => {
    const result = validatePassword('lowercase123')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one uppercase letter')
  })

  it('should require lowercase letter', () => {
    const result = validatePassword('UPPERCASE123')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one lowercase letter')
  })

  it('should require number', () => {
    const result = validatePassword('NoNumbers')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one number')
  })

  it('should accept custom minimum length', () => {
    const result = validatePassword('Short1', 6)
    expect(result.isValid).toBe(true)
  })
})

describe('isValidPhone', () => {
  it('should return true for valid US phone numbers', () => {
    expect(isValidPhone('1234567890')).toBe(true)
    expect(isValidPhone('(123) 456-7890')).toBe(true)
    expect(isValidPhone('123-456-7890')).toBe(true)
    expect(isValidPhone('123.456.7890')).toBe(true)
    expect(isValidPhone('+1 1234567890')).toBe(true)
  })

  it('should return false for invalid phone numbers', () => {
    expect(isValidPhone('12345')).toBe(false)
    expect(isValidPhone('123456789012345')).toBe(false)
    expect(isValidPhone('')).toBe(false)
    expect(isValidPhone('abc')).toBe(false)
  })

  it('should return false for null or undefined', () => {
    expect(isValidPhone(null as any)).toBe(false)
    expect(isValidPhone(undefined as any)).toBe(false)
  })
})

describe('isValidDate', () => {
  it('should return true for valid date strings', () => {
    expect(isValidDate('2024-01-15')).toBe(true)
    expect(isValidDate('2024-01-15T12:00:00Z')).toBe(true)
    expect(isValidDate('01/15/2024')).toBe(true)
  })

  it('should return false for invalid date strings', () => {
    expect(isValidDate('invalid-date')).toBe(false)
    expect(isValidDate('2024-13-45')).toBe(false)
    expect(isValidDate('')).toBe(false)
  })

  it('should return false for null or undefined', () => {
    expect(isValidDate(null as any)).toBe(false)
    expect(isValidDate(undefined as any)).toBe(false)
  })
})

describe('isFutureDate', () => {
  it('should return true for future dates', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    expect(isFutureDate(futureDate.toISOString())).toBe(true)
  })

  it('should return false for past dates', () => {
    const pastDate = new Date()
    pastDate.setFullYear(pastDate.getFullYear() - 1)
    expect(isFutureDate(pastDate.toISOString())).toBe(false)
  })

  it('should return false for invalid dates', () => {
    expect(isFutureDate('invalid-date')).toBe(false)
  })
})

describe('isPastDate', () => {
  it('should return true for past dates', () => {
    const pastDate = new Date()
    pastDate.setFullYear(pastDate.getFullYear() - 1)
    expect(isPastDate(pastDate.toISOString())).toBe(true)
  })

  it('should return false for future dates', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    expect(isPastDate(futureDate.toISOString())).toBe(false)
  })

  it('should return false for invalid dates', () => {
    expect(isPastDate('invalid-date')).toBe(false)
  })
})

describe('validateRequiredFields', () => {
  it('should return valid when all required fields are present', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    }
    const result = validateRequiredFields(data, ['name', 'email'])
    expect(result.isValid).toBe(true)
    expect(result.missingFields).toHaveLength(0)
  })

  it('should return invalid when required fields are missing', () => {
    const data = {
      name: 'John Doe',
      email: '',
    }
    const result = validateRequiredFields(data, ['name', 'email', 'phone'])
    expect(result.isValid).toBe(false)
    expect(result.missingFields).toContain('phone')
  })

  it('should detect null values as missing', () => {
    const data = {
      name: 'John Doe',
      email: null,
    }
    const result = validateRequiredFields(data, ['name', 'email'])
    expect(result.isValid).toBe(false)
    expect(result.missingFields).toContain('email')
  })

  it('should detect undefined values as missing', () => {
    const data = {
      name: 'John Doe',
    }
    const result = validateRequiredFields(data, ['name', 'email'])
    expect(result.isValid).toBe(false)
    expect(result.missingFields).toContain('email')
  })

  it('should detect empty arrays as missing', () => {
    const data = {
      name: 'John Doe',
      tags: [],
    }
    const result = validateRequiredFields(data, ['name', 'tags'])
    expect(result.isValid).toBe(false)
    expect(result.missingFields).toContain('tags')
  })

  it('should handle arrays with values as valid', () => {
    const data = {
      name: 'John Doe',
      tags: ['tag1', 'tag2'],
    }
    const result = validateRequiredFields(data, ['name', 'tags'])
    expect(result.isValid).toBe(true)
  })
})

