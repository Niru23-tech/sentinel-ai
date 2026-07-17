import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Customer {
  id: number;
  name: string;
  account_number: string;
  balance: number;
  today_spending: number;
  current_device: string;
  current_browser: string;
  current_location: string;
  current_ip: string;
  risk_score: number;
  account_status: string;
  security_status: string;
}

export interface TelemetryLog {
  id: number;
  timestamp: string;
  customer_id?: number;
  event_type: string;
  icon: string;
  severity: string;
  description: string;
  risk_added: number;
  customer_name?: string;
}

export interface Transaction {
  id: number;
  customer_id: number;
  amount: number;
  receiver: string;
  bank: string;
  upi?: string;
  purpose?: string;
  status: string;
  risk_score: number;
  blocked_reason?: string;
  money_saved: number;
  timestamp: string;
}

export interface Incident {
  id: number;
  customer_id: number;
  threat_type: string;
  risk_score: number;
  confidence_score: number;
  events_correlated_json?: string;
  transaction_details_json?: string;
  actions_taken_json?: string;
  money_protected: number;
  analyst_recommendation?: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface SystemSettings {
  risk_threshold: number;
  enable_ai: boolean;
  enable_auto_protection: boolean;
  enable_learning_mode: boolean;
}

interface SentinelContextType {
  customers: Customer[];
  activeCustomer: Customer | null;
  logs: TelemetryLog[];
  transactions: Transaction[];
  incidents: Incident[];
  settings: SystemSettings | null;
  loading: boolean;
  recentLogs: TelemetryLog[];
  moneySaved: number;
  activeIncidentsCount: number;
  criticalThreatsCount: number;
  selectCustomer: (id: number) => void;
  initiateTransaction: (txData: { amount: number; receiver: string; bank: string; upi?: string; purpose?: string }) => Promise<Transaction>;
  triggerAttack: (attackType: string) => Promise<Incident>;
  resetSimulation: () => Promise<void>;
  updateSettings: (newSettings: SystemSettings) => Promise<void>;
  updateIncidentStatus: (id: number, status: string) => Promise<void>;
  fetchData: () => Promise<void>;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

export const SentinelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Fetch Customers
      const custRes = await fetch('/api/customers');
      const custData = await custRes.json();
      setCustomers(custData);
      
      // Auto-set first customer as active if none set
      if (custData.length > 0) {
        setActiveCustomer(prev => {
          if (prev) {
            const updated = custData.find((c: Customer) => c.id === prev.id);
            return updated || custData[0];
          }
          return custData[0];
        });
      }

      // 2. Fetch Global Logs
      const logsRes = await fetch('/api/logs');
      const logsData = await logsRes.json();
      setLogs(logsData);

      // 3. Fetch Incidents
      const incRes = await fetch('/api/incidents');
      const incData = await incRes.json();
      setIncidents(incData);

      // 4. Fetch System Settings
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      setSettings(settingsData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching Sentinel data:", error);
      setLoading(false);
    }
  };

  // Poll for live telemetry and database state updates every 3 seconds for active simulation flow
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch transactions specifically when the active customer changes
  useEffect(() => {
    if (activeCustomer) {
      fetch(`/api/customers/${activeCustomer.id}/transactions`)
        .then(res => res.json())
        .then(data => setTransactions(data))
        .catch(err => console.error("Error fetching transactions:", err));
    }
  }, [activeCustomer?.id]);

  const selectCustomer = (id: number) => {
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setActiveCustomer(cust);
    }
  };

  const initiateTransaction = async (txData: { amount: number; receiver: string; bank: string; upi?: string; purpose?: string }) => {
    if (!activeCustomer) throw new Error("No active customer");

    const res = await fetch('/api/transactions/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: activeCustomer.id,
        ...txData
      })
    });

    if (!res.ok) {
      throw new Error("Failed to initiate transaction");
    }

    const tx: Transaction = await res.json();
    await fetchData(); // Refresh state
    return tx;
  };

  const triggerAttack = async (attackType: string) => {
    const res = await fetch('/api/simulation/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attack_type: attackType })
    });

    if (!res.ok) {
      throw new Error("Failed to trigger simulation");
    }

    const incident: Incident = await res.json();
    await fetchData();
    return incident;
  };

  const resetSimulation = async () => {
    const res = await fetch('/api/simulation/reset', { method: 'POST' });
    if (!res.ok) {
      throw new Error("Failed to reset simulation");
    }
    await fetchData();
  };

  const updateSettings = async (newSettings: SystemSettings) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });

    if (!res.ok) {
      throw new Error("Failed to update settings");
    }

    const data = await res.json();
    setSettings(data);
  };

  const updateIncidentStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/incidents/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      throw new Error("Failed to update incident status");
    }

    await fetchData();
  };

  // Derived states
  const recentLogs = logs.slice(0, 15);
  const moneySaved = incidents.reduce((sum, inc) => sum + inc.money_protected, 0);
  const activeIncidentsCount = incidents.filter(inc => inc.status !== 'Resolved').length;
  const criticalThreatsCount = customers.filter(c => c.risk_score >= 80).length;

  return (
    <SentinelContext.Provider value={{
      customers,
      activeCustomer,
      logs,
      transactions,
      incidents,
      settings,
      loading,
      recentLogs,
      moneySaved,
      activeIncidentsCount,
      criticalThreatsCount,
      selectCustomer,
      initiateTransaction,
      triggerAttack,
      resetSimulation,
      updateSettings,
      updateIncidentStatus,
      fetchData
    }}>
      {children}
    </SentinelContext.Provider>
  );
};

export const useSentinel = () => {
  const context = useContext(SentinelContext);
  if (context === undefined) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
};
