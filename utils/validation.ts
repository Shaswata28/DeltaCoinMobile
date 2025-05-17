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
export const validatePassword = (password: string): {
  isValid: boolean;
  strength: number;
  criteria: {
    length: boolean;
    uppercase: boolean;
    number: boolean;
  };
} => {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const strength = Object.values(criteria).filter(Boolean).length;
  const isValid = Object.values(criteria).every(Boolean);

  return {
    isValid,
    strength,
    criteria,
  };
};

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

export const validateName = (name: string): boolean => {
  return name.trim().length > 0;
};

export const validateStudentId = (id: string): boolean => {
  // Add your specific student ID validation rules here
  return /^\d{9}$/.test(id);
};

export const validatePhone = (phone: string): boolean => {
  return /^\+?[0-9]{10,15}$/.test(phone);
};

export const validateUsername = (username: string): boolean => {
  return username.length >= 4 && /^[a-zA-Z0-9_]+$/.test(username);
};

export const validatePin = (pin: string): boolean => {
  return /^\d{5}$/.test(pin);
};

export const validatePinMatch = (pin1: string, pin2: string): boolean => {
  return pin1 === pin2 && validatePin(pin1);
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};