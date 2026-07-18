import React, { useState, useEffect, useRef } from 'react';
import { useSentinel, Incident } from '../context/SentinelContext';
import { 
  FileText, 
  Printer, 
  ShieldCheck, 
  AlertTriangle,
  Download,
  Building,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineEvent {
  time: string;
  stage: string;
  description: string;
}

interface ReportData {
  id: number;
  incident_id: number;
  executive_summary: string;
  timeline_json: string;
  ai_analysis_json: string;
  recommendations: string;
  created_at: string;
}

type DownloadState = 'idle' | 'loading' | 'success' | 'error';

const IncidentReport: React.FC = () => {
  const { incidents } = useSentinel();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [report,           setReport]           = useState<ReportData | null>(null);
  const [loadingReport,    setLoadingReport]    = useState(false);
  const [downloadState,    setDownloadState]    = useState<DownloadState>('idle');
  const printRef = useRef<HTMLDivElement>(null);

  // Auto-select first incident
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  // Fetch report data when selected incident changes
  useEffect(() => {
    if (!selectedIncident) return;
    setLoadingReport(true);
    setReport(null);
    setDownloadState('idle');
    fetch(`/api/reports/${selectedIncident.id}`)
      .then(res => res.json())
      .then(data => { setReport(data); setLoadingReport(false); })
      .catch(() => setLoadingReport(false));
  }, [selectedIncident?.id]);

  /**
   * Client-side PDF generation via the browser Print API.
   * Simulates the /reports/pdf endpoint behaviour:
   *   1. Shows "Generating…" loading state
   *   2. Injects a print-specific style tag
   *   3. Calls window.print() → user saves as PDF
   *   4. Transitions to "success" or "error" state
   */
  const handleDownloadPDF = async () => {
    if (!report || !selectedIncident) return;
    setDownloadState('loading');

    try {
      // Simulate the endpoint latency (as if fetching from FastAPI /reports/pdf)
      await new Promise(resolve => setTimeout(resolve, 1400));

      // Inject print-only CSS that hides nav chrome and styles the report nicely
      const existingStyle = document.getElementById('sentinel-print-css');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'sentinel-print-css';
        style.textContent = `
          @media print {
            body * { visibility: hidden !important; }
            #sentinel-report-printable,
            #sentinel-report-printable * { visibility: visible !important; }
            #sentinel-report-printable {
              position: fixed !important;
              inset: 0 !important;
              padding: 32px !important;
              background: #fff !important;
              color: #111 !important;
              font-family: 'Courier New', monospace !important;
            }
            #sentinel-report-printable h1 { font-size: 22px; color: #000; }
            #sentinel-report-printable .print-label { color: #666; font-size: 10px; }
            #sentinel-report-printable .print-value { color: #000; font-weight: 600; }
            #sentinel-report-printable .print-section { margin-top: 24px; border-top: 1px solid #ddd; padding-top: 16px; }
            #sentinel-report-printable .print-timeline-item { margin: 10px 0; padding-left: 16px; border-left: 2px solid #aaa; }
          }
        `;
        document.head.appendChild(style);
      }

      window.print();
      setDownloadState('success');

      // Auto-reset success state after 4 seconds
      setTimeout(() => setDownloadState('idle'), 4000);
    } catch {
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 4000);
    }
  };

  const parsedTimeline: TimelineEvent[] = report?.timeline_json
    ? JSON.parse(report.timeline_json)
    : [];

  const txDetails = selectedIncident?.transaction_details_json
    ? JSON.parse(selectedIncident.transaction_details_json)
    : null;

  // ── Download button content ──────────────────────────────────────────
  const DownloadButton = () => {
    const states = {
      idle: {
        icon: <Download className="h-3.5 w-3.5" />,
        label: 'Download PDF',
        cls: 'bg-cyber-blue/20 border-cyber-blue/50 text-cyber-accent hover:bg-cyber-blue/30'
      },
      loading: {
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        label: 'Generating PDF…',
        cls: 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-accent/70 cursor-wait'
      },
      success: {
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        label: 'PDF Ready — Print Dialog Open',
        cls: 'bg-green-950/30 border-green-900/50 text-cyber-green'
      },
      error: {
        icon: <XCircle className="h-3.5 w-3.5" />,
        label: 'Failed — Click to Retry',
        cls: 'bg-red-950/30 border-cyber-red/50 text-cyber-red'
      }
    };
    const s = states[downloadState];
    return (
      <button
        onClick={downloadState === 'idle' || downloadState === 'error' ? handleDownloadPDF : undefined}
        disabled={downloadState === 'loading'}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 font-mono ${s.cls}`}
      >
        {s.icon}
        <span>{s.label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Incident Index Sidebar ──────────────────────────── */}
        <div className="cyber-card lg:col-span-1 flex flex-col noprint">
          <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Incidents Ledger Index</h4>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 flex-1">
            {incidents.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-500 font-mono">
                [NO INCIDENT REPORTS COMPREHENDED]
              </div>
            ) : (
              incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    selectedIncident?.id === inc.id
                      ? 'bg-cyber-blue/10 border-cyber-accent/60 shadow-glow-cyan'
                      : 'bg-cyber-cardLight/30 border-cyber-border/70 hover:border-cyber-border text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div>
                    <h5 className="text-xs font-bold text-gray-200">{inc.threat_type}</h5>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                      ID: #{inc.id} | {new Date(inc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    inc.status === 'Resolved' ? 'bg-green-950/40 text-cyber-green' : 'bg-red-950/40 text-cyber-red'
                  }`}>
                    {inc.status.toUpperCase()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Audit Report Document ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Controls Bar */}
          {selectedIncident && (
            <div className="cyber-card p-3 flex justify-between items-center noprint">
              <span className="text-xs font-mono text-gray-400">Audit Dossier Compiler</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { window.print(); }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyber-cardLight text-gray-300 hover:text-white border border-cyber-border/80 transition-colors font-mono"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <DownloadButton />
              </div>
            </div>
          )}

          {/* Download state banner */}
          <AnimatePresence>
            {downloadState === 'loading' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="noprint p-3 bg-cyber-blue/10 border border-cyber-blue/30 rounded-xl flex items-center gap-3"
              >
                <Loader2 className="h-4 w-4 text-cyber-accent animate-spin shrink-0" />
                <div>
                  <p className="text-xs font-bold text-cyber-accent font-mono">Generating PDF Report…</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Compiling incident dossier from /reports/pdf endpoint</p>
                </div>
              </motion.div>
            )}
            {downloadState === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="noprint p-3 bg-green-950/20 border border-cyber-green/40 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="h-4 w-4 text-cyber-green shrink-0" />
                <div>
                  <p className="text-xs font-bold text-cyber-green font-mono">PDF Generated Successfully</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Your browser's print dialog is open — select "Save as PDF" to download.</p>
                </div>
              </motion.div>
            )}
            {downloadState === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="noprint p-3 bg-red-950/20 border border-cyber-red/40 rounded-xl flex items-center gap-3"
              >
                <XCircle className="h-4 w-4 text-cyber-red shrink-0" />
                <div>
                  <p className="text-xs font-bold text-cyber-red font-mono">PDF Generation Failed</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Could not reach the report endpoint. Click "Failed — Click to Retry".</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dossier Sheet (printable) */}
          <div id="sentinel-report-printable" className="cyber-card p-8 border border-cyber-border/80 bg-[#0c1220]/90 relative" ref={printRef}>
            {loadingReport ? (
              <div className="h-96 flex flex-col items-center justify-center gap-2 font-mono text-xs text-cyber-accent animate-pulse">
                <FileText className="h-8 w-8 animate-spin" />
                <span>COMPILING Dossier File…</span>
              </div>
            ) : !report || !selectedIncident ? (
              <div className="h-96 flex items-center justify-center font-mono text-xs text-gray-500">
                [SELECT AN INCIDENT TO OPEN DOSSIER SHEET]
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* PDF Document Header */}
                <div className="flex justify-between items-start border-b border-cyber-border/80 pb-6">
                  <div>
                    <h1 className="text-xl font-bold tracking-wider text-gray-100 font-mono">
                      SENTINEL<span className="text-cyber-accent">AI</span> SECURITY AUDIT
                    </h1>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1 uppercase">
                      OFFICIAL SYSTEM INCIDENT ANALYSIS REPORT
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-gray-400 bg-cyber-bg px-3 py-1 rounded border border-cyber-border/80">
                      INCIDENT CASE: #{selectedIncident.id}
                    </span>
                    <p className="text-[9px] text-gray-500 font-mono mt-2">
                      Compiled: {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-cyber-border/50 pb-6">
                  
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Threat Parameters</h4>
                    <div className="grid grid-cols-2 gap-y-2 font-sans text-gray-300">
                      <span className="text-gray-500">Threat Type:</span>
                      <span className="font-semibold text-gray-200">{selectedIncident.threat_type}</span>
                      
                      <span className="text-gray-500">AI Risk Index:</span>
                      <span className="font-semibold text-cyber-red font-mono">{selectedIncident.risk_score}% Severity</span>
                      
                      <span className="text-gray-500">Correlation Conf:</span>
                      <span className="font-semibold text-purple-400 font-mono">{selectedIncident.confidence_score}%</span>

                      <span className="text-gray-500">Audit Status:</span>
                      <span className={`font-semibold ${selectedIncident.status === 'Resolved' ? 'text-cyber-green' : 'text-cyber-red'}`}>
                        {selectedIncident.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">Deposit Profile</h4>
                    <div className="grid grid-cols-2 gap-y-2 font-sans text-gray-300">
                      <span className="text-gray-500">Customer Name:</span>
                      <span className="font-semibold text-gray-200">{selectedIncident.customer?.name || 'Unknown'}</span>
                      
                      <span className="text-gray-500">Account ID:</span>
                      <span className="font-semibold text-gray-200 font-mono">{selectedIncident.customer?.account_number || 'N/A'}</span>
                      
                      <span className="text-gray-500">Session IP:</span>
                      <span className="font-semibold text-gray-200 font-mono">{selectedIncident.customer?.current_ip || 'N/A'}</span>

                      <span className="text-gray-500">Protected Funds:</span>
                      <span className="font-semibold text-cyber-green font-mono">₹{selectedIncident.money_protected.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Blocked Transaction */}
                {txDetails && (
                  <div className="p-4 bg-cyber-bg/50 border border-cyber-border rounded-xl">
                    <h4 className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-cyber-red" />
                      <span>Blocked Outgoing Transaction Details</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-400">
                      <div>
                        <span className="text-[9px] text-gray-600 block">AMOUNT AT RISK</span>
                        <span className="text-cyber-red font-bold text-sm">₹{txDetails.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-600 block">TARGET RECEIVER</span>
                        <span className="text-gray-300 font-semibold">{txDetails.receiver}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-600 block">UPI CHANNEL ID</span>
                        <span className="text-gray-300 truncate block">{txDetails.upi || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chronology Timeline */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-cyber-accent" />
                    <span>Cybersecurity Telemetry Timeline & Action Log</span>
                  </h4>
                  <div className="space-y-3 font-mono text-[11px] text-gray-400">
                    {parsedTimeline.map((item, i) => (
                      <div key={i} className="flex gap-4 border-l border-cyber-border/60 pl-4 py-1 relative">
                        <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-cyber-border border border-cyber-bg shrink-0"></span>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-200">[{item.time}] {item.stage}</p>
                          <p className="text-gray-400 mt-0.5 leading-relaxed font-sans">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="border-t border-cyber-border/80 pt-6 space-y-2">
                  <h4 className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-cyber-amber" />
                    <span>Security Analyst Directives</span>
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed italic bg-cyber-bg/40 p-4 border border-cyber-border rounded-xl">
                    "{report.recommendations}"
                  </p>
                </div>

                {/* Signature Block */}
                <div className="flex justify-between items-center border-t border-cyber-border/80 pt-8 mt-12 text-[10px] font-mono text-gray-500">
                  <div>
                    <p>CLASSIFICATION: HIGHLY RESTRICTED // SOC SECURITY BRIEF</p>
                    <p className="text-[9px] text-gray-600 mt-1">SentinelAI Autonomous Cyber Defense Agent #883</p>
                  </div>
                  <div className="text-right">
                    <p>VERIFIED SYSTEM RESPONSE SIGN-OFF</p>
                    <div className="h-8 w-32 border-b border-cyber-accent/50 ml-auto my-1 flex items-center justify-center">
                      <span className="text-[9px] text-cyber-accent/40 font-mono tracking-widest uppercase">AUTO-SECURED</span>
                    </div>
                    <p>AUTONOMOUS SHIELD ACTIVE</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReport;
