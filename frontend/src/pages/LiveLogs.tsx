import React, { useState } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { 
  Activity, 
  Search, 
  ShieldCheck, 
  AlertOctagon, 
  Filter, 
  Smartphone, 
  Globe, 
  Lock, 
  Key, 
  UserPlus, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveLogs: React.FC = () => {
  const { logs, fetchData } = useSentinel();
  const [searchTerm,       setSearchTerm]       = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [expandedId,       setExpandedId]       = useState<number | null>(null);
  const [refreshing,       setRefreshing]       = useState(false);

  const getLogIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':    return <ShieldCheck  className="h-4 w-4" />;
      case 'smartphone':return <Smartphone   className="h-4 w-4" />;
      case 'globe':     return <Globe        className="h-4 w-4" />;
      case 'lock':      return <Lock         className="h-4 w-4" />;
      case 'key':       return <Key          className="h-4 w-4" />;
      case 'user-plus': return <UserPlus     className="h-4 w-4" />;
      default:          return <Activity     className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-950/50 text-cyber-red border border-red-900/80 animate-pulse';
      case 'High':     return 'bg-amber-950/50 text-cyber-amber border border-amber-900/60';
      case 'Medium':   return 'bg-blue-950/50 text-cyber-blue border border-blue-900/60';
      default:         return 'bg-green-950/50 text-cyber-green border border-green-900/60';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.customer_name && log.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  /** Refresh with animated spinner */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => setRefreshing(false), 600);
  };

  /** Export filtered logs as CSV download */
  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Event Type', 'Severity', 'Customer', 'Description', 'Risk Added'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.event_type}"`,
      l.severity,
      l.customer_name || 'System',
      `"${l.description.replace(/"/g, "'")}"`,
      l.risk_added
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sentinelai-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Search & Filters Bar ────────────────────────────── */}
      <div className="cyber-card flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search security event logs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg pl-10 pr-8 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyber-accent focus:shadow-glow-cyan transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-300">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500 shrink-0 hidden sm:block" />
          <span className="text-xs text-gray-500 font-mono hidden sm:block">SEVERITY:</span>

          {['ALL', 'Critical', 'High', 'Medium', 'Low'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                selectedSeverity === sev
                  ? sev === 'Critical' ? 'bg-red-950/45 text-cyber-red border-cyber-red' :
                    sev === 'High'     ? 'bg-amber-950/45 text-cyber-amber border-cyber-amber' :
                    'bg-cyber-blue/15 text-cyber-accent border-cyber-accent'
                  : 'bg-cyber-cardLight/30 border-cyber-border/80 text-gray-400 hover:text-gray-200'
              }`}
            >
              {sev}
            </button>
          ))}

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            title="Export visible logs as CSV"
            className="p-2 bg-cyber-cardLight/40 hover:bg-cyber-blue/20 border border-cyber-border/80 text-gray-400 hover:text-cyber-accent transition-colors rounded-lg"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh logs"
            className="p-2 bg-cyber-cardLight/40 hover:bg-cyber-cardLight/80 border border-cyber-border/80 text-gray-400 hover:text-cyber-accent transition-colors rounded-lg"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-cyber-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-[11px] font-mono text-gray-500 px-1">
        Showing <span className="text-cyber-accent font-bold">{filteredLogs.length}</span> of {logs.length} events
        {selectedSeverity !== 'ALL' && <span> — filtered by <span className="text-cyber-accent">{selectedSeverity}</span></span>}
      </div>

      {/* ── Timeline Card ───────────────────────────────────── */}
      <div className="cyber-card relative">
        <div className="absolute top-0 bottom-0 left-[26px] sm:left-[34px] w-0.5 bg-cyber-border/50 z-0"></div>

        <div className="space-y-4 relative z-10">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-20 text-xs text-gray-500 font-mono">
              [NO CORRELATED CYBERSECURITY EVENTS MATCHING FILTERS FOUND]
            </div>
          ) : (
            <AnimatePresence>
              {filteredLogs.map((log, index) => {
                const isExpanded = expandedId === log.id;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.4) }}
                    className="flex items-start gap-4 md:gap-6 group"
                  >
                    {/* Timeline icon */}
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      log.severity === 'Critical' ? 'bg-red-950/60 text-cyber-red border-cyber-red shadow-glow-red' :
                      log.severity === 'High'     ? 'bg-amber-950/65 text-cyber-amber border-cyber-amber' :
                      log.severity === 'Medium'   ? 'bg-blue-950/60 text-cyber-blue border-cyber-blue' :
                      'bg-cyber-cardLight/60 text-cyber-green border-cyber-border group-hover:border-cyber-accent group-hover:text-cyber-accent'
                    }`}>
                      {getLogIcon(log.icon)}
                    </div>

                    {/* Log card — click to expand */}
                    <div
                      className={`flex-grow min-w-0 border rounded-xl transition-all duration-300 cursor-pointer ${
                        isExpanded
                          ? 'bg-cyber-cardLight/30 border-cyber-accent/40'
                          : 'bg-cyber-cardLight/20 border-cyber-border/40 hover:border-cyber-accent/20'
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      {/* Summary row */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getSeverityBadge(log.severity)}`}>
                              {log.severity.toUpperCase()}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-200">{log.event_type}</h4>
                            <span className="text-[10px] text-gray-500 font-mono">({log.customer_name || 'System'})</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{log.description}</p>
                        </div>

                        <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0 gap-2 border-t border-cyber-border/30 pt-3 sm:border-0 sm:pt-0">
                          <span className="text-[10px] text-gray-500 font-mono">{log.timestamp}</span>
                          {log.risk_added > 0 ? (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              log.severity === 'Critical' || log.severity === 'High' ? 'bg-red-950 text-cyber-red' : 'bg-amber-950 text-cyber-amber'
                            }`}>
                              +{log.risk_added} Risk
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-gray-600 px-2 py-0.5 rounded bg-cyber-bg/50">
                              +0 Neutral
                            </span>
                          )}
                          {isExpanded
                            ? <ChevronUp className="h-3.5 w-3.5 text-cyber-accent" />
                            : <ChevronDown className="h-3.5 w-3.5 text-gray-500 group-hover:text-gray-300" />
                          }
                        </div>
                      </div>

                      {/* Expanded Detail Panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-cyber-border/40"
                          >
                            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] font-mono">
                              <div>
                                <p className="text-gray-600 uppercase text-[9px] mb-1">Event ID</p>
                                <p className="text-gray-300 font-semibold">EVT-{String(log.id).padStart(5, '0')}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 uppercase text-[9px] mb-1">Customer</p>
                                <p className="text-gray-300 font-semibold">{log.customer_name || '— System Event —'}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 uppercase text-[9px] mb-1">Risk Delta</p>
                                <p className={`font-bold ${log.risk_added > 0 ? 'text-cyber-red' : 'text-cyber-green'}`}>
                                  {log.risk_added > 0 ? `+${log.risk_added}` : '0'} pts
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 uppercase text-[9px] mb-1">Severity</p>
                                <p className={`font-bold ${
                                  log.severity === 'Critical' ? 'text-cyber-red' :
                                  log.severity === 'High'     ? 'text-cyber-amber' :
                                  log.severity === 'Medium'   ? 'text-cyber-blue' :
                                  'text-cyber-green'
                                }`}>{log.severity}</p>
                              </div>
                              <div className="col-span-2 md:col-span-4">
                                <p className="text-gray-600 uppercase text-[9px] mb-1">Full Description</p>
                                <p className="text-gray-300 leading-relaxed">{log.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveLogs;
