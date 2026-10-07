// SentinelX AI - Adaptive Risk Scoring & Device Trust Engine

import { RiskAssessmentResult } from '../types/security';

export interface RiskInputContext {
  employeeId: string;
  trustManagedDevice?: boolean;
  scenarioPreset?: 'auto' | 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  location?: string;
}

export const evaluateLoginRisk = async (
  context: RiskInputContext
): Promise<RiskAssessmentResult> => {
  // Simulate security context analysis computation (400ms)
  await new Promise((resolve) => setTimeout(resolve, 400));

  const preset = context.scenarioPreset || 'auto';
  const employeeId = context.employeeId.toUpperCase().trim();

  // Helper for generating incident IDs
  const incidentId = `SEC-AUTH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  if (preset === 'low') {
    return {
      score: 18,
      category: 'LOW',
      title: 'LOW RISK — Identity Verified',
      subtitle: 'Employee identity and security context verified for corporate workspace access.',
      requiresMFA: false,
      isBlocked: false,
      reasons: [
        'Recognized bank-managed workstation hardware fingerprint',
        'Corporate VPN connection (New York Banking Operations Center)',
        'Zero failed password attempts recorded in past 24 hours',
      ],
      factors: [
        { name: 'Device Trust', status: 'pass', weight: 5, description: 'Matched approved bank-managed device signature' },
        { name: 'IP Reputation', status: 'pass', weight: 0, description: 'Internal corporate banking network node' },
        { name: 'Behavioral Velocity', status: 'pass', weight: 3, description: 'Normal shift access pattern (10:30 AM)' },
        { name: 'Threat Intelligence', status: 'pass', weight: 0, description: 'Clean C2 telemetry blacklist score' },
      ],
      verificationSteps: [
        { id: '1', label: 'Verifying employee credentials', status: 'completed' },
        { id: '2', label: 'Checking employee account status', status: 'completed' },
        { id: '3', label: 'Verifying authorized department', status: 'completed' },
        { id: '4', label: 'Analyzing managed device status', status: 'completed' },
        { id: '5', label: 'Evaluating authentication behavior', status: 'completed' },
        { id: '6', label: 'Checking security risk indicators', status: 'completed' },
      ],
    };
  }

  if (preset === 'medium') {
    return {
      score: 45,
      category: 'MEDIUM',
      title: 'ADDITIONAL VERIFICATION REQUIRED',
      subtitle: 'Additional identity verification is required for this access attempt.',
      requiresMFA: true,
      isBlocked: false,
      reasons: [
        'First time login from browser user-agent signature',
        'Login attempt outside typical shift hours (11:45 PM)',
        'Off-network Wi-Fi access point detected',
      ],
      factors: [
        { name: 'Device Trust', status: 'warn', weight: 20, description: 'New browser session signature' },
        { name: 'IP Reputation', status: 'pass', weight: 5, description: 'Commercial broadband ISP node' },
        { name: 'Behavioral Velocity', status: 'warn', weight: 15, description: 'Off-hours access attempt' },
        { name: 'Threat Intelligence', status: 'pass', weight: 0, description: 'Zero active threats detected' },
      ],
      verificationSteps: [
        { id: '1', label: 'Verifying employee credentials', status: 'completed' },
        { id: '2', label: 'Checking employee account status', status: 'completed' },
        { id: '3', label: 'Verifying authorized department', status: 'completed' },
        { id: '4', label: 'Analyzing managed device status', status: 'flagged' },
        { id: '5', label: 'Evaluating authentication behavior', status: 'completed' },
        { id: '6', label: 'Checking security risk indicators', status: 'completed' },
      ],
    };
  }

  if (preset === 'high') {
    return {
      score: 72,
      category: 'HIGH',
      title: 'UNUSUAL ACCESS PATTERN DETECTED',
      subtitle: 'Multiple risk factors detected. MFA verification and secondary security approval required.',
      requiresMFA: true,
      isBlocked: false,
      reasons: [
        'New device detected',
        'Unusual login time',
        'Multiple failed authentication attempts (3 attempts in 5 mins)',
        'VPN / Data-Center relay IP node detected',
      ],
      factors: [
        { name: 'Device Trust', status: 'fail', weight: 30, description: 'Unregistered personal laptop' },
        { name: 'IP Reputation', status: 'warn', weight: 20, description: 'Commercial proxy IP node' },
        { name: 'Behavioral Velocity', status: 'fail', weight: 22, description: 'Velocity mismatch (Delhi → London in 15 mins)' },
        { name: 'Threat Intelligence', status: 'warn', weight: 10, description: 'Elevated threat proxy score' },
      ],
      verificationSteps: [
        { id: '1', label: 'Verifying employee credentials', status: 'completed' },
        { id: '2', label: 'Checking employee account status', status: 'flagged' },
        { id: '3', label: 'Verifying authorized department', status: 'completed' },
        { id: '4', label: 'Analyzing managed device status', status: 'flagged' },
        { id: '5', label: 'Evaluating authentication behavior', status: 'flagged' },
        { id: '6', label: 'Checking security risk indicators', status: 'completed' },
      ],
    };
  }

  if (preset === 'critical') {
    return {
      score: 95,
      category: 'CRITICAL',
      title: 'ACCESS BLOCKED',
      subtitle: 'This authentication attempt has been blocked to protect the banking security environment.',
      requiresMFA: false,
      isBlocked: true,
      incidentId,
      reasons: [
        'Tor Exit Node IP address detected',
        'Known banking malware / credential-stuffing signature',
        'Employee account state set to Temporarily Locked',
        '10+ brute-force login attempts detected',
      ],
      factors: [
        { name: 'Device Trust', status: 'fail', weight: 35, description: 'Spoofed hardware headers & rooted signature' },
        { name: 'IP Reputation', status: 'fail', weight: 30, description: 'Tor Anonymizing Exit Node' },
        { name: 'Behavioral Velocity', status: 'fail', weight: 25, description: 'Automated botnet attack signature' },
        { name: 'Threat Intelligence', status: 'fail', weight: 10, description: 'Matched active C2 malware blacklist' },
      ],
      verificationSteps: [
        { id: '1', label: 'Verifying employee credentials', status: 'completed' },
        { id: '2', label: 'Checking employee account status', status: 'flagged' },
        { id: '3', label: 'Verifying authorized department', status: 'flagged' },
        { id: '4', label: 'Analyzing managed device status', status: 'flagged' },
        { id: '5', label: 'Evaluating authentication behavior', status: 'flagged' },
        { id: '6', label: 'Checking security risk indicators', status: 'flagged' },
      ],
    };
  }

  // Automatic determination if auto mode
  if (employeeId.includes('CRITICAL') || employeeId.includes('ADM-9999')) {
    return evaluateLoginRisk({ ...context, scenarioPreset: 'critical' });
  } else if (employeeId.includes('HIGH') || employeeId.includes('VPN')) {
    return evaluateLoginRisk({ ...context, scenarioPreset: 'high' });
  } else if (employeeId.includes('MEDIUM') || employeeId.includes('NEW')) {
    return evaluateLoginRisk({ ...context, scenarioPreset: 'medium' });
  } else {
    return evaluateLoginRisk({ ...context, scenarioPreset: 'low' });
  }
};
