import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ClipboardList, MessageSquare, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Clock, ArrowUpCircle, User,
  Send, Plus, Filter, Tag, Calendar, Paperclip, Bell, X
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type CasePriority = 'P1-Critical' | 'P2-High' | 'P3-Medium' | 'P4-Low';
type CaseStatus   = 'Open' | 'Investigating' | 'Pending Approval' | 'Resolved' | 'Closed';

interface TimelineEvent {
  id: number;
  time: string;
  actor: string;
  action: string;
  note?: string;
  type: 'opened' | 'assigned' | 'comment' | 'escalated' | 'resolved' | 'evidence';
}

interface SOCCase {
  id: string;
  title: string;
  incidentRef: string;
  customer: string;
  accountNo: string;
  priority: CasePriority;
  status: CaseStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  threatType: string;
  riskScore: number;
  amountAtRisk: number;
  timeline: TimelineEvent[];
  tags: string[];
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const ANALYSTS = ['Kiran Reddy', 'Meera Iyer', 'Suresh Babu', 'Divya Nair', 'Unassigned'];

const PRIORITY_CFG: Record<CasePriority, { color: string; badge: string; dot: string }> = {
  'P1-Critical':  { color: 'text-cyber-red',   badge: 'bg-red-950/50 border-red-900/60 text-cyber-red',      dot: 'bg-cyber-red'   },
  'P2-High':      { color: 'text-cyber-amber',  badge: 'bg-amber-950/50 border-amber-900/60 text-cyber-amber', dot: 'bg-cyber-amber' },
  'P3-Medium':    { color: 'text-cyber-blue',   badge: 'bg-blue-950/50 border-blue-900/60 text-cyber-blue',   dot: 'bg-cyber-blue'  },
  'P4-Low':       { color: 'text-gray-400',     badge: 'bg-cyber-cardLight/50 border-cyber-border/60 text-gray-400', dot: 'bg-gray-500' },
};

const STATUS_CFG: Record<CaseStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  'Open':             { color: 'text-cyber-red',    bg: 'bg-red-950/40 border-red-900/60',          icon: <AlertTriangle className="h-3 w-3" /> },
  'Investigating':    { color: 'text-cyber-amber',  bg: 'bg-amber-950/40 border-amber-900/60',       icon: <Clock className="h-3 w-3" />        },
  'Pending Approval': { color: 'text-purple-400',   bg: 'bg-purple-950/40 border-purple-900/60',     icon: <Bell className="h-3 w-3" />         },
  'Resolved':         { color: 'text-cyber-green',  bg: 'bg-green-950/40 border-green-900/60',       icon: <CheckCircle className="h-3 w-3" />  },
  'Closed':           { color: 'text-gray-500',     bg: 'bg-cyber-cardLight/30 border-cyber-border', icon: <CheckCircle className="h-3 w-3" />  },
};

const TIMELINE_ICON: Record<TimelineEvent['type'], React.ReactNode> = {
  opened:   <AlertTriangle  className="h-3.5 w-3.5 text-cyber-red"    />,
  assigned: <User           className="h-3.5 w-3.5 text-cyber-blue"   />,
  comment:  <MessageSquare  className="h-3.5 w-3.5 text-cyber-accent" />,
  escalated:<ArrowUpCircle  className="h-3.5 w-3.5 text-cyber-amber"  />,
  resolved: <CheckCircle    className="h-3.5 w-3.5 text-cyber-green"  />,
  evidence: <Paperclip      className="h-3.5 w-3.5 text-purple-400"   />,
};

const SEED_CASES: SOCCase[] = [
  {
    id: 'CASE-0041', title: 'Full Account Takeover — Tor Exit Node',
    incidentRef: 'INC-0001', customer: 'Arjun Sharma', accountNo: 'ACC-100001',
    priority: 'P1-Critical', status: 'Investigating', assignedTo: 'Kiran Reddy',
    createdAt: '09:23', updatedAt: '09:31', threatType: 'Account Takeover',
    riskScore: 95, amountAtRisk: 485000, tags: ['ATO', 'Tor', 'Frozen'],
    timeline: [
      { id: 1, time: '09:23:14', actor: 'SentinelAI Engine', action: 'Case automatically opened. Risk score 95% exceeded P1 threshold.', type: 'opened' },
      { id: 2, time: '09:23:15', actor: 'SentinelAI Engine', action: 'Account ACC-100001 frozen. Outgoing transactions blocked.', type: 'evidence' },
      { id: 3, time: '09:23:18', actor: 'SentinelAI Engine', action: 'OTP sent to registered mobile +91-XXXXX-08421.', type: 'evidence' },
      { id: 4, time: '09:25:02', actor: 'Kiran Reddy', action: 'Assigned to self. Reviewing Tor exit node IP: 185.220.101.5 (RU).', type: 'assigned' },
      { id: 5, time: '09:28:44', actor: 'Kiran Reddy', action: 'Confirmed malicious session. Attacker used credential dump from LinkedIn breach. Escalating for account recovery.', type: 'comment' },
      { id: 6, time: '09:31:10', actor: 'Meera Iyer', action: 'Peer review completed. Evidence sufficient for STR filing. Escalated to Compliance team.', type: 'escalated' },
    ],
  },
  {
    id: 'CASE-0040', title: 'Phishing Link — Credential Theft Suspected',
    incidentRef: 'INC-0002', customer: 'Priya Patel', accountNo: 'ACC-100002',
    priority: 'P2-High', status: 'Open', assignedTo: 'Unassigned',
    createdAt: '09:15', updatedAt: '09:15', threatType: 'Phishing Attack',
    riskScore: 72, amountAtRisk: 120000, tags: ['Phishing', 'New Device'],
    timeline: [
      { id: 1, time: '09:15:02', actor: 'SentinelAI Engine', action: 'New device login from Netherlands VPN. Phishing click detected on customer email.', type: 'opened' },
      { id: 2, time: '09:15:05', actor: 'SentinelAI Engine', action: 'SMS alert dispatched. Customer login flagged for MFA re-verification.', type: 'evidence' },
    ],
  },
  {
    id: 'CASE-0039', title: 'Smurfing Pattern — 4 Mule Accounts',
    incidentRef: 'INC-0003', customer: 'Multi-Account', accountNo: 'Multiple',
    priority: 'P2-High', status: 'Pending Approval', assignedTo: 'Suresh Babu',
    createdAt: '08:55', updatedAt: '09:05', threatType: 'Money Laundering',
    riskScore: 81, amountAtRisk: 720000, tags: ['AML', 'Smurfing', 'STR-Required'],
    timeline: [
      { id: 1, time: '08:55:00', actor: 'SentinelAI Engine', action: 'Structuring pattern detected. 4 accounts each receiving ≤₹10,000 × 9 transactions.', type: 'opened' },
      { id: 2, time: '08:58:10', actor: 'Suresh Babu', action: 'Network graph confirmed. All 4 accounts linked to single aggregator. STR draft prepared.', type: 'comment' },
      { id: 3, time: '09:05:00', actor: 'Suresh Babu', action: 'STR submitted to FIU-IND portal. Awaiting compliance head approval to freeze all linked accounts.', type: 'escalated' },
    ],
  },
  {
    id: 'CASE-0038', title: 'Session Hijack — Mid-Transaction',
    incidentRef: 'INC-0004', customer: 'Rahul Verma', accountNo: 'ACC-100003',
    priority: 'P1-Critical', status: 'Resolved', assignedTo: 'Divya Nair',
    createdAt: '08:40', updatedAt: '08:53', threatType: 'Session Hijack',
    riskScore: 88, amountAtRisk: 200000, tags: ['Session', 'Resolved'],
    timeline: [
      { id: 1, time: '08:40:11', actor: 'SentinelAI Engine', action: 'Session cookie stolen mid-transaction. Geo-velocity anomaly: Mumbai → London in 4 min.', type: 'opened' },
      { id: 2, time: '08:42:00', actor: 'Divya Nair', action: 'Session terminated immediately. Attacker ejected. ₹2L transfer cancelled.', type: 'comment' },
      { id: 3, time: '08:50:30', actor: 'Divya Nair', action: 'Customer verified via phone. New session issued with device binding. Case resolved.', type: 'resolved' },
    ],
  },
  {
    id: 'CASE-0037', title: 'Credential Stuffing — 847 Failed Logins',
    incidentRef: 'INC-0005', customer: 'System-Wide', accountNo: 'N/A',
    priority: 'P2-High', status: 'Closed', assignedTo: 'Kiran Reddy',
    createdAt: '07:30', updatedAt: '08:10', threatType: 'Brute Force',
    riskScore: 65, amountAtRisk: 0, tags: ['BruteForce', 'IPBlocked'],
    timeline: [
      { id: 1, time: '07:30:00', actor: 'SentinelAI Engine', action: '847 failed login attempts in 8 minutes from 3 IPs. Botnet signature matched.', type: 'opened' },
      { id: 2, time: '07:31:00', actor: 'SentinelAI Engine', action: 'All 3 IPs auto-blacklisted. CAPTCHA enforced on login endpoint.', type: 'evidence' },
      { id: 3, time: '08:10:00', actor: 'Kiran Reddy', action: 'Post-incident review complete. No accounts compromised. Playbook executed correctly. Closing.', type: 'resolved' },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SOCWorkbench: React.FC = () => {
  const { incidents } = useSentinel();
  const [cases,         setCases]         = useState<SOCCase[]>(SEED_CASES);
  const [selectedCase,  setSelectedCase]  = useState<SOCCase>(SEED_CASES[0]);
  const [filterStatus,  setFilterStatus]  = useState<CaseStatus | 'All'>('All');
  const [newComment,    setNewComment]    = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [newTag,        setNewTag]        = useState('');

  const updateCase = (id: string, patch: Partial<SOCCase>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...patch, updatedAt: new Date().toLocaleTimeString().slice(0, 5) } : c));
    if (selectedCase.id === id) setSelectedCase(prev => ({ ...prev, ...patch }));
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAddingComment(true);
    await new Promise(r => setTimeout(r, 500));
    const event: TimelineEvent = {
      id: Date.now(), time: new Date().toLocaleTimeString(),
      actor: 'Kiran Reddy (You)', action: newComment.trim(), type: 'comment',
    };
    const updatedTimeline = [...selectedCase.timeline, event];
    updateCase(selectedCase.id, { timeline: updatedTimeline });
    setNewComment('');
    setAddingComment(false);
  };

  const handleAssign = (analyst: string) => updateCase(selectedCase.id, { assignedTo: analyst });

  const handleStatus = (status: CaseStatus) => {
    const event: TimelineEvent = {
      id: Date.now(), time: new Date().toLocaleTimeString(),
      actor: 'Kiran Reddy (You)', action: `Status changed to ${status}.`,
      type: status === 'Resolved' ? 'resolved' : status === 'Pending Approval' ? 'escalated' : 'comment',
    };
    updateCase(selectedCase.id, { status, timeline: [...selectedCase.timeline, event] });
  };

  const handleAddTag = () => {
    if (!newTag.trim() || selectedCase.tags.includes(newTag.trim())) { setNewTag(''); return; }
    updateCase(selectedCase.id, { tags: [...selectedCase.tags, newTag.trim()] });
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => updateCase(selectedCase.id, { tags: selectedCase.tags.filter(t => t !== tag) });

  const visibleCases = filterStatus === 'All' ? cases : cases.filter(c => c.status === filterStatus);

  const openCount       = cases.filter(c => c.status === 'Open').length;
  const investigCount   = cases.filter(c => c.status === 'Investigating').length;
  const pendingCount    = cases.filter(c => c.status === 'Pending Approval').length;
  const resolvedToday   = cases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

  // Sync when selectedCase changes from list
  const syncSelected = (c: SOCCase) => setSelectedCase(cases.find(x => x.id === c.id) ?? c);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open',             value: openCount,     color: 'text-cyber-red'   },
          { label: 'Investigating',    value: investigCount,  color: 'text-cyber-amber' },
          { label: 'Pending Approval', value: pendingCount,   color: 'text-purple-400'  },
          { label: 'Resolved Today',   value: resolvedToday,  color: 'text-cyber-green' },
        ].map(s => (
          <div key={s.label} className="cyber-card text-center">
            <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
        {/* ── Case List ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 cyber-card flex flex-col gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap border-b border-cyber-border/50 pb-3">
            <Filter className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            {(['All', 'Open', 'Investigating', 'Pending Approval', 'Resolved', 'Closed'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded text-[9px] font-mono border transition-colors ${
                  filterStatus === s ? 'bg-cyber-accent/20 border-cyber-accent/50 text-cyber-accent' : 'border-cyber-border/50 text-gray-500 hover:text-gray-300'
                }`}
              >{s}</button>
            ))}
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
            {visibleCases.map(c => {
              const pc  = PRIORITY_CFG[c.priority];
              const sc  = STATUS_CFG[c.status];
              const sel = selectedCase.id === c.id;
              return (
                <button key={c.id} onClick={() => syncSelected(c)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    sel ? 'bg-cyber-blue/10 border-cyber-accent/60 shadow-glow-blue' : 'bg-cyber-cardLight/20 border-cyber-border/40 hover:border-cyber-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono text-gray-500">{c.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${sc.bg} ${sc.color}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-200 leading-snug">{c.title}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">{c.customer} · {c.threatType}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${pc.badge}`}>{c.priority}</span>
                    <span className="text-[9px] text-gray-600 font-mono">{c.updatedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Case Detail ───────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedCase.id}
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="lg:col-span-3 space-y-4"
          >
            {/* Case header */}
            <div className="cyber-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono text-gray-500">{selectedCase.id}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${PRIORITY_CFG[selectedCase.priority].badge}`}>
                      {selectedCase.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-200">{selectedCase.title}</h3>
                  <p className="text-[11px] text-gray-400 font-mono mt-1">
                    {selectedCase.customer} · {selectedCase.accountNo} · Opened {selectedCase.createdAt}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xl font-extrabold font-mono ${selectedCase.riskScore >= 80 ? 'text-cyber-red' : 'text-cyber-amber'}`}>
                    {selectedCase.riskScore}%
                  </p>
                  <p className="text-[9px] text-gray-600 font-mono">RISK</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedCase.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 bg-cyber-bg border border-cyber-border/60 rounded text-gray-400">
                    <Tag className="h-2.5 w-2.5" />{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-0.5 text-gray-600 hover:text-cyber-red">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                <input type="text" placeholder="+ tag" value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  className="text-[9px] font-mono px-2 py-0.5 bg-transparent border border-dashed border-cyber-border/60 rounded text-gray-500 focus:outline-none focus:border-cyber-accent w-16"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-cyber-border/40">
                {/* Assign */}
                <div>
                  <p className="text-[9px] font-mono text-gray-600 uppercase mb-1.5">Assigned To</p>
                  <select value={selectedCase.assignedTo}
                    onChange={e => handleAssign(e.target.value)}
                    className="w-full bg-cyber-cardLight border border-cyber-border rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyber-accent font-mono"
                  >
                    {ANALYSTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                {/* Status */}
                <div>
                  <p className="text-[9px] font-mono text-gray-600 uppercase mb-1.5">Case Status</p>
                  <select value={selectedCase.status}
                    onChange={e => handleStatus(e.target.value as CaseStatus)}
                    className="w-full bg-cyber-cardLight border border-cyber-border rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyber-accent font-mono"
                  >
                    {(['Open', 'Investigating', 'Pending Approval', 'Resolved', 'Closed'] as CaseStatus[]).map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Amount at risk */}
              {selectedCase.amountAtRisk > 0 && (
                <div className="mt-3 p-2.5 bg-red-950/20 border border-red-900/40 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400">Amount at Risk</span>
                  <span className="text-sm font-extrabold font-mono text-cyber-red">
                    ₹{selectedCase.amountAtRisk.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* ── Timeline ─────────────────────────────────────────────── */}
            <div className="cyber-card">
              <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-cyber-accent" /> Investigation Timeline
              </h4>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-cyber-border/50" />
                <div className="space-y-4">
                  {selectedCase.timeline.map((evt, i) => (
                    <motion.div key={evt.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-4 pl-2"
                    >
                      {/* Icon */}
                      <div className="h-8 w-8 rounded-full bg-cyber-cardLight/40 border border-cyber-border/60 flex items-center justify-center shrink-0 z-10">
                        {TIMELINE_ICON[evt.type]}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-gray-300 font-mono">{evt.actor}</span>
                          <span className="text-[9px] text-gray-600 font-mono">{evt.time}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{evt.action}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Comment box */}
              <div className="mt-4 pt-4 border-t border-cyber-border/40">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add investigation note…"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !addingComment && handleAddComment()}
                    className="flex-1 bg-cyber-bg/50 border border-cyber-border rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyber-accent font-mono"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addingComment}
                    className="px-3 py-2 rounded-lg bg-cyber-blue/20 border border-cyber-blue/40 text-cyber-accent hover:bg-cyber-blue/30 transition-colors disabled:opacity-40"
                  >
                    {addingComment
                      ? <div className="h-3.5 w-3.5 border border-cyber-accent border-t-transparent rounded-full animate-spin" />
                      : <Send className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
                <p className="text-[9px] text-gray-600 font-mono mt-1.5 ml-1">Press Enter or click ↑ to add note. Logged as Kiran Reddy.</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SOCWorkbench;
