// SentinelX AI - Live Banking Security System Status Indicators

import React from 'react';
import { Cpu, Lock, Activity, ShieldCheck, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const SecurityStatus: React.FC = () => {
  const indicators = [
    {
      label: 'Threat Intelligence Network',
      statusText: 'ONLINE',
      subtext: 'Global C2 Blacklist Feed v4.2',
      icon: Cpu,
      dotColor: 'bg-emerald-400',
    },
    {
      label: 'Security Event Monitoring',
      statusText: 'ACTIVE',
      subtext: 'Zero Trust Session Scoring',
      icon: Activity,
      dotColor: 'bg-emerald-400',
    },
    {
      label: 'AI Correlation Engine',
      statusText: 'RUNNING',
      subtext: 'Neural Risk Model Active',
      icon: Lock,
      dotColor: 'bg-emerald-400',
    },
    {
      label: 'Adaptive Authentication',
      statusText: 'ENABLED',
      subtext: 'Device Trust & Risk Scoring',
      icon: ShieldCheck,
      dotColor: 'bg-emerald-400',
    },
    {
      label: 'Audit Logging',
      statusText: 'ACTIVE',
      subtext: 'Immutable Security Ledger',
      icon: FileText,
      dotColor: 'bg-emerald-400',
    },
  ];

  return (
    <div className="space-y-2.5 w-full font-mono">
      {indicators.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.25 }}
            className="flex items-center justify-between p-2.5 rounded-xl bg-cyber-card/80 border border-cyber-border/50 hover:border-cyber-accent/40 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-cyber-bg border border-cyber-border/40 text-cyber-teal">
                <IconComponent className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200">{item.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.subtext}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>{item.statusText}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SecurityStatus;
