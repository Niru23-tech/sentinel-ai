// SentinelX AI - Authentication Security Verification Analysis Component

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiskAssessmentResult } from '../../types/security';
import RiskScore from './RiskScore';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertOctagon, Loader2, Cpu, ArrowRight, ShieldX } from 'lucide-react';

interface AuthenticationAnalysisProps {
  result: RiskAssessmentResult;
  onProceed: () => void;
  onCancel?: () => void;
}

export const AuthenticationAnalysis: React.FC<AuthenticationAnalysisProps> = ({
  result,
  onProceed,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);

  useEffect(() => {
    if (currentStepIndex < result.verificationSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 300);
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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="w-full max-w-lg mx-auto bg-cyber-card border border-cyber-border/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl font-mono"
    >
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/40 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyber-accent/10 border border-cyber-accent/40 text-cyber-accent">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-100">
              VERIFYING SECURITY CONTEXT
            </h3>
            <p className="text-[11px] text-gray-400">
              SentinelX Adaptive Trust Analysis Engine
            </p>
          </div>
        </div>
      </div>

      {/* Animated Check Steps */}
      <div className="space-y-2.5 mb-6">
        <p className="text-[10px] uppercase tracking-widest text-cyber-teal font-bold mb-2">
          COMPUTING EMPLOYEE TRUST PROFILE...
        </p>

        {result.verificationSteps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <motion.div
              key={step.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all duration-200 ${
                isDone
                  ? 'bg-cyber-cardLight/60 border-cyber-border/40 text-gray-200'
                  : isCurrent
                  ? 'bg-cyber-accent/10 border-cyber-accent/50 text-cyber-accent'
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
                  <span className="text-cyber-accent">ANALYZING</span>
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
          {/* Risk Score Gauge */}
          <RiskScore score={result.score} category={result.category} type="horizontal" />

          {/* Banner message based on risk level */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              result.isBlocked
                ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                : result.requiresMFA
                ? result.category === 'HIGH'
                  ? 'bg-orange-950/80 border-orange-500 text-orange-200'
                  : 'bg-amber-950/80 border-amber-500 text-amber-200'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
            }`}
          >
            {result.isBlocked ? (
              <ShieldX className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
            ) : result.requiresMFA ? (
              <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase">{result.title}</h4>
              <p className="text-xs font-sans leading-relaxed opacity-95">
                {result.subtitle}
              </p>
              {result.incidentId && (
                <p className="text-[11px] font-mono text-rose-300 pt-1 font-bold">
                  Incident Reference ID: <span className="underline">{result.incidentId}</span>
                </p>
              )}
            </div>
          </div>

          {/* Risk Reasons List */}
          <div className="bg-cyber-bg/80 border border-cyber-border/40 rounded-xl p-3.5 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              Detected Risk Context
            </p>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {result.reasons.map((reason, rIdx) => (
                <li key={rIdx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-accent shrink-0"></span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.isBlocked && (
            <p className="text-[11px] text-rose-400 font-bold text-center">
              Security administrators have been notified of this blocked attempt.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {onCancel && !result.isBlocked && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel Session
              </button>
            )}

            <button
              type="button"
              onClick={onProceed}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                result.isBlocked
                  ? 'bg-rose-900/80 border border-rose-600 text-rose-200 hover:bg-rose-900'
                  : 'bg-cyber-accent hover:bg-rose-600 text-white shadow-cyber-accent/20'
              }`}
            >
              <span>
                {result.isBlocked
                  ? 'Acknowledge Security Block'
                  : result.requiresMFA
                  ? 'Proceed to MFA Verification'
                  : 'ACCESS GRANTED — Enter Command Center'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AuthenticationAnalysis;
