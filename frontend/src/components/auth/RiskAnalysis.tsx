// SentinelX AI - Risk Analysis & Animated Security Verification Modal/Overlay

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiskAnalysisResult } from '../../services/riskService';
import RiskBadge from '../ui/RiskBadge';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertOctagon, Loader2, Cpu, ArrowRight } from 'lucide-react';

interface RiskAnalysisProps {
  result: RiskAnalysisResult;
  onProceed: () => void;
  onCancel?: () => void;
}

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
  result,
  onProceed,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);

  useEffect(() => {
    // Sequentially complete steps to show animated security analysis sequence
    if (currentStepIndex < result.verificationSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setAnalysisComplete(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, result.verificationSteps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg mx-auto bg-cyber-card border border-cyber-border/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl"
    >
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyber-accent/10 border border-cyber-accent/40 text-cyber-accent">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-100">
              SentinelX Adaptive Security Analysis
            </h3>
            <p className="text-[11px] font-mono text-gray-400">
              Zero-Trust Contextual Evaluation Engine
            </p>
          </div>
        </div>

        {analysisComplete && (
          <RiskBadge category={result.category} score={result.score} size="sm" />
        )}
      </div>

      {/* Animated Step-by-Step Verification Sequence */}
      <div className="space-y-2.5 mb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-cyber-teal font-bold mb-2">
          ANALYZING SECURITY CONTEXT...
        </p>

        {result.verificationSteps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <motion.div
              key={step.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all duration-200 ${
                isDone
                  ? 'bg-cyber-cardLight/60 border-cyber-border/40 text-gray-200'
                  : isCurrent
                  ? 'bg-cyber-accent/10 border-cyber-accent/50 text-cyber-accent shadow-sm'
                  : 'bg-cyber-bg/40 border-transparent text-gray-600 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-cyber-teal shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-cyber-accent animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-gray-700 shrink-0" />
                )}
                <span>{step.label}</span>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider">
                {isDone ? (
                  <span className="text-cyber-teal">✓ VERIFIED</span>
                ) : isCurrent ? (
                  <span className="text-cyber-accent">COMPUTING</span>
                ) : (
                  <span className="text-gray-600">WAITING</span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Final Risk Evaluation Display */}
      {analysisComplete && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2 border-t border-cyber-border/40"
        >
          {/* Banner message based on risk level */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              result.isBlocked
                ? 'bg-rose-950/70 border-rose-600 text-rose-200'
                : result.requiresMFA
                ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
                : 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
            }`}
          >
            {result.isBlocked ? (
              <AlertOctagon className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
            ) : result.requiresMFA ? (
              <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div>
              <h4 className="text-sm font-mono font-bold uppercase">{result.title}</h4>
              <p className="text-xs font-sans mt-1 leading-relaxed opacity-90">
                {result.subtitle}
              </p>
            </div>
          </div>

          {/* Explicit Risk Reasons Breakdown */}
          <div className="bg-cyber-bg/80 border border-cyber-border/40 rounded-xl p-3.5 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
              Detected Risk Factors ({result.score}/100)
            </p>
            <ul className="space-y-1.5 text-xs font-mono text-gray-300">
              {result.reasons.map((reason, rIdx) => (
                <li key={rIdx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-accent shrink-0"></span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {onCancel && !result.isBlocked && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-mono text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel Session
              </button>
            )}

            <button
              type="button"
              onClick={onProceed}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
                result.isBlocked
                  ? 'bg-rose-900/60 border border-rose-600 text-rose-300 hover:bg-rose-900'
                  : 'bg-cyber-accent hover:bg-rose-600 text-white shadow-cyber-accent/20'
              }`}
            >
              <span>
                {result.isBlocked
                  ? 'Acknowledge Security Block'
                  : result.requiresMFA
                  ? 'Proceed to MFA Verification'
                  : 'Complete Secure Access'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RiskAnalysis;
