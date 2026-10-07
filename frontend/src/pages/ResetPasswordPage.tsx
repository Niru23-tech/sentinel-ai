// SentinelX AI - Password Reset Page

import React from 'react';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 flex items-center justify-center p-4 relative overflow-hidden scanline">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 relative">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
