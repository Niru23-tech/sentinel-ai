// SentinelX AI - Cybersecurity & Risk Assessment Type Definitions

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface VerificationCheckStep {
  id: string;
  label: string;
  status: 'pending' | 'analyzing' | 'completed' | 'flagged';
}

export interface RiskFactor {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  weight: number;
  description: string;
}

export interface RiskAssessmentResult {
  score: number; // 0 to 100
  category: RiskLevel;
  title: string;
  subtitle: string;
  requiresMFA: boolean;
  isBlocked: boolean;
  incidentId?: string;
  reasons: string[];
  factors: RiskFactor[];
  verificationSteps: VerificationCheckStep[];
}

export interface SecurityAuditEvent {
  eventId: string;
  employeeId: string;
  eventType:
    | 'Login Success'
    | 'MFA Verification'
    | 'Password Reset'
    | 'New Managed Device Approval'
    | 'Failed Login Attempt'
    | 'Suspicious Access Blocked';
  timestamp: string;
  device: string;
  ipAddress: string;
  approximateLocation: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: 'Allowed' | 'Step-Up Required' | 'Blocked' | 'Resolved';
  browser: string;
}
