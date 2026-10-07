// SentinelX AI - Dedicated Security Context Verification Analysis Page

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticationAnalysis from '../components/auth/AuthenticationAnalysis';
import { useAuth } from '../context/AuthContext';

export const AuthenticationAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { lastRiskResult } = useAuth();

  if (!lastRiskResult) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center font-mono">
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-xl bg-cyber-accent text-white text-xs font-bold uppercase"
        >
          Return to Restricted Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 flex items-center justify-center p-4 relative overflow-hidden scanline">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 relative">
        <AuthenticationAnalysis
          result={lastRiskResult}
          onProceed={() => {
            if (lastRiskResult.requiresMFA) {
              navigate('/mfa');
            } else if (!lastRiskResult.isBlocked) {
              navigate('/');
            } else {
              navigate('/login');
            }
          }}
          onCancel={() => navigate('/login')}
        />
      </div>
    </div>
  );
};

export default AuthenticationAnalysisPage;
