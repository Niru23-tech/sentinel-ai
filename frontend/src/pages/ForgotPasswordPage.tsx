// SentinelX AI - Password Recovery Page

import React from 'react';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 flex items-center justify-center p-4 relative overflow-hidden scanline">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 relative">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
