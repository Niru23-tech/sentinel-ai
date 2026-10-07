// SentinelX AI - Multi-Step Secure Password Recovery Component

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ArrowLeft, Check, X, ShieldAlert, KeyRound, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [emailOrEmpId, setEmailOrEmpId] = useState<string>('sarah.jenkins@sentinelx.bank');
  const [otpCode, setOtpCode] = useState<string>('749201');
  const [resetToken, setResetToken] = useState<string>('');

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Strength Checklist
  const passwordChecks = {
    length: newPassword.length >= 12,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const checkCount = Object.values(passwordChecks).filter(Boolean).length;
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const getStrengthLabel = () => {
    if (checkCount <= 2) return { label: 'WEAK', color: 'bg-rose-600 text-rose-300' };
    if (checkCount <= 4) return { label: 'MEDIUM', color: 'bg-amber-600 text-amber-300' };
    if (checkCount === 5) return { label: 'STRONG', color: 'bg-emerald-600 text-emerald-300' };
    return { label: 'ENTERPRISE GRADE', color: 'bg-cyber-teal text-black font-bold' };
  };

  // Step 1: Submit Email / Emp ID
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!emailOrEmpId.trim()) {
      setErrorMessage('Please enter your registered email or Employee ID.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.requestForgotPassword(emailOrEmpId);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch recovery request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authService.verifyForgotPasswordOTP(emailOrEmpId, otpCode);
      setResetToken(res.resetToken);
      setStep(3);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid recovery code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!isPasswordValid) {
      setErrorMessage('Password does not meet all security requirements.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-cyber-card/90 border border-cyber-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-4 mb-6">
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </Link>
        <span className="text-[10px] font-mono text-cyber-teal bg-cyber-teal/10 px-2 py-0.5 rounded border border-cyber-teal/30">
          RECOVERY MODE
        </span>
      </div>

      {/* Progress Indicators */}
      {step <= 3 && (
        <div className="flex items-center justify-between gap-2 mb-6 font-mono text-[10px]">
          {['Identity', 'OTP Verify', 'New Password'].map((title, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={title} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`h-2 w-full rounded-full transition-all ${
                    isDone
                      ? 'bg-cyber-teal'
                      : isActive
                      ? 'bg-cyber-accent animate-pulse'
                      : 'bg-cyber-bg border border-cyber-border/40'
                  }`}
                />
                <span className={isActive ? 'text-gray-100 font-bold' : 'text-gray-500'}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-600 text-rose-300 text-xs font-mono flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: Enter Email / ID */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleStep1Submit}
            className="space-y-4"
          >
            <div className="text-left">
              <h3 className="text-xl font-mono font-bold text-gray-100 uppercase tracking-tight">
                Reset Password
              </h3>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Enter your registered corporate email address or Employee ID to receive a verification OTP.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Registered Email or Employee ID
              </label>
              <input
                type="text"
                value={emailOrEmpId}
                onChange={(e) => setEmailOrEmpId(e.target.value)}
                placeholder="e.g. sarah.jenkins@sentinelx.bank or EMP-9021-SEC"
                required
                className="w-full px-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border text-gray-100 text-xs font-mono focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {isLoading ? 'Dispatching OTP...' : 'Send Recovery OTP'}
            </button>
          </motion.form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleStep2Submit}
            className="space-y-4"
          >
            <div className="text-left">
              <h3 className="text-xl font-mono font-bold text-gray-100 uppercase tracking-tight">
                Enter Recovery Code
              </h3>
              <p className="text-xs font-mono text-gray-400 mt-1">
                We sent a 6-digit OTP code to <span className="text-cyber-teal font-bold">{emailOrEmpId}</span>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                6-Digit Recovery OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="749201"
                required
                className="w-full px-4 py-3 text-center text-lg tracking-widest rounded-xl bg-cyber-bg border border-cyber-border text-gray-100 font-mono focus:outline-none focus:border-cyber-accent"
              />
              <p className="text-[10px] font-mono text-gray-500 mt-1">Demo helper code: 749201</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP Code'}
            </button>
          </motion.form>
        )}

        {/* STEP 3: Create New Password */}
        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleStep3Submit}
            className="space-y-4"
          >
            <div className="text-left">
              <h3 className="text-xl font-mono font-bold text-gray-100 uppercase tracking-tight">
                Create New Password
              </h3>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Password must meet strict enterprise banking security standards.
              </p>
            </div>

            {/* Field: New Password */}
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 12 characters"
                  required
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-cyber-bg border border-cyber-border text-gray-100 text-xs font-mono focus:outline-none focus:border-cyber-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Field: Confirm Password */}
            <div>
              <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full px-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border text-gray-100 text-xs font-mono focus:outline-none focus:border-cyber-accent"
              />
            </div>

            {/* Strength Meter Bar */}
            <div className="p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-gray-400">Security Grade:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${getStrengthLabel().color}`}>
                  {getStrengthLabel().label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-cyber-cardLight rounded-full overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-full transition-all ${
                      i <= checkCount ? 'bg-cyber-accent' : 'bg-cyber-border/20'
                    }`}
                  />
                ))}
              </div>

              {/* Requirements Checklist */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] font-mono">
                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {passwordChecks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>12+ Characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.uppercase ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {passwordChecks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.lowercase ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {passwordChecks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.number ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {passwordChecks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.special ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {passwordChecks.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Special (!@#$)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordChecks.match ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {passwordChecks.match ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>Passwords Match</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full py-3.5 px-6 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Updating Password...' : 'Reset & Update Password'}
            </button>
          </motion.form>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-4"
          >
            <div className="h-16 w-16 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-mono font-bold text-gray-100 uppercase">
              Password Reset Complete
            </h3>

            <p className="text-xs font-mono text-gray-300 leading-relaxed max-w-xs mx-auto">
              Your password has been successfully updated. All active sessions have been invalidated across all devices for your security.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-6 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Return to Secure Login</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPasswordForm;
