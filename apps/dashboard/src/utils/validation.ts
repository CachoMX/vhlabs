/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone validation (supports various formats)
 */
export function validatePhone(phone: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Check if it's a valid length (10-15 digits)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Required field validation
 */
export function validateRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * URL validation
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Number range validation
 */
export function validateNumberRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Validate contact form
 */
export function validateContactForm(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Email validation (optional but must be valid if provided)
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation (optional but must be valid if provided)
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // At least one contact method required
  if (!data.email && !data.phone) {
    errors.contact = 'Please provide at least an email or phone number';
  }

  // Name validation (at least first or last name)
  if (!data.first_name?.trim() && !data.last_name?.trim()) {
    errors.name = 'Please provide at least a first or last name';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate content form
 */
export function validateContentForm(data: {
  raw_text?: string;
  source_type?: string;
  status?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.raw_text)) {
    errors.raw_text = 'Content text is required';
  }

  if (!validateRequired(data.source_type)) {
    errors.source_type = 'Source type is required';
  }

  if (!validateRequired(data.status)) {
    errors.status = 'Status is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate prompt form
 */
export function validatePromptForm(data: {
  name?: string;
  prompt_text?: string;
  model?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.name)) {
    errors.name = 'Prompt name is required';
  }

  if (!validateRequired(data.prompt_text)) {
    errors.prompt_text = 'Prompt text is required';
  }

  if (data.prompt_text && data.prompt_text.length < 10) {
    errors.prompt_text = 'Prompt text must be at least 10 characters';
  }

  if (!validateRequired(data.model)) {
    errors.model = 'Model selection is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
