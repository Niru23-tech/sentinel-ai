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
  ShieldOff
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { 
    customers, 
    activeCustomer, 
    selectCustomer, 
    incidents, 
    moneySaved, 
    activeIncidentsCount,
    updateIncidentStatus,
    fetchData
  } = useSentinel();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch]               = useState(false);
  const [searchQuery, setSearchQuery]             = useState('');
  const [resolvingId, setResolvingId]             = useState<number | null>(null);

  const searchPanelRef  = useRef<HTMLDivElement>(null);
  const notifPanelRef   = useRef<HTMLDivElement>(null);
  const searchInputRef  = useRef<HTMLInputElement>(null);

  // Focus input when panel opens
  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 50);
    else setSearchQuery('');
  }, [showSearch]);

  // Close panels on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
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
      case '/':               return 'SentinelAI Operations Terminal';
      case '/logs':           return 'Live Cyber Security Monitor';
      case '/transactions':   return 'Banking Transaction Simulator';
      case '/analysis':       return 'AI Correlation & Behavior Analysis';
      case '/reports':        return 'Incident Report Ledger';
      case '/settings':       return 'Risk Engine Configuration';
      case '/threat-map':     return 'Global Threat Intelligence Map';
      case '/playbooks':      return 'Automated Security Playbooks';
      case '/alerts':         return 'Customer Alert & OTP Center';
      case '/risk-explainer': return 'Explainable AI — Risk Score Breakdown';
      case '/dark-web':       return 'Dark Web Credential Monitor';
      case '/compliance':     return 'RBI & PCI-DSS Compliance Dashboard';
      default:              return 'SentinelAI Security Platform';
    }
  };

  const criticalAlarms = incidents.filter(i => i.status !== 'Resolved');

  /** Click notification row → navigate to AI Analysis pre-selected */
  const handleNotifClick = (incidentId: number) => {
    setShowNotifications(false);
    navigate(`/analysis?incident=${incidentId}`);
  };

  /** Resolve threat directly from notification panel */
  const handleResolve = async (e: React.MouseEvent, incidentId: number) => {
    e.stopPropagation(); // don't trigger row navigation
    setResolvingId(incidentId);
    try {
      await updateIncidentStatus(incidentId, 'Resolved');
      await fetchData();
    } finally {
      setResolvingId(null);
    }
  };

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

        {/* ── Client Search ──────────────────────────────────── */}
        <div className="relative" ref={searchPanelRef}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-cardLight/50 border border-cyber-border/80 text-xs text-gray-300">
            <span className="text-gray-500 font-mono">Target Client:</span>
            <span className="text-cyber-accent font-semibold max-w-[110px] truncate">
              {activeCustomer?.name || 'Select Client'}
            </span>
            <button
              onClick={() => setShowSearch(prev => !prev)}
              className="ml-1 p-1 rounded hover:bg-cyber-blue/20 text-gray-400 hover:text-cyber-accent transition-colors"
              title="Search client"
            >
              {showSearch ? <X className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showSearch && (
            <div className="absolute right-0 mt-2 w-64 bg-cyber-card border border-cyber-border rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-cyber-cardLight/80 border-b border-cyber-border/80">
                <Search className="h-3.5 w-3.5 text-cyber-accent shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search client name or account…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-gray-200 placeholder-gray-600 outline-none font-mono"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-gray-300">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-cyber-border/40">
                {filteredCustomers.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[11px] text-gray-500 font-mono">
                    No clients match "{searchQuery}"
                  </div>
                ) : (
                  filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { selectCustomer(c.id); setShowSearch(false); }}
                      className={`w-full text-left px-3 py-2.5 hover:bg-cyber-blue/15 hover:text-cyber-accent transition-colors flex items-center justify-between ${
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
                  ))
                )}
              </div>
              <div className="px-3 py-1.5 bg-cyber-cardLight/40 border-t border-cyber-border/60 text-[9px] font-mono text-gray-600">
                {filteredCustomers.length} of {customers.length} clients
              </div>
            </div>
          )}
        </div>

        {/* Money Protected */}
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

        {/* ── Notifications ──────────────────────────────────── */}
        <div className="relative" ref={notifPanelRef}>
          <button 
            onClick={() => setShowNotifications(prev => !prev)}
            className="p-1.5 rounded-lg bg-cyber-cardLight/40 hover:bg-cyber-cardLight/80 text-gray-300 transition-colors border border-cyber-border/60 relative"
          >
            <Bell className="h-4 w-4" />
            {activeIncidentsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cyber-red text-[9px] font-bold flex items-center justify-center text-white animate-bounce">
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
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-96 bg-cyber-card border border-cyber-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {/* Header bar */}
                <div className="px-4 py-2.5 bg-cyber-cardLight/80 border-b border-cyber-border/80 flex justify-between items-center">
                  <span className="font-semibold text-gray-200 text-sm">Threat Alerts</span>
                  <div className="flex items-center gap-3">
                    {activeIncidentsCount > 0 && (
                      <span className="text-[10px] font-mono text-cyber-red font-bold animate-pulse">
                        {activeIncidentsCount} Critical
                      </span>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-cyber-border/40">
                  {criticalAlarms.length === 0 ? (
                    <div className="p-6 flex flex-col items-center gap-2 text-center">
                      <CheckCircle className="h-8 w-8 text-cyber-green" />
                      <p className="text-xs text-gray-400">All threats resolved. System secure.</p>
                    </div>
                  ) : (
                    criticalAlarms.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n.id)}
                        className="p-3 hover:bg-cyber-cardLight/40 transition-colors cursor-pointer group bg-cyber-red/5"
                      >
                        <div className="flex gap-3 items-start">
                          {/* Icon */}
                          <div className="h-8 w-8 rounded-full bg-red-950/60 border border-cyber-red/50 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="h-4 w-4 text-cyber-red" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-gray-100 truncate">{n.threat_type} Detected</p>
                              <ArrowRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-cyber-accent transition-colors shrink-0" />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Customer: <span className="text-gray-300">{n.customer?.name || `ID #${n.customer_id}`}</span>
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/50 text-cyber-red border border-red-900/50">
                                Risk {n.risk_score}%
                              </span>
                              <span className="text-[9px] font-mono text-cyber-green">
                                ₹{n.money_protected.toLocaleString()} protected
                              </span>
                              <span className="text-[9px] text-gray-600 font-mono ml-auto">
                                {new Date(n.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Resolve button */}
                        <div className="mt-2.5 flex justify-end">
                          <button
                            onClick={(e) => handleResolve(e, n.id)}
                            disabled={resolvingId === n.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-semibold bg-green-950/30 border border-green-900/50 text-cyber-green hover:bg-green-950/60 transition-colors disabled:opacity-50"
                          >
                            {resolvingId === n.id ? (
                              <div className="h-2.5 w-2.5 border border-cyber-green border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <ShieldOff className="h-3 w-3" />
                            )}
                            {resolvingId === n.id ? 'Resolving…' : 'Resolve Threat'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-cyber-cardLight/40 border-t border-cyber-border/60 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-gray-600">Click alert to open AI forensics</span>
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/analysis'); }}
                    className="text-[10px] font-mono text-cyber-accent hover:underline"
                  >
                    View All →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
