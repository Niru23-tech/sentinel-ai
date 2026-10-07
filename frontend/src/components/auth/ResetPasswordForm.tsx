// SentinelX AI - Direct Token Reset Password Form

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, Check, X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'demo_reset_token';

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordChecks = {
    length: newPassword.length >= 12,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage('Password does not meet all security requirements.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto bg-cyber-card border border-cyber-border/80 rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-mono font-bold text-gray-100 uppercase">
          Password Updated Successfully
        </h3>
        <p className="text-xs font-mono text-gray-300">
          Your credentials have been securely updated. You can now sign in with your new password.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3.5 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-cyber-card/90 border border-cyber-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl"
    >
      <div className="text-left mb-6 border-b border-cyber-border/40 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyber-teal font-bold uppercase mb-2">
          <Lock className="h-4 w-4 text-cyber-teal" />
          <span>SentinelX Token Reset</span>
        </div>
        <h2 className="text-xl font-mono font-bold text-gray-100 uppercase">
          Set New Password
        </h2>
        <p className="text-xs font-mono text-gray-400 mt-1">
          Authorized recovery session token: <span className="text-cyber-accent font-mono">{token.substring(0, 14)}...</span>
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-950/70 border border-rose-600 text-rose-300 text-xs font-mono flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 12 characters"
            required
            className="w-full px-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border text-gray-100 text-xs font-mono focus:outline-none focus:border-cyber-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold text-gray-300 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            required
            className="w-full px-4 py-3 rounded-xl bg-cyber-bg border border-cyber-border text-gray-100 text-xs font-mono focus:outline-none focus:border-cyber-accent"
          />
        </div>

        {/* Requirements */}
        <div className="p-3 rounded-xl bg-cyber-bg/80 border border-cyber-border/40 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-400' : 'text-gray-500'}`}>
            {passwordChecks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>12+ Chars</span>
          </div>
          <div className={`flex items-center gap-1.5 ${passwordChecks.uppercase ? 'text-emerald-400' : 'text-gray-500'}`}>
            {passwordChecks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Uppercase</span>
          </div>
          <div className={`flex items-center gap-1.5 ${passwordChecks.lowercase ? 'text-emerald-400' : 'text-gray-500'}`}>
            {passwordChecks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Lowercase</span>
          </div>
          <div className={`flex items-center gap-1.5 ${passwordChecks.number ? 'text-emerald-400' : 'text-gray-500'}`}>
            {passwordChecks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Number</span>
          </div>
          <div className={`flex items-center gap-1.5 ${passwordChecks.special ? 'text-emerald-400' : 'text-gray-500'}`}>
            {passwordChecks.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Special Symbol</span>
          </div>
          <div className={`flex items-center gap-1.5 ${passwordChecks.match ? 'text-emerald-400' : 'text-gray-500'}`}>
            {passwordChecks.match ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            <span>Matching</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid}
          className="w-full py-3.5 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordForm;
