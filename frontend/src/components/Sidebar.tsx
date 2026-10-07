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
  Zap,
  Bell,
  BrainCircuit,
  Eye,
  ClipboardCheck,
  Network,
  Briefcase,
  Target,
  Bot,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { resetSimulation, activeCustomer } = useSentinel();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const menuItems = [
    { name: 'SOC Mission Control',  path: '/',               icon: LayoutDashboard },
    { name: 'Analyst Workbench',    path: '/soc',            icon: Briefcase       },
    { name: 'Pre-Auth Audit',       path: '/transactions',   icon: Wallet          },
    { name: 'Multi-Agent Forensics',path: '/agents',         icon: Bot             },
    { name: 'Security Telemetry',   path: '/logs',           icon: Activity        },
    { name: 'AI Threat Forensics',  path: '/analysis',       icon: Cpu             },
    { name: 'Incident Reports',     path: '/reports',        icon: FileText        },
    { name: 'Explainable AI (XAI)', path: '/risk-explainer', icon: BrainCircuit    },
    { name: 'Threat Map',           path: '/threat-map',     icon: Map             },
    { name: 'Automated Playbooks',  path: '/playbooks',      icon: Zap             },
    { name: 'RBI & PCI Compliance', path: '/compliance',     icon: ClipboardCheck  },
    { name: 'Customer Alerts',      path: '/alerts',         icon: Bell            },
    { name: 'Risk Rules & APIs',    path: '/settings',       icon: SettingsIcon    },
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
      <motion.aside
        animate={{ width: collapsed ? 76 : 250 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-[#0E0F17] border-r border-white/10 flex flex-col z-30 shrink-0 h-screen sticky top-0 font-mono"
      >
        {/* Brand Logo & Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-[#E11D48]/20 border border-[#E11D48]/50 flex items-center justify-center shrink-0 shadow-glow-red">
              <Shield className="h-4 w-4 text-[#E11D48]" />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="font-bold text-sm tracking-wider text-slate-100 flex items-center gap-1">
                  SENTINEL<span className="text-[#E11D48]">X</span>
                </h1>
                <p className="text-[8px] text-[#E11D48] tracking-widest uppercase font-bold">MILITARY SOC AI</p>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(prev => !prev)}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#E11D48] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Menu List */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-[#E11D48]/20 text-[#E11D48] border border-[#E11D48]/50 shadow-glow-red font-bold' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}
              `}
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#E11D48]' : 'text-slate-400'}`} />
                  {!collapsed && (
                    <span className="ml-2.5 truncate text-[11px]">
                      {item.name}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 w-1 h-5 rounded-l-full bg-[#E11D48] shadow-glow-red"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Monitored Client Card & Reset Button */}
        <div className="p-3 border-t border-white/10 bg-black/40 shrink-0">
          {!collapsed && activeCustomer && (
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 mb-2 font-mono text-[10px]">
              <p className="text-[8px] text-[#E11D48] uppercase tracking-widest font-bold">TARGET CLIENT</p>
              <p className="font-bold text-slate-200 truncate mt-0.5">{activeCustomer.name}</p>
              <p className="text-[9px] text-slate-400">{activeCustomer.account_number}</p>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={`w-full py-2 px-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-[#E11D48]/40 hover:bg-[#E11D48]/10 transition-colors flex items-center gap-2.5 text-xs font-mono mb-2 ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Sign Out of SentinelX"
          >
            <LogOut className="h-4 w-4 text-[#E11D48] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* Reset Simulation Target */}
          <button
            onClick={() => !resetting && setShowConfirm(true)}
            disabled={resetting}
            className={`w-full py-2 px-3 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2.5 text-xs font-mono ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Reset Simulation"
          >
            {resetDone ? (
              <CheckCircle className="h-4 w-4 text-[#00E5FF] shrink-0" />
            ) : resetting ? (
              <RefreshCw className="h-4 w-4 text-[#E11D48] animate-spin shrink-0" />
            ) : (
              <RefreshCw className="h-4 w-4 text-slate-400 shrink-0" />
            )}
            {!collapsed && <span>{resetDone ? 'Complete' : resetting ? 'Resetting…' : 'Reset Target'}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0E0F17] border border-[#E11D48]/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#E11D48]" />
                  <h3 className="text-sm font-bold text-slate-100">Reset Simulation?</h3>
                </div>
                <button onClick={() => setShowConfirm(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Flushes all active threat telemetry, clears incident logs, and restores all customer profiles to baseline state.
              </p>
              <div className="flex gap-3 pt-2 font-mono">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs border border-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-1.5 rounded-lg text-xs bg-[#E11D48]/20 border border-[#E11D48]/50 text-[#E11D48] font-bold hover:bg-[#E11D48]/30 transition-colors"
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
