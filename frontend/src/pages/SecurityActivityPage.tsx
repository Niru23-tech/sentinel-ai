// SentinelX AI - Dedicated Security Activity Audit Page

import React from 'react';
import SecurityActivity from '../components/auth/SecurityActivity';

export const SecurityActivityPage: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <SecurityActivity />
    </div>
  );
};

export default SecurityActivityPage;
