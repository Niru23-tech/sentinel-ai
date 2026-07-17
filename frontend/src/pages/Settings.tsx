import React, { useState, useEffect } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Terminal, 
  RefreshCw, 
  ShieldAlert, 
  Cpu, 
  Info,
  Bug,
  Globe,
  Mail,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { settings, updateSettings, triggerAttack, resetSimulation, activeCustomer } = useSentinel();
  
  // Local settings states
  const [threshold, setThreshold] = useState(80);
  const [enableAi, setEnableAi] = useState(true);
  const [enableAutoProtect, setEnableAutoProtect] = useState(true);
  const [enableLearningMode, setEnableLearningMode] = useState(true);

  // Loading states for attack simulations
  const [injectingAttack, setInjectingAttack] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // Sync local state with context settings on load
  useEffect(() => {
    if (settings) {
      setThreshold(settings.risk_threshold);
      setEnableAi(settings.enable_ai);
      setEnableAutoProtect(settings.enable_auto_protection);
      setEnableLearningMode(settings.enable_learning_mode);
    }
  }, [settings]);

  const handleSettingsUpdate = async (updatedFields: Partial<typeof settings>) => {
    if (!settings) return;
    const newSettings = {
      risk_threshold: threshold,
      enable_ai: enableAi,
      enable_auto_protection: enableAutoProtect,
      enable_learning_mode: enableLearningMode,
      ...updatedFields
    };
    try {
      await updateSettings(newSettings);
    } catch (err) {
      console.error("Error updating settings:", err);
    }
  };

  const handleAttackInjection = async (attackType: string) => {
    setInjectingAttack(attackType);
    try {
      await triggerAttack(attackType);
      alert(`ATTACK INJECTED SUCCESSFUL: Simulated ${attackType} logs entered. Monitored customer has been updated in database.`);
    } catch (err) {
      console.error("Error injecting attack:", err);
    } finally {
      setInjectingAttack(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to restore the simulation database to baseline? This clears all recent logs and incidents.")) return;
    setResetting(true);
    try {
      await resetSimulation();
      alert("Simulation DB restored. Sarah Jenkins is secured and John Doe is reset.");
    } catch (err) {
      console.error("Error resetting simulation:", err);
    } finally {
      setResetting(false);
    }
  };

  const attacks = [
    { name: 'Phishing Attack', icon: Mail, type: 'Phishing Attack', desc: 'Email click triggers VPN routing anomaly.' },
    { name: 'Credential Theft', icon: UserCheck, type: 'Credential Theft', desc: 'Failed logins followed by password change.' },
    { name: 'Session Hijack', icon: Globe, type: 'Session Hijack', desc: 'Impossible travel jump routed via Tor exit nodes.' },
    { name: 'VPN Login Only', icon: Globe, type: 'VPN Login', desc: 'Simple VPN location jump (+25 risk additions).' },
    { name: 'Malware Trojan', icon: Bug, type: 'Malware Infection', desc: 'Edr reports background Trojan process executing.' },
    { name: 'Account Takeover', icon: ShieldAlert, type: 'Account Takeover', desc: 'Full cyber sequence + new beneficiary added.' },
    { name: 'Insider Threat', icon: Terminal, type: 'Insider Threat', desc: 'Rapid transfers executed at abnormal hours.' }
  ];

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Engine System Configuration */}
        <div className="cyber-card lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 border-b border-cyber-border/60 pb-3 mb-2">
            <Sliders className="h-5 w-5 text-cyber-accent" />
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">AI Risk Engine Settings</h3>
          </div>

          {/* Risk Threshold Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-gray-400">Auto-Quarantine Threshold:</span>
              <span className="text-cyber-accent font-bold">{threshold}% Risk</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setThreshold(val);
                handleSettingsUpdate({ risk_threshold: val });
              }}
              className="w-full h-1 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-accent focus:outline-none"
            />
            <div className="flex justify-between text-[8px] text-gray-500 font-mono">
              <span>20% (AGGRESSIVE)</span>
              <span>80% (BALANCED)</span>
              <span>95% (CONSERVATIVE)</span>
            </div>
          </div>

          <div className="border-t border-cyber-border/40 pt-4 space-y-4">
            
            {/* Enable AI Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gray-200">Enable AI Correlation</label>
                <p className="text-[10px] text-gray-500">Correlate cyber and transaction data.</p>
              </div>
              <button
                onClick={() => {
                  const state = !enableAi;
                  setEnableAi(state);
                  handleSettingsUpdate({ enable_ai: state });
                }}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableAi ? 'bg-cyber-accent' : 'bg-cyber-border'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-cyber-bg shadow ring-0 transition duration-200 ease-in-out ${
                  enableAi ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Enable Auto Protection Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gray-200">Autonomous Defense Response</label>
                <p className="text-[10px] text-gray-500">Freeze accounts and lock sessions automatically.</p>
              </div>
              <button
                onClick={() => {
                  const state = !enableAutoProtect;
                  setEnableAutoProtect(state);
                  handleSettingsUpdate({ enable_auto_protection: state });
                }}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableAutoProtect ? 'bg-cyber-accent' : 'bg-cyber-border'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-cyber-bg shadow ring-0 transition duration-200 ease-in-out ${
                  enableAutoProtect ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Learning Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gray-200">System Learning Mode</label>
                <p className="text-[10px] text-gray-500">Continuously calibrate normal user location baselines.</p>
              </div>
              <button
                onClick={() => {
                  const state = !enableLearningMode;
                  setEnableLearningMode(state);
                  handleSettingsUpdate({ enable_learning_mode: state });
                }}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableLearningMode ? 'bg-cyber-accent' : 'bg-cyber-border'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-cyber-bg shadow ring-0 transition duration-200 ease-in-out ${
                  enableLearningMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>

          <div className="p-3 bg-cyber-cardLight/30 border border-cyber-border/80 rounded-xl flex gap-2">
            <Info className="h-4 w-4 text-cyber-accent shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
              Adjusting the quarantine threshold controls how fast SentinelAI reacts. If the score matches or exceeds it, outbound payments are auto-blocked.
            </p>
          </div>
        </div>

        {/* Breach & Cyber Attack Simulation Injector */}
        <div className="cyber-card lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-cyber-red animate-pulse" />
              <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Attack Simulator Matrix</h3>
            </div>
            {activeCustomer && (
              <span className="text-[10px] font-mono text-gray-500">TARGET: {activeCustomer.name}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attacks.map((att) => {
              const Icon = att.icon;
              return (
                <button
                  key={att.name}
                  disabled={injectingAttack !== null}
                  onClick={() => handleAttackInjection(att.type)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all duration-200 ${
                    injectingAttack === att.type 
                      ? 'bg-red-950/20 border-cyber-red animate-pulse'
                      : 'bg-cyber-cardLight/20 border-cyber-border hover:border-cyber-red/50 hover:bg-red-950/5 group'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    injectingAttack === att.type 
                      ? 'bg-red-950 text-cyber-red border-cyber-red' 
                      : 'bg-cyber-bg border-cyber-border group-hover:border-cyber-red/30 group-hover:text-cyber-red'
                  }`}>
                    {injectingAttack === att.type ? (
                      <div className="h-3 w-3 border border-cyber-red border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Icon className="h-4.5 w-4.5 text-gray-400 group-hover:text-cyber-red transition-colors" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-200 group-hover:text-cyber-red transition-colors">{att.name}</h5>
                    <p className="text-[10px] text-gray-400 leading-snug mt-1">{att.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-cyber-border/40 pt-6 flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-gray-300">Environment Reset</p>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">Flush simulation logs and restore default configurations.</p>
            </div>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyber-border hover:bg-cyber-border/80 text-gray-300 transition-colors border border-cyber-border/50 font-mono"
            >
              {resetting ? (
                <div className="h-3 w-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>Purge Simulation DB</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
