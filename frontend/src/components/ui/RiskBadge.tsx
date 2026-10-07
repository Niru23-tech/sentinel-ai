// SentinelX AI - Risk Level & Score Badge Component

import React from 'react';
import { RiskLevelCategory } from '../../services/riskService';
import { ShieldCheck, AlertTriangle, ShieldAlert, XCircle } from 'lucide-react';

interface RiskBadgeProps {
  score?: number;
  category: RiskLevelCategory;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  category,
  showScore = true,
  size = 'md',
}) => {
  const getStyles = () => {
    switch (category) {
      case 'LOW':
        return {
          bg: 'bg-emerald-950/60',
          border: 'border-emerald-500/50',
          text: 'text-emerald-400',
          icon: ShieldCheck,
          label: 'LOW RISK',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/60',
          border: 'border-amber-500/50',
          text: 'text-amber-400',
          icon: AlertTriangle,
          label: 'MEDIUM RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/60',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          icon: ShieldAlert,
          label: 'HIGH RISK',
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-600',
          text: 'text-rose-400 animate-pulse',
          icon: XCircle,
          label: 'CRITICAL RISK',
        };
    }
  };

  const config = getStyles();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-bold',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border font-mono ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]}`}
    >
      <IconComponent className={iconSizes[size]} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="font-bold ml-1 opacity-90">({score}/100)</span>
      )}
    </div>
  );
};

export default RiskBadge;
