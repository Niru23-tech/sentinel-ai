// SentinelX AI - Restricted Banking Authentication Type Definitions

export type EmployeeRole = 'SOC_ANALYST' | 'FRAUD_ANALYST' | 'SECURITY_ADMIN' | 'EXECUTIVE';

export interface UserProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: EmployeeRole;
  department: string;
  clearanceLevel: string;
  lastLogin: string;
  isManagedDeviceTrusted: boolean;
  avatarUrl?: string;
}

export interface LoginCredentials {
  employeeId: string;
  password: string;
  trustManagedDevice: boolean;
  scenarioPreset?: 'auto' | 'low' | 'medium' | 'high' | 'critical';
}

export interface MFAVerificationPayload {
  mfaSessionId: string;
  otpCode: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: UserProfile;
}
