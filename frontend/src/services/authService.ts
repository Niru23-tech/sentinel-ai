// SentinelX AI - Restricted Banking Authentication & Audit Service

import { apiClient, setAuthToken, clearAuthToken } from './apiClient';
import { evaluateLoginRisk } from './riskService';
import { UserProfile, EmployeeRole, LoginCredentials } from '../types/auth';
import { RiskAssessmentResult, SecurityAuditEvent } from '../types/security';

export interface LoginResponse {
  requiresMFA: boolean;
  isBlocked: boolean;
  mfaSessionId?: string;
  user?: UserProfile;
  token?: string;
  riskResult: RiskAssessmentResult;
}

export interface MFAVerifyResponse {
  success: boolean;
  token: string;
  user: UserProfile;
  message: string;
}

// Security Audit Event Trail
const MOCK_SECURITY_AUDIT_LOGS: SecurityAuditEvent[] = [
  {
    eventId: 'EVT-90821',
    employeeId: 'BOI-SEC-1042',
    eventType: 'Login Success',
    timestamp: '2026-08-24 10:15:12 UTC',
    device: 'Bank-Managed MacBook Pro 16" (Tag #BOI-NY-9021)',
    ipAddress: '198.51.100.42',
    approximateLocation: 'New York, USA (Corporate HQ)',
    riskScore: 18,
    riskLevel: 'LOW',
    status: 'Allowed',
    browser: 'Chrome Enterprise 128.0 (macOS)',
  },
  {
    eventId: 'EVT-90820',
    employeeId: 'BOI-FRD-4401',
    eventType: 'MFA Verification',
    timestamp: '2026-08-24 09:30:44 UTC',
    device: 'Bank Workstation (Tag #BOI-[#FRD-201])',
    ipAddress: '203.0.113.88',
    approximateLocation: 'Chicago, USA (Fraud Ops Center)',
    riskScore: 45,
    riskLevel: 'MEDIUM',
    status: 'Step-Up Required',
    browser: 'Edge Enterprise 127.0',
  },
  {
    eventId: 'EVT-90819',
    employeeId: 'BOI-ADM-0010',
    eventType: 'New Managed Device Approval',
    timestamp: '2026-08-23 16:10:00 UTC',
    device: 'Bank iPad Air 5th Gen (#BOI-ADMIN-IPAD)',
    ipAddress: '198.51.100.42',
    approximateLocation: 'New York, USA (Corporate HQ)',
    riskScore: 22,
    riskLevel: 'LOW',
    status: 'Allowed',
    browser: 'Safari Mobile 17.5',
  },
  {
    eventId: 'EVT-90818',
    employeeId: 'BOI-SEC-9999',
    eventType: 'Suspicious Access Blocked',
    timestamp: '2026-08-22 03:15:00 UTC',
    device: 'Unrecognized Linux Workstation (Tor Node)',
    ipAddress: '185.220.101.5',
    approximateLocation: 'Frankfurt, Germany (Tor Exit Node)',
    riskScore: 95,
    riskLevel: 'CRITICAL',
    status: 'Blocked',
    browser: 'Tor Browser / Headless Script',
  },
];

// Helper to determine role from Employee ID prefix
export const getRoleFromEmployeeId = (employeeId: string): EmployeeRole => {
  const upper = employeeId.toUpperCase().trim();
  if (upper.includes('FRD') || upper.includes('FRAUD')) return 'FRAUD_ANALYST';
  if (upper.includes('ADM') || upper.includes('ADMIN')) return 'SECURITY_ADMIN';
  if (upper.includes('EXEC') || upper.includes('DIRECTOR')) return 'EXECUTIVE';
  return 'SOC_ANALYST';
};

export const authService = {
  // Login with Adaptive Risk Scoring
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { employeeId, password, trustManagedDevice, scenarioPreset = 'auto' } = credentials;

    // 1. Try real FastAPI backend call if available
    const apiRes = await apiClient<{ access_token?: string; token?: string; user?: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ employeeId, email: employeeId, password, trustManagedDevice, scenarioPreset }),
    });

    if (apiRes.success && apiRes.data) {
      const jwtToken = apiRes.data.access_token || apiRes.data.token || `sentinel_token_${Date.now()}`;
      setAuthToken(jwtToken);
      const riskResult = await evaluateLoginRisk({ employeeId, trustManagedDevice, scenarioPreset });
      
      const userRole = getRoleFromEmployeeId(employeeId);
      const dbUser: UserProfile = apiRes.data.user ? {
        id: `USR-${apiRes.data.user.id}`,
        employeeId: employeeId.toUpperCase(),
        name: apiRes.data.user.name,
        email: apiRes.data.user.email,
        role: userRole,
        department: 'SOC Cyber Threat Intelligence Unit',
        clearanceLevel: 'LEVEL 4 - RESTRICTED BANKING CLEARANCE',
        lastLogin: new Date().toISOString(),
        isManagedDeviceTrusted: trustManagedDevice,
      } : {
        id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
        employeeId: employeeId.toUpperCase(),
        name: employeeId.includes('-') ? `OFFICER ${employeeId.toUpperCase()}` : 'CHIEF SOC ANALYST',
        email: `${employeeId.toLowerCase().replace(/[^a-z0-9]/g, '')}@sentinel.ai`,
        role: userRole,
        department: 'SOC Cyber Threat Intelligence Unit',
        clearanceLevel: 'LEVEL 4 - RESTRICTED BANKING CLEARANCE',
        lastLogin: new Date().toISOString(),
        isManagedDeviceTrusted: trustManagedDevice,
      };

      return {
        requiresMFA: riskResult.requiresMFA,
        isBlocked: riskResult.isBlocked,
        token: jwtToken,
        user: dbUser,
        riskResult,
      };
    }

    // 2. Standalone Mock Implementation
    const riskResult = await evaluateLoginRisk({ employeeId, trustManagedDevice, scenarioPreset });
    const userRole = getRoleFromEmployeeId(employeeId);

    const mockUser: UserProfile = {
      id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
      employeeId: employeeId.toUpperCase(),
      name: employeeId.includes('-') ? `OFFICER ${employeeId.toUpperCase()}` : 'SARAH JENKINS',
      email: `${employeeId.toLowerCase().replace(/[^a-z0-9]/g, '')}@sentinelx.bank`,
      role: userRole,
      department:
        userRole === 'FRAUD_ANALYST'
          ? 'Autonomous Fraud Investigation Division'
          : userRole === 'SECURITY_ADMIN'
          ? 'Global Cyber Security & IAM Administration'
          : userRole === 'EXECUTIVE'
          ? 'Executive Risk & Threat Oversight Council'
          : 'SOC Cyber Threat Intelligence Unit',
      clearanceLevel: 'LEVEL 4 - RESTRICTED BANKING CLEARANCE',
      lastLogin: new Date().toISOString(),
      isManagedDeviceTrusted: trustManagedDevice,
    };

    if (riskResult.isBlocked) {
      // Record critical security audit event
      MOCK_SECURITY_AUDIT_LOGS.unshift({
        eventId: `EVT-${Math.floor(10000 + Math.random() * 90000)}`,
        employeeId: employeeId.toUpperCase(),
        eventType: 'Suspicious Access Blocked',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        device: 'Unrecognized Device Signature',
        ipAddress: '185.220.101.5',
        approximateLocation: 'Frankfurt, Germany (Tor Node)',
        riskScore: riskResult.score,
        riskLevel: riskResult.category,
        status: 'Blocked',
        browser: 'Headless Script / Automated Attack',
      });

      return {
        requiresMFA: false,
        isBlocked: true,
        riskResult,
      };
    }

    if (riskResult.requiresMFA) {
      return {
        requiresMFA: true,
        isBlocked: false,
        mfaSessionId: `MFA-SESS-${Date.now()}`,
        user: mockUser,
        riskResult,
      };
    }

    // Low risk: direct login success
    const mockToken = `sentinelx_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    setAuthToken(mockToken);

    MOCK_SECURITY_AUDIT_LOGS.unshift({
      eventId: `EVT-${Math.floor(10000 + Math.random() * 90000)}`,
      employeeId: employeeId.toUpperCase(),
      eventType: 'Login Success',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      device: trustManagedDevice ? 'Bank-Managed Device (#APPROVED)' : 'Bank Workstation',
      ipAddress: '198.51.100.42',
      approximateLocation: 'New York, USA (Corporate HQ)',
      riskScore: riskResult.score,
      riskLevel: riskResult.category,
      status: 'Allowed',
      browser: 'Chrome Enterprise 128.0 (macOS)',
    });

    return {
      requiresMFA: false,
      isBlocked: false,
      token: mockToken,
      user: mockUser,
      riskResult,
    };
  },

  // Verify MFA / OTP Code
  async verifyMFA(mfaSessionId: string, otpCode: string, user: UserProfile): Promise<MFAVerifyResponse> {
    const apiRes = await apiClient<{ token: string; user: UserProfile }>('/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ mfaSessionId, otpCode }),
    });

    if (apiRes.success && apiRes.data) {
      setAuthToken(apiRes.data.token);
      return {
        success: true,
        token: apiRes.data.token,
        user: apiRes.data.user,
        message: 'Multi-factor identity verification confirmed.',
      };
    }

    // Standalone fallback: Accept any 6-digit code or demo 749201
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      throw new Error('Invalid OTP format. Please enter a 6-digit numeric security code.');
    }

    const mockToken = `sentinelx_jwt_mfa_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    setAuthToken(mockToken);

    MOCK_SECURITY_AUDIT_LOGS.unshift({
      eventId: `EVT-${Math.floor(10000 + Math.random() * 90000)}`,
      employeeId: user.employeeId,
      eventType: 'MFA Verification',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      device: 'Bank-Managed Workstation',
      ipAddress: '198.51.100.42',
      approximateLocation: 'New York, USA',
      riskScore: 24,
      riskLevel: 'LOW',
      status: 'Allowed',
      browser: 'Chrome Enterprise 128.0',
    });

    return {
      success: true,
      token: mockToken,
      user,
      message: 'Identity verified via SentinelX Multi-Factor Authentication.',
    };
  },

  // Forgot Password Step 1: Request OTP
  async requestForgotPassword(employeeIdOrEmail: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: `A 6-digit password recovery OTP has been dispatched to the registered contact for ${employeeIdOrEmail}.`,
    };
  },

  // Forgot Password Step 2: Verify Recovery OTP
  async verifyForgotPasswordOTP(employeeIdOrEmail: string, otpCode: string): Promise<{ success: boolean; resetToken: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (otpCode.length !== 6) {
      throw new Error('Invalid recovery code.');
    }
    return {
      success: true,
      resetToken: `RST-TOK-${Date.now()}`,
    };
  },

  // Reset Password Step 3: Complete Password Update
  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    MOCK_SECURITY_AUDIT_LOGS.unshift({
      eventId: `EVT-${Math.floor(10000 + Math.random() * 90000)}`,
      employeeId: 'BOI-SEC-1042',
      eventType: 'Password Reset',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      device: 'Bank-Managed Workstation',
      ipAddress: '198.51.100.42',
      approximateLocation: 'New York, USA',
      riskScore: 10,
      riskLevel: 'LOW',
      status: 'Allowed',
      browser: 'Chrome Enterprise 128.0',
    });

    clearAuthToken();
    return {
      success: true,
      message: 'Password successfully updated. All active sessions have been invalidated.',
    };
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient('/auth/logout', { method: 'POST' }).catch(() => {});
    clearAuthToken();
  },

  // Get Security Audit Activity
  async getSecurityActivity(): Promise<SecurityAuditEvent[]> {
    const apiRes = await apiClient<SecurityAuditEvent[]>('/auth/security-activity');
    if (apiRes.success && apiRes.data) {
      return apiRes.data;
    }
    return MOCK_SECURITY_AUDIT_LOGS;
  },
};
