// SentinelX AI - 6-Digit OTP / MFA Verification Component

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowLeft, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface OTPVerificationProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onSuccess,
  onBack,
}) => {
  const { verifyMFA, mfaPendingSession, cancelMFAPending, isLoading } = useAuth();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-focus first input box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your authentication code.');
      return;
    }

    try {
      await verifyMFA(fullCode);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid MFA code. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  const handleFillDemoCode = () => {
    setOtp(['7', '4', '9', '2', '0', '1']);
    inputRefs.current[5]?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-cyber-card/90 border border-cyber-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-4 mb-6">
        <button
          type="button"
          onClick={() => {
            cancelMFAPending();
            if (onBack) onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </button>
        <span className="text-[10px] font-mono text-cyber-teal bg-cyber-teal/10 px-2 py-0.5 rounded border border-cyber-teal/30">
          STEP-UP MFA
        </span>
      </div>

      <div className="text-center mb-6">
        <div className="h-12 w-12 rounded-full bg-cyber-accent/10 border border-cyber-accent/40 flex items-center justify-center text-cyber-accent mx-auto mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-mono font-bold text-gray-100 uppercase tracking-tight">
          Verify Your Identity
        </h3>
        <p className="text-xs font-mono text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
          We detected additional security requirements for this login context.
        </p>

        {mfaPendingSession?.user && (
          <p className="text-[11px] font-mono text-cyber-teal mt-2">
            Target Account: <span className="text-gray-200 font-bold">{mfaPendingSession.user.email}</span>
          </p>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-600 text-rose-300 text-xs font-mono flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Digit Input Boxes */}
        <div className="flex justify-between gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-lg font-mono font-bold text-gray-100 bg-cyber-bg border border-cyber-border rounded-xl focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent transition-all duration-200"
            />
          ))}
        </div>

        {/* Prototype Demo Code Quick Fill Helper */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyber-bg/70 border border-cyber-border/40 text-[11px] font-mono">
          <span className="text-gray-400">Demo OTP Code: <strong className="text-cyber-teal font-mono">749201</strong></span>
          <button
            type="button"
            onClick={handleFillDemoCode}
            className="text-cyber-accent hover:underline text-[10px] uppercase font-bold"
          >
            Auto-Fill
          </button>
        </div>

        {/* Resend & Timer */}
        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
          <span>
            {timer > 0 ? (
              <>Code expires in <strong className="text-cyber-teal font-bold">{timer}s</strong></>
            ) : (
              <span className="text-rose-400 font-bold">Code Expired</span>
            )}
          </span>

          <button
            type="button"
            disabled={!canResend || isResending}
            onClick={handleResendOTP}
            className={`flex items-center gap-1.5 font-bold transition-colors ${
              canResend
                ? 'text-cyber-teal hover:underline cursor-pointer'
                : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Resend OTP</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full py-3.5 px-6 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-cyber-accent/20 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying OTP Code...</span>
            </div>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Verify Identity</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default OTPVerification;
