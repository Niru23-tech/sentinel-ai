// Local client-side API mock interceptor for SentinelAI.
// This overrides window.fetch globally to fall back to simulated state if the backend is offline.

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
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: 1, name: "Sarah Jenkins", account_number: "ACC-998243", balance: 145000.0, today_spending: 12000.0, current_device: "iPhone 15 Pro", current_browser: "Safari Mobile", current_location: "Chennai, India", current_ip: "122.172.18.92", risk_score: 15, account_status: "Active", security_status: "Secured" },
  { id: 2, name: "Rajesh Patel", account_number: "ACC-334190", balance: 412000.0, today_spending: 0.0, current_device: "MacBook Pro", current_browser: "Chrome", current_location: "Mumbai, India", current_ip: "103.241.12.18", risk_score: 5, account_status: "Active", security_status: "Secured" },
  { id: 3, name: "Anita Sen", account_number: "ACC-109348", balance: 87500.0, today_spending: 3500.0, current_device: "Windows 11 PC", current_browser: "Edge", current_location: "Kolkata, India", current_ip: "182.74.88.54", risk_score: 10, account_status: "Active", security_status: "Secured" },
  { id: 4, name: "David Miller", account_number: "ACC-884210", balance: 210000.0, today_spending: 45000.0, current_device: "iPad Air", current_browser: "Safari Mobile", current_location: "New Delhi, India", current_ip: "115.110.201.7", risk_score: 20, account_status: "Active", security_status: "Secured" },
  { id: 5, name: "Priya Sharma", account_number: "ACC-776123", balance: 345000.0, today_spending: 0.0, current_device: "OnePlus 11", current_browser: "Chrome Mobile", current_location: "Bangalore, India", current_ip: "49.207.130.45", risk_score: 12, account_status: "Active", security_status: "Secured" },
  { id: 6, name: "John Doe", account_number: "ACC-124987", balance: 95000.0, today_spending: 0.0, current_device: "Samsung Galaxy S23 (Rooted)", current_browser: "Tor Browser", current_location: "Frankfurt, Germany (via VPN)", current_ip: "185.220.101.5", risk_score: 85, account_status: "Temporarily Frozen", security_status: "Under Threat" },
  { id: 7, name: "Michael Chang", account_number: "ACC-554109", balance: 620000.0, today_spending: 8000.0, current_device: "iPhone 13", current_browser: "Safari Mobile", current_location: "Singapore", current_ip: "202.166.15.82", risk_score: 8, account_status: "Active", security_status: "Secured" },
  { id: 8, name: "Elena Rostova", account_number: "ACC-229487", balance: 180000.0, today_spending: 0.0, current_device: "Lenovo ThinkPad", current_browser: "Firefox", current_location: "Moscow, Russia", current_ip: "46.112.83.204", risk_score: 15, account_status: "Active", security_status: "Secured" },
  { id: 9, name: "Amit Verma", account_number: "ACC-448201", balance: 290000.0, today_spending: 500.0, current_device: "Google Pixel 8", current_browser: "Chrome Mobile", current_location: "Hyderabad, India", current_ip: "157.51.92.14", risk_score: 0, account_status: "Active", security_status: "Secured" },
  { id: 10, name: "Vikram Malhotra", account_number: "ACC-663842", balance: 540000.0, today_spending: 15000.0, current_device: "MacBook Air", current_browser: "Safari", current_location: "Pune, India", current_ip: "117.211.89.33", risk_score: 18, account_status: "Active", security_status: "Secured" }
];

const MOCK_AI_EXPLANATIONS: Record<string, string> = {
  "Phishing Attack": "AI detected a phishing link click event on the customer's registered email/SMS logs, followed by an immediate login session initiated from an unfamiliar IP address using a commercial VPN server.",
  "Credential Theft": "AI identified multiple failed authentication attempts on different browsers, followed by a successful login, a password change, and consecutive OTP delivery failures.",
  "Session Hijack": "AI correlated a standard login from Chennai, India with an active Tor connection requesting transaction authorization from Berlin, Germany just 5 minutes later. This represents impossible physical travel.",
  "VPN Login": "A successful login was established using a known commercial VPN provider (NordVPN/ExpressVPN). The device fingerprint matches the customer's registered profile, but the IP route is spoofed.",
  "Malware Infection": "Mobile endpoint protection telemetry reported that the customer's mobile app is running on a rooted/jailbroken environment and identified a resident banking Trojan process (Anubis/Pegasus clone) actively monitoring screen layouts.",
  "Account Takeover": "AI detected a critical threat sequence: the customer logged in from a new device in Frankfurt, Germany (NordVPN) while their registered phone is in Delhi, India. They immediately added a beneficiary ('Hacker Wallet') and initiated an urgent transaction of ₹45,000.",
  "Insider Threat": "Customer session initiated at 03:14 AM showing high-velocity transfers (3 transfers within 60 seconds) close to the daily transfer limits. Device footprint matches, but behavior is highly anomalous."
};

const MOCK_AI_ROOT_CAUSES: Record<string, string> = {
  "Phishing Attack": "Social engineering via SMS/Email leading to active session token harvesting or credential disclosure.",
  "Credential Theft": "Compromised credentials (credential stuffing or password spraying) without robust Multi-Factor Authentication.",
  "Session Hijack": "Session hijacking via cookie theft, malware stager, or active browser-in-the-middle proxy.",
  "VPN Login": "Customer using a VPN for privacy, or attacker attempting to mask location.",
  "Malware Infection": "Installation of an infected, side-loaded Android package (APK) by the customer.",
  "Account Takeover": "Combined credential theft, device sandbox compromise, and session hijacking routed through geo-masking proxies.",
  "Insider Threat": "Coerced transactions, theft of physical unlocked device, or insider fraud."
};

const MOCK_AI_RECOMMENDATIONS: Record<string, string> = {
  "Phishing Attack": "1. Invalidate active browser cookies.\n2. Force authentication credential reset.\n3. Run mobile device malware inspection.",
  "Credential Theft": "1. Reset Active Account Password.\n2. Revoke active session tokens.\n3. Require MFA setup upon next portal entry.",
  "Session Hijack": "1. Terminate all active browser sessions immediately.\n2. Place 24-hour cooling freeze on outgoing UPI transactions.\n3. Blacklist IP addresses associated with Tor Exit Node.",
  "VPN Login": "1. Log session as low-risk anomaly.\n2. Monitor for subsequent location jumps.",
  "Malware Infection": "1. Freeze mobile banking access channel.\n2. Send push alert instructing user to uninstall suspicious software.\n3. Require physical device verification before unblocking.",
  "Account Takeover": "1. Block outgoing UPI transaction of ₹45,000 immediately.\n2. Temporarily suspend account ACC-124987.\n3. Log out attacker and lock IP address 185.220.101.5.\n4. Notify client via SMS and out-of-band phone call.",
  "Insider Threat": "1. Temporarily freeze transaction processing for 6 hours.\n2. Require biometric authentication (FaceID/Fingerprint) to resume transfers.\n3. Trigger automated verification callback."
};

const ATTACK_TEMPLATES: Record<string, any[]> = {
  "Phishing Attack": [
    ["Suspicious Email Link Clicked", "mail", "Medium", "User clicked a link in a suspicious phishing email offering reward points.", 20],
    ["Unfamiliar IP Detected", "wifi", "Low", "Session opened from unrecognized IP range 185.220.101.44", 15],
    ["VPN Detected", "globe", "Medium", "Connection routed through NordVPN proxy servers.", 25]
  ],
  "Credential Theft": [
    ["Failed Login Attempt", "lock", "Low", "First authentication attempt failed: Bad password", 10],
    ["Login Successful", "shield", "Low", "Authentication succeeded on third attempt from Windows 11 PC", 0],
    ["Password Changed", "key", "High", "Account password updated via web self-service portal", 15],
    ["Multiple OTP Failures", "lock", "Medium", "OTP authentication failed twice during profile update", 15]
  ],
  "Session Hijack": [
    ["Unfamiliar Browser", "smartphone", "Medium", "Session cookie injected into a new Chrome 124 browser profile", 20],
    ["VPN Detected", "globe", "Medium", "Connection routed through ExpressVPN Munich servers", 25],
    ["Impossible Travel", "plane", "High", "Access requested from Berlin, Germany within 5 minutes of Chennai, India login", 30],
    ["TOR Detected", "shield-alert", "High", "Connection routing detected via TOR Exit Node", 35]
  ],
  "VPN Login": [
    ["VPN Detected", "globe", "Medium", "Connection established using IP 46.112.83.204 (commercial VPN range)", 25],
    ["Login Successful", "shield", "Low", "Successful login from VPN endpoint", 0],
    ["Device Check", "smartphone", "Low", "Device posture check: Normal iPhone OS version", 0]
  ],
  "Malware Infection": [
    ["Rooted Device", "alert-triangle", "High", "Device integrity check failed: Root access/Jailbreak detected", 30],
    ["Malware Detected", "bug", "Critical", "Banking Trojan signature (Anubis/Pegasus clone) detected in memory background processes", 40]
  ],
  "Account Takeover": [
    ["New Device Detected", "smartphone", "Medium", "Unfamiliar Samsung S23 logged into account", 20],
    ["VPN Detected", "globe", "Medium", "Connection routed through IP 185.220.101.5 (Proxy)", 25],
    ["Impossible Travel", "plane", "High", "Login session jumped across continents in 10 minutes", 30],
    ["Rooted Device", "alert-triangle", "High", "Samsung S23 running customized jailbroken OS environment", 30],
    ["New Beneficiary Added", "user-plus", "Medium", "UPI Payee 'Hacker Wallet' registered successfully", 20]
  ],
  "Insider Threat": [
    ["Unusual Login Hours", "clock", "Medium", "Account logged into at 03:14 AM (Normal login: 09:00 AM - 07:00 PM)", 15],
    ["Rapid Transfers", "activity", "High", "Initiated 3 high-value transactions within 60 seconds", 20],
    ["Failed OTP Attempt", "lock", "Medium", "OTP authentication expired during beneficiary validation", 15]
  ]
};

// Seed Local Storage
const initLocalStorage = () => {
  if (localStorage.getItem('sentinel_seeded_v3')) return;

  localStorage.setItem('sentinel_seeded_v3', 'true');
  localStorage.setItem('settings', JSON.stringify({
    risk_threshold: 80,
    enable_ai: true,
    enable_auto_protection: true,
    enable_learning_mode: true
  }));

  localStorage.setItem('customers', JSON.stringify(MOCK_CUSTOMERS));

  // Seed Transactions
  const transactions: Transaction[] = [
    { id: 1, customer_id: 1, amount: 5000, receiver: "Ajay Kumar", bank: "HDFC Bank", upi: "ajay@upi", purpose: "Rent", status: "Allowed", risk_score: 10, money_saved: 0, timestamp: new Date(Date.now() - 36*3600*1000).toISOString() },
    { id: 2, customer_id: 1, amount: 7000, receiver: "Amazon India", bank: "ICICI Bank", purpose: "Shopping", status: "Allowed", risk_score: 8, money_saved: 0, timestamp: new Date(Date.now() - 24*3600*1000).toISOString() },
    { id: 3, customer_id: 3, amount: 1500, receiver: "Zomato", bank: "SBI", upi: "zomato@upi", purpose: "Food Delivery", status: "Allowed", risk_score: 5, money_saved: 0, timestamp: new Date(Date.now() - 12*3600*1000).toISOString() },
    { id: 4, customer_id: 6, amount: 45000, receiver: "Hacker Wallet", bank: "Unknown Offshore Bank", upi: "malicious_addr@upi", purpose: "Urgent Transfer", status: "Blocked", risk_score: 90, blocked_reason: "High Risk Session - Suspected Account Takeover", money_saved: 45000, timestamp: new Date(Date.now() - 30*60*1000).toISOString() }
  ];
  localStorage.setItem('transactions', JSON.stringify(transactions));

  // Seed Logs
  const logs: TelemetryLog[] = [
    { id: 1, customer_id: 1, event_type: "Login Successful", icon: "shield", severity: "Low", description: "Successful login from registered device 'iPhone 15 Pro'", risk_added: 0, timestamp: new Date(Date.now() - 48*3600*1000).toISOString() },
    { id: 2, customer_id: 1, event_type: "Device Check", icon: "smartphone", severity: "Low", description: "Device posture check: iOS 17.4.1 (Non-Rooted)", risk_added: 0, timestamp: new Date(Date.now() - 47*3600*1000).toISOString() },
    { id: 3, customer_id: 6, event_type: "Login Successful", icon: "shield", severity: "Low", description: "Successful login from registered device 'John's Phone'", risk_added: 0, timestamp: new Date(Date.now() - 1*3600*1000).toISOString() },
    { id: 4, customer_id: 6, event_type: "New Device Detected", icon: "smartphone", severity: "Medium", description: "Unfamiliar device Samsung Galaxy S23 initiated login session", risk_added: 20, timestamp: new Date(Date.now() - 50*60*1000).toISOString() },
    { id: 5, customer_id: 6, event_type: "VPN Detected", icon: "globe", severity: "Medium", description: "Connection routed through NordVPN Frankfurt servers", risk_added: 25, timestamp: new Date(Date.now() - 40*60*1000).toISOString() },
    { id: 6, customer_id: 6, event_type: "TOR Detected", icon: "shield-alert", severity: "High", description: "Connection routing detected via TOR Exit Node", risk_added: 35, timestamp: new Date(Date.now() - 35*60*1000).toISOString() }
  ];
  localStorage.setItem('logs', JSON.stringify(logs));

  // Seed Incident Reports
  const actions = [
    "Blocked Outgoing UPI Transaction of ₹45,000",
    "Froze Customer Account ACC-124987",
    "Terminated Rogue Tor/VPN Session",
    "Locked Attacker IP 185.220.101.5",
    "SMS/Email Warning Dispatched to Registered Mobile"
  ];
  
  const correlated = [
    { time: "09:12 AM", event: "New Device Detected", risk: 20, description: "Samsung Galaxy S23 logged in" },
    { time: "09:14 AM", event: "VPN Connection Active", risk: 25, description: "NordVPN Server (Frankfurt, Germany)" },
    { time: "09:15 AM", event: "Impossible Travel Triggered", risk: 30, description: "Delhi to Frankfurt in under 10 minutes" }
  ];

  const incidents: Incident[] = [
    {
      id: 1,
      customer_id: 6,
      threat_type: "Account Takeover",
      risk_score: 95,
      confidence_score: 98,
      events_correlated_json: JSON.stringify(correlated),
      transaction_details_json: JSON.stringify({ amount: 45000, receiver: "Hacker Wallet", bank: "Unknown Offshore Bank", upi: "malicious_addr@upi", purpose: "Urgent Transfer" }),
      actions_taken_json: JSON.stringify(actions),
      money_protected: 45000,
      analyst_recommendation: "Contact customer John Doe immediately on registered landline. Require in-person KYC and biometric reset before unlocking account.",
      status: "Blocked",
      created_at: new Date(Date.now() - 30*60*1000).toISOString(),
      updated_at: new Date(Date.now() - 30*60*1000).toISOString()
    }
  ];
  localStorage.setItem('incidents', JSON.stringify(incidents));
};

initLocalStorage();

const makeResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

const handleMockRequest = (urlStr: string, options: any = {}) => {
  const method = options.method || 'GET';
  const cleanUrl = urlStr.replace(/^https?:\/\/[^/]+/, ''); // remove domain

  // --- API 1: Customers ---
  if (cleanUrl === '/api/customers' && method === 'GET') {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    return makeResponse(customers);
  }

  // --- API 2: Specific Customer ---
  const custMatch = cleanUrl.match(/\/api\/customers\/(\d+)$/);
  if (custMatch && method === 'GET') {
    const id = parseInt(custMatch[1]);
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find((c: Customer) => c.id === id);
    if (!customer) return makeResponse({ detail: "Customer not found" }, 404);
    return makeResponse(customer);
  }

  // --- API 3: Customer Transactions ---
  const custTxMatch = cleanUrl.match(/\/api\/customers\/(\d+)\/transactions$/);
  if (custTxMatch && method === 'GET') {
    const id = parseInt(custTxMatch[1]);
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const list = transactions.filter((t: Transaction) => t.customer_id === id);
    return makeResponse(list);
  }

  // --- API 4: Initiate Transaction ---
  if (cleanUrl === '/api/transactions/initiate' && method === 'POST') {
    const payload = JSON.parse(options.body);
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find((c: Customer) => c.id === payload.customer_id);
    if (!customer) return makeResponse({ detail: "Customer not found" }, 404);

    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const threshold = settings.risk_threshold || 80;
    const autoProtect = settings.enable_auto_protection !== false;
    const aiEnabled = settings.enable_ai !== false;

    // Check if already frozen
    if (customer.account_status === "Temporarily Frozen" || customer.account_status === "Locked") {
      const tx: Transaction = {
        id: Date.now(),
        customer_id: customer.id,
        amount: payload.amount,
        receiver: payload.receiver,
        bank: payload.bank,
        upi: payload.upi,
        purpose: payload.purpose,
        status: "Blocked",
        risk_score: customer.risk_score,
        blocked_reason: "Account Suspended - Risk Threshold Exceeded",
        money_saved: payload.amount,
        timestamp: new Date().toISOString()
      };
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.unshift(tx);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      return makeResponse(tx);
    }

    let addedRisk = 0;
    if (aiEnabled) {
      if (payload.amount > 50000) addedRisk += 20;
      addedRisk += 10; // base tx check
    }

    // Add log
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const txLog: TelemetryLog = {
      id: Date.now(),
      customer_id: customer.id,
      event_type: "Transaction Initiated",
      icon: "wallet",
      severity: addedRisk >= 30 ? "Medium" : "Low",
      description: `Transaction of ₹${payload.amount.toLocaleString()} initiated to ${payload.receiver} (${payload.bank})`,
      risk_added: addedRisk,
      timestamp: new Date().toISOString()
    };
    logs.unshift(txLog);

    customer.risk_score = Math.min(100, customer.risk_score + addedRisk);

    let txStatus = "Allowed";
    let blockedReason = undefined;
    let saved = 0;

    if (customer.risk_score >= threshold && aiEnabled) {
      txStatus = "Blocked";
      blockedReason = "High Risk Session - Suspected Account Takeover";
      saved = payload.amount;

      const actions = ["Blocked Outgoing UPI Transaction", "Out-of-band Customer SMS Alert Dispatched"];
      if (autoProtect) {
        customer.account_status = "Temporarily Frozen";
        customer.security_status = "Under Threat";
        actions.push(`Suspended Customer Account ${customer.account_number}`);
        actions.push("Terminated Rogue Browser/Tor Session");
        actions.push(`Isolated IP Address ${customer.current_ip}`);
      }

      // Create Incident
      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      const newInc: Incident = {
        id: Date.now(),
        customer_id: customer.id,
        threat_type: "Account Takeover",
        risk_score: customer.risk_score,
        confidence_score: 95,
        events_correlated_json: JSON.stringify(logs.slice(0, 3)),
        transaction_details_json: JSON.stringify(payload),
        actions_taken_json: JSON.stringify(actions),
        money_protected: payload.amount,
        analyst_recommendation: "Verify client identity. Enforce face biometric key resets.",
        status: autoProtect ? "Blocked" : "Under Investigation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      incidents.unshift(newInc);
      localStorage.setItem('incidents', JSON.stringify(incidents));
    } else {
      customer.balance = Math.max(0, customer.balance - payload.amount);
      customer.today_spending += payload.amount;
    }

    const tx: Transaction = {
      id: Date.now(),
      customer_id: customer.id,
      amount: payload.amount,
      receiver: payload.receiver,
      bank: payload.bank,
      upi: payload.upi,
      purpose: payload.purpose,
      status: txStatus,
      risk_score: customer.risk_score,
      blocked_reason: blockedReason,
      money_saved: saved,
      timestamp: new Date().toISOString()
    };

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift(tx);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('logs', JSON.stringify(logs));

    return makeResponse(tx);
  }

  // --- API 5: Trigger Attack Simulation ---
  if (cleanUrl === '/api/simulation/trigger' && method === 'POST') {
    const { attack_type } = JSON.parse(options.body);
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find((c: Customer) => c.id === 1) || customers[0];

    // Reset status for demo fresh run
    customer.account_status = "Active";
    customer.security_status = "Secured";
    customer.risk_score = 10;

    const events = ATTACK_TEMPLATES[attack_type] || [];
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    let riskSum = 0;
    const addedLogs: any[] = [];

    events.forEach(([evName, icon, sev, desc, riskAdd], idx) => {
      const log: TelemetryLog = {
        id: Date.now() + idx,
        customer_id: customer.id,
        event_type: evName,
        icon,
        severity: sev,
        description: desc,
        risk_added: riskAdd,
        timestamp: new Date(Date.now() - (events.length - idx) * 1000).toISOString()
      };
      logs.unshift(log);
      addedLogs.push(log);
      riskSum += riskAdd;
    });

    customer.risk_score = Math.min(100, customer.risk_score + riskSum);
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const threshold = settings.risk_threshold || 80;
    const autoProtect = settings.enable_auto_protection !== false;

    let newInc = null;
    if (customer.risk_score >= threshold) {
      customer.security_status = "Under Threat";
      const actions = ["Blocked Outgoing UPI Transaction"];
      if (autoProtect) {
        customer.account_status = "Temporarily Frozen";
        actions.push(`Suspended Customer Account ${customer.account_number}`);
        actions.push("Terminated Attacker Session");
      }

      const txMock = { amount: 35000, receiver: "Unknown Offshore Wallet", bank: "Cayman Trust", purpose: "Crypto Purchase" };

      // Blocked tx
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.unshift({
        id: Date.now(),
        customer_id: customer.id,
        amount: 35000,
        receiver: txMock.receiver,
        bank: txMock.bank,
        purpose: txMock.purpose,
        status: "Blocked",
        risk_score: customer.risk_score,
        blocked_reason: "High Risk Session - Suspected Account Takeover",
        money_saved: 35000,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('transactions', JSON.stringify(transactions));

      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      newInc = {
        id: Date.now(),
        customer_id: customer.id,
        threat_type: attack_type,
        risk_score: customer.risk_score,
        confidence_score: 92,
        events_correlated_json: JSON.stringify(addedLogs.map(l => ({ time: new Date(l.timestamp).toLocaleTimeString(), event: l.event_type, risk: l.risk_added, description: l.description }))),
        transaction_details_json: JSON.stringify(txMock),
        actions_taken_json: JSON.stringify(actions),
        money_protected: 35000,
        analyst_recommendation: "Enforce multi-factor verification, reset credentials, blacklist IP.",
        status: autoProtect ? "Blocked" : "Under Investigation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      incidents.unshift(newInc);
      localStorage.setItem('incidents', JSON.stringify(incidents));
    }

    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('logs', JSON.stringify(logs));

    return makeResponse(newInc || { id: 999, threat_type: attack_type, risk_score: customer.risk_score, status: "Under Investigation" });
  }

  // --- API 6: Reset Simulation ---
  if (cleanUrl === '/api/simulation/reset' && method === 'POST') {
    localStorage.removeItem('sentinel_seeded_v3');
    initLocalStorage();
    return makeResponse({ message: "Simulation reset successful" });
  }

  // --- API 7: Global Logs ---
  if (cleanUrl === '/api/logs' && method === 'GET') {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    const detailedLogs = logs.map((l: TelemetryLog) => {
      const c = customers.find((cust: Customer) => cust.id === l.customer_id);
      return {
        ...l,
        customer_name: c ? c.name : 'System'
      };
    });
    return makeResponse(detailedLogs);
  }

  // --- API 8: Global Incidents ---
  if (cleanUrl === '/api/incidents' && method === 'GET') {
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const list = incidents.map((inc: Incident) => {
      const c = customers.find((cust: Customer) => cust.id === inc.customer_id);
      return {
        ...inc,
        customer: c
      };
    });
    return makeResponse(list);
  }

  // --- API 9: Specific Incident ---
  const incDetailMatch = cleanUrl.match(/\/api\/incidents\/(\d+)$/);
  if (incDetailMatch && method === 'GET') {
    const id = parseInt(incDetailMatch[1]);
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const inc = incidents.find((i: Incident) => i.id === id);
    if (!inc) return makeResponse({ detail: "Incident not found" }, 404);
    inc.customer = customers.find((c: Customer) => c.id === inc.customer_id);
    return makeResponse(inc);
  }

  // --- API 10: AI investigation Details ---
  const aiInvestMatch = cleanUrl.match(/\/api\/incidents\/(\d+)\/ai-investigation$/);
  if (aiInvestMatch && method === 'GET') {
    const id = parseInt(aiInvestMatch[1]);
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const inc = incidents.find((i: Incident) => i.id === id);
    if (!inc) return makeResponse({ detail: "Incident not found" }, 404);

    const threat = inc.threat_type;
    const summary = MOCK_AI_EXPLANATIONS[threat] || MOCK_AI_EXPLANATIONS["Account Takeover"];
    const rootCause = MOCK_AI_ROOT_CAUSES[threat] || MOCK_AI_ROOT_CAUSES["Account Takeover"];
    const recommendations = MOCK_AI_RECOMMENDATIONS[threat] || MOCK_AI_RECOMMENDATIONS["Account Takeover"];

    const aiData = {
      summary: `Threat profile investigation completed for incident #${id}.`,
      description: summary,
      root_cause: rootCause,
      affected_assets: `Client Deposit Account (ACC-${inc.customer_id === 6 ? '124987' : '998243'}) & Associated UPI Gateways.`,
      recommendations,
      next_step: "Attacker will attempt to cash out using card-not-present channels or register a secondary backup phone number.",
      risk_score: inc.risk_score,
      confidence_score: 95
    };
    return makeResponse(aiData);
  }

  // --- API 11: System Settings ---
  if (cleanUrl === '/api/settings' && method === 'GET') {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    return makeResponse(settings);
  }

  if (cleanUrl === '/api/settings' && method === 'PUT') {
    const payload = JSON.parse(options.body);
    localStorage.setItem('settings', JSON.stringify(payload));
    return makeResponse(payload);
  }

  // --- API 12: Incident Status Update ---
  const incStatusMatch = cleanUrl.match(/\/api\/incidents\/(\d+)\/status$/);
  if (incStatusMatch && method === 'PUT') {
    const id = parseInt(incStatusMatch[1]);
    const { status } = JSON.parse(options.body);
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const inc = incidents.find((i: Incident) => i.id === id);
    if (inc) {
      inc.status = status;
      if (status === 'Resolved') {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const customer = customers.find((c: Customer) => c.id === inc.customer_id);
        if (customer) {
          customer.account_status = "Active";
          customer.security_status = "Secured";
          customer.risk_score = 10;
          localStorage.setItem('customers', JSON.stringify(customers));
        }
      }
      localStorage.setItem('incidents', JSON.stringify(incidents));
      return makeResponse(inc);
    }
    return makeResponse({ detail: "Incident not found" }, 404);
  }

  // --- API 13: Incident Reports Dossier ---
  const reportMatch = cleanUrl.match(/\/api\/reports\/(\d+)$/);
  if (reportMatch && method === 'GET') {
    const id = parseInt(reportMatch[1]);
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const inc = incidents.find((i: Incident) => i.id === id);
    if (!inc) return makeResponse({ detail: "Incident not found" }, 404);

    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find((c: Customer) => c.id === inc.customer_id);

    const threat = inc.threat_type;
    const explanation = MOCK_AI_EXPLANATIONS[threat] || MOCK_AI_EXPLANATIONS["Account Takeover"];
    const recommendations = MOCK_AI_RECOMMENDATIONS[threat] || MOCK_AI_RECOMMENDATIONS["Account Takeover"];

    const timeline = [
      { time: "09:00 AM", stage: "Connection Established", description: `Active session login established using IP ${customer?.current_ip || '122.172.18.92'}` }
    ];
    if (inc.events_correlated_json) {
      const correlated = JSON.parse(inc.events_correlated_json);
      correlated.forEach((c: any) => {
        timeline.push({
          time: c.time,
          stage: c.event,
          description: c.description
        });
      });
    }

    const report = {
      id: id,
      incident_id: id,
      executive_summary: explanation,
      timeline_json: JSON.stringify(timeline),
      ai_analysis_json: JSON.stringify({ risk_score: inc.risk_score, confidence_score: 95, summary: explanation }),
      recommendations,
      created_at: inc.created_at
    };
    return makeResponse(report);
  }

  // --- API 14: Dashboard stats compilation ---
  if (cleanUrl === '/api/dashboard/stats' && method === 'GET') {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    const total_alerts = logs.length;
    const critical_threats = customers.filter((c: Customer) => c.risk_score >= 80).length;
    const active_incidents = incidents.filter((i: Incident) => i.status !== 'Resolved').length;
    const money_saved = incidents.reduce((sum: number, inc: Incident) => sum + inc.money_protected, 0);

    const recent_logs = logs.slice(0, 10).map((l: TelemetryLog) => {
      const c = customers.find((cust: Customer) => cust.id === l.customer_id);
      return {
        id: l.id,
        timestamp: l.timestamp,
        event_type: l.event_type,
        icon: l.icon,
        severity: l.severity,
        description: l.description,
        risk_added: l.risk_added,
        customer_name: c ? c.name : 'System'
      };
    });

    const blocked_count = transactions.filter((t: Transaction) => t.status === "Blocked").count || transactions.filter((t: Transaction) => t.status === "Blocked").length;
    const allowed_count = transactions.filter((t: Transaction) => t.status === "Allowed").count || transactions.filter((t: Transaction) => t.status === "Allowed").length;

    const ato_count = incidents.filter((i: Incident) => i.threat_type === 'Account Takeover').length;
    const hijack_count = incidents.filter((i: Incident) => i.threat_type === 'Session Hijack').length;
    const phishing_count = incidents.filter((i: Incident) => i.threat_type === 'Phishing Attack').length;
    
    return makeResponse({
      metrics: {
        total_alerts,
        critical_threats,
        active_incidents,
        money_saved
      },
      recent_logs,
      charts: {
        transaction_status: [
          { name: "Allowed", value: allowed_count },
          { name: "Blocked", value: blocked_count }
        ],
        threat_categories: [
          { name: "Account Takeover", value: ato_count + 1 },
          { name: "Session Hijack", value: hijack_count },
          { name: "Phishing", value: phishing_count }
        ],
        risk_trend: [
          { time: "09:00", risk: 15 },
          { time: "09:05", risk: 20 },
          { time: "09:10", risk: 25 },
          { time: "09:15", risk: 40 },
          { time: "09:20", risk: 85 }
        ]
      }
    });
  }

  return new Response("Not Found", { status: 404 });
};

// Override window.fetch globally
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  const urlStr = url.toString();
  if (urlStr.startsWith('/api') || urlStr.includes('/api/')) {
    try {
      const response = await originalFetch(url, options);
      if (response.status === 502 || response.status === 504 || response.status === 503 || response.status === 404) {
        throw new Error("Backend offline");
      }
      return response;
    } catch (err) {
      // Fallback
      console.log(`[SentinelAI Mock Engine] Offline Fallback triggered for: ${urlStr}`);
      return handleMockRequest(urlStr, options);
    }
  }
  return originalFetch(url, options);
};
