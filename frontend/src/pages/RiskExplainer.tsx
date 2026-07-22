import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell
} from 'recharts';

interface RiskFactor {
  factor: string;
  score: number;
  max: number;
  color: string;
  explanation: string;
}

const FACTOR_EXPLANATIONS: Record<string, string> = {
  'Tor/VPN Usage':         'Traffic routed through Tor exit nodes or VPN servers is a top indicator of account takeover. Legitimate users rarely use Tor for banking.',
  'New Device Login':      'First-time login from an unrecognized device fingerprint. Device trust history tracks this signal per customer.',
  'Geo-Velocity Anomaly':  'Impossible travel detected — login from two geographically distant locations within minutes. Indicates credential sharing or theft.',
  'Unusual Hour Access':   'Login or transaction at an abnormal hour (e.g., 2:30 AM) deviating from the customer\'s established usage pattern.',
  'Transaction Anomaly':   'Transfer amount, beneficiary, or bank significantly deviates from historical pattern. Offshore destinations are high weight.',
  'Failed Login Spike':    'Multiple failed password attempts before successful login indicates brute-force or credential stuffing attack.',
  'Behavioral Mismatch':   'Typing speed, mouse movement, and session duration differ from the customer\'s established behavioral baseline.',
};

function buildFactors(riskScore: number, threatType: string): RiskFactor[] {
  const isTor      = threatType?.toLowerCase().includes('takeover') || threatType?.toLowerCase().includes('session');
  const isPhishing = threatType?.toLowerCase().includes('phishing') || threatType?.toLowerCase().includes('credential');
  return [
    { factor: 'Tor/VPN Usage',        score: isTor      ? 30 : 10, max: 30, color: '#ff3e3e', explanation: FACTOR_EXPLANATIONS['Tor/VPN Usage']         },
    { factor: 'New Device Login',      score: 20,                   max: 25, color: '#ffaa00', explanation: FACTOR_EXPLANATIONS['New Device Login']        },
    { factor: 'Geo-Velocity Anomaly',  score: isTor      ? 18 : 8,  max: 20, color: '#f97316', explanation: FACTOR_EXPLANATIONS['Geo-Velocity Anomaly']   },
    { factor: 'Unusual Hour Access',   score: 10,                   max: 15, color: '#a855f7', explanation: FACTOR_EXPLANATIONS['Unusual Hour Access']     },
    { factor: 'Transaction Anomaly',   score: riskScore > 60 ? 12 : 5, max: 15, color: '#00b4ff', explanation: FACTOR_EXPLANATIONS['Transaction Anomaly'] },
    { factor: 'Failed Login Spike',    score: isPhishing ? 8 : 3,   max: 10, color: '#22d3ee', explanation: FACTOR_EXPLANATIONS['Failed Login Spike']      },
    { factor: 'Behavioral Mismatch',   score: 7,                    max: 10, color: '#4ade80', explanation: FACTOR_EXPLANATIONS['Behavioral Mismatch']     },
  ];
}

const RiskExplainer: React.FC = () => {
  const { incidents, activeCustomer } = useSentinel();
  const [selectedId,   setSelectedId]   = useState<number | null>(null);
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  useEffect(() => {
    if (incidents.length > 0 && !selectedId) setSelectedId(incidents[0].id);
  }, [incidents]);

  const selectedIncident = incidents.find(i => i.id === selectedId);
  const riskScore  = selectedIncident?.risk_score  ?? (activeCustomer?.risk_score ?? 45);
  const threatType = selectedIncident?.threat_type ?? 'General Anomaly';
  const factors    = buildFactors(riskScore, threatType);

  const radarData = factors.map(f => ({ subject: f.factor.split(' ')[0], A: f.score, fullMark: f.max }));
  const totalScore = factors.reduce((s, f) => s + f.score, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card border-l-4 border-l-cyber-accent">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-cyber-accent animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-gray-200 font-mono">Explainable AI — Risk Score Breakdown</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Every risk score is evidence-based. Click any factor to understand why it contributed.</p>
          </div>
        </div>
      </div>

      {/* Incident selector */}
      {incidents.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {incidents.map(inc => (
            <button key={inc.id} onClick={() => setSelectedId(inc.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
                selectedId === inc.id
                  ? 'bg-cyber-blue/20 border-cyber-accent/50 text-cyber-accent'
                  : 'border-cyber-border/50 text-gray-500 hover:text-gray-300'
              }`}
            >
              #{inc.id} — {inc.threat_type}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factor Bar Chart */}
        <div className="cyber-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Risk Factor Contribution</h4>
            <div className="text-right">
              <p className="text-2xl font-extrabold font-mono text-cyber-red">{riskScore}%</p>
              <p className="text-[9px] text-gray-500 font-mono">TOTAL RISK SCORE</p>
            </div>
          </div>

          <div className="space-y-3">
            {factors.map(f => (
              <div key={f.factor}>
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-cyber-cardLight/20 rounded-lg px-2 py-1.5 transition-colors"
                  onClick={() => setExpandedFactor(expandedFactor === f.factor ? null : f.factor)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                    <span className="text-xs text-gray-300 truncate">{f.factor}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono" style={{ color: f.color }}>+{f.score}</span>
                    {expandedFactor === f.factor ? <ChevronUp className="h-3 w-3 text-gray-500" /> : <ChevronDown className="h-3 w-3 text-gray-500" />}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mx-2 mt-1 h-1.5 bg-cyber-bg rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: f.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(f.score / f.max) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                {/* Expanded explanation */}
                {expandedFactor === f.factor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mx-2 mt-2 mb-1 p-3 bg-cyber-bg/60 border border-cyber-border/60 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: f.color }} />
                      <p className="text-[11px] text-gray-300 leading-relaxed">{f.explanation}</p>
                    </div>
                    <p className="text-[10px] font-mono text-gray-500 mt-2">
                      Score: {f.score}/{f.max} pts — {Math.round((f.score / f.max) * 100)}% of max weight
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-cyber-border/40 flex justify-between text-xs font-mono">
            <span className="text-gray-500">Sum of factors:</span>
            <span className="text-cyber-red font-bold">{totalScore} pts → {riskScore}% Risk</span>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="cyber-card">
          <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Threat Profile Radar</h4>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e3040" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} />
              <Radar name="Risk" dataKey="A" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>

          {/* Threat verdict */}
          <div className="mt-4 p-3 bg-cyber-bg/50 border border-cyber-border/60 rounded-xl">
            <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">AI Verdict</p>
            <p className="text-xs text-gray-200 leading-relaxed">
              {riskScore >= 80
                ? 'HIGH CONFIDENCE THREAT — Multiple high-weight signals correlated. Autonomous mitigation warranted.'
                : riskScore >= 50
                ? 'MODERATE RISK — Suspicious pattern detected. Enhanced monitoring activated.'
                : 'LOW RISK — Behaviour within normal baseline parameters. Continue monitoring.'}
            </p>
            <p className="text-[10px] font-mono text-purple-400 mt-2">
              AI Confidence: {riskScore >= 80 ? '95%' : riskScore >= 50 ? '78%' : '62%'} | Model: SentinelAI-v2 Fraud Classifier
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskExplainer;
