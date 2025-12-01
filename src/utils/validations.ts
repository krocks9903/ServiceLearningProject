/**
 * Validates an email address
 * @param email - Email string to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validates a password
 * @param password - Password string to validate
 * @param minLength - Minimum length (default: 8)
 * @returns Object with isValid boolean and errors array
 */
export function validatePassword(
  password: string,
  minLength: number = 8
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!password || password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates a phone number (US format)
 * @param phone - Phone number string
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  // Check if it's 10 or 11 digits (with or without country code)
  return digitsOnly.length === 10 || digitsOnly.length === 11
}

/**
 * Validates a date string
 * @param dateString - Date string to validate
 * @returns true if valid date, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Validates that a date is in the future
 * @param dateString - Date string to validate
 * @returns true if date is in the future, false otherwise
 */
export function isFutureDate(dateString: string): boolean {
  if (!isValidDate(dateString)) return false
  const date = new Date(dateString)
  const now = new Date()
  return date.getTime() > now.getTime()
}

/**
 * Validates that a date is in the past
 * @param dateString - Date string to validate
 * @returns true if date is in the past, false otherwise
 */
export function isPastDate(dateString: string): boolean {
  if (!isValidDate(dateString)) return false
  const date = new Date(dateString)
  const now = new Date()
  return date.getTime() < now.getTime()
}

/**
 * Validates required fields in an object
 * @param data - Object to validate
 * @param requiredFields - Array of required field names
 * @returns Object with isValid boolean and missingFields array
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = []

  for (const field of requiredFields) {
    const value = data[field]
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missingFields.push(String(field))
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}

