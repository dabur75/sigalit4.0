import * as bcrypt from 'bcryptjs';

/**
 * Utility functions for authentication and password management
 */

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure random password
 * @param length - Length of password (default: 12)
 * @returns Random password
 */
export function generateSecurePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation results
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('הסיסמה חייבת להיות באורך של לפחות 8 תווים');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*]/.test(password)) score += 1;

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push('הסיסמה לא יכולה להכיל תווים חוזרים יותר מפעמיים');
  }

  if (/(123|abc|qwe|password|admin)/i.test(password)) {
    errors.push('הסיסמה לא יכולה להכיל רצפים נפוצים');
  }

  const isValid = errors.length === 0 && score >= 3;

  return {
    isValid,
    errors,
    score
  };
}

/**
 * Sanitize username (remove special characters, ensure uniqueness)
 * @param username - Raw username input
 * @returns Sanitized username
 */
export function sanitizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/_+/g, '_')
    .replace(/-+/g, '-');
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns Validation result
 */
export function validateUsername(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push('שם המשתמש חייב להיות באורך של לפחות 3 תווים');
  }

  if (username.length > 20) {
    errors.push('שם המשתמש לא יכול להיות ארוך מ-20 תווים');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('שם המשתמש יכול להכיל רק אותיות, מספרים, קווים תחתונים וקווים מפרידים');
  }

  if (username.startsWith('-') || username.endsWith('-')) {
    errors.push('שם המשתמש לא יכול להתחיל או להסתיים בקו מפריד');
  }

  if (username.startsWith('_') || username.endsWith('_')) {
    errors.push('שם המשתמש לא יכול להתחיל או להסתיים בקו תחתון');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
