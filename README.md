<div align="center">

# 🛡️ SentinelAI

### AI-Powered Cyber Threat Correlation & Autonomous Fraud Prevention for Banking

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)
[![Status](https://img.shields.io/badge/Status-Prototype-blueviolet?style=for-the-badge)]()

> **SentinelAI is NOT a banking application.** It is an **AI Security Intelligence Platform** built for banks — designed to detect cyber attacks *before* money leaves a customer's account by correlating cybersecurity telemetry with transactional behaviour in real time.

</div>

---

## 🎯 What Is SentinelAI?

SentinelAI is a production-quality **Security Operations Center (SOC) prototype** that simulates the complete cyber-defence workflow:

```
DETECT ──► CORRELATE ──► ANALYZE ──► RESPOND ──► REPORT
```

When a threat is detected (e.g. impossible travel, Tor browser usage, rooted device), SentinelAI autonomously:

- 🚫 **Blocks the outgoing transaction** before funds transfer
- 🔒 **Freezes the customer account** temporarily
- 🔐 **Locks the operator terminal** (requiring biometric unlock)
- 📩 **Dispatches SMS/email alerts** to the customer (simulated)
- 📋 **Generates a full incident dossier** (printable PDF)

All data is **fully simulated** — no real banking systems, real customers, or real attacks are involved.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎛️ **Live Dashboard** | Real-time risk gauge, customer profile, threat metrics |
| 📡 **Security Monitor** | Live cybersecurity telemetry event feed with severity filters |
| 💳 **Transaction Simulator** | UPI payment form that blocks transfers when risk is high |
| 🧠 **AI Forensics** | Natural language threat reasoning (Google Gemini or built-in mock) |
| 📄 **Incident Reports** | Printable PDF dossiers with attack timelines and recommendations |
| ⚙️ **Settings & Simulator** | Adjustable risk thresholds and one-click attack injection buttons |
| 🔐 **Session Lock Overlay** | Full-screen terminal lock with biometric unlock simulation |
| 👥 **10 Customer Profiles** | Switch between profiles with different risk levels |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Port 5173)               │
│                                                     │
│  ┌─────────────┐   ┌────────────┐  ┌────────────┐  │
│  │  Dashboard  │   │  Monitor   │  │ Transactions│  │
│  └─────────────┘   └────────────┘  └────────────┘  │
│  ┌─────────────┐   ┌────────────┐  ┌────────────┐  │
│  │ AI Analysis │   │  Reports   │  │  Settings  │  │
│  └─────────────┘   └────────────┘  └────────────┘  │
│                                                     │
│  SentinelContext (React Context + Polling)          │
│  apiMock.ts (Offline Fallback Interceptor)          │
└────────────────────┬────────────────────────────────┘
                     │ REST API (if backend running)
                     ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8000)             │
│                                                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ /api/    │  │simulation │  │   Gemini AI       │  │
│  │customers │  │ /trigger  │  │  (optional)       │  │
│  └──────────┘  └───────────┘  └──────────────────┘  │
│                                                     │
│           SQLite Database (sentinel.db)             │
└─────────────────────────────────────────────────────┘
```

> **Standalone Mode**: If the backend is offline, `apiMock.ts` intercepts all `/api/*` calls and serves responses from browser `localStorage`. The app works fully without Python or any backend.

---

## 🚀 Quick Start

### Option A — Standalone Frontend (No Python Required)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sentinel-ai.git
cd sentinel-ai

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** — the app starts immediately in standalone mock mode. No backend needed.

---

### Option B — Full Stack (Frontend + FastAPI Backend)

#### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. (Optional) Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY for real AI explanations

# 5. Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```

The SQLite database `sentinel.db` is created and seeded automatically on first run.

#### Frontend Setup

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The frontend auto-detects the running backend and switches from mock to live mode.

---

## 🕹️ Demo Walkthrough (5 Minutes)

1. **Select a Customer** — Use the dropdown in the top bar to switch between 10 customer profiles.

2. **View Normal State** — Select **Sarah Jenkins** (Risk: 15%). Her dashboard shows a healthy green risk gauge.

3. **Trigger an Attack** — Go to **Settings** → click **"Account Takeover"**. This simulates:
   - New device login from Frankfurt, Germany (via NordVPN)
   - Impossible travel detection (Delhi → Frankfurt in 5 minutes)
   - Rooted Android device + Tor browser usage
   - New UPI beneficiary "Hacker Wallet" added

4. **Watch Autonomous Response** — Sarah's risk score jumps to **95%**. The system automatically:
   - Freezes her account
   - Locks the operator terminal (full-screen overlay appears)
   - Blocks the pending ₹45,000 transfer

5. **Unlock Terminal** — Click the **Fingerprint Sensor** on the lock screen to simulate biometric authentication.

6. **Test Transaction Block** — Go to **Transactions** → attempt a ₹50,000 transfer → a red shield overlay shows *"TRANSACTION BLOCKED — Loss Prevented: ₹50,000"*.

7. **View AI Reasoning** — Go to **AI Analysis** to see the natural language explanation of *why* the threat was flagged.

8. **Export Report** — Go to **Incident Report** → click **Print / Export PDF** to generate a professional audit dossier.

---

## 🗂️ Project Structure

```
sentinel-ai/
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
│
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx              # Root component + session lock overlay
│   │   ├── main.tsx             # Entry point + mock interceptor registration
│   │   ├── context/
│   │   │   └── SentinelContext.tsx   # Global state (customers, logs, settings)
│   │   ├── components/
│   │   │   ├── Header.tsx       # Top bar with customer switcher
│   │   │   └── Sidebar.tsx      # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # Risk gauge, stats, charts
│   │   │   ├── LiveLogs.tsx     # Real-time telemetry feed
│   │   │   ├── Transactions.tsx # UPI simulator + block overlay
│   │   │   ├── AIAnalysis.tsx   # Forensic AI reasoning panel
│   │   │   ├── IncidentReport.tsx  # Printable incident dossier
│   │   │   └── Settings.tsx     # Controls + attack injectors
│   │   └── utils/
│   │       └── apiMock.ts       # Client-side offline API fallback
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── backend/                     # FastAPI + Python + SQLite
    ├── requirements.txt
    ├── .env.example
    └── app/
        ├── main.py              # FastAPI router + CORS
        ├── models.py            # SQLAlchemy database models
        ├── schemas.py           # Pydantic request/response schemas
        ├── database.py          # DB init + simulation data seeding
        ├── simulation.py        # 7 attack scenario engines
        ├── gemini.py            # AI explanation generator
        ├── config.py            # Settings + env variable loading
        ├── auth.py              # JWT authentication helpers
        └── reports.py           # Incident report builder
```

---

## 🛡️ Simulated Attack Scenarios

| Scenario | Events Generated | Risk Impact |
|---|---|---|
| 🎣 Phishing Attack | Email link click, unfamiliar IP, VPN detected | +60 risk |
| 🔑 Credential Theft | Failed logins, password change, OTP failures | +40 risk |
| 👤 Session Hijack | Cookie injection, impossible travel, Tor node | +85 risk |
| 🌐 VPN Login | Commercial VPN detected, device mismatch | +25 risk |
| 🦠 Malware Infection | Rooted device, banking Trojan signature | +70 risk |
| 🔓 Account Takeover | New device + VPN + impossible travel + new payee | +95 risk |
| 🕵️ Insider Threat | 3AM login, rapid transfers, OTP expiry | +50 risk |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(none)* | Google Gemini API key for real AI explanations |
| `DATABASE_URL` | `sqlite:///./sentinel.db` | SQLAlchemy database connection string |
| `SECRET_KEY` | *(dev default)* | JWT signing secret — **change in production** |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Frontend API proxy target |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + TypeScript 5.8 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 3.4 |
| **Animations** | Framer Motion 12 |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **Routing** | React Router v7 |
| **Backend** | FastAPI 0.115 + Uvicorn |
| **Database** | SQLite via SQLAlchemy ORM |
| **AI** | Google Gemini API (optional) |
| **Auth** | JWT (python-jose + passlib) |

---

## ⚠️ Disclaimer

> This project is an **educational prototype** for demonstrating AI-driven cybersecurity concepts. It does **not** perform actual cyberattacks, connect to real banking systems, or apply real firewall/device changes. All threat scenarios, customer data, and financial figures are entirely simulated.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
