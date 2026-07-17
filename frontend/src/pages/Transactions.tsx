import React, { useState, useEffect } from 'react';
import { useSentinel, Transaction } from '../context/SentinelContext';
import { 
  ShieldAlert, 
  Send, 
  CheckCircle, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Transactions: React.FC = () => {
  const { activeCustomer, initiateTransaction, transactions, settings } = useSentinel();

  // Input states
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const [bank, setBank] = useState('HDFC Bank');
  const [upi, setUpi] = useState('');
  const [purpose, setPurpose] = useState('General Transfer');

  // Transaction processing states
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);
  const [blockedTx, setBlockedTx] = useState<Transaction | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !receiver || !bank) return;

    setLoading(true);
    setSuccessTx(null);
    setBlockedTx(null);

    try {
      const tx = await initiateTransaction({
        amount: parseFloat(amount),
        receiver,
        bank,
        upi: upi || undefined,
        purpose
      });

      if (tx.status === 'Blocked') {
        setBlockedTx(tx);
      } else {
        setSuccessTx(tx);
        // Clear form on success
        setAmount('');
        setReceiver('');
        setUpi('');
      }
    } catch (err) {
      console.error("Error executing transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transaction Simulator Form */}
        <div className="cyber-card lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-cyber-border/60 pb-3 mb-6">
            <CreditCard className="h-5 w-5 text-cyber-accent" />
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">UPI / Internet Banking Simulator</h3>
          </div>

          {activeCustomer?.account_status === "Temporarily Frozen" ? (
            <div className="p-8 border border-cyber-red/30 bg-cyber-red/5 rounded-xl flex flex-col items-center text-center">
              <Lock className="h-12 w-12 text-cyber-red animate-pulse mb-4" />
              <h4 className="text-md font-bold text-gray-100 font-mono tracking-wider uppercase">Transactions Suspended</h4>
              <p className="text-xs text-gray-400 mt-2 max-w-sm">
                Account <span className="text-gray-200 font-mono">{activeCustomer.account_number}</span> has been locked and placed in offline quarantine mode due to anomalous cybersecurity alerts. Outbound fund transfers are blocked.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">Transfer Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-mono text-sm">₹</span>
                    <input
                      type="number"
                      required
                      placeholder="e.g., 25000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg pl-8 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyber-accent focus:shadow-glow-cyan transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">Receiver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Alice Vance"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyber-accent focus:shadow-glow-cyan transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">Receiver Bank</label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full bg-cyber-cardLight border border-cyber-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyber-accent"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Unknown Offshore Bank">Offshore Cayman Trust</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">UPI Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., receiver@upi"
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyber-accent focus:shadow-glow-cyan transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">Purpose of Transfer</label>
                <input
                  type="text"
                  placeholder="e.g., Invoice Payment, Rent, Family Support"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-cyber-bg/50 border border-cyber-border rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyber-accent focus:shadow-glow-cyan transition-all"
                />
              </div>

              <div className="border-t border-cyber-border/40 pt-4 mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyber-blue to-cyber-accent text-cyber-bg hover:opacity-90 active:scale-95 transition-all gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-cyber-bg border-t-transparent rounded-full animate-spin"></div>
                      <span>Evaluating Security...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Money</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* Success Dialog overlay */}
          {successTx && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-950/20 border border-cyber-green/40 rounded-xl flex items-start gap-3"
            >
              <CheckCircle className="h-5 w-5 text-cyber-green mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-cyber-green font-mono uppercase">Transaction Completed Successfully</h4>
                <p className="text-[11px] text-gray-300 mt-1">
                  Transferred <span className="font-semibold text-gray-100 font-mono">₹{successTx.amount.toLocaleString()}</span> to <span className="font-semibold text-gray-100">{successTx.receiver}</span>. AI correlation Risk check verified session as secure (Risk Score: {successTx.risk_score}%).
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Client Ledger Summary (Right bar) */}
        <div className="cyber-card lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-cyber-border/60 pb-3 mb-4">
            <Building className="h-4.5 w-4.5 text-cyber-accent" />
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Account Transaction History</h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-500 font-mono">
                [NO RECENT TRANSACTIONS RECORDED]
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-3 bg-cyber-cardLight/30 border border-cyber-border/50 rounded-lg flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-gray-200">{tx.receiver}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold font-mono ${tx.status === 'Blocked' ? 'text-cyber-red line-through' : 'text-gray-100'}`}>
                      ₹{tx.amount.toLocaleString()}
                    </p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      tx.status === 'Blocked' ? 'bg-red-950/40 text-cyber-red border border-red-900/60' : 'bg-green-950/40 text-cyber-green border border-green-900/60'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Fullscreen Transaction Blocked Shield Modal */}
      <AnimatePresence>
        {blockedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cyber-bg/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="max-w-lg w-full bg-cyber-card border border-cyber-red rounded-2xl p-8 shadow-glow-red flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Alert Icon */}
              <div className="h-16 w-16 rounded-full bg-red-950/60 border border-cyber-red flex items-center justify-center text-cyber-red mb-6 animate-pulse">
                <ShieldAlert className="h-8 w-8" />
              </div>

              <h2 className="text-xl font-bold text-gray-100 font-mono tracking-wider uppercase">
                Transaction Blocked
              </h2>
              <p className="text-xs text-cyber-red font-mono font-semibold uppercase tracking-widest mt-1 animate-pulse-cyan">
                Autonomous Security Action Triggered
              </p>

              {/* Money Saved Highlight Banner */}
              <div className="w-full bg-red-950/30 border border-red-900/60 rounded-xl px-6 py-4 my-6">
                <p className="text-[10px] text-gray-400 font-mono uppercase">Loss Prevented</p>
                <h3 className="text-3xl font-extrabold text-cyber-red mt-1 font-mono">
                  ₹{blockedTx.amount.toLocaleString()}
                </h3>
                <p className="text-[10px] text-cyber-accent font-mono mt-1">
                  Correlated Risk Score: {blockedTx.risk_score}%
                </p>
              </div>

              {/* Threat Correlation Explanation */}
              <div className="text-left w-full space-y-3">
                <div className="bg-cyber-bg/60 border border-cyber-border rounded-xl p-4 text-xs font-mono text-gray-400">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">BLOCKED REASON:</p>
                  <p className="text-gray-300 font-semibold">{blockedTx.blocked_reason}</p>
                  <p className="mt-2 text-[11px] leading-relaxed">
                    AI engine correlated anomalous cybersecurity events (New Device, Tor usage, VPN Routing) with an immediate out-of-pattern UPI cashout request.
                  </p>
                </div>

                <div className="text-xs">
                  <p className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-2">AUTONOMOUS CONTAIMENT EXECUTED:</p>
                  <ul className="space-y-1.5 font-mono text-[10px] text-cyber-red">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyber-red"></span>
                      <span>Outgoing payment of ₹{blockedTx.amount.toLocaleString()} intercepted and voided</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyber-red"></span>
                      <span>Client account access temporarily frozen</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyber-red"></span>
                      <span>Rogue network endpoints blacklisted</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Acknowledge Button */}
              <button
                onClick={() => setBlockedTx(null)}
                className="w-full mt-6 py-2.5 rounded-lg text-xs font-mono uppercase bg-cyber-red hover:bg-red-700 text-white font-semibold shadow-glow-red transition-all"
              >
                Acknowledge Alert & Proceed
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Transactions;
