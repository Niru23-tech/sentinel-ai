// SentinelX AI - Global React Error Boundary Component

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Lock } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SentinelX Uncaught Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080E] text-gray-100 flex flex-col items-center justify-center p-6 scanline font-mono text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

          <div className="max-w-md w-full bg-[#0E101A] border border-rose-600/60 rounded-2xl p-8 shadow-2xl z-10 space-y-4">
            <div className="h-16 w-16 rounded-full bg-rose-950/60 border border-rose-600 flex items-center justify-center text-rose-400 mx-auto animate-pulse">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-gray-100">
                SYSTEM EXCEPTION INTERCEPTED
              </h2>
              <p className="text-xs text-rose-400 mt-1 font-semibold">
                SENTINELX FAULT TOLERANCE PROTECTION ACTIVE
              </p>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              An unexpected render exception was trapped. SentinelX has isolated the fault to preserve memory state and prevent security leaks.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#07080E] border border-white/10 text-left overflow-x-auto text-[11px] font-mono text-rose-300">
                <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>RELOAD SYSTEM & SECURE LOGIN</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 pt-2 border-t border-white/10">
              <Lock className="h-3 w-3 text-cyan-400" />
              <span>SentinelX Zero-Trust Fault Isolation Engine</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
