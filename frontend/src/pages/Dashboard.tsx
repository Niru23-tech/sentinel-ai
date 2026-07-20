import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSentinel } from '../context/SentinelContext';
import { 
  Activity, 
  ShieldAlert, 
  Smartphone, 
  Compass, 
  Globe, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle,
  User,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { activeCustomer, incidents, recentLogs, moneySaved, activeIncidentsCount } = useSentinel();

  if (!activeCustomer) {
    return (
      <div className="h-96 flex items-center justify-center font-mono text-gray-500 animate-pulse">
        [INITIALIZING COGNITIVE TELEMETRY DATABASE...]
      </div>
    );
  }

  // Risk Gauge styling based on score
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-cyber-red border-cyber-red shadow-glow-red';
    if (score >= 50) return 'text-cyber-amber border-cyber-amber';
    return 'text-cyber-accent border-cyber-accent shadow-glow-cyan';
  };

  const getThreatLevel = (score: number) => {
    if (score >= 80) return { label: 'CRITICAL', color: 'text-cyber-red' };
    if (score >= 50) return { label: 'HIGH', color: 'text-cyber-amber' };
    if (score >= 30) return { label: 'MEDIUM', color: 'text-cyber-blue' };
    return { label: 'LOW', color: 'text-cyber-green' };
  };

  const threatLevel = getThreatLevel(activeCustomer.risk_score);

  // Recharts Chart configurations
  const transactionData = [
    { name: 'Allowed', value: incidents.length > 0 ? 19 : 20 },
    { name: 'Blocked', value: incidents.length > 0 ? incidents.length : 1 }
  ];
  
  const pieColors = ['#10b981', '#ef4444'];

  const categoryData = [
    { name: 'Account Takeover', value: incidents.filter(i => i.threat_type === 'Account Takeover').length + 1 },
    { name: 'Session Hijack', value: incidents.filter(i => i.threat_type === 'Session Hijack').length },
    { name: 'Phishing', value: incidents.filter(i => i.threat_type === 'Phishing Attack').length },
    { name: 'Malware', value: incidents.filter(i => i.threat_type === 'Malware Infection').length },
    { name: 'Credential Theft', value: incidents.filter(i => i.threat_type === 'Credential Theft').length }
  ];

  const categoryColors = ['#00f0ff', '#3b82f6', '#a855f7', '#ef4444', '#f59e0b'];

  const riskHistory = [
    { time: '09:00', risk: 10 },
    { time: '09:05', risk: 15 },
    { time: '09:10', risk: activeCustomer.risk_score >= 45 ? 45 : 15 },
    { time: '09:15', risk: activeCustomer.risk_score >= 70 ? 70 : 15 },
    { time: '09:20', risk: activeCustomer.risk_score }
  ];

  // Filter logs for this active customer
  const customerLogs = recentLogs.filter(l => l.customer_id === activeCustomer.id);

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Cards — all clickable with drill-down navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Monitored Account → Transactions */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          onClick={() => navigate('/transactions')}
          className="cyber-card border-l-4 border-l-cyber-blue shadow-glow-blue flex items-center justify-between cursor-pointer group"
          title="Open Transaction Simulator"
        >
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider font-mono">Monitored Deposit Account</p>
            <h3 className="text-xl font-bold text-gray-100 mt-1">{activeCustomer.name}</h3>
            <p className="text-[11px] text-gray-400 font-mono mt-1">{activeCustomer.account_number}</p>
            <p className="text-[9px] text-cyber-accent/60 mt-1 font-mono group-hover:text-cyber-accent transition-colors flex items-center gap-1">
              <ArrowRight className="h-2.5 w-2.5" /> Open Transactions
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-cyber-blue/10 flex items-center justify-center text-cyber-blue border border-cyber-blue/20 group-hover:bg-cyber-blue/20 transition-colors">
            <User className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Account Balance → Transactions */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          onClick={() => navigate('/transactions')}
          className="cyber-card border-l-4 border-l-cyber-green shadow-glow-cyan flex items-center justify-between cursor-pointer group"
          title="Send Money"
        >
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider font-mono">Available Balance</p>
            <h3 className="text-xl font-extrabold text-cyber-green mt-1 font-mono">
              ₹{activeCustomer.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">Today's Spend: ₹{activeCustomer.today_spending.toLocaleString()}</p>
            <p className="text-[9px] text-cyber-green/60 mt-1 font-mono group-hover:text-cyber-green transition-colors flex items-center gap-1">
              <ArrowRight className="h-2.5 w-2.5" /> Send Money
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-cyber-green/10 flex items-center justify-center text-cyber-green border border-cyber-green/20 group-hover:bg-cyber-green/20 transition-colors">
            <DollarSign className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Active Threats → AI Analysis */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          onClick={() => navigate('/analysis')}
          className="cyber-card border-l-4 border-l-cyber-red shadow-glow-red flex items-center justify-between cursor-pointer group"
          title="Open AI Analysis"
        >
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider font-mono">Active Threats Flagged</p>
            <h3 className="text-xl font-bold text-cyber-red mt-1 font-mono">{activeIncidentsCount}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Blocked & Frozen under auto-defense</p>
            <p className="text-[9px] text-cyber-red/60 mt-1 font-mono group-hover:text-cyber-red transition-colors flex items-center gap-1">
              <ArrowRight className="h-2.5 w-2.5" /> Investigate Now
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-cyber-red/10 flex items-center justify-center text-cyber-red border border-cyber-red/20 group-hover:bg-cyber-red/20 transition-colors">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Prevented Losses → Incident Reports */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          onClick={() => navigate('/reports')}
          className="cyber-card border-l-4 border-l-purple-500 flex items-center justify-between cursor-pointer group"
          title="View Incident Reports"
        >
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider font-mono">Prevented Losses</p>
            <h3 className="text-xl font-bold text-purple-400 mt-1 font-mono">₹{moneySaved.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Protected before transfer exit</p>
            <p className="text-[9px] text-purple-400/60 mt-1 font-mono group-hover:text-purple-400 transition-colors flex items-center gap-1">
              <ArrowRight className="h-2.5 w-2.5" /> View Reports
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-950/20 flex items-center justify-center text-purple-400 border border-purple-900/40 group-hover:bg-purple-950/40 transition-colors">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </motion.div>
      </div>

      {/* 2. Risk Engine & Profile Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Gauge Card */}
        <div className="cyber-card lg:col-span-1 flex flex-col items-center justify-center p-6 text-center">
          <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-6 self-start">AI Session Risk Gauge</h4>
          
          {/* Animated Gauge Ring */}
          <div className="relative flex items-center justify-center h-48 w-48 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="78"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-cyber-border/40"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="78"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={490}
                initial={{ strokeDashoffset: 490 }}
                animate={{ strokeDashoffset: 490 - (490 * activeCustomer.risk_score) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={activeCustomer.risk_score >= 80 ? 'text-cyber-red' : activeCustomer.risk_score >= 50 ? 'text-cyber-amber' : 'text-cyber-accent'}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold font-mono tracking-tighter text-gray-100">
                {activeCustomer.risk_score}%
              </span>
              <span className={`text-[10px] font-bold font-mono tracking-wider mt-1 ${threatLevel.color}`}>
                {threatLevel.label} RISK
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full border-t border-cyber-border/50 pt-4 mt-2">
            <div>
              <p className="text-[10px] text-gray-500 font-mono">SECURITY STATUS</p>
              <span className={`text-xs font-semibold ${activeCustomer.security_status === 'Secured' ? 'text-cyber-green' : 'text-cyber-red animate-pulse-cyan'}`}>
                {activeCustomer.security_status}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-mono">ACCOUNT STATUS</p>
              <span className={`text-xs font-semibold ${activeCustomer.account_status === 'Active' ? 'text-cyber-green' : 'text-cyber-red font-bold'}`}>
                {activeCustomer.account_status}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Security Telemetry Profile Card */}
        <div className="cyber-card lg:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Device & Session Telemetry</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="flex items-center gap-3 p-3.5 bg-cyber-cardLight/30 border border-cyber-border/50 rounded-xl">
                <Smartphone className="h-5 w-5 text-cyber-accent" />
                <div>
                  <p className="text-[10px] text-gray-500 font-mono">CLIENT DEVICE</p>
                  <p className="text-xs font-semibold text-gray-300 truncate">{activeCustomer.current_device}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-cyber-cardLight/30 border border-cyber-border/50 rounded-xl">
                <Globe className="h-5 w-5 text-cyber-accent" />
                <div>
                  <p className="text-[10px] text-gray-500 font-mono">NETWORK ROUTE / IP</p>
                  <p className="text-xs font-semibold text-gray-300 font-mono">{activeCustomer.current_ip}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-cyber-cardLight/30 border border-cyber-border/50 rounded-xl">
                <Compass className="h-5 w-5 text-cyber-accent" />
                <div>
                  <p className="text-[10px] text-gray-500 font-mono">REPORTED GEO-LOCATION</p>
                  <p className="text-xs font-semibold text-gray-300">{activeCustomer.current_location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-cyber-cardLight/30 border border-cyber-border/50 rounded-xl">
                <Compass className="h-5 w-5 text-cyber-accent" />
                <div>
                  <p className="text-[10px] text-gray-500 font-mono">CURRENT WEB BROWSER</p>
                  <p className="text-xs font-semibold text-gray-300">{activeCustomer.current_browser}</p>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 p-4 bg-cyber-red/5 border border-cyber-red/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-cyber-red mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-200">Threat Correlation Analysis</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {activeCustomer.risk_score >= 80 
                  ? "CRITICAL: Correlated events indicate active Account Takeover. Outbound transfers locked."
                  : activeCustomer.risk_score >= 40 
                  ? "WARNING: Anomalous location/VPN detected. Elevating transaction risk evaluation."
                  : "Normal session profile. Standard transaction processing rules applied."}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Charts and Activity Log Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Trend Chart */}
        <div className="cyber-card lg:col-span-2">
          <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyber-accent" />
            <span>AI Risk Scoring Trend (Session History)</span>
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#4b5563" fontSize={10} fontFamily="monospace" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1624', borderColor: '#1b2a47', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Distribution Chart */}
        <div className="cyber-card lg:col-span-1 flex flex-col justify-between">
          <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Platform Threat Categories</h4>
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1624', borderColor: '#1b2a47', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-xl font-bold font-mono text-gray-300">
                {incidents.length + 1}
              </span>
              <p className="text-[9px] text-gray-500 font-mono">CORRELATIONS</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400 pt-2 border-t border-cyber-border/40">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: categoryColors[i] }}></span>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Customer Activity Stream timeline */}
      <div className="cyber-card">
        <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyber-accent animate-pulse" />
          <span>Active Threat Telemetry Timeline (Client Logs)</span>
        </h4>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {customerLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500 font-mono">
              [NO ANOMALOUS TELEMETRY DETECTED FOR CURRENT CLIENT SESSION]
            </div>
          ) : (
            customerLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-3 bg-cyber-cardLight/20 border border-cyber-border/40 rounded-xl hover:border-cyber-accent/30 transition-all duration-200">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  log.severity === 'Critical' ? 'bg-red-950/40 text-cyber-red border border-red-900/60' :
                  log.severity === 'High' ? 'bg-amber-950/50 text-cyber-amber border border-amber-900/60' :
                  'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20'
                }`}>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold text-gray-200">{log.event_type}</p>
                    <span className="text-[9px] font-mono text-gray-500 shrink-0">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{log.description}</p>
                </div>
                {log.risk_added > 0 && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-bold ${
                    log.severity === 'Critical' || log.severity === 'High' ? 'bg-red-950/50 text-cyber-red' : 'bg-amber-950/50 text-cyber-amber'
                  }`}>
                    +{log.risk_added} Risk
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
