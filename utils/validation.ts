/**
 * Enhanced validation utilities for registration
 */

// Password strength requirements
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

export function validateEmail(email: string): boolean {
  // Enhanced email validation with academic domain check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const academicDomains = ['eastdelta.edu.bd']; // Add all valid domains
  
  if (!emailRegex.test(email)) return false;
  
  const domain = email.split('@')[1];
  return academicDomains.includes(domain);
}

export const validatePassword = (password: string): {
  isValid: boolean;
  strength: number;
  criteria: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
} => {
  const criteria = {
    length: password.length >= PASSWORD_REQUIREMENTS.minLength,
    uppercase: (password.match(/[A-Z]/g) || []).length >= PASSWORD_REQUIREMENTS.minUppercase,
    lowercase: (password.match(/[a-z]/g) || []).length >= PASSWORD_REQUIREMENTS.minLowercase,
    number: (password.match(/[0-9]/g) || []).length >= PASSWORD_REQUIREMENTS.minNumbers,
    symbol: (password.match(/[^A-Za-z0-9]/g) || []).length >= PASSWORD_REQUIREMENTS.minSymbols,
  };

  const strength = Object.values(criteria).filter(Boolean).length;
  const isValid = Object.values(criteria).every(Boolean);

  return {
    isValid,
    strength,
    criteria,
  };
};

export const validateName = (name: string): boolean => {
  // Enhanced name validation
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

export const validateStudentId = (id: string): boolean => {
  // Specific format for student IDs: YYYYNNNNN (Year + 5 digit number)
  const studentIdRegex = /^20\d{2}\d{5}$/;
  return studentIdRegex.test(id);
};

export const validatePhone = (phone: string): boolean => {
  // Bangladesh phone number format
  const phoneRegex = /^(\+8801|01)[3-9][0-9]{8}$/;
  return phoneRegex.test(phone);
};

export const validateUsername = (username: string): boolean => {
  // Enhanced username requirements
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{3,29}$/;
  return usernameRegex.test(username);
};

export const validatePin = (pin: string): boolean => {
  // 5-digit PIN validation
  return /^\d{5}$/.test(pin);
};

export const validatePinMatch = (pin1: string, pin2: string): boolean => {
  return pin1 === pin2 && validatePin(pin1);
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const getPasswordStrengthText = (strength: number): string => {
  switch (strength) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    case 5:
      return 'Very Strong';
    default:
      return '';
  }
};