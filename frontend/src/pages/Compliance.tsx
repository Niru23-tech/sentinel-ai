import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Download, AlertTriangle, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

type ComplianceStatus = 'Compliant' | 'Warning' | 'NonCompliant' | 'Pending';

interface ComplianceItem {
  id: string;
  regulation: string;
  category: string;
  requirement: string;
  status: ComplianceStatus;
  detail: string;
  lastAudit: string;
  nextAudit: string;
}

const COMPLIANCE_DATA: ComplianceItem[] = [
  // RBI
  { id: 'rbi-1', regulation: 'RBI IT Framework', category: 'Incident Response', requirement: 'Respond to cyber incidents within 6 hours', status: 'Compliant', detail: 'Average incident response time: 3.2 min (autonomous)', lastAudit: '2024-06-01', nextAudit: '2025-06-01' },
  { id: 'rbi-2', regulation: 'RBI IT Framework', category: 'Audit Trail',        requirement: 'Maintain complete audit logs for all actions',  status: 'Compliant', detail: 'All 100% analyst and system actions are logged with timestamp + actor', lastAudit: '2024-06-01', nextAudit: '2025-06-01' },
  { id: 'rbi-3', regulation: 'RBI IT Framework', category: 'Data Retention',     requirement: 'Retain logs and reports for 5 years',             status: 'Compliant', detail: 'All logs retained in cold storage for 5-year rolling window', lastAudit: '2024-06-01', nextAudit: '2025-06-01' },
  { id: 'rbi-4', regulation: 'RBI IT Framework', category: 'Penetration Testing', requirement: 'Annual VAPT by certified agency',                 status: 'Warning',   detail: 'Last VAPT: 14 months ago. Schedule overdue — schedule new test.', lastAudit: '2023-05-10', nextAudit: '2024-05-10' },
  { id: 'rbi-5', regulation: 'RBI IT Framework', category: 'Vendor Risk',        requirement: 'Third-party vendor risk assessments',              status: 'Pending',   detail: 'Vendor risk questionnaire sent to 3 vendors. Awaiting 2 responses.', lastAudit: '2024-03-01', nextAudit: '2024-09-01' },
  // PCI-DSS
  { id: 'pci-1', regulation: 'PCI-DSS v4.0', category: 'Access Control',      requirement: 'Restrict access to cardholder data by business need', status: 'Compliant', detail: 'Role-based access control (RBAC) enforced. 0 unauthorized access events.', lastAudit: '2024-04-15', nextAudit: '2025-04-15' },
  { id: 'pci-2', regulation: 'PCI-DSS v4.0', category: 'Encryption',          requirement: 'Encrypt transmission of cardholder data across networks', status: 'Compliant', detail: 'TLS 1.3 enforced for all API endpoints. HSTS enabled.', lastAudit: '2024-04-15', nextAudit: '2025-04-15' },
  { id: 'pci-3', regulation: 'PCI-DSS v4.0', category: 'Vulnerability Mgmt',  requirement: 'Use and update anti-virus software',                  status: 'NonCompliant', detail: 'EDR agent not deployed on 3 endpoint machines. Action required.', lastAudit: '2024-04-15', nextAudit: '2024-10-15' },
  { id: 'pci-4', regulation: 'PCI-DSS v4.0', category: 'Monitoring',          requirement: 'Track and monitor all access to network resources',   status: 'Compliant', detail: 'SentinelAI telemetry covers 100% of monitored account sessions.', lastAudit: '2024-04-15', nextAudit: '2025-04-15' },
  // CERT-In
  { id: 'cert-1', regulation: 'CERT-In 2022',  category: 'Incident Reporting',  requirement: 'Report incidents to CERT-In within 6 hours',         status: 'Compliant', detail: 'Auto-report pipeline active. Last report filed: 09:25 today.', lastAudit: '2024-05-20', nextAudit: '2025-05-20' },
  // DPDP
  { id: 'dpdp-1', regulation: 'DPDP Act 2023',  category: 'Data Privacy',       requirement: 'Customer consent for personal data processing',       status: 'Warning',   detail: 'Consent logs present but UI consent flow update pending v2.1.', lastAudit: '2024-07-01', nextAudit: '2025-01-01' },
  { id: 'dpdp-2', regulation: 'DPDP Act 2023',  category: 'Data Breach Notify', requirement: 'Notify Data Protection Board of breaches within 72h', status: 'Compliant', detail: 'Automated breach notification pipeline tested and operational.', lastAudit: '2024-07-01', nextAudit: '2025-01-01' },
];

const STATUS_CFG: Record<ComplianceStatus, { label: string; color: string; icon: React.ReactNode; badge: string }> = {
  Compliant:    { label: 'Compliant',     color: 'text-cyber-green',  icon: <CheckCircle className="h-3.5 w-3.5" />, badge: 'bg-green-950/50 border-green-900/60 text-cyber-green'  },
  Warning:      { label: 'Warning',       color: 'text-cyber-amber',  icon: <AlertTriangle className="h-3.5 w-3.5" />, badge: 'bg-amber-950/50 border-amber-900/60 text-cyber-amber' },
  NonCompliant: { label: 'Non-Compliant', color: 'text-cyber-red',    icon: <XCircle className="h-3.5 w-3.5" />, badge: 'bg-red-950/50 border-red-900/60 text-cyber-red'           },
  Pending:      { label: 'Pending',       color: 'text-gray-400',     icon: <Clock className="h-3.5 w-3.5" />,    badge: 'bg-cyber-cardLight/50 border-cyber-border/60 text-gray-400' },
};

const REGULATIONS = ['All', 'RBI IT Framework', 'PCI-DSS v4.0', 'CERT-In 2022', 'DPDP Act 2023'];

const Compliance: React.FC = () => {
  const { incidents } = useSentinel();
  const [filter,      setFilter]      = useState('All');
  const [downloading, setDownloading] = useState(false);
  const [dlDone,      setDlDone]      = useState(false);

  const filteredItems = filter === 'All' ? COMPLIANCE_DATA : COMPLIANCE_DATA.filter(c => c.regulation === filter);

  const compliantCount    = COMPLIANCE_DATA.filter(c => c.status === 'Compliant').length;
  const warningCount      = COMPLIANCE_DATA.filter(c => c.status === 'Warning').length;
  const nonCompliantCount = COMPLIANCE_DATA.filter(c => c.status === 'NonCompliant').length;
  const pendingCount      = COMPLIANCE_DATA.filter(c => c.status === 'Pending').length;
  const overallScore      = Math.round((compliantCount / COMPLIANCE_DATA.length) * 100);

  const handleDownloadReport = async () => {
    setDownloading(true);
    await new Promise(r => setTimeout(r, 1200));

    const lines = [
      'SENTINELAI — COMPLIANCE AUDIT REPORT',
      `Generated: ${new Date().toLocaleString()}`,
      `Overall Score: ${overallScore}%`,
      '',
      'REQUIREMENT,REGULATION,CATEGORY,STATUS,DETAIL,LAST AUDIT,NEXT AUDIT',
      ...COMPLIANCE_DATA.map(c =>
        `"${c.requirement}","${c.regulation}","${c.category}","${c.status}","${c.detail}","${c.lastAudit}","${c.nextAudit}"`
      )
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sentinelai-compliance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloading(false);
    setDlDone(true);
    setTimeout(() => setDlDone(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="cyber-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
            <svg viewBox="0 0 80 80" className="rotate-[-90deg]">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1e3040" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none"
                stroke={overallScore >= 80 ? '#00ff88' : overallScore >= 60 ? '#ffaa00' : '#ff3e3e'}
                strokeWidth="8"
                strokeDasharray={`${(overallScore / 100) * 201} 201`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-extrabold font-mono ${overallScore >= 80 ? 'text-cyber-green' : overallScore >= 60 ? 'text-cyber-amber' : 'text-cyber-red'}`}>
                {overallScore}%
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-200 font-mono">RBI & PCI-DSS Compliance Score</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{compliantCount} of {COMPLIANCE_DATA.length} requirements met</p>
            <p className="text-[10px] font-mono text-gray-500 mt-1">Next mandatory audit: <span className="text-cyber-amber">2025-04-15</span></p>
          </div>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
            dlDone      ? 'bg-green-950/30 border-cyber-green/40 text-cyber-green' :
            downloading ? 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-accent animate-pulse' :
            'bg-cyber-blue/20 border-cyber-blue/40 text-cyber-accent hover:bg-cyber-blue/30'
          }`}
        >
          {dlDone ? <><CheckCircle className="h-3.5 w-3.5" /> Downloaded!</> :
           downloading ? <><div className="h-3 w-3 border border-cyber-accent border-t-transparent rounded-full animate-spin" /> Generating…</> :
           <><Download className="h-3.5 w-3.5" /> Export Compliance Report</>}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Compliant',     value: compliantCount,    color: 'text-cyber-green'  },
          { label: 'Warnings',      value: warningCount,      color: 'text-cyber-amber'  },
          { label: 'Non-Compliant', value: nonCompliantCount, color: 'text-cyber-red'    },
          { label: 'Pending',       value: pendingCount,      color: 'text-gray-400'     },
        ].map(s => (
          <div key={s.label} className="cyber-card text-center">
            <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Regulation filter */}
      <div className="flex gap-2 flex-wrap">
        {REGULATIONS.map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
              filter === r
                ? 'bg-cyber-blue/20 border-cyber-accent/50 text-cyber-accent'
                : 'border-cyber-border/50 text-gray-500 hover:text-gray-300'
            }`}
          >{r}</button>
        ))}
      </div>

      {/* Checklist table */}
      <div className="space-y-3">
        {filteredItems.map((item, i) => {
          const cfg = STATUS_CFG[item.status];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="cyber-card border border-cyber-border/60"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyber-cardLight/60 border border-cyber-border/60 text-gray-400">
                      {item.regulation}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">{item.category}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-200">{item.requirement}</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.detail}</p>
                  <div className="flex gap-4 mt-1.5 text-[9px] font-mono text-gray-600">
                    <span>Last audit: {item.lastAudit}</span>
                    <span>Next: <span className={item.status === 'NonCompliant' ? 'text-cyber-red' : 'text-gray-500'}>{item.nextAudit}</span></span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold shrink-0 ${cfg.badge}`}>
                  {cfg.icon}
                  <span>{cfg.label}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Compliance;
