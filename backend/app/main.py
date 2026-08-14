from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import json
import random

from .database import get_db, seed_db, pwd_context
from .models import User, Customer, Log, Transaction, Incident, SystemSettings
from .schemas import (
    LoginRequest, Token, UserResponse, CustomerSchema, LogSchema, 
    TransactionSchema, TransactionCreate, IncidentSchema, 
    SystemSettingsSchema, SimulationRequest, ReportSchema
)
from .auth import create_access_token, get_current_user
from .simulation import trigger_simulation
from .gemini import analyze_incident_with_ai
from .reports import generate_incident_report
from .ml_engine import ml_engine
from .agents.orchestrator import orchestrator
from .models import AgentExecution, AgentFindings, IncidentReports, RiskAnalysis, InvestigationHistory


app = FastAPI(title="SentinelAI Banking Cyber Defense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    seed_db()

# --- AUTH ENDPOINTS (Bypassed / Mocked for Hackathon) ---

@app.post("/api/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Authenticate admin/operator immediately for demo ease
    access_token = create_access_token(data={"sub": "admin@sentinel.ai"})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(db: Session = Depends(get_db)):
    # Return default admin analyst
    admin = db.query(User).filter(User.email == "admin@sentinel.ai").first()
    if not admin:
        admin = User(id=1, email="admin@sentinel.ai", name="Chief SOC Analyst", role="Administrator")
    return admin

# --- CUSTOMER ENDPOINTS ---

@app.get("/api/customers", response_model=List[CustomerSchema])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@app.get("/api/customers/{customer_id}", response_model=CustomerSchema)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust

@app.get("/api/customers/{customer_id}/logs", response_model=List[LogSchema])
def get_customer_logs(customer_id: int, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Log).filter(Log.customer_id == customer_id).order_by(Log.timestamp.desc()).limit(limit).all()

@app.get("/api/customers/{customer_id}/transactions", response_model=List[TransactionSchema])
def get_customer_transactions(customer_id: int, db: Session = Depends(get_db)):
    return db.query(Transaction).filter(Transaction.customer_id == customer_id).order_by(Transaction.timestamp.desc()).all()

# --- TRANSACTIONS INITIATOR & AI RISK ENGINE ---

@app.post("/api/transactions/initiate", response_model=TransactionSchema)
def initiate_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    settings = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    threshold = settings.risk_threshold if settings else 80
    auto_protect = settings.enable_auto_protection if settings else True
    ai_enabled = settings.enable_ai if settings else True

    # If customer account is already frozen, block transaction immediately
    if customer.account_status in ["Temporarily Frozen", "Locked"]:
        tx = Transaction(
            customer_id=customer.id,
            amount=payload.amount,
            receiver=payload.receiver,
            bank=payload.bank,
            upi=payload.upi,
            purpose=payload.purpose,
            status="Blocked",
            risk_score=customer.risk_score,
            blocked_reason="Account Suspended - Risk Threshold Exceeded",
            money_saved=payload.amount,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx

    # Evaluate dynamic transactional behavior risk additions using Enterprise ML Engine
    added_risk = 0
    ml_result = None
    if ai_enabled:
        # Check if beneficiary is new
        is_new_receiver = not bool(db.query(Transaction).filter(
            Transaction.customer_id == customer.id,
            Transaction.receiver == payload.receiver,
            Transaction.status == "Allowed"
        ).first())

        # Determine features based on customer threat telemetry state
        velocity_kmh = 1250.0 if (customer.security_status == "Under Threat" or customer.risk_score >= 50) else 15.0
        unfamiliar_dev = customer.risk_score >= 40
        vpn_or_tor = customer.risk_score >= 60
        failed_auth = 4 if customer.risk_score >= 50 else 0
        avg_amt = max(3000.0, payload.amount * 0.4 if is_new_receiver else payload.amount * 0.9)

        # Run sub-5ms local ML inference
        ml_result = ml_engine.predict_risk(
            amount=payload.amount,
            avg_amount=avg_amt,
            timestamp=datetime.datetime.utcnow(),
            velocity_kmh=velocity_kmh,
            is_unfamiliar_device=unfamiliar_dev,
            is_vpn_or_tor=vpn_or_tor,
            failed_auth_count=failed_auth,
            is_unverified_receiver=is_new_receiver,
            time_delta_seconds=30.0 if unfamiliar_dev else 3600.0,
            behavioral_index=float(customer.risk_score)
        )
        added_risk = ml_result["ml_risk_score"]

    # Add transaction check event to security logs
    tx_log = Log(
        customer_id=customer.id,
        event_type="Transaction ML Risk Evaluated",
        icon="wallet",
        severity="High" if added_risk >= 50 else ("Medium" if added_risk >= 25 else "Low"),
        description=f"ML Engine evaluated transaction of ₹{payload.amount:,.2f} to {payload.receiver} ({payload.bank}). Score: {added_risk}% ({ml_result['risk_level'] if ml_result else 'N/A'})",
        risk_added=added_risk,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(tx_log)
    
    # Update customer cumulative risk score
    customer.risk_score = min(100, max(customer.risk_score, added_risk))
    db.commit()

    # Verify if risk exceeds threshold
    if customer.risk_score >= threshold and ai_enabled:
        # Block transaction
        tx = Transaction(
            customer_id=customer.id,
            amount=payload.amount,
            receiver=payload.receiver,
            bank=payload.bank,
            upi=payload.upi,
            purpose=payload.purpose,
            status="Blocked",
            risk_score=customer.risk_score,
            blocked_reason="High Risk Session - Suspected Account Takeover",
            money_saved=payload.amount,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(tx)
        
        # Execute autonomous responses if enabled
        actions = ["Blocked Outgoing UPI Transaction", "Out-of-band Customer SMS Alert Dispatched"]
        if auto_protect:
            customer.account_status = "Temporarily Frozen"
            customer.security_status = "Under Threat"
            actions.extend([
                f"Suspended Customer Account {customer.account_number}",
                "Terminated Rogue Browser/Tor Session",
                f"Isolated IP Address {customer.current_ip}",
                "SOC Incident Log Automatically Created"
            ])
        else:
            actions.append("Flagged High Risk - Awaiting Analyst Approval")

        # Get last 5 telemetry logs to correlate
        recent_logs = db.query(Log).filter(Log.customer_id == customer.id).order_by(Log.timestamp.desc()).limit(5).all()
        correlated_events = []
        for rl in recent_logs:
            correlated_events.append({
                "time": rl.timestamp.strftime("%H:%M:%S"),
                "event": rl.event_type,
                "risk": rl.risk_added,
                "description": rl.description
            })

        tx_details = {
            "amount": payload.amount,
            "receiver": payload.receiver,
            "bank": payload.bank,
            "upi": payload.upi,
            "purpose": payload.purpose
        }

        # Generate incident report entry in database
        incident = Incident(
            customer_id=customer.id,
            threat_type="Account Takeover Attempt",
            risk_score=customer.risk_score,
            confidence_score=random.randint(85, 99),
            events_correlated_json=json.dumps(correlated_events),
            transaction_details_json=json.dumps(tx_details),
            actions_taken_json=json.dumps(actions),
            money_protected=payload.amount,
            analyst_recommendation="Contact customer immediately. Require multi-factor biometric check and hardware token registration. Lock current IP on edge firewall.",
            status="Blocked" if auto_protect else "Under Investigation",
            created_at=datetime.datetime.utcnow()
        )
        db.add(incident)
        db.commit()
        db.refresh(tx)
        return tx
    else:
        # Allow transaction
        customer.balance = max(0.0, customer.balance - payload.amount)
        customer.today_spending += payload.amount
        
        tx = Transaction(
            customer_id=customer.id,
            amount=payload.amount,
            receiver=payload.receiver,
            bank=payload.bank,
            upi=payload.upi,
            purpose=payload.purpose,
            status="Allowed",
            risk_score=customer.risk_score,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx

# --- SIMULATION ENDPOINTS ---

@app.post("/api/simulation/trigger", response_model=IncidentSchema)
def trigger_attack_simulation(payload: SimulationRequest, db: Session = Depends(get_db)):
    try:
        incident = trigger_simulation(payload.attack_type, db)
        if not incident:
            # If the attack did not trigger an incident (e.g. VPN Login didn't exceed 80), return placeholder incident
            # Find the customer
            customer = db.query(Customer).filter(Customer.id == 1).first()
            incident = Incident(
                id=999,
                customer_id=customer.id if customer else 1,
                threat_type=payload.attack_type,
                risk_score=customer.risk_score if customer else 25,
                confidence_score=90,
                status="Under Investigation",
                created_at=datetime.datetime.utcnow(),
                updated_at=datetime.datetime.utcnow()
            )
        return incident
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulation/reset")
def reset_simulation(db: Session = Depends(get_db)):
    # Clear tables and re-seed
    db.query(Incident).delete()
    db.query(Transaction).delete()
    db.query(Log).delete()
    db.query(Customer).delete()
    db.query(User).delete()
    db.query(SystemSettings).delete()
    db.commit()
    seed_db()
    return {"message": "Simulation environment successfully reset to baseline."}

# --- GLOBAL TELEMETRY MONITOR ---

@app.get("/api/logs", response_model=List[LogSchema])
def get_all_logs(limit: int = 100, db: Session = Depends(get_db)):
    # Get all logs for real-time dashboard monitoring
    return db.query(Log).order_by(Log.timestamp.desc()).limit(limit).all()

# --- INCIDENT ENDPOINTS ---

@app.get("/api/incidents", response_model=List[IncidentSchema])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()

@app.get("/api/incidents/{incident_id}", response_model=IncidentSchema)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@app.put("/api/incidents/{incident_id}/status", response_model=IncidentSchema)
def update_incident_status(incident_id: int, status_update: dict, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident.status = status_update.get("status", incident.status)
    
    # If resolving, unfreeze customer account
    if incident.status == "Resolved":
        customer = db.query(Customer).filter(Customer.id == incident.customer_id).first()
        if customer:
            customer.account_status = "Active"
            customer.security_status = "Secured"
            customer.risk_score = 10
            
    db.commit()
    db.refresh(incident)
    return incident

# --- AI INVESTIGATION & COGNITIVE ANALYSIS ---

@app.get("/api/incidents/{incident_id}/ai-investigation")
def get_ai_investigation(incident_id: int, db: Session = Depends(get_db)):
    analysis = analyze_incident_with_ai(incident_id, db)
    return analysis

# --- PDF INCIDENT REPORT EXPORT ---

@app.get("/api/reports/{incident_id}", response_model=ReportSchema)
def get_incident_report(incident_id: int, db: Session = Depends(get_db)):
    try:
        report = generate_incident_report(incident_id, db)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- MACHINE LEARNING RISK ENGINE ENDPOINTS ---

@app.post("/api/ml/predict")
def ml_predict_risk(payload: dict):
    """Real-time ML risk inference endpoint for raw security telemetry inputs."""
    amount = float(payload.get("amount", 1000.0))
    avg_amount = float(payload.get("avg_amount", 3000.0))
    velocity_kmh = float(payload.get("velocity_kmh", 0.0))
    is_unfamiliar_device = bool(payload.get("is_unfamiliar_device", False))
    is_vpn_or_tor = bool(payload.get("is_vpn_or_tor", False))
    failed_auth_count = int(payload.get("failed_auth_count", 0))
    is_unverified_receiver = bool(payload.get("is_unverified_receiver", False))
    time_delta_seconds = float(payload.get("time_delta_seconds", 3600.0))
    behavioral_index = float(payload.get("behavioral_index", 10.0))

    prediction = ml_engine.predict_risk(
        amount=amount,
        avg_amount=avg_amount,
        timestamp=datetime.datetime.utcnow(),
        velocity_kmh=velocity_kmh,
        is_unfamiliar_device=is_unfamiliar_device,
        is_vpn_or_tor=is_vpn_or_tor,
        failed_auth_count=failed_auth_count,
        is_unverified_receiver=is_unverified_receiver,
        time_delta_seconds=time_delta_seconds,
        behavioral_index=behavioral_index
    )
    return prediction

@app.get("/api/ml/model-info")
def get_ml_model_info():
    """Retrieve ML model metrics, version, feature list, and performance evaluation."""
    return ml_engine.get_model_info()

@app.post("/api/ml/retrain")
def retrain_ml_model():
    """Trigger on-demand training of the SentinelAI local ML ensemble model."""
    ml_engine.train_model()
    return {
        "message": "SentinelAI Local ML Ensemble Model retrained successfully.",
        "model_info": ml_engine.get_model_info()
    }

# --- MULTI-AI AGENT SECURITY INTELLIGENCE ENDPOINTS ---

@app.get("/api/agents")
def get_ai_agents():
    """List all 6 independent AI Security Agents and their operational specifications."""
    return [
        {
            "id": 1,
            "agent_name": "Threat Analyst",
            "role": "Cyber Telemetry & Authentication Forensics",
            "purpose": "Analyzes login logs, auth events, device fingerprints, browsers, IPs, and locations.",
            "detects": ["Brute Force", "Credential Stuffing", "Impossible Travel", "New Device Login", "Suspicious IP", "Repeated Login Failure"]
        },
        {
            "id": 2,
            "agent_name": "Fraud Analyst",
            "role": "Transactional Pattern & Money Mule Forensics",
            "purpose": "Analyzes transaction history, transfer amounts, beneficiaries, frequency, and spending patterns.",
            "detects": ["UPI Fraud", "Money Mule Activity", "Rapid Transactions", "High Value Transfers", "Account Takeover"]
        },
        {
            "id": 3,
            "agent_name": "Behaviour Analysis Agent",
            "role": "Circadian & Device Posture Baseline Correlation",
            "purpose": "Compares current user behavior against historical 90-day baseline models.",
            "detects": ["Circadian Time Shift", "Device Posture Drift", "Location Delta", "Abnormal Navigation Flow"]
        },
        {
            "id": 4,
            "agent_name": "Digital Forensics Agent",
            "role": "Telemetry Correlation & Timeline Reconstruction",
            "purpose": "Correlates authentication, transaction, and audit logs to construct incident timelines and harvest IOCs.",
            "detects": ["Attack Path Mapping", "IOC Collection", "Affected Services Identification", "Compromised Assets List"]
        },
        {
            "id": 5,
            "agent_name": "Incident Response Agent",
            "role": "Playbook Orchestration & Mandatory Authorization Gate",
            "purpose": "Synthesizes multi-agent findings, calculates overall risk (0-40, 40-80, 80-100), and generates mitigation checklists requiring bank approval.",
            "detects": ["Mitigation Checklist", "Mandatory Bank Approval Gate", "Severity Tier Assignment"]
        },
        {
            "id": 6,
            "agent_name": "Executive Report Agent",
            "role": "Executive Dossier & Compliance Report Generation",
            "purpose": "Generates executive summaries, MITRE ATT&CK matrix mappings, business impact assessments, and downloadable PDF reports.",
            "detects": ["MITRE ATT&CK Matrix", "Business Impact Score", "Executive Dossier PDF"]
        }
    ]

@app.post("/api/agents/run")
def run_agent_investigation(payload: dict, db: Session = Depends(get_db)):
    """Triggers the Agent Orchestrator to execute all 6 AI Security Agents sequentially."""
    customer_id = int(payload.get("customer_id", 1))
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Target customer not found")

    # Serialize customer data
    cust_data = {
        "id": customer.id,
        "name": customer.name,
        "account_number": customer.account_number,
        "balance": customer.balance,
        "today_spending": customer.today_spending,
        "current_device": customer.current_device,
        "current_browser": customer.current_browser,
        "current_location": customer.current_location,
        "current_ip": customer.current_ip,
        "risk_score": customer.risk_score,
        "account_status": customer.account_status,
        "security_status": customer.security_status
    }

    # Fetch logs & transactions
    raw_logs = db.query(Log).filter(Log.customer_id == customer.id).order_by(Log.timestamp.desc()).limit(20).all()
    logs_data = [{"event_type": l.event_type, "severity": l.severity, "description": l.description, "risk_added": l.risk_added} for l in raw_logs]

    raw_txs = db.query(Transaction).filter(Transaction.customer_id == customer.id).order_by(Transaction.timestamp.desc()).limit(20).all()
    txs_data = [{"amount": t.amount, "receiver": t.receiver, "status": t.status, "risk_score": t.risk_score} for t in raw_txs]

    # Run orchestrator
    result = orchestrator.run_investigation(cust_data, logs_data, txs_data)

    # Save investigation session to DB
    inv_entry = InvestigationHistory(
        investigation_id=result["investigation_id"],
        customer_id=customer.id,
        analyst_name="Chief SOC Analyst",
        overall_risk=result["final_ai_decision"]["overall_risk_percentage"],
        threat_type=result["final_ai_decision"]["threat_category"],
        status=result["final_ai_decision"]["investigation_status"],
        full_payload_json=json.dumps(result)
    )
    db.add(inv_entry)
    db.commit()

    return result

@app.get("/api/agents/status")
def get_agents_status():
    """Returns active operational status of the Multi-AI Agent Framework."""
    return {
        "orchestrator_status": "ACTIVE",
        "agent_count": 6,
        "sequential_pipeline": "Threat Analyst -> Fraud Analyst -> Behaviour Analysis -> Digital Forensics -> Incident Response -> Executive Report",
        "execution_engine": "FastAPI Async Multi-Agent Core",
        "average_latency_ms": 115.4
    }

@app.get("/api/agents/history")
def get_investigation_history(limit: int = 10, db: Session = Depends(get_db)):
    """Retrieves recent SOC multi-agent investigation sessions."""
    entries = db.query(InvestigationHistory).order_by(InvestigationHistory.created_at.desc()).limit(limit).all()
    history = []
    for e in entries:
        cust = db.query(Customer).filter(Customer.id == e.customer_id).first()
        history.append({
            "id": e.id,
            "investigation_id": e.investigation_id,
            "customer_name": cust.name if cust else f"Customer #{e.customer_id}",
            "overall_risk": e.overall_risk,
            "threat_type": e.threat_type,
            "status": e.status,
            "timestamp": e.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return history

@app.post("/api/agents/analyze")
def analyze_single_agent(payload: dict, db: Session = Depends(get_db)):
    """Runs a single targeted AI Agent independently."""
    agent_id = int(payload.get("agent_id", 1))
    customer_id = int(payload.get("customer_id", 1))
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    cust_data = {"id": customer.id, "name": customer.name, "risk_score": customer.risk_score, "current_ip": customer.current_ip, "current_device": customer.current_device}
    raw_logs = db.query(Log).filter(Log.customer_id == customer.id).limit(10).all()
    logs_data = [{"event_type": l.event_type, "description": l.description} for l in raw_logs]
    raw_txs = db.query(Transaction).filter(Transaction.customer_id == customer.id).limit(10).all()
    txs_data = [{"amount": t.amount, "receiver": t.receiver, "status": t.status} for t in raw_txs]

    if agent_id == 1:
        return orchestrator.threat_agent.analyze(cust_data, logs_data)
    elif agent_id == 2:
        return orchestrator.fraud_agent.analyze(cust_data, txs_data)
    elif agent_id == 3:
        return orchestrator.behaviour_agent.analyze(cust_data, logs_data)
    elif agent_id == 4:
        return orchestrator.forensics_agent.analyze(cust_data, logs_data, txs_data)
    elif agent_id == 5:
        agent_outputs = {
            "threat_analyst": orchestrator.threat_agent.analyze(cust_data, logs_data),
            "fraud_analyst": orchestrator.fraud_agent.analyze(cust_data, txs_data),
            "behaviour_analyst": orchestrator.behaviour_agent.analyze(cust_data, logs_data),
            "forensics_analyst": orchestrator.forensics_agent.analyze(cust_data, logs_data, txs_data)
        }
        return orchestrator.response_agent.analyze(agent_outputs, cust_data)
    elif agent_id == 6:
        agent_outputs = {
            "threat_analyst": orchestrator.threat_agent.analyze(cust_data, logs_data),
            "fraud_analyst": orchestrator.fraud_agent.analyze(cust_data, txs_data),
            "behaviour_analyst": orchestrator.behaviour_agent.analyze(cust_data, logs_data),
            "forensics_analyst": orchestrator.forensics_agent.analyze(cust_data, logs_data, txs_data)
        }
        agent_outputs["response_analyst"] = orchestrator.response_agent.analyze(agent_outputs, cust_data)
        return orchestrator.report_agent.analyze(agent_outputs, cust_data)
    else:
        raise HTTPException(status_code=400, detail="Invalid agent_id")

@app.post("/api/agents/report")
def generate_executive_pdf_report(payload: dict, db: Session = Depends(get_db)):
    """Generates structured executive report data for PDF download."""
    customer_id = int(payload.get("customer_id", 1))
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    cust_data = {"id": customer.id if customer else 1, "name": customer.name if customer else "John Doe", "risk_score": customer.risk_score if customer else 85}
    
    agent_outputs = {
        "threat_analyst": orchestrator.threat_agent.analyze(cust_data, []),
        "fraud_analyst": orchestrator.fraud_agent.analyze(cust_data, []),
        "behaviour_analyst": orchestrator.behaviour_agent.analyze(cust_data, []),
        "forensics_analyst": orchestrator.forensics_agent.analyze(cust_data, [], [])
    }
    agent_outputs["response_analyst"] = orchestrator.response_agent.analyze(agent_outputs, cust_data)
    report = orchestrator.report_agent.analyze(agent_outputs, cust_data)
    return report


# --- SYSTEM SETTINGS ---

@app.get("/api/settings", response_model=SystemSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    if not settings:
        settings = SystemSettings(risk_threshold=80, enable_ai=True, enable_auto_protection=True, enable_learning_mode=True)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.put("/api/settings", response_model=SystemSettingsSchema)
def update_settings(payload: SystemSettingsSchema, db: Session = Depends(get_db)):
    settings = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    if not settings:
        settings = SystemSettings()
        db.add(settings)
    
    settings.risk_threshold = payload.risk_threshold
    settings.enable_ai = payload.enable_ai
    settings.enable_auto_protection = payload.enable_auto_protection
    settings.enable_learning_mode = payload.enable_learning_mode
    
    db.commit()
    db.refresh(settings)
    return settings

# --- DASHBOARD STATISTICS ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Aggregate statistics
    total_alerts = db.query(Log).count()
    critical_threats = db.query(Customer).filter(Customer.risk_score >= 80).count()
    active_incidents = db.query(Incident).filter(Incident.status != "Resolved").count()
    money_saved_total = sum(x.money_protected for x in db.query(Incident).all())
    
    # Fetch recent telemetry logs
    recent_logs = db.query(Log).order_by(Log.timestamp.desc()).limit(10).all()
    recent_logs_serialized = []
    for l in recent_logs:
        cust = db.query(Customer).filter(Customer.id == l.customer_id).first()
        recent_logs_serialized.append({
            "id": l.id,
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "event_type": l.event_type,
            "icon": l.icon,
            "severity": l.severity,
            "description": l.description,
            "risk_added": l.risk_added,
            "customer_name": cust.name if cust else "System"
        })

    # Blocked vs Allowed Transactions
    blocked_count = db.query(Transaction).filter(Transaction.status == "Blocked").count()
    allowed_count = db.query(Transaction).filter(Transaction.status == "Allowed").count()
    
    # Pie Chart Categories
    phishing_count = db.query(Incident).filter(Incident.threat_type == "Phishing Attack").count()
    credential_count = db.query(Incident).filter(Incident.threat_type == "Credential Theft").count()
    hijack_count = db.query(Incident).filter(Incident.threat_type == "Session Hijack").count()
    ato_count = db.query(Incident).filter(Incident.threat_type == "Account Takeover").count()
    malware_count = db.query(Incident).filter(Incident.threat_type == "Malware Infection").count()
    insider_count = db.query(Incident).filter(Incident.threat_type == "Insider Threat").count()

    # Risk trend line (Mock historical chart values)
    risk_trend = [
        {"time": "09:00", "risk": 15},
        {"time": "09:05", "risk": 20},
        {"time": "09:10", "risk": 25},
        {"time": "09:15", "risk": 35},
        {"time": "09:20", "risk": 65},
        {"time": "09:25", "risk": 85},
        {"time": "09:30", "risk": 85}
    ]

    return {
        "metrics": {
            "total_alerts": total_alerts,
            "critical_threats": critical_threats,
            "active_incidents": active_incidents,
            "money_saved": float(money_saved_total)
        },
        "recent_logs": recent_logs_serialized,
        "charts": {
            "transaction_status": [
                {"name": "Allowed", "value": allowed_count},
                {"name": "Blocked", "value": blocked_count}
            ],
            "threat_categories": [
                {"name": "Account Takeover", "value": ato_count + 1}, # add 1 base value for seeding
                {"name": "Session Hijack", "value": hijack_count},
                {"name": "Phishing", "value": phishing_count},
                {"name": "Credential Theft", "value": credential_count},
                {"name": "Malware", "value": malware_count},
                {"name": "Insider Threat", "value": insider_count}
            ],
            "risk_trend": risk_trend
        }
    }
