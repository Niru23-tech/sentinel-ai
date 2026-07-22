import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, AlertTriangle, Shield, X, ZoomIn, ZoomOut, RefreshCw, Info, ArrowRight } from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

interface NetworkNode {
  id: string;
  label: string;
  type: 'victim' | 'mule' | 'cashout' | 'external' | 'bank';
  risk: number;
  amount?: number;
  flagged: boolean;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  amount: number;
  txCount: number;
  suspicious: boolean;
  label: string;
}

interface NetworkGraph {
  id: string;
  name: string;
  description: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  patternType: string;
  totalAmount: number;
  riskLevel: 'Critical' | 'High' | 'Medium';
}

const GRAPHS: NetworkGraph[] = [
  {
    id: 'g1',
    name: 'Account Takeover Cashout Chain',
    description: 'Hacked account funnels funds through 2 mule accounts before offshore cashout.',
    patternType: 'Money Mule Chain',
    totalAmount: 485000,
    riskLevel: 'Critical',
    nodes: [
      { id: 'v1',   label: 'Arjun Sharma\n(Victim)',         type: 'victim',   risk: 95, amount: 485000, flagged: true,  x: 120, y: 220 },
      { id: 'm1',   label: 'Ravi Kumar\n(Mule #1)',          type: 'mule',     risk: 82, amount: 350000, flagged: true,  x: 320, y: 130 },
      { id: 'm2',   label: 'Farida B.\n(Mule #2)',           type: 'mule',     risk: 78, amount: 200000, flagged: true,  x: 520, y: 200 },
      { id: 'c1',   label: 'Offshore\nCayman Trust',         type: 'cashout',  risk: 99, amount: 185000, flagged: true,  x: 700, y: 130 },
      { id: 'c2',   label: 'Crypto\nWallet (Monero)',        type: 'cashout',  risk: 99, amount: 165000, flagged: true,  x: 700, y: 310 },
      { id: 'b1',   label: 'SBI\n(Legitimate)',              type: 'bank',     risk: 5,  amount: 0,      flagged: false, x: 120, y: 80  },
    ],
    edges: [
      { source: 'v1', target: 'm1', amount: 350000, txCount: 3, suspicious: true,  label: '₹3.5L / 3 tx' },
      { source: 'm1', target: 'm2', amount: 200000, txCount: 2, suspicious: true,  label: '₹2L / 2 tx'   },
      { source: 'm1', target: 'c1', amount: 150000, txCount: 1, suspicious: true,  label: '₹1.5L / 1 tx' },
      { source: 'm2', target: 'c1', amount: 35000,  txCount: 1, suspicious: true,  label: '₹35K'         },
      { source: 'm2', target: 'c2', amount: 165000, txCount: 2, suspicious: true,  label: '₹1.65L / 2 tx'},
      { source: 'b1', target: 'v1', amount: 0,      txCount: 0, suspicious: false, label: 'Home Bank'     },
    ],
  },
  {
    id: 'g2',
    name: 'Layering — Smurfing Pattern',
    description: 'Large sum broken into small deposits across many accounts to avoid detection thresholds.',
    patternType: 'Smurfing / Structuring',
    totalAmount: 720000,
    riskLevel: 'High',
    nodes: [
      { id: 'src',  label: 'Unknown\nSource',   type: 'external', risk: 99, amount: 720000, flagged: true,  x: 120, y: 220 },
      { id: 's1',   label: 'Smurf Acct #1',    type: 'mule',     risk: 70, amount: 90000,  flagged: true,  x: 330, y: 80  },
      { id: 's2',   label: 'Smurf Acct #2',    type: 'mule',     risk: 70, amount: 90000,  flagged: true,  x: 330, y: 180 },
      { id: 's3',   label: 'Smurf Acct #3',    type: 'mule',     risk: 70, amount: 90000,  flagged: true,  x: 330, y: 280 },
      { id: 's4',   label: 'Smurf Acct #4',    type: 'mule',     risk: 70, amount: 90000,  flagged: true,  x: 330, y: 370 },
      { id: 'agg',  label: 'Aggregator\nAccount', type: 'cashout', risk: 90, amount: 360000, flagged: true, x: 560, y: 220 },
      { id: 'out',  label: 'Final\nWithdrawal', type: 'cashout',  risk: 99, amount: 360000, flagged: true,  x: 740, y: 220 },
    ],
    edges: [
      { source: 'src', target: 's1', amount: 90000, txCount: 9, suspicious: true, label: '₹90K / 9 tx ≤₹10K' },
      { source: 'src', target: 's2', amount: 90000, txCount: 9, suspicious: true, label: '₹90K / 9 tx' },
      { source: 'src', target: 's3', amount: 90000, txCount: 9, suspicious: true, label: '₹90K / 9 tx' },
      { source: 'src', target: 's4', amount: 90000, txCount: 9, suspicious: true, label: '₹90K / 9 tx' },
      { source: 's1', target: 'agg', amount: 90000, txCount: 1, suspicious: true, label: '→ Aggregator' },
      { source: 's2', target: 'agg', amount: 90000, txCount: 1, suspicious: true, label: '→ Aggregator' },
      { source: 's3', target: 'agg', amount: 90000, txCount: 1, suspicious: true, label: '→ Aggregator' },
      { source: 's4', target: 'agg', amount: 90000, txCount: 1, suspicious: true, label: '→ Aggregator' },
      { source: 'agg', target: 'out', amount: 360000, txCount: 1, suspicious: true, label: 'Final exit ₹3.6L' },
    ],
  },
  {
    id: 'g3',
    name: 'Insider Fraud — Rapid Transfer',
    description: 'Bank insider adds themselves as beneficiary and executes rapid transfers during off-hours.',
    patternType: 'Insider Threat',
    totalAmount: 250000,
    riskLevel: 'Critical',
    nodes: [
      { id: 'emp', label: 'Bank Employee\n(Insider)',      type: 'victim',  risk: 88, amount: 250000, flagged: true,  x: 120, y: 200 },
      { id: 'acc', label: 'Employee\nPersonal Acct',      type: 'mule',    risk: 95, amount: 250000, flagged: true,  x: 380, y: 120 },
      { id: 'rel', label: 'Relative\nAccount',            type: 'mule',    risk: 72, amount: 150000, flagged: true,  x: 380, y: 300 },
      { id: 'fin', label: 'Crypto\nExchange',             type: 'cashout', risk: 99, amount: 400000, flagged: true,  x: 620, y: 210 },
    ],
    edges: [
      { source: 'emp', target: 'acc', amount: 250000, txCount: 5, suspicious: true, label: '₹2.5L / 5 tx (2 AM)' },
      { source: 'emp', target: 'rel', amount: 150000, txCount: 3, suspicious: true, label: '₹1.5L off-hours'      },
      { source: 'acc', target: 'fin', amount: 250000, txCount: 1, suspicious: true, label: '→ Crypto exit'        },
      { source: 'rel', target: 'fin', amount: 150000, txCount: 1, suspicious: true, label: '→ Crypto exit'        },
    ],
  },
];

const NODE_COLORS: Record<NetworkNode['type'], { fill: string; stroke: string; text: string }> = {
  victim:   { fill: '#1e1040', stroke: '#00f0ff', text: '#00f0ff' },
  mule:     { fill: '#3d1a00', stroke: '#ffaa00', text: '#ffaa00' },
  cashout:  { fill: '#3d0000', stroke: '#ff3e3e', text: '#ff3e3e' },
  external: { fill: '#2d0d40', stroke: '#c084fc', text: '#c084fc' },
  bank:     { fill: '#0d2d1a', stroke: '#00ff88', text: '#00ff88' },
};

const SVG_W = 860;
const SVG_H = 460;

const NetworkTopology: React.FC = () => {
  const [selectedGraph, setSelectedGraph] = useState<NetworkGraph>(GRAPHS[0]);
  const [selectedNode,  setSelectedNode]  = useState<NetworkNode | null>(null);
  const [selectedEdge,  setSelectedEdge]  = useState<NetworkEdge | null>(null);
  const [animating,     setAnimating]     = useState(false);
  const [visibleNodes,  setVisibleNodes]  = useState<Set<string>>(new Set());
  const [visibleEdges,  setVisibleEdges]  = useState<Set<string>>(new Set());

  const animateGraph = useCallback((graph: NetworkGraph) => {
    setVisibleNodes(new Set());
    setVisibleEdges(new Set());
    setSelectedNode(null);
    setSelectedEdge(null);
    setAnimating(true);

    // Reveal nodes first
    graph.nodes.forEach((node, i) => {
      setTimeout(() => {
        setVisibleNodes(prev => new Set([...prev, node.id]));
      }, i * 200);
    });

    // Then edges
    const nodeDelay = graph.nodes.length * 200 + 100;
    graph.edges.forEach((edge, i) => {
      setTimeout(() => {
        setVisibleEdges(prev => new Set([...prev, `${edge.source}-${edge.target}`]));
      }, nodeDelay + i * 150);
    });

    setTimeout(() => setAnimating(false), nodeDelay + graph.edges.length * 150 + 200);
  }, []);

  useEffect(() => { animateGraph(selectedGraph); }, [selectedGraph.id]);

  const handleSelectGraph = (g: NetworkGraph) => {
    setSelectedGraph(g);
    animateGraph(g);
  };

  // Midpoint + perpendicular offset for edge label
  const edgeMidpoint = (src: NetworkNode, tgt: NetworkNode) => ({
    x: (src.x + tgt.x) / 2,
    y: (src.y + tgt.y) / 2 - 10,
  });

  const edgeKey = (e: NetworkEdge) => `${e.source}-${e.target}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card border-l-4 border-l-cyber-accent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-cyber-accent" />
          <div>
            <h3 className="text-sm font-bold text-gray-200 font-mono">Network Topology & Money Mule Detection</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Maps transaction networks to expose laundering chains, smurfing patterns, and insider fraud.
            </p>
          </div>
        </div>
        <button
          onClick={() => animateGraph(selectedGraph)}
          disabled={animating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-cyber-border/60 text-gray-400 hover:text-cyber-accent hover:border-cyber-accent/40 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${animating ? 'animate-spin text-cyber-accent' : ''}`} />
          Re-animate
        </button>
      </div>

      {/* Pattern selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {GRAPHS.map(g => (
          <button
            key={g.id}
            onClick={() => handleSelectGraph(g)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedGraph.id === g.id
                ? 'bg-cyber-blue/10 border-cyber-accent/60 shadow-glow-cyan'
                : 'bg-cyber-cardLight/20 border-cyber-border/50 hover:border-cyber-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${
                g.riskLevel === 'Critical' ? 'bg-red-950/50 text-cyber-red border-red-900/60' :
                g.riskLevel === 'High'     ? 'bg-amber-950/50 text-cyber-amber border-amber-900/60' :
                'bg-blue-950/50 text-cyber-blue border-blue-900/60'
              }`}>{g.riskLevel}</span>
              <span className="text-[9px] font-mono text-gray-500">{g.patternType}</span>
            </div>
            <p className="text-xs font-bold text-gray-200">{g.name}</p>
            <p className="text-[10px] text-gray-500 mt-1 leading-snug">{g.description}</p>
            <p className="text-[10px] font-mono text-cyber-red mt-2 font-bold">
              Total at risk: ₹{g.totalAmount.toLocaleString('en-IN')}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Graph */}
        <div className="lg:col-span-2 cyber-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider">{selectedGraph.name}</h4>
            {animating && (
              <span className="text-[10px] font-mono text-cyber-amber animate-pulse flex items-center gap-1">
                <GitBranch className="h-3 w-3" /> Building graph…
              </span>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-3 text-[9px] font-mono">
            {Object.entries(NODE_COLORS).map(([type, cfg]) => (
              <span key={type} className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: cfg.fill, borderColor: cfg.stroke }} />
                <span style={{ color: cfg.text }} className="capitalize">{type}</span>
              </span>
            ))}
            <span className="flex items-center gap-1 ml-2">
              <span className="h-0.5 w-5 bg-cyber-red rounded" />
              <span className="text-gray-500">Suspicious flow</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-0.5 w-5 bg-cyber-green rounded" />
              <span className="text-gray-500">Legitimate</span>
            </span>
          </div>

          <div className="rounded-xl overflow-hidden bg-[#040c14] border border-cyber-border/30">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: '420px' }}>
              <defs>
                <marker id="arrow-red"   markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ff3e3e" />
                </marker>
                <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#00ff88" />
                </marker>
                <filter id="nodeGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Animated dash */}
                <style>{`
                  .flow-dash { stroke-dasharray: 8 4; animation: dash 1.5s linear infinite; }
                  @keyframes dash { to { stroke-dashoffset: -36; } }
                `}</style>
              </defs>

              {/* Edges */}
              {selectedGraph.edges.map(edge => {
                const src = selectedGraph.nodes.find(n => n.id === edge.source)!;
                const tgt = selectedGraph.nodes.find(n => n.id === edge.target)!;
                if (!src || !tgt) return null;
                const visible = visibleEdges.has(edgeKey(edge));
                if (!visible) return null;

                const color = edge.suspicious ? '#ff3e3e' : '#00ff88';
                const mid   = edgeMidpoint(src, tgt);
                const isSelected = selectedEdge?.source === edge.source && selectedEdge?.target === edge.target;

                // Offset node center to edge
                const dx = tgt.x - src.x, dy = tgt.y - src.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const r   = 32;
                const x1  = src.x + (dx / len) * r;
                const y1  = src.y + (dy / len) * r;
                const x2  = tgt.x - (dx / len) * r;
                const y2  = tgt.y - (dy / len) * r;

                return (
                  <g key={edgeKey(edge)} onClick={() => setSelectedEdge(isSelected ? null : edge)} className="cursor-pointer">
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isSelected ? '#ffffff' : color}
                      strokeWidth={isSelected ? 2.5 : edge.suspicious ? 1.8 : 1}
                      strokeOpacity={isSelected ? 1 : 0.6}
                      markerEnd={edge.suspicious ? 'url(#arrow-red)' : 'url(#arrow-green)'}
                      className={edge.suspicious ? 'flow-dash' : ''}
                    />
                    {/* Edge label */}
                    <rect x={mid.x - 32} y={mid.y - 9} width="64" height="14" rx="3"
                      fill="#061018" fillOpacity="0.85" />
                    <text x={mid.x} y={mid.y + 1} textAnchor="middle" fontSize="8"
                      fill={color} fontFamily="monospace" fontWeight="600">
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {selectedGraph.nodes.map(node => {
                const visible  = visibleNodes.has(node.id);
                const cfg      = NODE_COLORS[node.type];
                const isSelected = selectedNode?.id === node.id;
                const lines    = node.label.split('\n');

                return (
                  <g key={node.id}
                    style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    className="cursor-pointer"
                  >
                    {/* Glow ring for flagged */}
                    {node.flagged && (
                      <circle cx={node.x} cy={node.y} r="38" fill="none"
                        stroke={cfg.stroke} strokeWidth="1" strokeOpacity="0.25">
                        <animate attributeName="r" from="34" to="44" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Node circle */}
                    <circle cx={node.x} cy={node.y} r="32"
                      fill={cfg.fill}
                      stroke={isSelected ? '#ffffff' : cfg.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter={node.flagged ? 'url(#nodeGlow)' : ''}
                    />
                    {/* Risk badge */}
                    {node.risk > 0 && (
                      <rect x={node.x + 18} y={node.y - 42} width="26" height="12" rx="4"
                        fill={node.risk >= 80 ? '#7f0000' : '#7f4500'} />
                    )}
                    {node.risk > 0 && (
                      <text x={node.x + 31} y={node.y - 34} textAnchor="middle" fontSize="7"
                        fill={node.risk >= 80 ? '#ff3e3e' : '#ffaa00'} fontFamily="monospace" fontWeight="bold">
                        {node.risk}%
                      </text>
                    )}
                    {/* Label lines */}
                    {lines.map((line, i) => (
                      <text key={i} x={node.x} y={node.y + (i - (lines.length - 1) / 2) * 11}
                        textAnchor="middle" fontSize="8.5" fill={cfg.text}
                        fontFamily="monospace" fontWeight="600">
                        {line}
                      </text>
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {/* Graph summary */}
          <div className="cyber-card">
            <h4 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Pattern Analysis</h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Pattern:</span>
                <span className="text-cyber-amber font-bold">{selectedGraph.patternType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Risk Level:</span>
                <span className={selectedGraph.riskLevel === 'Critical' ? 'text-cyber-red font-bold' : 'text-cyber-amber font-bold'}>
                  {selectedGraph.riskLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nodes:</span>
                <span className="text-gray-300">{selectedGraph.nodes.length} accounts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Edges:</span>
                <span className="text-gray-300">{selectedGraph.edges.length} transfers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Flagged:</span>
                <span className="text-cyber-red font-bold">{selectedGraph.nodes.filter(n => n.flagged).length} accounts</span>
              </div>
              <div className="flex justify-between border-t border-cyber-border/40 pt-2 mt-1">
                <span className="text-gray-500">Total at Risk:</span>
                <span className="text-cyber-red font-extrabold">₹{selectedGraph.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Node detail */}
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="cyber-card border border-cyber-border/60"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono text-gray-400 uppercase">Account Detail</h4>
                  <button onClick={() => setSelectedNode(null)} className="text-gray-600 hover:text-gray-300">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-200 font-mono">{selectedNode.label.replace('\n', ' ')}</p>
                <div className="space-y-2 mt-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role:</span>
                    <span style={{ color: NODE_COLORS[selectedNode.type].text }} className="capitalize font-bold">{selectedNode.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Risk Score:</span>
                    <span className={`font-extrabold ${selectedNode.risk >= 80 ? 'text-cyber-red' : selectedNode.risk >= 50 ? 'text-cyber-amber' : 'text-cyber-green'}`}>
                      {selectedNode.risk}%
                    </span>
                  </div>
                  {selectedNode.amount !== undefined && selectedNode.amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="text-cyber-red font-bold">₹{selectedNode.amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={selectedNode.flagged ? 'text-cyber-red font-bold' : 'text-cyber-green'}>
                      {selectedNode.flagged ? '🚩 FLAGGED' : '✓ Clean'}
                    </span>
                  </div>
                </div>
                {selectedNode.flagged && (
                  <div className="mt-3 p-2 bg-red-950/20 border border-red-900/40 rounded-lg text-[10px] font-mono text-cyber-red">
                    This account has been flagged for AML review. Freeze and report to FIU-IND.
                  </div>
                )}
              </motion.div>
            )}
            {selectedEdge && !selectedNode && (
              <motion.div
                key={`edge-${selectedEdge.source}-${selectedEdge.target}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="cyber-card border border-cyber-border/60"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono text-gray-400 uppercase">Transfer Detail</h4>
                  <button onClick={() => setSelectedEdge(null)} className="text-gray-600 hover:text-gray-300">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Route:</span>
                    <span className="text-gray-300 flex items-center gap-1">
                      {selectedEdge.source} <ArrowRight className="h-3 w-3" /> {selectedEdge.target}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="text-cyber-red font-bold">₹{selectedEdge.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transactions:</span>
                    <span className="text-gray-300">{selectedEdge.txCount} tx</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Suspicious:</span>
                    <span className={selectedEdge.suspicious ? 'text-cyber-red font-bold' : 'text-cyber-green'}>
                      {selectedEdge.suspicious ? '🚩 YES — AML Flag' : '✓ Normal'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AML notice */}
          <div className="p-3 bg-amber-950/20 border border-cyber-amber/30 rounded-xl">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-cyber-amber shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-cyber-amber font-mono uppercase">AML Obligation</p>
                <p className="text-[10px] text-gray-400 leading-relaxed mt-0.5">
                  Banks must report Suspicious Transaction Reports (STRs) to FIU-IND within 7 days. SentinelAI auto-generates draft STRs for all flagged chains.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;
