// SentinelX AI - Step-Up MFA Verification Page

import React from 'react';
import { useNavigate } from 'react-router-dom';
import OTPVerification from '../components/auth/OTPVerification';

export const MFAPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 flex items-center justify-center p-4 relative overflow-hidden scanline">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 relative">
        <OTPVerification
          onSuccess={() => navigate('/')}
          onBack={() => navigate('/login')}
        />
      </div>
    </div>
  );
};

export default MFAPage;
