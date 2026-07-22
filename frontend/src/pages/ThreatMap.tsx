import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield, AlertTriangle, X, Activity, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

interface AttackNode {
  id: string;
  country: string;
  city: string;
  ip: string;
  lat: number;
  lng: number;
  type: string;
  severity: 'Critical' | 'High' | 'Medium';
  timestamp: string;
  blocked: boolean;
}

const THREAT_ORIGINS: AttackNode[] = [
  { id: 'a1', country: 'Russia',      city: 'Moscow',      ip: '185.220.101.5',  lat: 55.7,  lng: 37.6,   type: 'Tor Exit Node',      severity: 'Critical', timestamp: '09:12:33', blocked: true  },
  { id: 'a2', country: 'Netherlands', city: 'Amsterdam',   ip: '194.165.16.16',  lat: 52.3,  lng: 4.9,    type: 'VPN Server',         severity: 'Critical', timestamp: '09:14:01', blocked: true  },
  { id: 'a3', country: 'China',       city: 'Shanghai',    ip: '202.101.224.1',  lat: 31.2,  lng: 121.4,  type: 'Credential Stuffing',severity: 'High',     timestamp: '09:15:47', blocked: true  },
  { id: 'a4', country: 'Ukraine',     city: 'Kyiv',        ip: '31.184.236.63',  lat: 50.4,  lng: 30.5,   type: 'Phishing Origin',    severity: 'High',     timestamp: '09:18:22', blocked: true  },
  { id: 'a5', country: 'USA',         city: 'Atlanta',     ip: '45.142.120.100', lat: 33.7,  lng: -84.3,  type: 'Botnet Node',        severity: 'Medium',   timestamp: '09:20:05', blocked: false },
  { id: 'a6', country: 'Romania',     city: 'Bucharest',   ip: '89.40.88.0',     lat: 44.4,  lng: 26.1,   type: 'Tor Exit Node',      severity: 'Critical', timestamp: '09:21:30', blocked: true  },
  { id: 'a7', country: 'Brazil',      city: 'São Paulo',   ip: '177.70.32.5',    lat: -23.5, lng: -46.6,  type: 'Session Hijack',     severity: 'High',     timestamp: '09:23:14', blocked: true  },
  { id: 'a8', country: 'Germany',     city: 'Frankfurt',   ip: '195.176.3.23',   lat: 50.1,  lng: 8.6,    type: 'VPN Server',         severity: 'Medium',   timestamp: '09:25:00', blocked: false },
];

// India target (bank HQ)
const INDIA = { lat: 20.5, lng: 78.9 };

// Convert lat/lng to SVG x/y (simple equirectangular projection)
const toSVG = (lat: number, lng: number, w: number, h: number) => ({
  x: ((lng + 180) / 360) * w,
  y: ((90 - lat) / 180) * h,
});

const ThreatMap: React.FC = () => {
  const { incidents, logs } = useSentinel();
  const [selectedNode, setSelectedNode]   = useState<AttackNode | null>(null);
  const [activeNodes,  setActiveNodes]    = useState<AttackNode[]>([]);
  const [animating,    setAnimating]      = useState(true);
  const W = 800, H = 400;
  const indiaXY = toSVG(INDIA.lat, INDIA.lng, W, H);

  // Sequentially reveal nodes
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < THREAT_ORIGINS.length) {
        setActiveNodes(prev => [...prev, THREAT_ORIGINS[i]]);
        i++;
      } else {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = THREAT_ORIGINS.filter(n => n.severity === 'Critical').length;
  const blockedCount  = THREAT_ORIGINS.filter(n => n.blocked).length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Attack Origins', value: THREAT_ORIGINS.length, color: 'text-cyber-red' },
          { label: 'Critical Threats',      value: criticalCount,         color: 'text-cyber-amber' },
          { label: 'IPs Blocked',           value: blockedCount,          color: 'text-cyber-green' },
          { label: 'Countries Flagged',     value: new Set(THREAT_ORIGINS.map(n => n.country)).size, color: 'text-cyber-accent' },
        ].map(s => (
          <div key={s.label} className="cyber-card text-center">
            <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="cyber-card relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyber-accent animate-pulse" />
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Live Global Threat Intelligence Map</h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            {animating && <span className="text-cyber-amber animate-pulse flex items-center gap-1"><Activity className="h-3 w-3" /> Scanning…</span>}
            <span className="text-gray-600">Target: Indian Banking Infrastructure</span>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-cyber-border/40 bg-[#061018]">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: '420px' }}>
            {/* World map background (simplified grid) */}
            <defs>
              <radialGradient id="indiaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={(H / 8) * i} x2={W} y2={(H / 8) * i} stroke="#0a2030" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 17 }).map((_, i) => (
              <line key={`v${i}`} x1={(W / 16) * i} y1="0" x2={(W / 16) * i} y2={H} stroke="#0a2030" strokeWidth="0.5" />
            ))}

            {/* Attack lines + nodes */}
            {activeNodes.map((node) => {
              const xy = toSVG(node.lat, node.lng, W, H);
              const color = node.severity === 'Critical' ? '#ff3e3e' : node.severity === 'High' ? '#ffaa00' : '#00b4ff';
              return (
                <g key={node.id}>
                  {/* Animated attack line to India */}
                  <line
                    x1={xy.x} y1={xy.y}
                    x2={indiaXY.x} y2={indiaXY.y}
                    stroke={color} strokeWidth="0.8" strokeOpacity="0.4"
                    strokeDasharray="4 3"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="3s" repeatCount="indefinite" />
                  </line>
                  {/* Node dot */}
                  <circle cx={xy.x} cy={xy.y} r="5" fill={color} fillOpacity="0.9" filter="url(#glow)"
                    className="cursor-pointer" onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  />
                  <circle cx={xy.x} cy={xy.y} r="10" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4">
                    <animate attributeName="r" from="5" to="14" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Country label */}
                  <text x={xy.x + 7} y={xy.y - 5} fontSize="7" fill={color} fontFamily="monospace" opacity="0.9">
                    {node.country}
                  </text>
                </g>
              );
            })}

            {/* India target */}
            <circle cx={indiaXY.x} cy={indiaXY.y} r="6" fill="#00f0ff" filter="url(#glow)" />
            <circle cx={indiaXY.x} cy={indiaXY.y} r="14" fill="url(#indiaGlow)" />
            <text x={indiaXY.x + 9} y={indiaXY.y - 7} fontSize="8" fill="#00f0ff" fontFamily="monospace" fontWeight="bold">INDIA (Target)</text>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex gap-4 text-[9px] font-mono">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyber-red inline-block" /> Critical</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyber-amber inline-block" /> High</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyber-blue inline-block" /> Medium</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyber-accent inline-block" /> Target</span>
          </div>
        </div>
      </div>

      {/* Attack detail panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="cyber-card border-l-4 border-l-cyber-red"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-cyber-red" />
                <h4 className="text-sm font-bold text-gray-200 font-mono">Attack Origin Detail — {selectedNode.country}</h4>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-gray-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs font-mono">
              <div><p className="text-gray-600 text-[9px] uppercase mb-1">IP Address</p><p className="text-cyber-red font-bold">{selectedNode.ip}</p></div>
              <div><p className="text-gray-600 text-[9px] uppercase mb-1">City</p><p className="text-gray-300">{selectedNode.city}, {selectedNode.country}</p></div>
              <div><p className="text-gray-600 text-[9px] uppercase mb-1">Attack Type</p><p className="text-cyber-amber">{selectedNode.type}</p></div>
              <div><p className="text-gray-600 text-[9px] uppercase mb-1">Status</p>
                <p className={selectedNode.blocked ? 'text-cyber-green' : 'text-cyber-red'}>
                  {selectedNode.blocked ? '✓ BLOCKED' : '⚠ MONITORING'}
                </p>
              </div>
              <div><p className="text-gray-600 text-[9px] uppercase mb-1">Severity</p><p className={selectedNode.severity === 'Critical' ? 'text-cyber-red' : selectedNode.severity === 'High' ? 'text-cyber-amber' : 'text-cyber-blue'}>{selectedNode.severity}</p></div>
              <div><p className="text-gray-600 text-[9px] uppercase mb-1">First Seen</p><p className="text-gray-300">{selectedNode.timestamp}</p></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attack log table */}
      <div className="cyber-card">
        <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">Threat Origin Log</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {THREAT_ORIGINS.map(node => (
            <div key={node.id} onClick={() => setSelectedNode(node)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                selectedNode?.id === node.id
                  ? 'bg-cyber-red/10 border-cyber-red/50'
                  : 'bg-cyber-cardLight/20 border-cyber-border/40 hover:border-cyber-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full shrink-0 ${node.severity === 'Critical' ? 'bg-cyber-red' : node.severity === 'High' ? 'bg-cyber-amber' : 'bg-cyber-blue'}`} />
                <div>
                  <p className="font-semibold text-gray-200">{node.type} — {node.city}, {node.country}</p>
                  <p className="text-[10px] font-mono text-gray-500">{node.ip} · {node.timestamp}</p>
                </div>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                node.blocked ? 'bg-green-950/50 text-cyber-green border border-green-900/60' : 'bg-amber-950/50 text-cyber-amber border border-amber-900/60'
              }`}>{node.blocked ? 'BLOCKED' : 'MONITORING'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;
