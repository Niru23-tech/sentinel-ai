// SentinelX AI - Bank-Managed Device Trust Component

import React from 'react';
import { Laptop, ShieldCheck } from 'lucide-react';

interface DeviceTrustProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const DeviceTrust: React.FC<DeviceTrustProps> = ({ checked, onChange }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
        checked
          ? 'bg-cyber-cardLight/80 border-cyber-accent/60 shadow-sm'
          : 'bg-cyber-bg/60 border-cyber-border/40 hover:border-cyber-border'
      }`}
    >
      <div className="pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-cyber-border bg-cyber-bg text-rose-600 focus:ring-0 h-4 w-4 cursor-pointer accent-rose-600"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-200">
          <Laptop className="h-3.5 w-3.5 text-cyber-teal shrink-0" />
          <span>Trust This Managed Device</span>
          {checked && (
            <span className="ml-auto text-[9px] bg-cyber-teal/20 text-cyber-teal px-1.5 py-0.2 rounded border border-cyber-teal/40 font-bold uppercase">
              APPROVED
            </span>
          )}
        </div>
        <p className="text-[10px] font-mono text-gray-400 mt-0.5 leading-relaxed">
          Only enable this option on a bank-managed and approved device.
        </p>
      </div>
    </div>
  );
};

export default DeviceTrust;
