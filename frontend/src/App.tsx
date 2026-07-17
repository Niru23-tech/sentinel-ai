import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Dashboard from './pages/Dashboard';
import LiveLogs from './pages/LiveLogs';
import Transactions from './pages/Transactions';
import AIAnalysis from './pages/AIAnalysis';
import IncidentReport from './pages/IncidentReport';
import Settings from './pages/Settings';

import { useSentinel } from './context/SentinelContext';
import { ShieldAlert, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const { activeCustomer } = useSentinel();
  const [sessionLocked, setSessionLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // Monitor customer risk score. If it goes >= 80, trigger terminal lock simulation
  useEffect(() => {
    if (activeCustomer && activeCustomer.risk_score >= 80 && activeCustomer.account_status === "Temporarily Frozen") {
      setSessionLocked(true);
    } else {
      setSessionLocked(false);
    }
  }, [activeCustomer?.risk_score, activeCustomer?.account_status]);

  const handleBiometricUnlock = () => {
    setUnlocking(true);
    setTimeout(() => {
      // Unfreeze account on unlock in backend
      if (activeCustomer) {
        fetch(`/api/incidents/1/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: "Resolved" })
        }).then(() => {
          setUnlocking(false);
          setSessionLocked(false);
          window.location.reload(); // Refresh to restore baseline
        });
      } else {
        setUnlocking(false);
        setSessionLocked(false);
      }
    }, 2000);
  };

  return (
    <Router>
      <div className="min-h-screen bg-cyber-bg text-gray-100 flex scanline relative overflow-hidden">
        {/* Global Terminal Grid Background */}
        <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20"></div>

        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 z-10 relative">
          <Header />
          
          <main className="flex-grow p-4 md:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/logs" element={<LiveLogs />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/reports" element={<IncidentReport />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="h-10 border-t border-cyber-border/40 bg-cyber-card/40 flex items-center justify-between px-6 text-[10px] text-gray-500 font-mono shrink-0">
            <span>SentinelAI // Autonomous Banking Security Intelligence Matrix</span>
            <span>Hackathon Prototype v1.0.0</span>
          </footer>
        </div>

        {/* Fullscreen Autonomous Lock Overlay */}
        <AnimatePresence>
          {sessionLocked && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#040810]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-md w-full bg-cyber-card border border-cyber-red/50 rounded-2xl p-8 shadow-glow-red flex flex-col items-center"
              >
                <div className="h-16 w-16 rounded-full bg-red-950/40 border border-cyber-red flex items-center justify-center text-cyber-red mb-6 animate-pulse">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-100 font-mono tracking-wider uppercase">
                  Terminal Session Locked
                </h2>
                <p className="text-xs text-cyber-red font-mono mt-1 font-semibold">
                  AUTONOMOUS MITIGATION ENFORCED
                </p>
                
                <p className="text-xs text-gray-400 mt-4 leading-relaxed font-sans">
                  The risk score for account <span className="text-gray-200 font-mono">{activeCustomer?.account_number}</span> ({activeCustomer?.name}) has reached <span className="text-cyber-red font-bold font-mono">{activeCustomer?.risk_score}%</span>. SentinelAI has automatically frozen the account, blocked outbound transfers, and locked this session to prevent fraud.
                </p>

                <div className="w-full border-t border-cyber-border/80 my-6"></div>

                <p className="text-[10px] text-gray-500 font-mono mb-4 uppercase">
                  Identity Verification Required
                </p>

                <button
                  onClick={handleBiometricUnlock}
                  disabled={unlocking}
                  className={`relative h-28 w-28 rounded-full border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                    unlocking 
                      ? 'border-cyber-accent bg-cyber-accent/5 animate-pulse text-cyber-accent' 
                      : 'border-cyber-border hover:border-cyber-accent hover:bg-cyber-accent/5 text-gray-400 hover:text-cyber-accent'
                  }`}
                >
                  {unlocking ? (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-t-cyber-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                      <Fingerprint className="h-8 w-8 text-cyber-accent" />
                      <span className="text-[9px] font-mono uppercase tracking-wider">Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-10 w-10 transition-transform group-hover:scale-110" />
                      <span className="text-[8px] font-mono uppercase tracking-wider">Press Sensor</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-500 font-mono mt-4">
                  Touch the biometric sensor to authorize override & resolve threat.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;
