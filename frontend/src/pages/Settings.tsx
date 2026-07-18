import React, { useState, useEffect } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { 
  Sliders, 
  Terminal, 
  RefreshCw, 
  ShieldAlert, 
  Info,
  Bug,
  Globe,
  Mail,
  UserCheck,
  ShieldCheck,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

const Settings: React.FC = () => {
  const { settings, updateSettings, triggerAttack, resetSimulation, activeCustomer } = useSentinel();
  
  // Local settings states
  const [threshold, setThreshold]           = useState(80);
  const [enableAi, setEnableAi]             = useState(true);
  const [enableAutoProtect, setEnableAutoProtect] = useState(true);
  const [enableLearningMode, setEnableLearningMode] = useState(true);

  // Loading states
  const [injectingAttack, setInjectingAttack] = useState<string | null>(null);
  const [resetting, setResetting]             = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], title: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

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
      addToast('success', 'Settings Saved', 'AI Risk Engine configuration updated successfully.');
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not save settings. Please try again.');
    }
  };

  const handleAttackInjection = async (attackType: string) => {
    setInjectingAttack(attackType);
    try {
      await triggerAttack(attackType);
      addToast('success', `Attack Injected: ${attackType}`, `Simulated ${attackType} telemetry logged. Monitor the Dashboard for risk score escalation.`);
    } catch (err) {
      addToast('error', 'Injection Failed', 'Could not trigger attack simulation.');
    } finally {
      setInjectingAttack(null);
    }
  };

  const handleReset = async () => {
    setShowResetConfirm(false);
    setResetting(true);
    try {
      await resetSimulation();
      addToast('success', 'Simulation Reset', 'Database restored to baseline. All customers are now secured.');
    } catch (err) {
      addToast('error', 'Reset Failed', 'Could not restore simulation database.');
    } finally {
      setResetting(false);
    }
  };

  const attacks = [
    { name: 'Phishing Attack',   icon: Mail,       type: 'Phishing Attack',   desc: 'Email click triggers VPN routing anomaly.' },
    { name: 'Credential Theft',  icon: UserCheck,  type: 'Credential Theft',  desc: 'Failed logins followed by password change.' },
    { name: 'Session Hijack',    icon: Globe,      type: 'Session Hijack',    desc: 'Impossible travel jump routed via Tor exit nodes.' },
    { name: 'VPN Login Only',    icon: Globe,      type: 'VPN Login',         desc: 'Simple VPN location jump (+25 risk).' },
    { name: 'Malware Trojan',    icon: Bug,        type: 'Malware Infection', desc: 'EDR reports background Trojan process executing.' },
    { name: 'Account Takeover',  icon: ShieldAlert,type: 'Account Takeover',  desc: 'Full cyber sequence + new beneficiary added.' },
    { name: 'Insider Threat',    icon: Terminal,   type: 'Insider Threat',    desc: 'Rapid transfers executed at abnormal hours.' }
  ];

  return (
    <div className="space-y-6 relative">

      {/* ── Toast Notifications ──────────────────────────────── */}
      <div className="fixed top-20 right-6 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl w-80 backdrop-blur-md ${
                toast.type === 'success' ? 'bg-green-950/80 border-cyber-green/40 text-cyber-green' :
                toast.type === 'error'   ? 'bg-red-950/80 border-cyber-red/40 text-cyber-red' :
                'bg-amber-950/80 border-cyber-amber/40 text-cyber-amber'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold font-mono">{toast.title}</p>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-gray-300 shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Reset Confirmation Modal ──────────────────────────── */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cyber-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="bg-cyber-card border border-cyber-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-5 w-5 text-cyber-amber" />
                <h3 className="text-sm font-bold text-gray-200 font-mono">Reset Simulation?</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                This will flush all simulation logs, clear all incidents, and restore all 10 customer profiles to their secured baseline state.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-mono border border-cyber-border text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-lg text-xs font-mono bg-cyber-amber/20 border border-cyber-amber/40 text-cyber-amber hover:bg-cyber-amber/30 transition-colors font-semibold"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              }}
              onMouseUp={() => handleSettingsUpdate({ risk_threshold: threshold })}
              onTouchEnd={() => handleSettingsUpdate({ risk_threshold: threshold })}
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
                <p className="text-[10px] text-gray-500">Continuously calibrate normal user baselines.</p>
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
              Adjusting the quarantine threshold controls how fast SentinelAI reacts. If the risk score meets or exceeds it, outbound payments are auto-blocked.
            </p>
          </div>
        </div>

        {/* Attack Simulation Injector */}
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
              const isInjecting = injectingAttack === att.type;
              const anyInjecting = injectingAttack !== null;
              return (
                <button
                  key={att.name}
                  disabled={anyInjecting}
                  onClick={() => handleAttackInjection(att.type)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all duration-200 ${
                    isInjecting 
                      ? 'bg-red-950/20 border-cyber-red animate-pulse'
                      : anyInjecting
                      ? 'bg-cyber-cardLight/10 border-cyber-border/30 opacity-50 cursor-not-allowed'
                      : 'bg-cyber-cardLight/20 border-cyber-border hover:border-cyber-red/50 hover:bg-red-950/5 group cursor-pointer'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                    isInjecting 
                      ? 'bg-red-950 text-cyber-red border-cyber-red' 
                      : 'bg-cyber-bg border-cyber-border group-hover:border-cyber-red/30 group-hover:text-cyber-red'
                  }`}>
                    {isInjecting ? (
                      <div className="h-3 w-3 border border-cyber-red border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Icon className="h-4 w-4 text-gray-400 group-hover:text-cyber-red transition-colors" />
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
              onClick={() => setShowResetConfirm(true)}
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
