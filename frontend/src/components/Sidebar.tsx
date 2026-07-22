import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Activity, 
  Wallet, 
  Cpu, 
  FileText, 
  Settings as SettingsIcon,
  RefreshCw,
  AlertTriangle,
  X,
  CheckCircle,
  Map,
  Zap
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { resetSimulation, activeCustomer } = useSentinel();

  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting,   setResetting]   = useState(false);
  const [resetDone,   setResetDone]   = useState(false);

  const menuItems = [
    { name: 'Dashboard',        path: '/',             icon: LayoutDashboard },
    { name: 'Security Monitor', path: '/logs',         icon: Activity        },
    { name: 'Transactions',     path: '/transactions', icon: Wallet          },
    { name: 'AI Analysis',      path: '/analysis',     icon: Cpu             },
    { name: 'Incident Report',  path: '/reports',      icon: FileText        },
    { name: 'Threat Map',       path: '/threat-map',   icon: Map             },
    { name: 'Playbooks',        path: '/playbooks',    icon: Zap             },
    { name: 'AI Settings',      path: '/settings',     icon: SettingsIcon    },
  ];

  const handleConfirmReset = async () => {
    setShowConfirm(false);
    setResetting(true);
    try {
      await resetSimulation();
      setResetDone(true);
      setTimeout(() => { setResetDone(false); navigate('/'); }, 1800);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <aside className="w-64 bg-cyber-card border-r border-cyber-border/80 flex flex-col z-20 shrink-0">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-cyber-border/80 gap-3">
          <Shield className="h-7 w-7 text-cyber-accent animate-pulse-cyan" />
          <div>
            <h1 className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyber-accent to-cyber-blue">
              SENTINEL<span className="text-gray-100">AI</span>
            </h1>
            <p className="text-[9px] text-gray-500 font-mono tracking-tight -mt-1 uppercase">Cyber Defense Center</p>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group gap-3
                ${isActive 
                  ? 'bg-cyber-blue/15 text-cyber-accent border-l-2 border-cyber-accent shadow-glow-blue' 
                  : 'text-gray-400 hover:bg-cyber-cardLight/50 hover:text-gray-200'}
              `}
            >
              <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* SOC Info & Reset */}
        <div className="p-4 border-t border-cyber-border/80 bg-cyber-bg/30">
          {activeCustomer && (
            <div className="px-3 py-2 rounded-lg bg-cyber-cardLight/30 border border-cyber-border/50 mb-3">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Monitored Client</p>
              <p className="text-xs font-semibold text-gray-300 truncate">{activeCustomer.name}</p>
              <p className="text-[10px] text-gray-400 font-mono">{activeCustomer.account_number}</p>
            </div>
          )}
          
          <button
            onClick={() => !resetting && setShowConfirm(true)}
            disabled={resetting}
            className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-medium border transition-all gap-2 font-mono ${
              resetDone
                ? 'text-cyber-green border-cyber-green/40 bg-green-950/20'
                : 'text-cyber-accent hover:bg-cyber-accent/10 border-cyber-accent/20 hover:border-cyber-accent/40'
            }`}
          >
            {resetDone ? (
              <>
                <CheckCircle className="h-3 w-3" />
                <span>Reset Complete</span>
              </>
            ) : resetting ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Resetting…</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                <span>Reset Simulation</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Confirmation Modal (portal-style, fixed) ──────── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cyber-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="bg-cyber-card border border-cyber-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-cyber-amber" />
                  <h3 className="text-sm font-bold text-gray-200 font-mono">Reset Simulation?</h3>
                </div>
                <button onClick={() => setShowConfirm(false)} className="text-gray-500 hover:text-gray-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">
                This will flush all incident logs, clear all attack telemetry, and restore all 10 customer profiles to their secured baseline state. The dashboard will reload automatically.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-mono border border-cyber-border text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-2 rounded-lg text-xs font-mono bg-cyber-amber/20 border border-cyber-amber/40 text-cyber-amber hover:bg-cyber-amber/30 transition-colors font-semibold"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
