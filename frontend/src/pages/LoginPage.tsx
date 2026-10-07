// SentinelX AI - Restricted Access Banking Cyber Defense Command Center Login Page

import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import SecurityStatus from '../components/ui/SecurityStatus';
import { Shield, ShieldAlert, Cpu, Network, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cyber-bg text-gray-100 flex flex-col lg:flex-row relative overflow-hidden scanline select-none font-mono">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none"></div>

      {/* LEFT SIDE - SECURITY INFORMATION PANEL */}
      <div className="w-full lg:w-7/12 p-8 lg:p-14 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-r border-cyber-border/40 bg-gradient-to-br from-cyber-bg via-cyber-card/40 to-cyber-bg">
        <div>
          {/* Logo & Title Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyber-accent/10 border border-cyber-accent flex items-center justify-center text-cyber-accent shadow-lg shadow-cyber-accent/20">
                <Shield className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider text-gray-100 uppercase flex items-center gap-2">
                  <span>SENTINELX AI</span>
                  <span className="text-[10px] bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40 px-2 py-0.5 rounded font-normal">
                    RESTRICTED
                  </span>
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Banking Cyber Defense Command Center
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-cyber-teal bg-cyber-teal/10 px-3 py-1 rounded-full border border-cyber-teal/30">
              <Lock className="h-3.5 w-3.5 text-cyber-teal" />
              <span>BANK CLEARANCE ENFORCED</span>
            </div>
          </div>

          {/* Main Title & Subtitles */}
          <div className="max-w-xl space-y-3 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-3 py-1 rounded-md bg-rose-950/60 border border-rose-600/60 text-rose-300 text-xs font-bold uppercase tracking-widest"
            >
              Restricted Access
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight uppercase"
            >
              SentinelX AI — Banking Cyber Defense Command Center
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans"
            >
              Access is restricted to authorized bank personnel and approved security teams. AI-powered threat intelligence, fraud correlation, and adaptive cyber defense.
            </motion.p>
          </div>

          {/* Subtle Secure Network Visualization */}
          <div className="relative w-full h-40 rounded-2xl bg-cyber-card/80 border border-cyber-border/60 p-4 overflow-hidden mb-8 shadow-2xl flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-accent/5 via-transparent to-cyber-teal/5 pointer-events-none"></div>

            <div className="flex items-center justify-between text-xs text-gray-400 z-10">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-cyber-teal animate-spin" />
                <span className="text-gray-200 font-bold uppercase">Bank Core Security Mesh</span>
              </div>
              <span className="text-[10px] text-cyber-teal">MONITORING LATENCY: 0.8ms</span>
            </div>

            {/* SVG Network Connection Nodes */}
            <div className="relative h-20 w-full flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full text-cyber-border/40" xmlns="http://www.w3.org/2000/svg">
                <line x1="12%" y1="50%" x2="45%" y2="25%" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="45%" y1="25%" x2="78%" y2="75%" stroke="currentColor" strokeDasharray="3 3" />
                <line x1="45%" y1="25%" x2="88%" y2="30%" stroke="currentColor" strokeDasharray="3 3" />
              </svg>

              <div className="absolute left-[12%] top-[40%] flex items-center gap-1.5 p-1.5 rounded-lg bg-cyber-bg border border-cyber-accent text-[10px] text-cyber-accent">
                <ShieldAlert className="h-3 w-3" />
                <span>Core Gateway</span>
              </div>

              <div className="absolute left-[45%] top-[15%] flex items-center gap-1.5 p-1.5 rounded-lg bg-cyber-bg border border-cyber-teal text-[10px] text-cyber-teal">
                <Cpu className="h-3 w-3" />
                <span>AI Risk Correlation</span>
              </div>

              <div className="absolute left-[78%] top-[65%] flex items-center gap-1.5 p-1.5 rounded-lg bg-cyber-bg border border-emerald-400 text-[10px] text-emerald-400">
                <Shield className="h-3 w-3" />
                <span>Banking Vault</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 z-10">
              <span>ZERO TRUST ISOLATION ACTIVE</span>
              <span>RESTRICTED PROTOCOL: ENFORCED</span>
            </div>
          </div>
        </div>

        {/* SYSTEM SECURITY STATUS */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            SYSTEM SECURITY STATUS
          </p>
          <SecurityStatus />
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-cyber-border/30 flex items-center justify-between text-[10px] text-gray-500">
          <span>© 2026 SentinelX AI — Authorized Personnel Only</span>
          <span>BANK SECURITY PROTOCOL v2.6</span>
        </div>
      </div>

      {/* RIGHT SIDE — AUTHENTICATION PANEL */}
      <div className="w-full lg:w-5/12 p-6 sm:p-10 lg:p-14 flex items-center justify-center relative z-10 bg-cyber-bg/90">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
