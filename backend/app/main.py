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

    # Evaluate dynamic transactional behavior risk additions
    added_risk = 0
    if ai_enabled:
        # Check amount threshold
        if payload.amount > 50000:
            added_risk += 20
        # Check if beneficiary is new (does not exist in allowed transactions)
        exists = db.query(Transaction).filter(
            Transaction.customer_id == customer.id,
            Transaction.receiver == payload.receiver,
            Transaction.status == "Allowed"
        ).first()
        if not exists:
            added_risk += 25
        # Standard transaction risk checks
        added_risk += 10

    # Add transaction check event to security logs
    tx_log = Log(
        customer_id=customer.id,
        event_type="Transaction Initiated",
        icon="wallet",
        severity="Medium" if added_risk >= 30 else "Low",
        description=f"Transaction of ₹{payload.amount:,.2f} initiated to {payload.receiver} ({payload.bank})",
        risk_added=added_risk,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(tx_log)
    
    # Update customer cumulative risk score
    customer.risk_score = min(100, customer.risk_score + added_risk)
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
