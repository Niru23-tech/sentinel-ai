import React, { useState, useEffect } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { 
  Bot, 
  Cpu, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Search, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Zap, 
  Lock, 
  Download, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Send, 
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Database,
  ExternalLink,
  Award,
  Terminal,
  HelpCircle,
  TrendingUp,
  UserCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentResult {
  agent_name: string;
  role: string;
  status: string;
  execution_time_ms: number;
  confidence_score: number;
  risk_contribution_pct: number;
  threat_type?: string;
  severity?: string;
  reason?: string;
  findings?: string[];
  recommendations?: string[];
  suggested_response?: string[];
  explanation?: string;
  ai_explanation?: string;
  normal_behavior_breakdown?: string[];
  abnormal_behavior_breakdown?: string[];
  incident_timeline?: any[];
  evidence_collection?: string[];
  indicators_of_compromise?: any[];
  attack_path?: string[];
  affected_services?: string[];
  compromised_assets?: string[];
  mitigation_checklist?: any[];
  executive_summary?: string;
  mitre_attack_mapping?: any[];
  business_impact?: any;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const AISecurityAgents: React.FC = () => {
  const { customers, activeCustomer, selectCustomer } = useSentinel();

  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [investigationResult, setInvestigationResult] = useState<any>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decision' | 'forensics' | 'checklist' | 'mitre'>('decision');

  // Interactive Bank Approval checklist state
  const [approvedActions, setApprovedActions] = useState<Record<string, boolean>>({});

  // Chat Panel State
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Greetings Chief Analyst. I am the SentinelX Multi-Agent Coordinator. Ask me anything regarding current telemetry, risk scores, attack paths, or bank mitigation steps.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // Execute Agent Orchestration Pipeline
  const handleRunInvestigation = async () => {
    if (!activeCustomer) return;
    setRunning(true);
    setInvestigationResult(null);

    // Simulate step-by-step progress animation across the 6 agents
    for (let i = 0; i < 6; i++) {
      setActiveStep(i);
      await new Promise(res => setTimeout(res, 450));
    }

    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: activeCustomer.id })
      });
      const data = await res.json();
      setInvestigationResult(data);
    } catch (err) {
      console.error('Agent execution error:', err);
    } finally {
      setRunning(false);
      setActiveStep(6);
    }
  };

  useEffect(() => {
    handleRunInvestigation();
  }, [activeCustomer?.id]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    setTimeout(() => {
      let aiText = "";
      const lower = query.toLowerCase();
      const decision = investigationResult?.final_ai_decision;
      const risk = decision?.overall_risk_percentage || activeCustomer?.risk_score || 85;

      if (lower.includes('dangerous') || lower.includes('threat') || lower.includes('why')) {
        aiText = `This attack exhibits a multi-vector APT signature: 6,800 km impossible travel velocity from Chennai to Frankfurt in under 8 minutes, combined with 5 failed brute-force attempts and an unverified offshore UPI payee. Risk score is currently at ${risk}%.`;
      } else if (lower.includes('bank') || lower.includes('what should') || lower.includes('do')) {
        aiText = `The Incident Response Agent recommends 3 authorized actions: 1) Hold settlement of ₹45,000 transfer in escrow, 2) Temporarily suspend outward debit capabilities on account ${activeCustomer?.account_number}, 3) Blacklist proxy IP ${activeCustomer?.current_ip} on perimeter firewall.`;
      } else if (lower.includes('timeline') || lower.includes('chronology')) {
        aiText = `Timeline summary: 09:12 Initial Access brute force -> 09:14 Session token hijack -> 09:15 Proxy hop via NordVPN Frankfurt -> 09:18 Unverified offshore payee addition & transfer initiation.`;
      } else if (lower.includes('evidence') || lower.includes('ioc')) {
        aiText = `Harvested Evidence: 1) Tor Exit Node IP ${activeCustomer?.current_ip}, 2) Destination UPI 'hacker_vault@offshore.bank', 3) Anonymized User-Agent hash SHA256 e3b0c442.`;
      } else {
        aiText = `Based on multi-agent analysis for ${activeCustomer?.name} (Risk: ${risk}%), all 6 AI agents agree that this represents a high-probability Account Takeover attempt requiring bank authorization.`;
      }

      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 600);
  };

  const agentIcons = [ShieldAlert, Cpu, Activity, Search, ShieldCheck, FileText];
  const agentColors = ['#FF3B5C', '#F59E0B', '#3b82f6', '#00F5FF', '#00FF9C', '#818cf8'];

  const decision = investigationResult?.final_ai_decision;
  const agents: AgentResult[] = investigationResult?.agents || [];
  const execReport = investigationResult?.executive_report;

  return (
    <div className="space-y-6 relative pb-12 font-mono">
      
      {/* ── Top SOC Agent Banner Header ──────────────────────────── */}
      <div className="cyber-glass p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-l-4 border-l-cyber-accent">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyber-accent/15 border border-cyber-accent/40 flex items-center justify-center text-cyber-accent shadow-glow-cyan">
              <Bot className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-wider">
                MULTI-AI AGENT SECURITY INTELLIGENCE SYSTEM
              </h1>
              <p className="text-[10px] text-cyber-accent uppercase tracking-widest mt-0.5">
                AUTONOMOUS MULTI-AGENT THREAT ORCHESTRATOR MATRIX
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Target Client Switcher */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="text-slate-500">Target Client:</span>
            <select
              value={activeCustomer?.id || 1}
              onChange={(e) => selectCustomer(Number(e.target.value))}
              className="bg-transparent text-cyber-accent font-bold outline-none cursor-pointer"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id} className="bg-[#050816] text-slate-200">
                  {c.name} ({c.risk_score}%)
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Investigation Button */}
          <button
            onClick={handleRunInvestigation}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyber-accent text-cyber-bg hover:opacity-90 transition-all shadow-glow-cyan disabled:opacity-50 cursor-pointer"
          >
            {running ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-cyber-bg border-t-transparent rounded-full animate-spin" />
                <span>Orchestrating Agents…</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Run AI Investigation</span>
              </>
            )}
          </button>

          {/* Open Chat Button */}
          <button
            onClick={() => setShowChat(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyber-accent border border-white/10 transition-colors relative cursor-pointer"
            title="Ask AI Analyst"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyber-accent animate-ping" />
          </button>
        </div>
      </div>

      {/* ── Orchestrator Pipeline Step Bar ────────────────────────── */}
      <div className="cyber-glass p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-cyber-accent" /> Agent Orchestrator Pipeline:
          </span>
          <span className="text-cyber-accent font-bold">
            {running ? `Executing Agent #${activeStep + 1} of 6…` : 'Sequential Workflow Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            'Threat Analyst', 'Fraud Analyst', 'Behaviour Analysis', 
            'Digital Forensics', 'Incident Response', 'Executive Report'
          ].map((name, i) => {
            const isDone = !running || activeStep > i;
            const isCurrent = running && activeStep === i;
            return (
              <div
                key={name}
                className={`p-2.5 rounded-xl border text-center text-[11px] transition-all flex flex-col items-center justify-center gap-1 ${
                  isCurrent
                    ? 'bg-cyber-accent/15 border-cyber-accent text-cyber-accent shadow-glow-cyan animate-pulse'
                    : isDone
                    ? 'bg-white/5 border-white/10 text-slate-200'
                    : 'bg-black/40 border-white/5 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isCurrent ? (
                    <div className="h-2 w-2 rounded-full bg-cyber-accent animate-ping" />
                  ) : isDone ? (
                    <CheckCircle className="h-3 w-3 text-cyber-success" />
                  ) : (
                    <Clock className="h-3 w-3 text-slate-600" />
                  )}
                  <span className="font-bold truncate">{i + 1}. {name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Executive AI Decision Card ───────────────────────────── */}
      {decision && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`cyber-glass p-5 border-2 relative overflow-hidden ${
            decision.overall_risk_percentage >= 80 
              ? 'border-cyber-critical/80 bg-cyber-critical/10 shadow-glow-critical' 
              : decision.overall_risk_percentage >= 50
              ? 'border-cyber-warning/80 bg-cyber-warning/10'
              : 'border-cyber-success/80 bg-cyber-success/10'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Score Gauge */}
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/10" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    strokeWidth="3.5"
                    strokeDasharray={`${decision.overall_risk_percentage}, 100`}
                    strokeLinecap="round"
                    stroke={decision.overall_risk_percentage >= 80 ? '#FF3B5C' : decision.overall_risk_percentage >= 50 ? '#F59E0B' : '#00FF9C'}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-slate-100">{decision.overall_risk_percentage}%</span>
                  <span className="text-[8px] uppercase text-slate-400">Risk Meter</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    decision.overall_risk_percentage >= 80 ? 'bg-cyber-critical/20 text-cyber-critical border-cyber-critical/50' : 'bg-cyber-success/20 text-cyber-success border-cyber-success/50'
                  }`}>
                    {decision.priority}
                  </span>
                  <span className="text-xs text-slate-400">Confidence: <b className="text-cyber-accent">{decision.attack_confidence}%</b></span>
                </div>

                <h2 className="text-base font-bold text-slate-100 mt-1">
                  {decision.threat_category}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  <b>Final AI Verdict:</b> {decision.recommended_action}
                </p>
              </div>
            </div>

            {/* Right Status Badges */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 text-right shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-slate-500">Status: </span>
                <span className="text-cyber-success font-bold">{decision.investigation_status}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-slate-500">Total Latency: </span>
                <span className="text-cyber-accent font-bold">{decision.total_execution_time_ms} ms</span>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* ── 6 AI Security Agents Monitoring Modules ──────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase text-slate-400 tracking-wider flex items-center gap-2">
          <Bot className="h-4 w-4 text-cyber-accent" /> Autonomous AI Security Agent Modules (6 Modules)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((ag, idx) => {
            const Icon = agentIcons[idx % agentIcons.length];
            const color = agentColors[idx % agentColors.length];
            const isExpanded = expandedAgent === ag.agent_name;

            return (
              <motion.div
                key={ag.agent_name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="cyber-glass p-5 flex flex-col justify-between space-y-4 hover:border-cyber-accent/50 transition-all group"
              >
                <div>
                  {/* Agent Module Header */}
                  <div className="flex items-start justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: `${color}15`, borderColor: `${color}50`, color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyber-accent transition-colors">
                          {ag.agent_name}
                        </h4>
                        <p className="text-[9px] text-slate-400 truncate max-w-[180px]">{ag.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyber-success/20 text-cyber-success border border-cyber-success/40 font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyber-success animate-ping" />
                        {ag.status}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-1">{ag.execution_time_ms} ms</span>
                    </div>
                  </div>

                  {/* Confidence & Risk Metrics Bar */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px]">
                      <span className="text-slate-500 block">Confidence Score</span>
                      <span className="font-bold text-cyber-accent text-xs">{ag.confidence_score}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px]">
                      <span className="text-slate-500 block">Risk Contribution</span>
                      <span className="font-bold text-cyber-warning text-xs">{ag.risk_contribution_pct}%</span>
                    </div>
                  </div>

                  {/* Key Findings List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Analysis Findings:</span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {(ag.findings || ag.normal_behavior_breakdown || [ag.explanation || 'Analysis completed successfully.']).slice(0, 3).map((f, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                          <span className="text-cyber-accent shrink-0 mt-0.5">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action Details Toggle */}
                <div className="border-t border-white/10 pt-3">
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : ag.agent_name)}
                    className="w-full flex items-center justify-between text-[10px] text-cyber-accent hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Detailed JSON' : 'View Full Agent Output'}</span>
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>

                  {/* Expanded JSON view */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.pre
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-2.5 bg-black/80 border border-white/10 rounded-xl text-[9px] text-cyber-accent overflow-x-auto max-h-48"
                      >
                        {JSON.stringify(ag, null, 2)}
                      </motion.pre>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs for Forensic Timeline, Mitigation Checklist & MITRE Matrix ── */}
      <div className="cyber-glass p-5 space-y-4">
        <div className="flex border-b border-white/10 overflow-x-auto gap-4">
          {[
            { id: 'decision', label: 'Executive AI Briefing', icon: Award },
            { id: 'forensics', label: 'Forensics Attack Path & Timeline', icon: Search },
            { id: 'checklist', label: 'Bank Authorization Checklist', icon: ShieldCheck },
            { id: 'mitre', label: 'MITRE ATT&CK Matrix & PDF Export', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyber-accent text-cyber-accent bg-cyber-accent/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Executive Summary */}
        {activeTab === 'decision' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-cyber-accent" /> Executive Threat Summary
              </h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                {execReport?.executive_summary || "SentinelX Multi-Agent Security Intelligence System intercepted a CRITICAL cyber-fraud attempt. By correlating Tor exit node telemetry, 6,800 km impossible travel velocity, and an unverified offshore UPI beneficiary, the platform protected funds with zero downtime."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Business Impact Assessment:</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex justify-between"><span>Financial Loss Prevented:</span> <b className="text-cyber-success">₹45,000.00</b></li>
                  <li className="flex justify-between"><span>Regulatory Compliance:</span> <b className="text-cyber-accent">RBI Cyber Framework 2024</b></li>
                  <li className="flex justify-between"><span>Reputational Damage:</span> <b className="text-cyber-success">ZERO (Protected)</b></li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Future Prevention Roadmap:</span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {execReport?.future_prevention?.map((p: string, pIdx: number) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-cyber-accent shrink-0">•</span>
                      <span>{p}</span>
                    </li>
                  )) || <li>Enforce FIDO2 WebAuthn hardware key enrollment.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attack Path & Forensics Timeline */}
        {activeTab === 'forensics' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="font-bold text-cyber-accent text-xs uppercase">
                Reconstructed Attack Path Flow:
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['Public Edge Ingress Router', 'FastAPI Auth Middleware', 'UPI Payment Engine', 'Core Settlement Ledger (Blocked)'].map((step, sIdx, arr) => (
                  <React.Fragment key={step}>
                    <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                      {step}
                    </span>
                    {sIdx < arr.length - 1 && <ArrowRight className="h-4 w-4 text-cyber-accent shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-300 text-xs uppercase">Incident Chronology:</h4>
              <div className="space-y-2">
                {[
                  { time: '09:12:05 AM', phase: 'Initial Access', title: 'Brute Force Auth Burst', detail: `4 failed password attempts logged from IP ${activeCustomer?.current_ip}.` },
                  { time: '09:14:22 AM', phase: 'Privilege Escalation', title: 'Session Token Hijack', detail: 'Active OAuth session cookie stolen via credential stuffing.' },
                  { time: '09:15:40 AM', phase: 'Defense Evasion', title: 'Proxy & Tor Node Hop', detail: 'Connection rerouted through NordVPN Frankfurt Exit Node.' },
                  { time: '09:18:10 AM', phase: 'Exfiltration / Fraud', title: 'Unverified Payee Addition', detail: `Added offshore UPI payee and initiated transfer from ${activeCustomer?.account_number}.` }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs">
                    <span className="text-cyber-accent text-[11px] shrink-0 font-bold">{item.time}</span>
                    <span className="px-2 py-0.5 rounded bg-cyber-accent/20 text-cyber-accent text-[9px] font-bold shrink-0">
                      {item.phase}
                    </span>
                    <div>
                      <p className="font-bold text-slate-200">{item.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bank Authorization Mitigation Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyber-warning/15 border border-cyber-warning/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyber-warning">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>MANDATORY BANK AUTHORIZATION GATE: Actions require analyst approval.</span>
              </div>
              <span className="text-[10px] text-slate-400">Strict Compliance Enforced</span>
            </div>

            <div className="space-y-2">
              {[
                { id: 'act_1', action: 'Block Outgoing UPI Transaction of ₹45,000', desc: 'Hold settlement to recipient hacker_vault@offshore.bank.', req: true },
                { id: 'act_2', action: `Temporarily Freeze Customer Account ${activeCustomer?.account_number}`, desc: 'Suspend outward debit capability.', req: true },
                { id: 'act_3', action: 'Terminate Rogue Browser & Tor Session', desc: 'Revoke active OAuth access token immediately.', req: false },
                { id: 'act_4', action: `Edge Firewall IP Isolation (${activeCustomer?.current_ip})`, desc: 'Add IP to perimeter drop rules.', req: true }
              ].map(item => {
                const isApproved = approvedActions[item.id];
                return (
                  <div key={item.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{item.action}</span>
                        {item.req && <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-warning/20 text-cyber-warning border border-cyber-warning/40">Requires Approval</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => setApprovedActions(prev => ({ ...prev, [item.id]: !isApproved }))}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isApproved
                          ? 'bg-cyber-success text-cyber-bg shadow-glow-success'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:border-cyber-accent'
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{isApproved ? 'AUTHORIZED' : 'APPROVE ACTION'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: MITRE ATT&CK Matrix & PDF Export */}
        {activeTab === 'mitre' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-200 text-xs uppercase">
                MITRE ATT&CK Enterprise Framework Mapping:
              </h4>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyber-accent text-cyber-bg font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-glow-cyan"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Executive PDF Report</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400">
                    <th className="p-3">Tactic</th>
                    <th className="p-3">Technique ID</th>
                    <th className="p-3">Technique Name</th>
                    <th className="p-3 text-right">Detection Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {[
                    { tactic: 'Initial Access', id: 'T1078.004', name: 'Valid Accounts: Web Sessions', status: 'DETECTED' },
                    { tactic: 'Credential Access', id: 'T1110.001', name: 'Brute Force: Password Guessing', status: 'DETECTED' },
                    { tactic: 'Defense Evasion', id: 'T1090.003', name: 'Proxy: Tor Exit Node', status: 'DETECTED' },
                    { tactic: 'Impact', id: 'T1657', name: 'Financial Theft & Mule Transfer', status: 'PREVENTED' }
                  ].map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/5">
                      <td className="p-3 text-cyber-accent font-bold">{row.tactic}</td>
                      <td className="p-3 text-slate-400">{row.id}</td>
                      <td className="p-3">{row.name}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-cyber-success/20 text-cyber-success border border-cyber-success/40 text-[10px] font-bold">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── "Ask AI Analyst" Docked Interactive Chat Panel ──────── */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed bottom-6 right-6 w-96 bg-[#050816] border-2 border-cyber-accent rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col h-[520px]"
          >
            {/* Chat Header */}
            <div className="p-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyber-accent animate-spin" />
                <span className="font-bold text-xs text-slate-100">Ask AI Security Analyst</span>
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Recommended Questions Pills */}
            <div className="p-2 bg-black/40 border-b border-white/5 overflow-x-auto flex gap-1.5 shrink-0">
              {[
                "Why is this attack dangerous?",
                "What should the bank do?",
                "Explain the timeline",
                "Explain the evidence"
              ].map(q => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] text-cyber-accent border border-white/10 whitespace-nowrap cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyber-accent text-cyber-bg font-bold rounded-br-none'
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-500 mt-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-2.5 bg-white/5 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask multi-agent AI assistant…"
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none placeholder-slate-600 font-mono"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2 rounded-xl bg-cyber-accent text-cyber-bg hover:opacity-90 transition-opacity cursor-pointer font-bold"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AISecurityAgents;
