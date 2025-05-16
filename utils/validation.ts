/**
 * Validates an email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password requirements
 * At least 6 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password: string): boolean {
  const minLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return minLength && hasUppercase && hasLowercase && hasNumber;
}

/**
 * Checks password strength and returns a score from 0-4
 * 0: No password
 * 1: Very weak
 * 2: Weak
 * 3: Medium
 * 4: Strong
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Cap at 4
  return Math.min(4, score);
}

/**
 * Gets feedback message based on password strength
 */
export function getPasswordFeedback(strength: number): string {
  switch (strength) {
    case 0:
      return 'Password is required';
    case 1:
      return 'Very weak password';
    case 2:
      return 'Weak password';
    case 3:
      return 'Medium strength password';
    case 4:
      return 'Strong password';
    default:
      return '';
  }
}