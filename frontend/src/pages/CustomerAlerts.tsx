import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, MessageSquare, Mail, Smartphone, CheckCircle, XCircle,
  AlertTriangle, Send, Clock, User, ShieldCheck, RefreshCw
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

type AlertChannel = 'SMS' | 'Email' | 'OTP' | 'Push';
type AlertStatus  = 'Delivered' | 'Read' | 'Pending' | 'Failed';
type CustomerResponse = 'Confirmed' | 'Denied' | null;

interface AlertRecord {
  id: number;
  customerId: number;
  customerName: string;
  channel: AlertChannel;
  message: string;
  status: AlertStatus;
  response: CustomerResponse;
  sentAt: string;
  otp?: string;
}

const CHANNEL_ICON: Record<AlertChannel, React.ReactNode> = {
  SMS:   <MessageSquare className="h-4 w-4" />,
  Email: <Mail          className="h-4 w-4" />,
  OTP:   <Smartphone    className="h-4 w-4" />,
  Push:  <Bell          className="h-4 w-4" />,
};

const CHANNEL_COLOR: Record<AlertChannel, string> = {
  SMS:   'text-cyber-blue   border-cyber-blue/40   bg-cyber-blue/10',
  Email: 'text-purple-400   border-purple-500/40   bg-purple-950/20',
  OTP:   'text-cyber-amber  border-cyber-amber/40  bg-amber-950/20',
  Push:  'text-cyber-green  border-cyber-green/40  bg-green-950/20',
};

const SEED_ALERTS: AlertRecord[] = [
  { id: 1, customerId: 1, customerName: 'Arjun Sharma',   channel: 'OTP',   message: 'SentinelAI: OTP 847291 for re-verification. Do NOT share. Valid 5 min.',                   status: 'Read',      response: 'Confirmed', sentAt: '09:23:18', otp: '847291' },
  { id: 2, customerId: 1, customerName: 'Arjun Sharma',   channel: 'SMS',   message: 'ALERT: Suspicious login from Russia (Tor node). Account frozen. Contact bank if not you.', status: 'Delivered',  response: null,       sentAt: '09:23:14'              },
  { id: 3, customerId: 2, customerName: 'Priya Patel',    channel: 'Email', message: 'Security Notice: A new device logged into your account from Netherlands. Review now.',       status: 'Read',      response: 'Denied',   sentAt: '09:15:02'              },
  { id: 4, customerId: 2, customerName: 'Priya Patel',    channel: 'OTP',   message: 'SentinelAI: OTP 334820 to authorize ₹75,000 transfer. Expires in 5 min.',                  status: 'Delivered',  response: null,       sentAt: '09:01:44', otp: '334820' },
  { id: 5, customerId: 3, customerName: 'Rahul Verma',    channel: 'SMS',   message: 'WARNING: ₹1,20,000 transfer BLOCKED. Reason: High-risk session. Ref #INC-0003.',            status: 'Read',      response: 'Confirmed', sentAt: '08:55:30'              },
  { id: 6, customerId: 4, customerName: 'Sneha Iyer',     channel: 'Push',  message: 'New login from unusual location. Is this you? Tap to confirm.',                             status: 'Pending',   response: null,       sentAt: '08:47:10'              },
];

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const CustomerAlerts: React.FC = () => {
  const { customers, activeCustomer, incidents } = useSentinel();
  const [alerts,        setAlerts]        = useState<AlertRecord[]>(SEED_ALERTS);
  const [sending,       setSending]       = useState<string | null>(null);
  const [filterChannel, setFilterChannel] = useState<AlertChannel | 'ALL'>('ALL');
  const [justSent,      setJustSent]      = useState<number | null>(null);

  const filteredAlerts = filterChannel === 'ALL'
    ? alerts
    : alerts.filter(a => a.channel === filterChannel);

  const sendAlert = async (channel: AlertChannel, customerId: number, message: string) => {
    const key = `${channel}-${customerId}`;
    setSending(key);
    await new Promise(r => setTimeout(r, 1200));

    const newAlert: AlertRecord = {
      id: Date.now(),
      customerId,
      customerName: customers.find(c => c.id === customerId)?.name || 'Unknown',
      channel,
      message,
      status: 'Delivered',
      response: null,
      sentAt: new Date().toLocaleTimeString(),
      otp: channel === 'OTP' ? generateOTP() : undefined,
    };
    setAlerts(prev => [newAlert, ...prev]);
    setSending(null);
    setJustSent(newAlert.id);
    setTimeout(() => setJustSent(null), 3000);
  };

  const handleCustomerResponse = (id: number, resp: CustomerResponse) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, response: resp, status: 'Read' } : a));
  };

  const deliveredCount  = alerts.filter(a => a.status !== 'Pending').length;
  const deniedCount     = alerts.filter(a => a.response === 'Denied').length;
  const pendingCount    = alerts.filter(a => a.response === null && a.status !== 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Alerts Sent',       value: alerts.length, color: 'text-cyber-accent' },
          { label: 'Delivered',         value: deliveredCount, color: 'text-cyber-green'  },
          { label: 'Awaiting Response', value: pendingCount,   color: 'text-cyber-amber'  },
          { label: 'Customer Denied',   value: deniedCount,    color: 'text-cyber-red'    },
        ].map(s => (
          <div key={s.label} className="cyber-card text-center">
            <p className={`text-2xl font-extrabold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Alert Panel */}
        <div className="cyber-card space-y-4">
          <div className="flex items-center gap-2 border-b border-cyber-border/60 pb-3">
            <Send className="h-4 w-4 text-cyber-accent" />
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Send Alert</h3>
          </div>

          {(['SMS', 'Email', 'OTP', 'Push'] as AlertChannel[]).map(ch => {
            const key = `${ch}-${activeCustomer?.id}`;
            const isLoading = sending === key;
            const messages: Record<AlertChannel, string> = {
              SMS:   `ALERT: Suspicious activity on your account ${activeCustomer?.account_number}. Contact bank if not you.`,
              Email: `Security Notice: Unusual login detected on your SentinelAI-protected account. Please verify immediately.`,
              OTP:   `SentinelAI: OTP for re-authentication. Valid 5 minutes. Do NOT share.`,
              Push:  `New security event detected on your account. Tap to review.`,
            };
            return (
              <button
                key={ch}
                disabled={!activeCustomer || !!sending}
                onClick={() => activeCustomer && sendAlert(ch, activeCustomer.id, messages[ch])}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isLoading
                    ? 'animate-pulse bg-cyber-cardLight/30 border-cyber-accent/40'
                    : 'bg-cyber-cardLight/20 border-cyber-border/50 hover:border-cyber-accent/40 hover:bg-cyber-cardLight/40'
                } ${!activeCustomer ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center border text-sm ${CHANNEL_COLOR[ch]}`}>
                    {CHANNEL_ICON[ch]}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-200">Send {ch}</p>
                    <p className="text-[10px] text-gray-500">to {activeCustomer?.name || 'Select client'}</p>
                  </div>
                </div>
                {isLoading
                  ? <div className="h-3.5 w-3.5 border border-cyber-accent border-t-transparent rounded-full animate-spin" />
                  : <Send className="h-3.5 w-3.5 text-gray-500" />
                }
              </button>
            );
          })}

          {!activeCustomer && (
            <p className="text-[10px] text-gray-600 font-mono text-center">Select a client from the header search to send alerts.</p>
          )}
        </div>

        {/* Alert Feed */}
        <div className="lg:col-span-2 cyber-card">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-cyber-accent" />
              <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Alert History</h3>
            </div>
            {/* Channel filter */}
            <div className="flex gap-1.5">
              {(['ALL', 'SMS', 'Email', 'OTP', 'Push'] as const).map(f => (
                <button key={f} onClick={() => setFilterChannel(f)}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono border transition-colors ${
                    filterChannel === f
                      ? 'bg-cyber-accent/20 border-cyber-accent/50 text-cyber-accent'
                      : 'border-cyber-border/50 text-gray-500 hover:text-gray-300'
                  }`}
                >{f}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            <AnimatePresence>
              {filteredAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3.5 rounded-xl border transition-all ${
                    justSent === alert.id ? 'border-cyber-green/50 bg-green-950/10' : 'border-cyber-border/40 bg-cyber-cardLight/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Channel badge */}
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${CHANNEL_COLOR[alert.channel]}`}>
                        {CHANNEL_ICON[alert.channel]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-gray-200">{alert.customerName}</p>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${CHANNEL_COLOR[alert.channel]}`}>{alert.channel}</span>
                          {alert.otp && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyber-amber/20 border border-cyber-amber/40 text-cyber-amber tracking-widest">
                              OTP: {alert.otp}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-snug">{alert.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-mono text-gray-600 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {alert.sentAt}
                          </span>
                          <span className={`text-[9px] font-mono ${
                            alert.status === 'Read' ? 'text-cyber-green' :
                            alert.status === 'Delivered' ? 'text-cyber-blue' :
                            alert.status === 'Pending' ? 'text-cyber-amber' : 'text-cyber-red'
                          }`}>{alert.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Response badge / buttons */}
                    <div className="shrink-0">
                      {alert.response === 'Confirmed' ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-cyber-green bg-green-950/40 border border-green-900/50 px-2 py-1 rounded-lg">
                          <CheckCircle className="h-3 w-3" /> Confirmed
                        </span>
                      ) : alert.response === 'Denied' ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-cyber-red bg-red-950/40 border border-red-900/50 px-2 py-1 rounded-lg">
                          <XCircle className="h-3 w-3" /> Denied
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleCustomerResponse(alert.id, 'Confirmed')}
                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-green-950/30 border border-green-900/50 text-cyber-green hover:bg-green-950/60 transition-colors">
                            ✓ It's me
                          </button>
                          <button onClick={() => handleCustomerResponse(alert.id, 'Denied')}
                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-950/30 border border-red-900/50 text-cyber-red hover:bg-red-950/60 transition-colors">
                            ✗ Not me
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAlerts;
