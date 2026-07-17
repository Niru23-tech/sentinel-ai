import React, { useState, useEffect } from 'react';
import { useSentinel, Incident } from '../context/SentinelContext';
import { 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  ShieldAlert, 
  Server, 
  Zap, 
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAnalysisData {
  summary: string;
  description: string;
  root_cause: string;
  affected_assets: string;
  recommendations: string;
  next_step: string;
  risk_score: number;
  confidence_score: number;
}

const AIAnalysis: React.FC = () => {
  const { incidents, loading } = useSentinel();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null);
  const [fetchingAnalysis, setFetchingAnalysis] = useState(false);

  // Set first incident as selected initially
  useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  // Fetch AI analysis when selected incident changes
  useEffect(() => {
    if (selectedIncident) {
      setFetchingAnalysis(true);
      setAnalysis(null);
      fetch(`/api/incidents/${selectedIncident.id}/ai-investigation`)
        .then(res => res.json())
        .then(data => {
          setAnalysis(data);
          setFetchingAnalysis(false);
        })
        .catch(err => {
          console.error("Error fetching AI analysis:", err);
          setFetchingAnalysis(false);
        });
    }
  }, [selectedIncident]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Cases Index (Left Column) */}
        <div className="cyber-card lg:col-span-1 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Threat Incidents Registry</h4>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {incidents.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-500 font-mono">
                  [NO RECENT INCIDENTS GENERATED]
                </div>
              ) : (
                incidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
                      selectedIncident?.id === inc.id
                        ? 'bg-cyber-blue/10 border-cyber-accent/60 shadow-glow-cyan'
                        : 'bg-cyber-cardLight/30 border-cyber-border/70 hover:border-cyber-border text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        inc.status === 'Resolved' ? 'bg-green-950/40 text-cyber-green border border-green-900/60' : 'bg-red-950/40 text-cyber-red border border-red-900/60'
                      }`}>
                        {inc.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">ID: #{inc.id}</span>
                    </div>

                    <h5 className="text-xs font-bold text-gray-200">{inc.threat_type}</h5>
                    <p className="text-[11px] text-gray-400 truncate">Customer: {inc.customer?.name || `Customer ID #${inc.customer_id}`}</p>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono border-t border-cyber-border/30 pt-2 mt-1">
                      <span className="text-gray-500">Risk: <span className="text-cyber-accent font-bold">{inc.risk_score}%</span></span>
                      <span className="text-gray-500">Confidence: <span className="text-purple-400 font-bold">{inc.confidence_score}%</span></span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cognitive AI Core Review (Right Column) */}
        <div className="cyber-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-cyber-accent animate-pulse" />
              <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">AI Cognitive Threat Forensics</h3>
            </div>
            {selectedIncident && (
              <span className="text-[10px] font-mono text-gray-500">CASE FILE: #{selectedIncident.id}</span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {fetchingAnalysis ? (
              <div className="h-80 flex flex-col items-center justify-center gap-3 font-mono text-xs text-cyber-accent">
                <Cpu className="h-8 w-8 animate-spin" />
                <span>AI CORRELATION MATRIX COMPILING...</span>
              </div>
            ) : !selectedIncident ? (
              <div className="h-80 flex items-center justify-center font-mono text-xs text-gray-500">
                [AWAITING ANOMALOUS INCIDENT LOG FOR FORENSICS]
              </div>
            ) : analysis ? (
              <motion.div
                key={selectedIncident.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Executive Verdict Reasoning Card */}
                <div className="p-5 bg-gradient-to-br from-cyber-blue/10 to-purple-950/15 border border-cyber-accent/30 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-15">
                    <Cpu className="h-20 w-20 text-cyber-accent" />
                  </div>
                  <h4 className="text-[10px] font-mono font-bold text-cyber-accent uppercase tracking-wider mb-2">Cognitive Reasoning Summary</h4>
                  <p className="text-sm font-bold text-gray-100 leading-relaxed font-sans">
                    "{analysis.description}"
                  </p>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-cyber-cardLight/30 border border-cyber-border/80 rounded-xl">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">Threat Severity Risk</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-extrabold font-mono text-cyber-red">{analysis.risk_score}%</span>
                      <span className="text-xs text-gray-400">Security Index</span>
                    </div>
                    <div className="w-full bg-cyber-bg h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-cyber-red h-full rounded-full" style={{ width: `${analysis.risk_score}%` }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-cyber-cardLight/30 border border-cyber-border/80 rounded-xl">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block">AI Model Confidence</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-extrabold font-mono text-purple-400">{analysis.confidence_score}%</span>
                      <span className="text-xs text-gray-400">Correlation Confidence</span>
                    </div>
                    <div className="w-full bg-cyber-bg h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${analysis.confidence_score}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Root Cause & Affected Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-cyber-bg/50 border border-cyber-border/80 rounded-xl">
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold">Root Cause Identification</span>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">{analysis.root_cause}</p>
                  </div>

                  <div className="p-4 bg-cyber-bg/50 border border-cyber-border/80 rounded-xl">
                    <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold">Affected Channels & Assets</span>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">{analysis.affected_assets}</p>
                  </div>
                </div>

                {/* Mitigations */}
                <div className="p-4 bg-cyber-cardLight/30 border border-cyber-border/80 rounded-xl">
                  <span className="text-[10px] font-mono text-gray-500 uppercase font-semibold block mb-3">Analyst Recommended Mitigations</span>
                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed font-mono">
                    {analysis.recommendations}
                  </div>
                </div>

                {/* Next Step Prediction */}
                <div className="p-4 border border-cyber-amber/20 bg-cyber-amber/5 rounded-xl flex items-start gap-3">
                  <Zap className="h-5 w-5 text-cyber-amber mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-cyber-amber font-mono uppercase">AI Threat Prediction (Next Move)</h5>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {analysis.next_step}
                    </p>
                  </div>
                </div>

              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AIAnalysis;
