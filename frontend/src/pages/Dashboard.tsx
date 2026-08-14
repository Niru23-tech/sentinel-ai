import React, { useState, useEffect } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Wallet, 
  Zap, 
  ArrowUpRight, 
  Lock, 
  Globe, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp, 
  Database, 
  Terminal, 
  Layers, 
  Bot, 
  Cpu, 
  FileText, 
  Sparkles, 
  Search, 
  UserCheck, 
  Radio, 
  Flame, 
  Target, 
  Clock, 
  Check, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line 
} from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    customers, 
    activeCustomer, 
    logs, 
    transactions, 
    incidents, 
    recentLogs, 
    moneySaved, 
    activeIncidentsCount, 
    criticalThreatsCount,
    triggerAttack,
    selectCustomer
  } = useSentinel();

  const [simulating, setSimulating] = useState(false);
  const [digitalTime, setDigitalTime] = useState('21:30:06');

  // Digital Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setDigitalTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const riskScore = activeCustomer?.risk_score || 85;
  const isCritical = riskScore >= 80;

  // Waveform Data with bold thick strokes
  const waveformData = [
    { time: '00:00', threatWave: 25, baseline: 10, barVal: 15 },
    { time: '02:00', threatWave: 35, baseline: 12, barVal: 22 },
    { time: '04:00', threatWave: 20, baseline: 8,  barVal: 18 },
    { time: '06:00', threatWave: 55, baseline: 15, barVal: 45 },
    { time: '08:00', threatWave: 88, baseline: 20, barVal: 78 },
    { time: '10:00', threatWave: 92, baseline: 25, barVal: 85 },
    { time: '12:00', threatWave: 65, baseline: 18, barVal: 60 },
    { time: '14:00', threatWave: 75, baseline: 22, barVal: 70 },
    { time: '16:00', threatWave: 98, baseline: 30, barVal: 95 },
    { time: '18:00', threatWave: 45, baseline: 15, barVal: 40 },
    { time: '20:00', threatWave: 82, baseline: 20, barVal: 75 },
    { time: '22:00', threatWave: 90, baseline: 24, barVal: 88 }
  ];

  // Pie slices - High Contrast Sharp Colors
  const pieSlices = [
    { name: 'Critical Threat', value: 45, color: '#E11D48' },
    { name: 'Secure Baseline', value: 35, color: '#00F2FE' },
    { name: 'Muted Idle',      value: 20, color: '#334155' }
  ];

  const barData = [
    { cat: 'ATK-01', val: 65 },
    { cat: 'ATK-02', val: 88 },
    { cat: 'ATK-03', val: 42 },
    { cat: 'ATK-04', val: 95 },
    { cat: 'ATK-05', val: 78 },
    { cat: 'ATK-06', val: 54 },
    { cat: 'ATK-07', val: 90 }
  ];

  const handleQuickAttack = async (type: string) => {
    setSimulating(true);
    try {
      await triggerAttack(type);
      navigate('/agents');
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-4 relative pb-12 font-mono text-white font-bold">
      
      {/* ── TOP HEADER ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* Top Left: Sharp Digital LED Clock */}
        <div className="md:col-span-3 cyber-glass p-3 flex flex-col justify-between border-l-4 border-l-[#E11D48]">
          <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
            <span className="uppercase tracking-widest text-[#E11D48]">SYSTEM CLOCK</span>
            <span className="px-1.5 py-0.5 rounded bg-[#E11D48] text-white font-extrabold">LIVE</span>
          </div>
          <div className="my-1">
            <h1 className="text-3xl font-extrabold text-[#E11D48] tracking-wider font-digital">
              {digitalTime}
            </h1>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-300 border-t border-white/20 pt-1 font-bold">
            <span>TARGET: <b className="text-white">{activeCustomer?.account_number}</b></span>
            <span className="text-[#00F2FE] font-extrabold">211 3006</span>
          </div>
        </div>

        {/* Top Center: Command Status Banner */}
        <div className="md:col-span-6 cyber-glass p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-200 uppercase tracking-wider">COMMAND CENTER MATRIX</span>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E11D48]" />
              <span className="text-[#E11D48] font-extrabold">TACTICAL CRIMSON OVERRIDE</span>
            </div>
          </div>
          <div className="flex items-center justify-between my-2 text-xs font-bold">
            <div className="space-y-0.5">
              <p className="text-slate-400 text-[10px] font-bold">CURRENT RISK SCORE</p>
              <p className="text-xl font-extrabold text-[#E11D48]">{riskScore}% CRITICAL</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-slate-400 text-[10px] font-bold">AUTONOMOUS DEFENSE</p>
              <p className="text-sm font-extrabold text-[#00F2FE]">6 AI AGENTS ACTIVE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-white/20">
            {['Account Takeover', 'Credential Stuffing', 'Impossible Travel'].map(atk => (
              <button
                key={atk}
                onClick={() => handleQuickAttack(atk)}
                disabled={simulating}
                className="px-2.5 py-1 rounded bg-[#E11D48] hover:bg-[#BE123C] text-white text-[10px] font-extrabold transition-all cursor-pointer disabled:opacity-50 border border-white/20"
              >
                Inject {atk.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Top Right: Sharp Radial Meter Card */}
        <div className="md:col-span-3 cyber-glass p-3 flex items-center justify-between border-r-4 border-r-[#E11D48]">
          <div className="space-y-1 text-xs font-bold">
            <span className="text-[10px] text-slate-300 uppercase font-extrabold block">THREAT RADIAL</span>
            <p className="text-xl font-extrabold text-white">{riskScore}%</p>
            <span className="text-[10px] text-[#E11D48] font-extrabold block">P1 CRITICAL</span>
          </div>

          <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-700" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path
                strokeWidth="4"
                strokeDasharray={`${riskScore}, 100`}
                strokeLinecap="round"
                stroke="#E11D48"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-xs font-extrabold text-[#E11D48]">
              {riskScore}
            </div>
          </div>
        </div>

      </div>

      {/* ── CENTRAL MAIN DISPLAY GRID ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* Left Column (Col 3): Telemetry Feed */}
        <div className="lg:col-span-3 space-y-3">
          
          <div className="cyber-glass p-3 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-slate-200">TELEMETRY FEED</span>
              <span className="text-[#E11D48] font-extrabold">LIVE</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {recentLogs.slice(0, 5).map(l => (
                <div key={l.id} className="p-2 rounded bg-slate-900 border border-white/15 text-[10px] space-y-0.5 font-bold">
                  <div className="flex justify-between text-[#E11D48] font-extrabold text-[10px]">
                    <span>{l.event_type}</span>
                    <span>+{l.risk_added}%</span>
                  </div>
                  <p className="text-slate-300 text-[9px] truncate leading-snug">{l.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="cyber-glass p-3 space-y-1.5 border-l-4 border-l-[#00F2FE]">
            <span className="text-[10px] text-slate-300 font-extrabold block uppercase">MONEY SAVED</span>
            <p className="text-xl font-extrabold text-[#00F2FE]">₹{moneySaved.toLocaleString()}</p>
            <span className="text-[9px] text-slate-400 font-bold">Autonomous Escrow Hold</span>
          </div>

        </div>

        {/* Center Main Focus Card (Col 6): Bold Clear Line & Bar Charts */}
        <div className="lg:col-span-6 cyber-glass p-4 space-y-4 border-2 border-[#E11D48]">
          <div className="flex items-center justify-between text-xs border-b border-white/20 pb-2 font-bold">
            <span className="text-white tracking-wider flex items-center gap-2 font-extrabold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E11D48]" />
              PRIMARY THREAT WAVEFORM & BAR GRAPH
            </span>
            <span className="text-[10px] text-[#00F2FE] font-extrabold">TACTICAL WAVE: ACTIVE</span>
          </div>

          {/* Upper Crisp Thick Line Chart */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waveformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="time" stroke="#FFFFFF" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#FFFFFF" fontSize={10} fontWeight="bold" />
                <Tooltip contentStyle={{ backgroundColor: '#07080E', borderColor: '#E11D48', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="threatWave" stroke="#E11D48" strokeWidth={3.5} dot={{ fill: '#E11D48', r: 4 }} name="Threat Waveform" />
                <Line type="monotone" dataKey="baseline" stroke="#00F2FE" strokeWidth={2.5} dot={false} name="Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Lower Crisp Red Bar Chart */}
          <div className="h-28 w-full border-t border-white/20 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waveformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="time" stroke="#FFFFFF" fontSize={9} fontWeight="bold" />
                <Bar dataKey="barVal" fill="#E11D48" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (Col 3): AI Security Agents Mini Widget */}
        <div className="lg:col-span-3 space-y-3">
          <div className="cyber-glass p-3 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-white/20 pb-2 font-bold">
              <span className="text-white">AI AGENTS (6)</span>
              <button onClick={() => navigate('/agents')} className="text-[10px] text-[#E11D48] hover:underline cursor-pointer font-extrabold">
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Threat Analyst', conf: 96.8, color: '#E11D48' },
                { name: 'Fraud Analyst', conf: 95.2, color: '#FFB300' },
                { name: 'Behaviour Agent', conf: 94.0, color: '#00F2FE' },
                { name: 'Forensics Agent', conf: 97.4, color: '#E11D48' },
                { name: 'Incident Response', conf: 98.9, color: '#00E5FF' },
                { name: 'Executive Report', conf: 99.2, color: '#E11D48' }
              ].map(ag => (
                <div key={ag.name} className="p-2 rounded bg-slate-900 border border-white/15 text-[10px] space-y-1 font-bold">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">{ag.name}</span>
                    <span className="text-[#E11D48] font-extrabold">{ag.conf}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${ag.conf}%`, backgroundColor: ag.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

        {/* Bottom Left: Pie Chart */}
        <div className="md:col-span-4 cyber-glass p-3 space-y-2 font-bold">
          <span className="text-[10px] font-extrabold text-slate-200 uppercase block">THREAT BREAKDOWN SLICES</span>
          <div className="h-36 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieSlices} innerRadius={25} outerRadius={48} paddingAngle={4} dataKey="value">
                  {pieSlices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#07080E', borderColor: '#E11D48', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Center: Bar Chart */}
        <div className="md:col-span-4 cyber-glass p-3 space-y-2 font-bold">
          <span className="text-[10px] font-extrabold text-slate-200 uppercase block">CATEGORY BAR SPECTRUM</span>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                <XAxis dataKey="cat" stroke="#FFFFFF" fontSize={9} fontWeight="bold" />
                <Bar dataKey="val" fill="#E11D48" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Right: Status Readout */}
        <div className="md:col-span-4 cyber-glass p-3 space-y-2 font-bold">
          <span className="text-[10px] font-extrabold text-slate-200 uppercase block">TACTICAL INCIDENT READOUT</span>
          <div className="space-y-1 text-[10px] font-bold">
            <div className="flex justify-between p-2 rounded bg-slate-900 border border-white/10">
              <span className="text-slate-300">Account Status:</span> <b className="text-[#E11D48] font-extrabold">UNDER THREAT</b>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900 border border-white/10">
              <span className="text-slate-300">Authorization Gate:</span> <b className="text-[#00F2FE] font-extrabold">MANDATORY BANK APPROVAL</b>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900 border border-white/10">
              <span className="text-slate-300">Escrow Protection:</span> <b className="text-[#00E5FF] font-extrabold">₹45,000 HELD</b>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
