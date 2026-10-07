// SentinelX AI - Security Activity Audit Monitoring Component

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RiskBadge from '../ui/RiskBadge';
import { ShieldCheck, ShieldAlert, Monitor, MapPin, Search, Download, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const SecurityActivity: React.FC = () => {
  const { securityLogs, refreshSecurityLogs } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Allowed' | 'Blocked' | 'Step-Up Required'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSecurityLogs();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredLogs = securityLogs.filter((log) => {
    const matchesSearch =
      log.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="bg-cyber-card border border-cyber-border/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-teal font-bold uppercase mb-1">
            <ShieldCheck className="h-4 w-4 text-cyber-teal" />
            <span>Audit Trail & Security Monitoring</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-gray-100 uppercase tracking-tight">
            Recent Security Activity
          </h2>
          <p className="text-xs font-mono text-gray-400 mt-0.5">
            Real-time audit log of all authentication requests, MFA challenges, and risk enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border/60 text-gray-300 hover:text-white hover:border-cyber-accent transition-colors flex items-center gap-1.5 text-xs font-mono"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-cyber-accent hover:bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Audit Dossier</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cyber-card/60 border border-cyber-border/40 p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by IP, device, location..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-cyber-bg border border-cyber-border/60 text-xs font-mono text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyber-accent"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 text-[11px] font-mono w-full sm:w-auto overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-gray-500 mr-1 hidden sm:block" />
          {(['ALL', 'Allowed', 'Blocked', 'Step-Up Required'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                statusFilter === filter
                  ? 'bg-cyber-accent text-white border-cyber-accent font-bold'
                  : 'bg-cyber-bg text-gray-400 border-cyber-border/40 hover:text-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Security Activity List Table */}
      <div className="bg-cyber-card border border-cyber-border/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-cyber-cardLight/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-cyber-border/60">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Device & Browser</th>
                <th className="py-3 px-4">IP Address & Location</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/30">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No security activity records match the selected query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-cyber-cardLight/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-gray-400 font-bold whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* Event Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-gray-100">{log.eventType}</span>
                    </td>

                    {/* Device & Browser */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-3.5 w-3.5 text-cyber-teal shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-200 font-medium truncate">{log.device}</p>
                          <p className="text-[10px] text-gray-500 truncate">{log.browser}</p>
                        </div>
                      </div>
                    </td>

                    {/* IP & Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-cyber-accent shrink-0" />
                        <div className="min-w-0">
                          <p className="text-gray-200 truncate">{log.location}</p>
                          <p className="text-[10px] text-cyber-teal truncate">{log.ipAddress}</p>
                        </div>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <RiskBadge category={log.riskCategory} score={log.riskScore} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          log.status === 'Allowed'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                            : log.status === 'Blocked'
                            ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                            : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityActivity;
