import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, Trash2, Play, CheckCircle, Clock, Shield, ShieldOff, BellRing, Lock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Action {
  type: string;
  label: string;
}

interface Playbook {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
  triggerCount: number;
  lastTriggered: string | null;
  avgResponseMs: number;
}

const CONDITION_FIELDS = ['risk_score', 'device_type', 'location_country', 'login_hour', 'transaction_amount', 'vpn_detected', 'tor_detected'];
const OPERATORS = ['>', '<', '=', '!=', 'contains'];
const ACTION_OPTIONS = [
  { type: 'freeze_account',      label: '🔒 Freeze Account'           },
  { type: 'block_transaction',   label: '🚫 Block Outgoing Transactions'},
  { type: 'send_otp',            label: '📱 Send OTP to Customer'     },
  { type: 'send_sms_alert',      label: '📨 Send SMS Alert'           },
  { type: 'create_incident',     label: '📋 Create Incident Report'   },
  { type: 'increase_monitoring', label: '👁 Enable Enhanced Monitoring'},
  { type: 'notify_analyst',      label: '🔔 Alert SOC Analyst'        },
  { type: 'blacklist_ip',        label: '🛡 Blacklist Attacker IP'    },
];

const DEFAULT_PLAYBOOKS: Playbook[] = [
  {
    id: 1,
    name: 'Account Takeover Response',
    description: 'Auto-respond when full ATO sequence detected.',
    enabled: true,
    conditions: [
      { field: 'risk_score',    operator: '>',  value: '80'  },
      { field: 'tor_detected',  operator: '=',  value: 'true'},
    ],
    actions: [
      { type: 'freeze_account',    label: '🔒 Freeze Account'            },
      { type: 'block_transaction', label: '🚫 Block Outgoing Transactions'},
      { type: 'send_otp',          label: '📱 Send OTP to Customer'      },
      { type: 'create_incident',   label: '📋 Create Incident Report'    },
    ],
    triggerCount: 3,
    lastTriggered: '09:23:14',
    avgResponseMs: 210,
  },
  {
    id: 2,
    name: 'VPN Login Alert',
    description: 'Alert analyst and request OTP when VPN login detected.',
    enabled: true,
    conditions: [
      { field: 'vpn_detected',   operator: '=', value: 'true' },
      { field: 'risk_score',     operator: '>',  value: '40'  },
    ],
    actions: [
      { type: 'send_sms_alert',  label: '📨 Send SMS Alert'     },
      { type: 'notify_analyst',  label: '🔔 Alert SOC Analyst'  },
      { type: 'send_otp',        label: '📱 Send OTP to Customer'},
    ],
    triggerCount: 7,
    lastTriggered: '08:55:01',
    avgResponseMs: 95,
  },
  {
    id: 3,
    name: 'High-Value Transaction Guard',
    description: 'Block and verify transfers above ₹50,000 automatically.',
    enabled: true,
    conditions: [
      { field: 'transaction_amount', operator: '>',  value: '50000' },
      { field: 'risk_score',         operator: '>',  value: '50'    },
    ],
    actions: [
      { type: 'block_transaction',   label: '🚫 Block Outgoing Transactions'},
      { type: 'send_otp',            label: '📱 Send OTP to Customer'       },
    ],
    triggerCount: 12,
    lastTriggered: '09:01:44',
    avgResponseMs: 78,
  },
];

interface ExecutionLog {
  id: number;
  playbookName: string;
  trigger: string;
  time: string;
  status: 'success' | 'failed';
  responseMs: number;
}

const EXECUTION_LOG: ExecutionLog[] = [
  { id: 1, playbookName: 'Account Takeover Response', trigger: 'risk_score=95, tor=true', time: '09:23:14', status: 'success', responseMs: 210 },
  { id: 2, playbookName: 'VPN Login Alert',           trigger: 'vpn=true, risk=65',       time: '08:55:01', status: 'success', responseMs: 95  },
  { id: 3, playbookName: 'High-Value Transaction Guard', trigger: 'amount=75000, risk=72', time: '09:01:44', status: 'success', responseMs: 78  },
  { id: 4, playbookName: 'Account Takeover Response', trigger: 'risk_score=88, tor=true', time: '08:43:20', status: 'success', responseMs: 195 },
];

const Playbooks: React.FC = () => {
  const { incidents, triggerAttack } = useSentinel();
  const [playbooks,     setPlaybooks]     = useState<Playbook[]>(DEFAULT_PLAYBOOKS);
  const [expandedId,    setExpandedId]    = useState<number | null>(1);
  const [runningId,     setRunningId]     = useState<number | null>(null);
  const [justRanId,     setJustRanId]     = useState<number | null>(null);
  const [showBuilder,   setShowBuilder]   = useState(false);
  const [newName,       setNewName]       = useState('');
  const [newDesc,       setNewDesc]       = useState('');
  const [newConditions, setNewConditions] = useState<Condition[]>([{ field: 'risk_score', operator: '>', value: '80' }]);
  const [newActions,    setNewActions]    = useState<Action[]>([ACTION_OPTIONS[0]]);

  const togglePlaybook = (id: number) => {
    setPlaybooks(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleRunPlaybook = async (pb: Playbook) => {
    setRunningId(pb.id);
    await new Promise(r => setTimeout(r, 1500));
    setPlaybooks(prev => prev.map(p =>
      p.id === pb.id
        ? { ...p, triggerCount: p.triggerCount + 1, lastTriggered: new Date().toLocaleTimeString() }
        : p
    ));
    setRunningId(null);
    setJustRanId(pb.id);
    setTimeout(() => setJustRanId(null), 3000);
  };

  const saveNewPlaybook = () => {
    if (!newName) return;
    const nb: Playbook = {
      id: Date.now(),
      name: newName,
      description: newDesc,
      enabled: true,
      conditions: newConditions,
      actions: newActions,
      triggerCount: 0,
      lastTriggered: null,
      avgResponseMs: 150,
    };
    setPlaybooks(prev => [...prev, nb]);
    setShowBuilder(false);
    setNewName(''); setNewDesc('');
    setNewConditions([{ field: 'risk_score', operator: '>', value: '80' }]);
    setNewActions([ACTION_OPTIONS[0]]);
  };

  const totalTriggers   = playbooks.reduce((s, p) => s + p.triggerCount, 0);
  const enabledCount    = playbooks.filter(p => p.enabled).length;
  const avgResponseTime = Math.round(playbooks.reduce((s, p) => s + p.avgResponseMs, 0) / playbooks.length);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Playbooks',   value: enabledCount,    color: 'text-cyber-green'  },
          { label: 'Total Triggers',     value: totalTriggers,   color: 'text-cyber-accent' },
          { label: 'Avg Response Time',  value: `${avgResponseTime}ms`, color: 'text-purple-400' },
          { label: 'Threats Auto-Blocked', value: EXECUTION_LOG.filter(l => l.status === 'success').length, color: 'text-cyber-red' },
        ].map(s => (
          <div key={s.label} className="cyber-card text-center">
            <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbook List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyber-accent" />
              <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Response Playbooks</h3>
            </div>
            <button
              onClick={() => setShowBuilder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyber-blue/20 border border-cyber-blue/40 text-cyber-accent hover:bg-cyber-blue/30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> New Playbook
            </button>
          </div>

          {playbooks.map(pb => {
            const isExpanded = expandedId === pb.id;
            const isRunning  = runningId  === pb.id;
            const justRan    = justRanId  === pb.id;
            return (
              <div key={pb.id} className={`cyber-card border transition-all ${pb.enabled ? 'border-cyber-border/60' : 'border-cyber-border/20 opacity-60'}`}>
                {/* Header */}
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : pb.id)}>
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${pb.enabled ? 'bg-cyber-green animate-pulse' : 'bg-gray-600'}`} />
                    <div>
                      <h5 className="text-sm font-bold text-gray-200">{pb.name}</h5>
                      <p className="text-[10px] text-gray-500 font-sans">{pb.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-500 hidden sm:block">
                      Triggered: <span className="text-cyber-accent font-bold">{pb.triggerCount}x</span>
                    </span>
                    {/* Enable toggle */}
                    <button
                      onClick={e => { e.stopPropagation(); togglePlaybook(pb.id); }}
                      className={`relative inline-flex h-4 w-8 rounded-full transition-colors ${pb.enabled ? 'bg-cyber-green' : 'bg-cyber-border'}`}
                    >
                      <span className={`inline-block h-3 w-3 mt-0.5 ml-0.5 transform rounded-full bg-cyber-bg transition-transform ${pb.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 border-t border-cyber-border/40 pt-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Conditions */}
                        <div>
                          <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">IF (Conditions)</p>
                          {pb.conditions.map((c, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs font-mono mb-1.5">
                              <span className="px-2 py-0.5 bg-cyber-blue/10 border border-cyber-blue/30 rounded text-cyber-accent">{c.field}</span>
                              <span className="text-gray-500">{c.operator}</span>
                              <span className="px-2 py-0.5 bg-cyber-cardLight/50 border border-cyber-border/60 rounded text-gray-300">{c.value}</span>
                            </div>
                          ))}
                        </div>
                        {/* Actions */}
                        <div>
                          <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">THEN (Actions)</p>
                          {pb.actions.map((a, i) => (
                            <p key={i} className="text-xs text-gray-300 mb-1.5 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-cyber-green shrink-0" />
                              {a.label}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-cyber-border/40 pt-3">
                        <div className="text-[10px] font-mono text-gray-500">
                          {pb.lastTriggered ? `Last run: ${pb.lastTriggered}` : 'Never triggered'}
                          {' · '} Avg: {pb.avgResponseMs}ms
                        </div>
                        <button
                          onClick={() => handleRunPlaybook(pb)}
                          disabled={isRunning || justRan}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                            justRan ? 'bg-green-950/40 border border-cyber-green/40 text-cyber-green' :
                            isRunning ? 'bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-accent animate-pulse' :
                            'bg-cyber-cardLight/40 border border-cyber-border/80 text-gray-300 hover:text-cyber-accent hover:border-cyber-accent/40'
                          }`}
                        >
                          {justRan ? <><CheckCircle className="h-3 w-3" /> Executed</> :
                           isRunning ? <><div className="h-2.5 w-2.5 border border-cyber-accent border-t-transparent rounded-full animate-spin" /> Running…</> :
                           <><Play className="h-3 w-3" /> Test Run</>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Execution Log */}
        <div className="cyber-card">
          <div className="flex items-center gap-2 border-b border-cyber-border/60 pb-3 mb-4">
            <Clock className="h-4 w-4 text-cyber-accent" />
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Execution Log</h4>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {EXECUTION_LOG.map(log => (
              <div key={log.id} className="p-3 bg-cyber-cardLight/20 border border-cyber-border/40 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold text-gray-200 truncate">{log.playbookName}</p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${log.status === 'success' ? 'bg-green-950/50 text-cyber-green' : 'bg-red-950/50 text-cyber-red'}`}>
                    {log.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono">{log.trigger}</p>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[9px] text-gray-600 font-mono">{log.time}</span>
                  <span className="text-[9px] text-purple-400 font-mono">{log.responseMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Playbook Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cyber-bg/85 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="bg-cyber-card border border-cyber-border rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-200 font-mono flex items-center gap-2"><Plus className="h-4 w-4 text-cyber-accent" /> New Playbook</h3>
                <button onClick={() => setShowBuilder(false)} className="text-gray-500 hover:text-gray-300"><X className="h-4 w-4" /></button>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="Playbook Name" value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyber-accent font-mono" />
                <input type="text" placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyber-accent" />

                {/* Conditions */}
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Conditions (IF)</p>
                  {newConditions.map((c, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-center">
                      <select value={c.field} onChange={e => setNewConditions(prev => prev.map((x, j) => j === i ? { ...x, field: e.target.value } : x))}
                        className="flex-1 bg-cyber-cardLight border border-cyber-border rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyber-accent">
                        {CONDITION_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <select value={c.operator} onChange={e => setNewConditions(prev => prev.map((x, j) => j === i ? { ...x, operator: e.target.value } : x))}
                        className="w-16 bg-cyber-cardLight border border-cyber-border rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyber-accent">
                        {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input type="text" value={c.value} onChange={e => setNewConditions(prev => prev.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                        className="w-20 bg-cyber-bg/50 border border-cyber-border rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyber-accent font-mono" />
                      <button onClick={() => setNewConditions(prev => prev.filter((_, j) => j !== i))} className="text-gray-600 hover:text-cyber-red"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => setNewConditions(prev => [...prev, { field: 'risk_score', operator: '>', value: '80' }])}
                    className="text-[10px] font-mono text-cyber-accent hover:underline">+ Add Condition</button>
                </div>

                {/* Actions */}
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Actions (THEN)</p>
                  {newActions.map((a, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <select value={a.type} onChange={e => {
                        const opt = ACTION_OPTIONS.find(o => o.type === e.target.value)!;
                        setNewActions(prev => prev.map((x, j) => j === i ? opt : x));
                      }} className="flex-1 bg-cyber-cardLight border border-cyber-border rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyber-accent">
                        {ACTION_OPTIONS.map(o => <option key={o.type} value={o.type}>{o.label}</option>)}
                      </select>
                      <button onClick={() => setNewActions(prev => prev.filter((_, j) => j !== i))} className="text-gray-600 hover:text-cyber-red"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => setNewActions(prev => [...prev, ACTION_OPTIONS[0]])}
                    className="text-[10px] font-mono text-cyber-accent hover:underline">+ Add Action</button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowBuilder(false)} className="flex-1 py-2 rounded-lg text-xs font-mono border border-cyber-border text-gray-400 hover:text-gray-200 transition-colors">Cancel</button>
                  <button onClick={saveNewPlaybook} className="flex-1 py-2 rounded-lg text-xs font-mono bg-cyber-blue/20 border border-cyber-blue/40 text-cyber-accent hover:bg-cyber-blue/30 transition-colors font-semibold">Save Playbook</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Playbooks;
