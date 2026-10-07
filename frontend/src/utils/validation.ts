// SentinelX AI - Input Validation & Security Formatting Utilities

export interface PasswordStrengthRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  match?: boolean;
}

export const validateEmployeeId = (id: string): boolean => {
  if (!id || id.trim().length < 4) return false;
  // Accepts standard Bank formats like BOI-SEC-1042, EMP-9021, etc. or corporate email
  return /^[A-Z0-9._-]+$/i.test(id.trim());
};

export const checkPasswordComplexity = (
  password: string,
  confirmPassword?: string
): { requirements: PasswordStrengthRequirements; isSatisfied: boolean; score: number } => {
  const requirements: PasswordStrengthRequirements = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    ...(confirmPassword !== undefined ? { match: password.length > 0 && password === confirmPassword } : {}),
  };

  const satisfiedCount = Object.values(requirements).filter(Boolean).length;
  const totalCount = Object.keys(requirements).length;
  const isSatisfied = satisfiedCount === totalCount;

  return {
    requirements,
    isSatisfied,
    score: Math.round((satisfiedCount / totalCount) * 100),
  };
};

export const validateOTPFormat = (otp: string): boolean => {
  return /^\d{6}$/.test(otp.trim());
};
