import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bell, 
  User as UserIcon, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  ChevronDown, 
  DollarSign 
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { 
    customers, 
    activeCustomer, 
    selectCustomer, 
    incidents, 
    moneySaved, 
    activeIncidentsCount 
  } = useSentinel();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Map path to title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'SentinelAI Operations Terminal';
      case '/logs': return 'Live Cyber Security Monitor';
      case '/transactions': return 'Banking Transaction Simulator';
      case '/analysis': return 'AI Correlation & Behavior Analysis';
      case '/reports': return 'Incident Report Ledger';
      case '/settings': return 'Risk Engine Configuration';
      default: return 'SentinelAI Security Platform';
    }
  };

  const criticalAlarms = incidents.filter(i => i.status !== 'Resolved');

  return (
    <header className="h-16 border-b border-cyber-border/80 bg-cyber-card/70 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0 relative">
      {/* Title */}
      <div>
        <h2 className="text-md font-semibold text-gray-200 tracking-wide font-mono">
          {getPageTitle()}
        </h2>
        <p className="text-[10px] text-gray-500 font-mono hidden md:block">
          COGNITIVE RISK CORRELATION PROTOCOL ACTIVE
        </p>
      </div>

      {/* Action Indicators */}
      <div className="flex items-center gap-6">
        {/* Customer Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-cardLight/50 border border-cyber-border/80 text-xs text-gray-300 hover:bg-cyber-cardLight/80 transition-colors"
          >
            <span className="text-gray-500 font-mono">Target Client:</span>
            <span className="text-cyber-accent font-semibold">{activeCustomer?.name || 'Select Client'}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {showCustomerDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-cyber-card border border-cyber-border rounded-xl shadow-2xl overflow-hidden z-50 text-sm">
              <div className="px-3 py-2 bg-cyber-cardLight/80 border-b border-cyber-border/80 text-[10px] font-mono text-gray-500 uppercase">
                Select Client Account
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-cyber-border/40">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      selectCustomer(c.id);
                      setShowCustomerDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-cyber-blue/15 hover:text-cyber-accent transition-colors flex items-center justify-between ${
                      activeCustomer?.id === c.id ? 'bg-cyber-blue/10 text-cyber-accent font-semibold' : 'text-gray-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs">{c.name}</p>
                      <p className="text-[9px] font-mono text-gray-500">{c.account_number}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      c.risk_score >= 80 ? 'bg-red-950/50 text-cyber-red border border-red-900/60' :
                      c.risk_score >= 50 ? 'bg-amber-950/50 text-cyber-amber border border-amber-900/60' :
                      'bg-green-950/50 text-cyber-green border border-green-900/60'
                    }`}>
                      {c.risk_score}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Money Protected Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-950/20 border border-green-900/40 text-xs text-cyber-green font-mono">
          <DollarSign className="h-3.5 w-3.5" />
          <span>Money Protected:</span>
          <span className="font-bold">₹{moneySaved.toLocaleString()}</span>
        </div>

        {/* System Health */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-cyber-green">
          <ShieldCheck className="h-4 w-4" />
          <span className="font-mono">SYS-DEFENSE: ACTIVE</span>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg bg-cyber-cardLight/40 hover:bg-cyber-cardLight/80 text-gray-300 transition-colors border border-cyber-border/60 relative"
          >
            <Bell className="h-4 w-4" />
            {activeIncidentsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cyber-red text-[9px] font-bold flex items-center justify-center text-white animate-bounce">
                {activeIncidentsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-cyber-card border border-cyber-border rounded-xl shadow-2xl overflow-hidden z-50 text-sm">
              <div className="px-4 py-2.5 bg-cyber-cardLight/80 border-b border-cyber-border/80 flex justify-between items-center">
                <span className="font-semibold text-gray-200">Threat Alerts</span>
                <span className="text-[10px] font-mono text-cyber-red font-bold animate-pulse-cyan">{activeIncidentsCount} Critical</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-cyber-border/40">
                {criticalAlarms.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-xs">No active account takover threats.</div>
                ) : (
                  criticalAlarms.map(n => (
                    <div key={n.id} className="p-3 hover:bg-cyber-cardLight/30 transition-colors bg-cyber-red/5">
                      <div className="flex gap-2 items-start">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-cyber-red" />
                        <div>
                          <p className="text-xs font-semibold text-gray-200">{n.threat_type} Triggered</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Risk Score: {n.risk_score} | Protected: ₹{n.money_protected}</p>
                          <span className="text-[9px] text-gray-500 font-mono mt-1 block">{new Date(n.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 border-l border-cyber-border/60 pl-6">
          <div className="h-8 w-8 rounded-full bg-cyber-blue/20 border border-cyber-blue/50 flex items-center justify-center text-cyber-accent">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-gray-200">Analyst Terminal</p>
            <p className="text-[9px] text-gray-500 font-mono uppercase">Operator #883</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
