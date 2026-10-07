// SentinelX AI - Professional Risk Score Gauge Component

import React from 'react';
import { RiskLevel } from '../../types/security';

interface RiskScoreProps {
  score: number;
  category: RiskLevel;
  type?: 'circular' | 'horizontal';
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  category,
  type = 'horizontal',
}) => {
  const getColor = () => {
    switch (category) {
      case 'LOW':
        return { text: 'text-emerald-400', stroke: '#10B981', bg: 'bg-emerald-500' };
      case 'MEDIUM':
        return { text: 'text-amber-400', stroke: '#F59E0B', bg: 'bg-amber-500' };
      case 'HIGH':
        return { text: 'text-orange-400', stroke: '#F97316', bg: 'bg-orange-500' };
      case 'CRITICAL':
        return { text: 'text-rose-400', stroke: '#E11D48', bg: 'bg-rose-600' };
    }
  };

  const color = getColor();

  if (type === 'circular') {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#161926"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center font-mono">
          <span className={`text-xl font-bold ${color.text}`}>{score}</span>
          <span className="text-[9px] text-gray-400 uppercase font-medium">/ 100</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5 font-mono">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 uppercase tracking-wider">AUTHENTICATION RISK SCORE</span>
        <span className={`font-bold ${color.text}`}>
          {score} / 100 <span className="text-[10px] font-normal">({category})</span>
        </span>
      </div>
      <div className="h-2 w-full bg-cyber-bg rounded-full overflow-hidden border border-cyber-border/40">
        <div
          className={`h-full transition-all duration-500 ${color.bg}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};

export default RiskScore;
