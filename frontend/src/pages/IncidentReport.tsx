import React, { useState, useEffect } from 'react';
import { useSentinel, Incident } from '../context/SentinelContext';
import { 
  FileText, 
  Printer, 
  ShieldCheck, 
  AlertTriangle,
  Download,
  Building,
  User,
  Activity,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

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

const IncidentReport: React.FC = () => {
  const { incidents } = useSentinel();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Auto-select first incident
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  // Fetch report data when selected incident changes
  useEffect(() => {
    if (selectedIncident) {
      setLoadingReport(true);
      setReport(null);
      fetch(`/api/reports/${selectedIncident.id}`)
        .then(res => res.json())
        .then(data => {
          setReport(data);
          setLoadingReport(false);
        })
        .catch(err => {
          console.error("Error fetching report:", err);
          setLoadingReport(false);
        });
    }
  }, [selectedIncident]);

  const handlePrint = () => {
    window.print();
  };

  const parsedTimeline: TimelineEvent[] = report?.timeline_json 
    ? JSON.parse(report.timeline_json) 
    : [];

  const txDetails = selectedIncident?.transaction_details_json 
    ? JSON.parse(selectedIncident.transaction_details_json) 
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Index Sidebar (Hidden during Print) */}
        <div className="cyber-card lg:col-span-1 flex flex-col justify-between noprint">
          <div>
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Incidents Ledger Index</h4>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
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
                      <p className="text-[10px] text-gray-500 font-mono mt-1">ID: #{inc.id} | {new Date(inc.created_at).toLocaleDateString()}</p>
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
        </div>

        {/* Audit Report Document (Print-optimized) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Bar (Hidden during Print) */}
          {selectedIncident && (
            <div className="cyber-card p-3 flex justify-between items-center noprint">
              <span className="text-xs font-mono text-gray-400">Audit Dossier Compiler</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyber-cardLight text-gray-300 hover:text-white border border-cyber-border/80 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Export PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* Dossier Sheet */}
          <div className="cyber-card p-8 border border-cyber-border/80 bg-[#0c1220]/90 relative">
            {loadingReport ? (
              <div className="h-96 flex flex-col items-center justify-center gap-2 font-mono text-xs text-cyber-accent animate-pulse">
                <FileText className="h-8 w-8 animate-spin" />
                <span>COMPILING Dossier File...</span>
              </div>
            ) : !report || !selectedIncident ? (
              <div className="h-96 flex items-center justify-center font-mono text-xs text-gray-500">
                [SELECT AN INCIDENT TO OPEN DOSSIER SHEET]
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* PDF Document Header watermark */}
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
                    <p className="text-[9px] text-gray-500 font-mono mt-2">Compiled: {new Date(report.created_at).toLocaleString()}</p>
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
                      <span className="font-semibold text-gray-200">{selectedIncident.customer?.name || 'John Doe'}</span>
                      
                      <span className="text-gray-500">Account ID:</span>
                      <span className="font-semibold text-gray-200 font-mono">{selectedIncident.customer?.account_number || 'ACC-124987'}</span>
                      
                      <span className="text-gray-500">Session IP:</span>
                      <span className="font-semibold text-gray-200 font-mono">{selectedIncident.customer?.current_ip || '185.220.101.5'}</span>

                      <span className="text-gray-500">Protected Funds:</span>
                      <span className="font-semibold text-cyber-green font-mono">₹{selectedIncident.money_protected.toLocaleString()}</span>
                    </div>
                  </div>

                </div>

                {/* Transaction Blocked Details */}
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
                    <p>AUTONOMOUS SHIELD ACTIVES</p>
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
