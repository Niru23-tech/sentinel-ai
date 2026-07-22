import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, ShieldAlert, Eye, RefreshCw, ExternalLink, X } from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

type BreachStatus = 'Safe' | 'AtRisk' | 'Compromised';

interface BreachRecord {
  source: string;
  date: string;
  dataExposed: string[];
  severity: 'High' | 'Medium' | 'Low';
}

interface ScanResult {
  customerId: number;
  customerName: string;
  accountNumber: string;
  email: string;
  status: BreachStatus;
  breaches: BreachRecord[];
  lastScanned: string;
  riskBoost: number;
}

const MOCK_BREACHES: Record<number, ScanResult> = {
  1: {
    customerId: 1, customerName: 'Arjun Sharma', accountNumber: 'ACC-100001',
    email: 'arjun.sharma@email.com', status: 'Compromised',
    breaches: [
      { source: 'LinkedIn Data Breach 2021',  date: '2021-06',  dataExposed: ['Email', 'Password Hash', 'Phone'],       severity: 'High'   },
      { source: 'Paytm Data Leak 2023',        date: '2023-02',  dataExposed: ['Email', 'UPI ID', 'Mobile'],             severity: 'High'   },
    ],
    lastScanned: '09:30:00', riskBoost: 20,
  },
  2: {
    customerId: 2, customerName: 'Priya Patel', accountNumber: 'ACC-100002',
    email: 'priya.patel@email.com', status: 'AtRisk',
    breaches: [
      { source: 'Canva Breach 2019',           date: '2019-05',  dataExposed: ['Email', 'Username'],                     severity: 'Medium' },
    ],
    lastScanned: '09:30:01', riskBoost: 10,
  },
  3: {
    customerId: 3, customerName: 'Rahul Verma',  accountNumber: 'ACC-100003',
    email: 'rahul.verma@email.com', status: 'Safe',
    breaches: [], lastScanned: '09:30:02', riskBoost: 0,
  },
  4: {
    customerId: 4, customerName: 'Sneha Iyer',   accountNumber: 'ACC-100004',
    email: 'sneha.iyer@email.com', status: 'Compromised',
    breaches: [
      { source: 'Facebook Breach 2019',        date: '2019-04',  dataExposed: ['Phone', 'Email', 'Facebook ID'],         severity: 'High'   },
      { source: 'Adobe Breach 2013',           date: '2013-10',  dataExposed: ['Email', 'Password Hash', 'Credit Card'], severity: 'High'   },
      { source: 'Dominos India Leak 2021',     date: '2021-05',  dataExposed: ['Name', 'Phone', 'Address', 'Email'],     severity: 'Medium' },
    ],
    lastScanned: '09:30:03', riskBoost: 30,
  },
  5: {
    customerId: 5, customerName: 'Vikram Nair',  accountNumber: 'ACC-100005',
    email: 'vikram.nair@email.com', status: 'AtRisk',
    breaches: [
      { source: 'Zomato Breach 2017',          date: '2017-05',  dataExposed: ['Email', 'Password Hash'],                severity: 'Medium' },
    ],
    lastScanned: '09:30:04', riskBoost: 8,
  },
};

const STATUS_CONFIG: Record<BreachStatus, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  Safe:        { label: 'Safe',        color: 'text-cyber-green',  icon: <CheckCircle className="h-5 w-5" />, bg: 'bg-green-950/30 border-cyber-green/30' },
  AtRisk:      { label: 'At Risk',     color: 'text-cyber-amber',  icon: <AlertTriangle className="h-5 w-5" />, bg: 'bg-amber-950/30 border-cyber-amber/30' },
  Compromised: { label: 'Compromised', color: 'text-cyber-red',    icon: <ShieldAlert className="h-5 w-5" />, bg: 'bg-red-950/30 border-cyber-red/30' },
};

const DarkWeb: React.FC = () => {
  const { customers } = useSentinel();
  const [scanning,        setScanning]        = useState(false);
  const [scanned,         setScanned]         = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [batchResults,    setBatchResults]    = useState<ScanResult[]>([]);
  const [expandedId,      setExpandedId]      = useState<number | null>(null);

  const handleBatchScan = async () => {
    setScanning(true);
    setBatchResults([]);
    // Reveal results one by one
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 500));
      setBatchResults(prev => [...prev, MOCK_BREACHES[i + 1]]);
    }
    setScanning(false);
    setScanned(true);
  };

  const selectedResult = selectedCustomer ? MOCK_BREACHES[selectedCustomer] : null;
  const compromisedCount = batchResults.filter(r => r.status === 'Compromised').length;
  const atRiskCount = batchResults.filter(r => r.status === 'AtRisk').length;

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="cyber-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-200 font-mono flex items-center gap-2">
            <Eye className="h-4 w-4 text-cyber-accent" /> Dark Web Credential Monitor
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">
            Scans known breach databases (Have I Been Pwned, LeakCheck, DeHashed) for customer credentials.
          </p>
        </div>
        <button
          onClick={handleBatchScan}
          disabled={scanning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
            scanning
              ? 'bg-cyber-accent/10 border-cyber-accent/30 text-cyber-accent animate-pulse'
              : 'bg-cyber-blue/20 border-cyber-blue/40 text-cyber-accent hover:bg-cyber-blue/30'
          }`}
        >
          {scanning
            ? <><div className="h-3 w-3 border border-cyber-accent border-t-transparent rounded-full animate-spin" /> Scanning Dark Web…</>
            : <><Search className="h-3.5 w-3.5" /> Run Batch Scan (All Customers)</>
          }
        </button>
      </div>

      {/* Summary stats */}
      {scanned && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: 'Customers Scanned',  value: batchResults.length,  color: 'text-cyber-accent' },
            { label: 'Compromised',        value: compromisedCount,       color: 'text-cyber-red'    },
            { label: 'At Risk',            value: atRiskCount,            color: 'text-cyber-amber'  },
            { label: 'Safe',               value: batchResults.filter(r => r.status === 'Safe').length, color: 'text-cyber-green' },
          ].map(s => (
            <div key={s.label} className="cyber-card text-center">
              <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer scan list */}
        <div className="cyber-card">
          <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Customer Breach Status</h4>
          {!scanned && !scanning && (
            <div className="text-center py-12 text-xs text-gray-500 font-mono">
              [RUN SCAN TO REVEAL BREACH STATUS]
            </div>
          )}
          <div className="space-y-2">
            <AnimatePresence>
              {batchResults.map((result, i) => {
                const cfg = STATUS_CONFIG[result.status];
                return (
                  <motion.div
                    key={result.customerId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <button
                      onClick={() => setSelectedCustomer(result.customerId === selectedCustomer ? null : result.customerId)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedCustomer === result.customerId
                          ? `${cfg.bg} border-opacity-80`
                          : 'bg-cyber-cardLight/20 border-cyber-border/40 hover:border-cyber-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-200">{result.customerName}</p>
                          <p className="text-[10px] font-mono text-gray-500">{result.accountNumber}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-mono font-bold ${cfg.color}`}>
                          {cfg.icon}
                          <span>{cfg.label}</span>
                        </div>
                      </div>
                      {result.status !== 'Safe' && (
                        <p className="text-[9px] font-mono text-gray-600 mt-1">
                          {result.breaches.length} breach{result.breaches.length > 1 ? 'es' : ''} found · +{result.riskBoost} risk pts
                        </p>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {!selectedResult ? (
            <div className="cyber-card h-full flex items-center justify-center text-xs text-gray-500 font-mono min-h-[200px]">
              [SELECT A CUSTOMER TO VIEW BREACH DETAILS]
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Customer header */}
              <div className={`cyber-card border-l-4 ${
                selectedResult.status === 'Compromised' ? 'border-l-cyber-red' :
                selectedResult.status === 'AtRisk' ? 'border-l-cyber-amber' : 'border-l-cyber-green'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">{selectedResult.customerName}</h4>
                    <p className="text-[11px] font-mono text-gray-400">{selectedResult.email} · {selectedResult.accountNumber}</p>
                    <p className="text-[10px] text-gray-600 font-mono mt-1">Last scanned: {selectedResult.lastScanned}</p>
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-bold font-mono ${STATUS_CONFIG[selectedResult.status].color}`}>
                    {STATUS_CONFIG[selectedResult.status].icon}
                    {STATUS_CONFIG[selectedResult.status].label}
                  </div>
                </div>
                {selectedResult.riskBoost > 0 && (
                  <div className="mt-3 p-2 bg-red-950/20 border border-red-900/40 rounded-lg text-[10px] font-mono text-cyber-red">
                    ⚠ Risk score increased by +{selectedResult.riskBoost} pts due to dark web exposure. Recommend forced password reset.
                  </div>
                )}
              </div>

              {/* Breach records */}
              {selectedResult.breaches.length === 0 ? (
                <div className="cyber-card text-center py-8">
                  <CheckCircle className="h-10 w-10 text-cyber-green mx-auto mb-2" />
                  <p className="text-sm font-bold text-cyber-green font-mono">No Breaches Found</p>
                  <p className="text-xs text-gray-400 mt-1">This customer's credentials are not in any known breach database.</p>
                </div>
              ) : (
                selectedResult.breaches.map((breach, i) => (
                  <div key={i} className="cyber-card border border-cyber-border/60">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-bold text-gray-200">{breach.source}</p>
                        <p className="text-[10px] text-gray-500 font-mono">Breach Date: {breach.date}</p>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                        breach.severity === 'High'   ? 'bg-red-950/50 text-cyber-red border-red-900/60' :
                        breach.severity === 'Medium' ? 'bg-amber-950/50 text-cyber-amber border-amber-900/60' :
                        'bg-green-950/50 text-cyber-green border-green-900/60'
                      }`}>{breach.severity}</span>
                    </div>
                    <p className="text-[10px] font-mono text-gray-500 mb-1">DATA EXPOSED:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {breach.dataExposed.map(d => (
                        <span key={d} className="text-[9px] font-mono px-2 py-0.5 bg-cyber-bg border border-cyber-border/60 rounded text-gray-300">{d}</span>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-cyber-border/40">
                      <p className="text-[10px] font-mono text-cyber-amber">Recommended Action: Force password reset + send OTP verification to customer.</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DarkWeb;
