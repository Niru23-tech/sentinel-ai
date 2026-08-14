import React, { useState, useEffect, useRef } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { 
  Target, 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  ShieldAlert, 
  Globe, 
  Bug, 
  Lock, 
  Mail, 
  Key, 
  Smartphone, 
  UserPlus, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Zap,
  Sliders,
  ShieldCheck,
  ArrowRight,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AttackStepItem {
  id: string;
  phase: 'Reconnaissance' | 'Initial Access' | 'Evasion & Persistence' | 'Exfiltration & Fraud';
  event_type: string;
  iconName: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  risk_added: number;
}

export interface PresetScenario {
  id: string;
  title: string;
  code: string;
  author: string;
  targetVector: string;
  threatLevel: string;
  description: string;
  steps: AttackStepItem[];
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'apt29-bank-takeover',
    title: 'APT29 Spear-Phishing & Account Takeover',
    code: 'CAMPAIGN-APT-882',
    author: 'Sentinel Threat Intel Labs',
    targetVector: 'High-Net-Worth UPI Accounts',
    threatLevel: 'Critical',
    description: 'Multi-stage state-sponsored campaign starting with spear-phishing, progressing to cookie hijacking, impossible travel, and automated high-value fund exfiltration.',
    steps: [
      {
        id: 's1',
        phase: 'Reconnaissance',
        event_type: 'Phishing Link Intercepted',
        iconName: 'Mail',
        severity: 'Medium',
        description: 'Customer clicked malicious SMS link pretending to be urgent bank KYC update.',
        risk_added: 20
      },
      {
        id: 's2',
        phase: 'Initial Access',
        event_type: 'Session Cookie Hijack',
        iconName: 'Key',
        severity: 'High',
        description: 'Active web session cookie cloned and imported into an unfamiliar browser profile.',
        risk_added: 25
      },
      {
        id: 's3',
        phase: 'Evasion & Persistence',
        event_type: 'Tor Exit Node & VPN Jump',
        iconName: 'Globe',
        severity: 'High',
        description: 'Attacker routed traffic via Frankfurt Tor exit node (Impossible Travel vs Chennai login).',
        risk_added: 30
      },
      {
        id: 's4',
        phase: 'Exfiltration & Fraud',
        event_type: 'Urgent Wire Transfer Attempt',
        iconName: 'ShieldAlert',
        severity: 'Critical',
        description: 'Unauthorized transfer of ₹45,000 to unverified offshore wallet initiated.',
        risk_added: 25
      }
    ]
  },
  {
    id: 'sim-swap-bypass',
    title: 'SIM Swap & OTP Interception Vector',
    code: 'CAMPAIGN-SIM-404',
    author: 'FinSec Fraud Operations',
    targetVector: 'Retail Banking Portals',
    threatLevel: 'High',
    description: 'Telco porting social engineering paired with password spraying, multi-factor authentication exhaustion, and rapid micro-withdrawals.',
    steps: [
      {
        id: 'ss1',
        phase: 'Reconnaissance',
        event_type: 'SIM Port Notification',
        iconName: 'Smartphone',
        severity: 'Low',
        description: 'Telecom provider registered SIM swap event for customer registered mobile number.',
        risk_added: 15
      },
      {
        id: 'ss2',
        phase: 'Initial Access',
        event_type: 'Credential Spraying',
        iconName: 'Lock',
        severity: 'Medium',
        description: 'Automated login attempts from IP 185.220.101.44 using leaked credential dump.',
        risk_added: 20
      },
      {
        id: 'ss3',
        phase: 'Evasion & Persistence',
        event_type: 'MFA Bypass Attempt',
        iconName: 'Key',
        severity: 'High',
        description: 'SMS OTP intercepted via swapped SIM channel during password recovery.',
        risk_added: 30
      },
      {
        id: 'ss4',
        phase: 'Exfiltration & Fraud',
        event_type: 'New Mule Account Payee Added',
        iconName: 'UserPlus',
        severity: 'High',
        description: 'Mule bank account "Hacker Wallet" added without cooling-off window.',
        risk_added: 25
      }
    ]
  },
  {
    id: 'mobile-trojan-anubis',
    title: 'Anubis Mobile Banking Trojan Outbreak',
    code: 'CAMPAIGN-MAL-911',
    author: 'Mobile EDR Intelligence',
    targetVector: 'Android Mobile Banking App',
    threatLevel: 'Critical',
    description: 'Sideloaded malicious APK injects overlay windows over banking app, harvests accessibility tokens, and executes unauthorized background transactions.',
    steps: [
      {
        id: 'mt1',
        phase: 'Reconnaissance',
        event_type: 'Sideloaded APK Installed',
        iconName: 'Bug',
        severity: 'Medium',
        description: 'Customer installed third-party APK outside official Google Play Store.',
        risk_added: 20
      },
      {
        id: 'mt2',
        phase: 'Initial Access',
        event_type: 'Root / Jailbreak Detection',
        iconName: 'ShieldAlert',
        severity: 'High',
        description: 'Device posture check failed: Root access / Magisk superuser granted.',
        risk_added: 30
      },
      {
        id: 'mt3',
        phase: 'Evasion & Persistence',
        event_type: 'Accessibility Overlay Hijack',
        iconName: 'Activity',
        severity: 'Critical',
        description: 'Anubis Trojan spawned fake login overlay and logged keystrokes in real time.',
        risk_added: 35
      }
    ]
  }
];

const CyberRange: React.FC = () => {
  const { customers, activeCustomer, selectCustomer, triggerAttackStep, resetSimulation, settings } = useSentinel();

  // Active Tab: Preset Scenarios vs Custom Attack Chain Builder
  const [activeMode, setActiveMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_SCENARIOS[0].id);

  // Custom Attack Step State
  const [customSteps, setCustomSteps] = useState<AttackStepItem[]>([
    {
      id: 'c1',
      phase: 'Reconnaissance',
      event_type: 'Suspicious Email Link Clicked',
      iconName: 'Mail',
      severity: 'Medium',
      description: 'Customer clicked untrusted email link containing tracking beacon.',
      risk_added: 20
    },
    {
      id: 'c2',
      phase: 'Evasion & Persistence',
      event_type: 'Commercial VPN Route',
      iconName: 'Globe',
      severity: 'High',
      description: 'Session IP suddenly jumped to commercial VPN endpoint in Munich.',
      risk_added: 25
    },
    {
      id: 'c3',
      phase: 'Exfiltration & Fraud',
      event_type: 'High-Value UPI Transfer',
      iconName: 'ShieldAlert',
      severity: 'Critical',
      description: 'Attempted ₹35,000 transfer to unrecognized offshore wallet.',
      risk_added: 40
    }
  ]);

  // Execution Engine State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<{ stepId: string; status: 'PENDING' | 'EXECUTING' | 'CORRELATED' | 'DEFENCE_TRIGGERED'; timestamp: string; logText: string }[]>([]);
  const [isThresholdBreached, setIsThresholdBreached] = useState<boolean>(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active Attack Steps depending on mode
  const activePreset = PRESET_SCENARIOS.find(p => p.id === selectedPresetId) || PRESET_SCENARIOS[0];
  const activeChainSteps = activeMode === 'preset' ? activePreset.steps : customSteps;

  // Sync execution status with customer risk score
  const targetCustomer = activeCustomer || customers[0];
  const currentRisk = targetCustomer?.risk_score || 0;
  const threshold = settings?.risk_threshold || 80;

  useEffect(() => {
    if (currentRisk >= threshold) {
      setIsThresholdBreached(true);
    } else {
      setIsThresholdBreached(false);
    }
  }, [currentRisk, threshold]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  // Execute a single step in the chain
  const executeNextStep = async () => {
    if (currentStepIndex >= activeChainSteps.length - 1) {
      setIsPlaying(false);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    const nextIndex = currentStepIndex + 1;
    const stepToExecute = activeChainSteps[nextIndex];
    setCurrentStepIndex(nextIndex);

    // Update execution status UI log
    setExecutionLogs(prev => [
      ...prev,
      {
        stepId: stepToExecute.id,
        status: 'EXECUTING',
        timestamp: new Date().toLocaleTimeString(),
        logText: `[INJECTING] ${stepToExecute.phase} :: ${stepToExecute.event_type} (+${stepToExecute.risk_added}% Risk)`
      }
    ]);

    try {
      const res = await triggerAttackStep({
        customer_id: targetCustomer?.id,
        event_type: stepToExecute.event_type,
        icon: stepToExecute.iconName.toLowerCase(),
        severity: stepToExecute.severity,
        description: stepToExecute.description,
        risk_added: stepToExecute.risk_added,
        attack_title: activeMode === 'preset' ? activePreset.title : 'Custom Cyber Range Attack'
      });

      const updatedRisk = res?.customer?.risk_score || (currentRisk + stepToExecute.risk_added);

      if (updatedRisk >= threshold) {
        setIsThresholdBreached(true);
        setExecutionLogs(prev => [
          ...prev,
          {
            stepId: stepToExecute.id,
            status: 'DEFENCE_TRIGGERED',
            timestamp: new Date().toLocaleTimeString(),
            logText: `[AUTONOMOUS DEFENSE ENFORCED] Threshold ${threshold}% breached! Account ${res?.customer?.account_number || targetCustomer?.account_number} frozen & transaction blocked.`
          }
        ]);
        setIsPlaying(false);
        if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      } else {
        setExecutionLogs(prev => [
          ...prev,
          {
            stepId: stepToExecute.id,
            status: 'CORRELATED',
            timestamp: new Date().toLocaleTimeString(),
            logText: `[AI RISK ENGINE] Correlated ${stepToExecute.event_type}. Updated customer risk score: ${updatedRisk}%`
          }
        ]);
      }
    } catch (err) {
      console.error('Error executing step:', err);
      setIsPlaying(false);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
  };

  // Toggle Auto Play
  const toggleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    } else {
      setIsPlaying(true);
      executeNextStep();
      autoPlayTimerRef.current = setInterval(() => {
        executeNextStep();
      }, 2000);
    }
  };

  // Reset Cyber Range
  const handleResetRange = async () => {
    setIsPlaying(false);
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setCurrentStepIndex(-1);
    setExecutionLogs([]);
    setIsThresholdBreached(false);
    await resetSimulation();
  };

  // Custom step add helper
  const addCustomStep = () => {
    const newStep: AttackStepItem = {
      id: `c_${Date.now()}`,
      phase: 'Evasion & Persistence',
      event_type: 'Unusual IP Access',
      iconName: 'Globe',
      severity: 'Medium',
      description: 'Access requested from unknown subnet.',
      risk_added: 20
    };
    setCustomSteps(prev => [...prev, newStep]);
  };

  const removeCustomStep = (id: string) => {
    setCustomSteps(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 relative pb-10">
      
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="cyber-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-cyber-card via-cyber-cardLight to-cyber-card border-cyber-accent/30 shadow-glow-blue">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyber-accent/10 border border-cyber-accent/40 text-cyber-accent">
            <Target className="h-7 w-7 animate-pulse-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono text-gray-100 uppercase tracking-wider">
                Cyber Range & Multi-Stage Attack Simulator
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40">
                PROTOTYPE LAB
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Simulate multi-vector threat sequences, test real-time AI risk correlation, and observe autonomous defense enforcement.
            </p>
          </div>
        </div>

        {/* Target Customer Dropdown Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-mono text-gray-400 shrink-0">Target Client:</span>
          <select
            value={targetCustomer?.id || 1}
            onChange={e => selectCustomer(Number(e.target.value))}
            className="bg-cyber-bg border border-cyber-accent/40 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyber-accent"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.account_number}) - Risk: {c.risk_score}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Control Bar & Mode Toggles ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Preset / Custom Builder */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveMode('preset'); setCurrentStepIndex(-1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all border ${
                  activeMode === 'preset'
                    ? 'bg-cyber-accent/15 border-cyber-accent text-cyber-accent font-bold shadow-glow-blue'
                    : 'border-cyber-border/60 text-gray-400 hover:text-gray-200 hover:bg-cyber-cardLight/30'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>APT Preset Campaigns</span>
              </button>

              <button
                onClick={() => { setActiveMode('custom'); setCurrentStepIndex(-1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all border ${
                  activeMode === 'custom'
                    ? 'bg-cyber-accent/15 border-cyber-accent text-cyber-accent font-bold shadow-glow-blue'
                    : 'border-cyber-border/60 text-gray-400 hover:text-gray-200 hover:bg-cyber-cardLight/30'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span>Custom Attack Builder</span>
              </button>
            </div>

            {/* Execution Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={executeNextStep}
                disabled={isPlaying || currentStepIndex >= activeChainSteps.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-cyber-accent/50 bg-cyber-accent/10 text-cyber-accent hover:bg-cyber-accent/20 disabled:opacity-40 transition-all"
              >
                <StepForward className="h-3.5 w-3.5" />
                <span>Step Play</span>
              </button>

              <button
                onClick={toggleAutoPlay}
                disabled={currentStepIndex >= activeChainSteps.length - 1}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all font-semibold ${
                  isPlaying 
                    ? 'bg-cyber-amber/20 border-cyber-amber text-cyber-amber hover:bg-cyber-amber/30 animate-pulse'
                    : 'bg-cyber-green/20 border-cyber-green text-cyber-green hover:bg-cyber-green/30'
                }`}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Auto Run All'}</span>
              </button>

              <button
                onClick={handleResetRange}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border border-gray-600/60 text-gray-400 hover:text-gray-200 hover:border-gray-400 transition-all"
                title="Reset Cyber Range"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Mode 1: APT Preset Campaigns Selection */}
          {activeMode === 'preset' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRESET_SCENARIOS.map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => { setSelectedPresetId(preset.id); setCurrentStepIndex(-1); setExecutionLogs([]); }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedPresetId === preset.id
                        ? 'bg-cyber-cardLight border-cyber-accent text-gray-100 shadow-glow-blue'
                        : 'bg-cyber-card/60 border-cyber-border/60 text-gray-400 hover:border-cyber-border hover:bg-cyber-cardLight/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-cyber-accent border border-cyber-accent/30 px-1.5 py-0.5 rounded">
                        {preset.code}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        preset.threatLevel === 'Critical' ? 'bg-red-950/80 text-cyber-red border border-cyber-red/40' : 'bg-amber-950/80 text-cyber-amber border border-cyber-amber/40'
                      }`}>
                        {preset.threatLevel}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold font-mono text-gray-200 line-clamp-1 mb-1">{preset.title}</h4>
                    <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">{preset.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-cyber-border/40 pt-2">
                      <span>{preset.steps.length} Attack Steps</span>
                      <span>+{preset.steps.reduce((acc, s) => acc + s.risk_added, 0)}% Risk</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Preset Detailed Timeline Pipeline */}
              <div className="cyber-card space-y-4 border-cyber-border/80">
                <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyber-accent" />
                    <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
                      Attack Vector Timeline :: {activePreset.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    Vector: <span className="text-cyber-accent">{activePreset.targetVector}</span>
                  </span>
                </div>

                {/* Steps Visual Chain */}
                <div className="space-y-3">
                  {activePreset.steps.map((step, idx) => {
                    const isExecuted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div
                        key={step.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                          isCurrent
                            ? 'bg-cyber-accent/15 border-cyber-accent text-gray-100 shadow-glow-blue scale-[1.01]'
                            : isExecuted
                            ? 'bg-cyber-cardLight/50 border-cyber-green/40 text-gray-300'
                            : 'bg-cyber-card/40 border-cyber-border/40 text-gray-500 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${
                            isCurrent ? 'bg-cyber-accent text-gray-950 border-cyber-accent animate-pulse' :
                            isExecuted ? 'bg-cyber-green/20 text-cyber-green border-cyber-green/40' :
                            'bg-cyber-bg text-gray-500 border-cyber-border'
                          }`}>
                            0{idx + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase text-cyber-accent font-semibold">{step.phase}</span>
                              <span className="text-gray-600">•</span>
                              <h5 className="text-xs font-bold font-mono text-gray-200 truncate">{step.event_type}</h5>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{step.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            step.severity === 'Critical' ? 'bg-red-950/60 text-cyber-red border border-cyber-red/30' :
                            step.severity === 'High' ? 'bg-amber-950/60 text-cyber-amber border border-cyber-amber/30' :
                            'bg-blue-950/60 text-cyber-accent border border-cyber-accent/30'
                          }`}>
                            +{step.risk_added}% Risk
                          </span>

                          <div className="w-24 text-right font-mono text-[10px]">
                            {isCurrent ? (
                              <span className="text-cyber-accent font-bold animate-pulse">EXECUTING...</span>
                            ) : isExecuted ? (
                              <span className="text-cyber-green flex items-center justify-end gap-1 font-semibold">
                                <CheckCircle2 className="h-3 w-3" /> Correlated
                              </span>
                            ) : (
                              <span className="text-gray-500">PENDING</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Custom Attack Chain Builder */}
          {activeMode === 'custom' && (
            <div className="cyber-card space-y-4 border-cyber-border/80">
              <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-cyber-accent" />
                  <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
                    Interactive Custom Attack Builder
                  </h3>
                </div>

                <button
                  onClick={addCustomStep}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyber-accent/15 border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accent/25 transition-all font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Attack Step</span>
                </button>
              </div>

              <p className="text-xs text-gray-400">
                Design custom telemetry vectors and configure individual risk scores to test SentinelAI's correlation thresholds.
              </p>

              <div className="space-y-3">
                {customSteps.map((step, idx) => {
                  const isExecuted = idx <= currentStepIndex;

                  return (
                    <div key={step.id} className="p-3.5 rounded-xl bg-cyber-bg/60 border border-cyber-border/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-cyber-accent uppercase">
                          Step 0{idx + 1} Phase
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeCustomStep(step.id)}
                            className="text-gray-500 hover:text-cyber-red p-1 transition-colors"
                            title="Remove step"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-mono text-gray-500 block mb-1">Attack Phase</label>
                          <select
                            value={step.phase}
                            onChange={e => {
                              const val = e.target.value as any;
                              setCustomSteps(prev => prev.map(s => s.id === step.id ? { ...s, phase: val } : s));
                            }}
                            className="w-full bg-cyber-card border border-cyber-border rounded px-2.5 py-1.5 text-xs font-mono text-gray-200"
                          >
                            <option value="Reconnaissance">Reconnaissance</option>
                            <option value="Initial Access">Initial Access</option>
                            <option value="Evasion & Persistence">Evasion & Persistence</option>
                            <option value="Exfiltration & Fraud">Exfiltration & Fraud</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-gray-500 block mb-1">Event Name</label>
                          <input
                            type="text"
                            value={step.event_type}
                            onChange={e => {
                              const val = e.target.value;
                              setCustomSteps(prev => prev.map(s => s.id === step.id ? { ...s, event_type: val } : s));
                            }}
                            className="w-full bg-cyber-card border border-cyber-border rounded px-2.5 py-1.5 text-xs font-mono text-gray-200"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-gray-500 block mb-1">Risk Contribution (+%)</label>
                          <input
                            type="number"
                            min="5"
                            max="50"
                            value={step.risk_added}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setCustomSteps(prev => prev.map(s => s.id === step.id ? { ...s, risk_added: val } : s));
                            }}
                            className="w-full bg-cyber-card border border-cyber-border rounded px-2.5 py-1.5 text-xs font-mono text-cyber-accent font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gray-500 block mb-1">Telemetry Description</label>
                        <input
                          type="text"
                          value={step.description}
                          onChange={e => {
                            const val = e.target.value;
                            setCustomSteps(prev => prev.map(s => s.id === step.id ? { ...s, description: val } : s));
                          }}
                          className="w-full bg-cyber-card border border-cyber-border rounded px-2.5 py-1.5 text-xs text-gray-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Execution & Target Risk Meter */}
        <div className="space-y-6">

          {/* Customer Risk Gauge Card */}
          <div className="cyber-card space-y-4 border-cyber-border/80">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
              <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Target Security Posture</h3>
              <span className="text-[10px] font-mono text-cyber-accent">{targetCustomer?.account_number}</span>
            </div>

            <div className="flex flex-col items-center py-2">
              {/* Dynamic Circular Risk Score */}
              <div className={`relative h-32 w-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 ${
                currentRisk >= threshold
                  ? 'border-cyber-red bg-red-950/30 text-cyber-red shadow-glow-red'
                  : currentRisk >= 50
                  ? 'border-cyber-amber bg-amber-950/30 text-cyber-amber'
                  : 'border-cyber-accent bg-cyber-accent/10 text-cyber-accent'
              }`}>
                <span className="text-3xl font-extrabold font-mono">{currentRisk}%</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mt-0.5">Session Risk</span>
              </div>

              <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Auto-Freeze Threshold:</span>
                  <span className="text-cyber-accent font-bold">{threshold}%</span>
                </div>
                <div className="w-full bg-cyber-bg rounded-full h-2 overflow-hidden border border-cyber-border">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      currentRisk >= threshold ? 'bg-cyber-red' : currentRisk >= 50 ? 'bg-cyber-amber' : 'bg-cyber-accent'
                    }`}
                    style={{ width: `${Math.min(100, currentRisk)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Threshold Defense Status Banner */}
            <AnimatePresence>
              {isThresholdBreached ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-red-950/50 border border-cyber-red/60 text-cyber-red space-y-2 text-center"
                >
                  <div className="flex items-center justify-center gap-2 font-mono font-bold text-xs">
                    <ShieldAlert className="h-4 w-4 animate-bounce" />
                    <span>AUTONOMOUS DEFENSE TRIGGERED</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-snug">
                    Account suspended, outbound UPI transfers locked, biometric overlay activated.
                  </p>
                </motion.div>
              ) : (
                <div className="p-3 rounded-xl bg-cyber-bg/60 border border-cyber-border/60 text-gray-400 flex items-center gap-2 text-xs font-mono">
                  <ShieldCheck className="h-4 w-4 text-cyber-green shrink-0" />
                  <span>Session within safe operating limits ({threshold - currentRisk}% safety margin).</span>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Cyber Range Live Terminal Logs */}
          <div className="cyber-card space-y-3 border-cyber-border/80 flex flex-col h-80">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyber-accent" />
                <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
                  Live Telemetry Console
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyber-green animate-pulse">● LIVE</span>
            </div>

            <div className="flex-1 bg-[#040810] border border-cyber-border/60 rounded-lg p-3 font-mono text-[11px] overflow-y-auto space-y-2">
              {executionLogs.length === 0 ? (
                <p className="text-gray-600 italic">No telemetry injected yet. Hit "Step Play" or "Auto Run All" to start attack execution.</p>
              ) : (
                executionLogs.map((log, i) => (
                  <div key={i} className={`leading-relaxed ${
                    log.status === 'DEFENCE_TRIGGERED' ? 'text-cyber-red font-bold' :
                    log.status === 'CORRELATED' ? 'text-cyber-green' :
                    'text-cyber-accent'
                  }`}>
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.logText}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CyberRange;
