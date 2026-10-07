// SentinelX AI - Restricted Access Banking Authentication Form

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, Shield, UserCheck, ArrowRight, AlertCircle, Cpu } from 'lucide-react';
import DeviceTrust from './DeviceTrust';
import AuthenticationAnalysis from './AuthenticationAnalysis';
import { RiskAssessmentResult } from '../../types/security';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [employeeId, setEmployeeId] = useState<string>('BOI-SEC-1042');
  const [password, setPassword] = useState<string>('SentinelX#2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [trustManagedDevice, setTrustManagedDevice] = useState<boolean>(true);
  const [scenarioPreset, setScenarioPreset] = useState<'auto' | 'low' | 'medium' | 'high' | 'critical'>('auto');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [riskEvaluation, setRiskEvaluation] = useState<RiskAssessmentResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!employeeId.trim() || !password.trim()) {
      setErrorMessage('Please enter both your authorized Employee ID and secure password.');
      return;
    }

    try {
      const response = await login({
        employeeId,
        password,
        trustManagedDevice,
        scenarioPreset,
      });

      setRiskEvaluation(response.riskResult);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify employee credentials.');
    }
  };

  const handleRiskProceed = () => {
    if (!riskEvaluation) return;

    if (riskEvaluation.isBlocked) {
      setRiskEvaluation(null);
      setErrorMessage('Authentication attempt was blocked by SentinelX Trust Engine. Incident logged.');
      return;
    }

    if (riskEvaluation.requiresMFA) {
      navigate('/mfa');
    } else {
      navigate('/');
    }
  };

  if (riskEvaluation) {
    return (
      <AuthenticationAnalysis
        result={riskEvaluation}
        onProceed={handleRiskProceed}
        onCancel={() => setRiskEvaluation(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-cyber-card/90 border border-cyber-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl font-mono">
      {/* Top Security Icon Header */}
      <div className="flex items-center justify-between mb-6 border-b border-cyber-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyber-accent/10 border border-cyber-accent/40 flex items-center justify-center text-cyber-accent shadow-lg">
            <Lock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-cyber-teal uppercase tracking-widest">
              RESTRICTED SYSTEM ACCESS
            </h3>
            <p className="text-[10px] text-gray-500 uppercase">
              Authorized Personnel Only
            </p>
          </div>
        </div>

        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/40 font-bold">
          FIPS 140-3
        </span>
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-100 uppercase tracking-tight">
          RESTRICTED ACCESS
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Authenticate using your authorized bank employee credentials.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-600 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Field 1: Employee ID */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Employee ID
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <UserCheck className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter Employee ID (e.g. BOI-SEC-1042)"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border text-gray-100 placeholder-gray-600 text-xs focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent transition-all"
            />
          </div>
        </div>

        {/* Field 2: Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-cyber-teal hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
              required
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-cyber-bg border border-cyber-border text-gray-100 placeholder-gray-600 text-xs focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Device Trust Option */}
        <DeviceTrust checked={trustManagedDevice} onChange={setTrustManagedDevice} />

        {/* Demo Mode Risk Scenario Selector */}
        <div className="p-3 rounded-xl bg-cyber-bg/70 border border-cyber-border/40 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
            <Cpu className="h-3 w-3 text-cyber-accent" />
            <span>Prototype Demo Risk Selector</span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-[10px]">
            {(['auto', 'low', 'medium', 'high', 'critical'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setScenarioPreset(mode)}
                className={`py-1 rounded border capitalize transition-all ${
                  scenarioPreset === mode
                    ? 'bg-cyber-accent text-white border-cyber-accent font-bold'
                    : 'bg-cyber-cardLight/50 text-gray-400 border-cyber-border/40 hover:text-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyber-accent/20 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>VERIFYING CREDENTIALS...</span>
            </div>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              <span>SECURE SIGN IN</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Notice */}
      <div className="mt-6 border-t border-cyber-border/40 pt-4 text-center text-[10px] text-gray-500">
        Protected by SentinelX Adaptive Trust Engine. Unauthorized access attempts are monitored and logged.
      </div>
    </div>
  );
};

export default LoginForm;
