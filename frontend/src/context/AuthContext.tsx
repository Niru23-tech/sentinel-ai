// SentinelX AI - AuthContext Provider & Global Security State Management

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authService,
  LoginResponse,
} from '../services/authService';
import { UserProfile, LoginCredentials } from '../types/auth';
import { RiskAssessmentResult, SecurityAuditEvent } from '../types/security';
import { getAuthToken } from '../services/apiClient';

interface MFAPendingSession {
  mfaSessionId: string;
  user: UserProfile;
  riskResult: RiskAssessmentResult;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaPendingSession: MFAPendingSession | null;
  lastRiskResult: RiskAssessmentResult | null;
  securityLogs: SecurityAuditEvent[];
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  verifyMFA: (otpCode: string) => Promise<void>;
  cancelMFAPending: () => void;
  logout: () => Promise<void>;
  refreshSecurityLogs: () => Promise<void>;
}

const DEFAULT_USER: UserProfile = {
  id: 'USR-88210',
  employeeId: 'BOI-SEC-1042',
  name: 'SARAH JENKINS',
  email: 'sarah.jenkins@sentinelx.bank',
  role: 'SOC_ANALYST',
  department: 'SOC Cyber Threat Intelligence Unit',
  clearanceLevel: 'LEVEL 4 - RESTRICTED BANKING CLEARANCE',
  lastLogin: new Date().toISOString(),
  isManagedDeviceTrusted: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const token = getAuthToken();
    return token ? DEFAULT_USER : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mfaPendingSession, setMfaPendingSession] = useState<MFAPendingSession | null>(null);
  const [lastRiskResult, setLastRiskResult] = useState<RiskAssessmentResult | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditEvent[]>([]);

  useEffect(() => {
    refreshSecurityLogs();
  }, []);

  const refreshSecurityLogs = async () => {
    try {
      const logs = await authService.getSecurityActivity();
      setSecurityLogs(logs);
    } catch (err) {
      console.error('Failed to fetch security logs:', err);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      setLastRiskResult(result.riskResult);

      if (result.isBlocked) {
        setIsLoading(false);
        await refreshSecurityLogs();
        return result;
      }

      if (result.requiresMFA && result.mfaSessionId && result.user) {
        setMfaPendingSession({
          mfaSessionId: result.mfaSessionId,
          user: result.user,
          riskResult: result.riskResult,
        });
        setIsLoading(false);
        return result;
      }

      if (result.user) {
        setUser(result.user);
      } else {
        setUser(DEFAULT_USER);
      }

      setIsLoading(false);
      await refreshSecurityLogs();
      return result;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const verifyMFA = async (otpCode: string): Promise<void> => {
    if (!mfaPendingSession) {
      throw new Error('No pending MFA session found. Please sign in again.');
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyMFA(
        mfaPendingSession.mfaSessionId,
        otpCode,
        mfaPendingSession.user
      );

      setUser(response.user);
      setMfaPendingSession(null);
      setIsLoading(false);
      await refreshSecurityLogs();
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const cancelMFAPending = () => {
    setMfaPendingSession(null);
    setLastRiskResult(null);
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setMfaPendingSession(null);
      setLastRiskResult(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        mfaPendingSession,
        lastRiskResult,
        securityLogs,
        login,
        verifyMFA,
        cancelMFAPending,
        logout,
        refreshSecurityLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
