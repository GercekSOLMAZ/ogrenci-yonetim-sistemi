export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;

export const isBlank = (value: string) => value.trim().length === 0;

export const minLength = (value: string, min: number) => value.trim().length >= min;

export const maxLength = (value: string, max: number) => value.trim().length <= max;

export const isValidEmail = (value: string) => emailRegex.test(value.trim());

export const isValidPhone = (value: string) => {
  const trimmed = value.trim();
  if (!phoneRegex.test(trimmed)) return false;
  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly.length >= 9 && digitsOnly.length <= 12;
};

export const isFutureDate = (dateStr: string) => {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return false;
  const input = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return input > today;
};

export const isValidCourseCode = (value: string) => /^[A-Z0-9-]{2,20}$/.test(value.trim());
