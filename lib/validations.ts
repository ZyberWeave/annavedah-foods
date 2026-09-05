// ─── Shared Form Validation Utilities ─────────────────────────────────────────
// Reusable validators for all forms across the Annavedah Foods website.

export type ValidationResult = { valid: boolean; message: string }

// ─── Email ────────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) return { valid: false, message: 'Email is required' }
  if (!EMAIL_REGEX.test(email)) return { valid: false, message: 'Please enter a valid email address' }
  return { valid: true, message: '' }
}

// ─── Password ─────────────────────────────────────────────────────────────────
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

export function getPasswordStrength(password: string): { strength: PasswordStrength; score: number; feedback: string[] } {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score++; else feedback.push('At least 8 characters')
  if (/[A-Z]/.test(password)) score++; else feedback.push('One uppercase letter')
  if (/[a-z]/.test(password)) score++; else feedback.push('One lowercase letter')
  if (/\d/.test(password)) score++; else feedback.push('One number')
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++; else feedback.push('One special character')

  const strength: PasswordStrength =
    score <= 2 ? 'weak' : score === 3 ? 'fair' : score === 4 ? 'good' : 'strong'

  return { strength, score, feedback }
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, message: 'Password is required' }
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must include an uppercase letter' }
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must include a lowercase letter' }
  if (!/\d/.test(password)) return { valid: false, message: 'Password must include a number' }
  return { valid: true, message: '' }
}

// ─── Name ─────────────────────────────────────────────────────────────────────
export function validateName(name: string, label = 'Name'): ValidationResult {
  if (!name.trim()) return { valid: false, message: `${label} is required` }
  if (name.trim().length < 2) return { valid: false, message: `${label} must be at least 2 characters` }
  if (/\d/.test(name)) return { valid: false, message: `${label} should not contain numbers` }
  return { valid: true, message: '' }
}

// ─── City ─────────────────────────────────────────────────────────────────────
// Supports international letters (including combining marks) and punctuation
// commonly used in place names, while rejecting digits and other symbols.
const CITY_REGEX = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u

export function validateCity(city: string): ValidationResult {
  const value = city.trim()
  if (!value) return { valid: false, message: 'City is required' }
  if (value.length < 2) return { valid: false, message: 'City must be at least 2 characters' }
  if (!CITY_REGEX.test(value)) {
    return { valid: false, message: 'City can only contain letters, spaces, apostrophes, periods, or hyphens' }
  }
  return { valid: true, message: '' }
}

// ─── Indian Phone ─────────────────────────────────────────────────────────────
const PHONE_REGEX = /^[6-9]\d{9}$/

export function validatePhone(phone: string, required = true): ValidationResult {
  if (!phone.trim()) {
    if (required) return { valid: false, message: 'Phone number is required' }
    return { valid: true, message: '' }
  }
  if (!PHONE_REGEX.test(phone)) return { valid: false, message: 'Enter a valid 10-digit Indian mobile number' }
  return { valid: true, message: '' }
}

// ─── Generic Required Field ───────────────────────────────────────────────────
export function validateRequired(value: string, label = 'This field'): ValidationResult {
  if (!value.trim()) return { valid: false, message: `${label} is required` }
  return { valid: true, message: '' }
}

// ─── Min Length ───────────────────────────────────────────────────────────────
export function validateMinLength(value: string, min: number, label = 'This field'): ValidationResult {
  if (!value.trim()) return { valid: false, message: `${label} is required` }
  if (value.trim().length < min) return { valid: false, message: `${label} must be at least ${min} characters` }
  return { valid: true, message: '' }
}

// ─── Pincode ──────────────────────────────────────────────────────────────────
export function validatePincode(pincode: string): ValidationResult {
  if (!pincode.trim()) return { valid: false, message: 'Pincode is required' }
  if (!/^\d{6}$/.test(pincode)) return { valid: false, message: 'Enter a valid 6-digit pincode' }
  return { valid: true, message: '' }
}

// ─── OTP ──────────────────────────────────────────────────────────────────────
export function validateOtp(otp: string): ValidationResult {
  if (!otp.trim()) return { valid: false, message: 'Verification code is required' }
  if (!/^\d{6}$/.test(otp)) return { valid: false, message: 'Enter the 6-digit code sent to your email' }
  return { valid: true, message: '' }
}

// ─── Password Strength Colors ─────────────────────────────────────────────────
export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak': return '#ef4444'
    case 'fair': return '#f59e0b'
    case 'good': return '#22c55e'
    case 'strong': return '#16a34a'
  }
}

export function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak': return 'Weak'
    case 'fair': return 'Fair'
    case 'good': return 'Good'
    case 'strong': return 'Strong'
  }
}
