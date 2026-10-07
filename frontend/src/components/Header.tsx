import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User as UserIcon, 
  AlertTriangle, 
  ShieldCheck, 
  Search,
  X,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ShieldOff,
  Palette,
  Clock,
  Building,
  Activity,
  Globe
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    customers, 
    activeCustomer, 
    selectCustomer, 
    incidents, 
    moneySaved, 
    activeIncidentsCount,
    updateIncidentStatus,
    fetchData,
    currentTheme,
    changeTheme
  } = useSentinel();

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Live UTC Clock
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString().split(' ')[4] + ' UTC');
    }, 1000);
    setUtcTime(new Date().toUTCString().split(' ')[4] + ' UTC');
    return () => clearInterval(timer);
  }, []);

  const searchPanelRef = useRef<HTMLDivElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const themePanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 50);
    else setSearchQuery('');
  }, [showSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (themePanelRef.current && !themePanelRef.current.contains(e.target as Node)) setShowThemeMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.account_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':               return 'SOC Mission Control Dashboard';
      case '/agents':         return 'Multi-AI Agent Security Intelligence';
      case '/cyber-range':    return 'Autonomous Attack Simulator';
      case '/logs':           return 'Live Cyber Security Monitor';
      case '/transactions':   return 'Banking Transaction Engine';
      case '/analysis':       return 'AI Threat Correlation Analysis';
      case '/reports':        return 'Executive Incident Ledger';
      case '/settings':       return 'Risk Engine Configuration';
      case '/threat-map':     return 'Global Cyber Threat Map';
      case '/playbooks':      return 'Automated SOC Playbooks';
      case '/alerts':         return 'Customer OTP & Alert Center';
      case '/risk-explainer': return 'Explainable AI Risk Breakdown';
      case '/dark-web':       return 'Dark Web Intelligence';
      case '/compliance':     return 'RBI & PCI-DSS Compliance Center';
      case '/network':        return 'Money Mule Network Topology';
      case '/soc':            return 'SOC Analyst Command Workbench';
      default:              return 'SentinelX AI Platform';
    }
  };

  const criticalAlarms = incidents.filter(i => i.status !== 'Resolved');
  const systemRiskLevel = activeCustomer?.risk_score || 15;

  const handleResolve = async (e: React.MouseEvent, incidentId: number) => {
    e.stopPropagation();
    setResolvingId(incidentId);
    try {
      await updateIncidentStatus(incidentId, 'Resolved');
      await fetchData();
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <header className="h-16 border-b border-cyber-border bg-[#07070E]/95 backdrop-blur-2xl flex items-center justify-between px-6 z-20 shrink-0 sticky top-0 font-mono">
      
      {/* Bank Identity & Page Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
          <Building className="h-4 w-4 text-cyber-accent" />
          <span className="font-bold text-slate-200">Reserve Sentinel Bank</span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        <div>
          <h2 className="text-xs font-bold text-slate-100 tracking-wide uppercase flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyber-accent animate-pulse" />
            {getPageTitle()}
          </h2>
          <p className="text-[9px] text-slate-400 hidden xl:block">
            TACTICAL STEALTH SOC // REAL-TIME TELEMETRY MATRIX
          </p>
        </div>
      </div>

      {/* Center Live Threat Status Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-lg"
        style={{
          backgroundColor: systemRiskLevel >= 80 ? 'rgba(255, 30, 66, 0.2)' : systemRiskLevel >= 50 ? 'rgba(255, 159, 10, 0.2)' : 'rgba(0, 230, 118, 0.2)',
          borderColor: systemRiskLevel >= 80 ? 'rgba(255, 30, 66, 0.5)' : systemRiskLevel >= 50 ? 'rgba(255, 159, 10, 0.5)' : 'rgba(0, 230, 118, 0.5)',
          color: systemRiskLevel >= 80 ? '#FF1E42' : systemRiskLevel >= 50 ? '#FF9F0A' : '#00E676'
        }}
      >
        <Activity className="h-3.5 w-3.5 animate-pulse" />
        <span>THREAT LEVEL: {systemRiskLevel >= 80 ? 'DEFCON 1 // CRITICAL' : systemRiskLevel >= 50 ? 'DEFCON 2 // ELEVATED' : 'DEFCON 5 // NORMAL'}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Live UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <Clock className="h-3.5 w-3.5 text-cyber-accent" />
          <span>{utcTime || '00:00:00 UTC'}</span>
        </div>

        {/* Client Selector & Search */}
        <div className="relative" ref={searchPanelRef}>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="text-slate-500">Client:</span>
            <span className="text-cyber-accent font-bold max-w-[100px] truncate">
              {activeCustomer?.name || 'Select Client'}
            </span>
            <button
              onClick={() => setShowSearch(prev => !prev)}
              className="ml-1 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-cyber-accent transition-colors"
              title="Search client"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>

          {showSearch && (
            <div className="absolute right-0 mt-2 w-72 bg-[#07070E] border border-cyber-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10 rounded-xl mb-2">
                <Search className="h-3.5 w-3.5 text-cyber-accent shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search client name or account…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none font-mono"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { selectCustomer(c.id); setShowSearch(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      activeCustomer?.id === c.id ? 'bg-cyber-accent/20 text-cyber-accent font-bold border border-cyber-accent/40' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="truncate">
                      <p className="truncate">{c.name}</p>
                      <p className="text-[9px] text-slate-500">{c.account_number}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      c.risk_score >= 80 ? 'bg-cyber-critical/20 text-cyber-critical' : 'bg-cyber-success/20 text-cyber-success'
                    }`}>
                      {c.risk_score}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <div className="relative" ref={themePanelRef}>
          <button
            onClick={() => setShowThemeMenu(prev => !prev)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-cyber-accent transition-colors border border-white/10"
            title="Theme Palette"
          >
            <Palette className="h-4 w-4 text-cyber-accent" />
          </button>

          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="absolute right-0 mt-2 w-64 bg-[#07070E] border border-cyber-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1"
              >
                <div className="px-3 py-2 border-b border-white/10 text-xs font-bold text-slate-200">
                  Select Theme Aesthetic
                </div>
                {[
                  { id: 'tactical-crimson', name: 'Tactical Stealth Crimson', color: '#FF1E42' },
                  { id: 'matrix-emerald', name: 'Matrix Cyberpunk Emerald', color: '#00E676' },
                  { id: 'amber-stealth', name: 'Tactical Amber Warning', color: '#FF9F0A' },
                  { id: 'cyber-void', name: 'Midnight Cyber Void', color: '#00F5FF' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { changeTheme(t.id); setShowThemeMenu(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentTheme === t.id ? 'bg-cyber-accent/20 text-cyber-accent font-bold border border-cyber-accent/40' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                      <span>{t.name}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifPanelRef}>
          <button 
            onClick={() => setShowNotifications(prev => !prev)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10 relative"
          >
            <Bell className="h-4 w-4 text-cyber-accent" />
            {activeIncidentsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cyber-critical text-[9px] font-bold flex items-center justify-center text-white animate-bounce">
                {activeIncidentsCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="absolute right-0 mt-2 w-96 bg-[#07070E] border border-cyber-border rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">Threat Alerts</span>
                  <span className="text-[10px] text-cyber-critical font-bold">{activeIncidentsCount} Active</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {criticalAlarms.map(n => (
                    <div key={n.id} className="p-3 hover:bg-white/5 transition-colors cursor-pointer space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-100">{n.threat_type}</p>
                          <p className="text-[10px] text-slate-400">Target: {n.customer?.name}</p>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-critical/20 text-cyber-critical font-bold">
                          Risk {n.risk_score}%
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleResolve(e, n.id)}
                        disabled={resolvingId === n.id}
                        className="w-full py-1.5 rounded-lg text-[10px] font-bold bg-cyber-success/20 text-cyber-success border border-cyber-success/40 hover:bg-cyber-success/30 transition-colors"
                      >
                        {resolvingId === n.id ? 'Resolving…' : 'Resolve Threat'}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Identity Card & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <button
            onClick={() => navigate('/security-activity')}
            className="flex items-center gap-2 text-left hover:bg-white/5 p-1 rounded-xl transition-colors"
            title="View Security Activity & Audit Logs"
          >
            <div className="h-8 w-8 rounded-xl bg-cyber-accent/20 border border-cyber-accent/40 flex items-center justify-center text-cyber-accent font-bold shrink-0">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-200">{user ? user.name : 'Chief Analyst'}</p>
              <p className="text-[8px] text-cyber-teal font-mono uppercase">{user ? user.employeeId : 'OPERATOR #883'}</p>
            </div>
          </button>

          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 transition-colors ml-1"
            title="Sign Out of SentinelX"
          >
            <ShieldOff className="h-4 w-4 text-cyber-accent" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
