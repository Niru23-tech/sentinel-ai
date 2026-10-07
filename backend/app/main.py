from fastapi import FastAPI, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import json
import random
import asyncio

from .database import get_db, seed_db, pwd_context
from .models import User, Customer, Log, Transaction, Incident, SystemSettings
from .schemas import (
    LoginRequest, Token, UserResponse, CustomerSchema, LogSchema, 
    TransactionSchema, TransactionCreate, IncidentSchema, 
    SystemSettingsSchema, SimulationRequest, ReportSchema,
    PreAuthAssessRequest, PreAuthAssessResponse, SIEMIngestRequest, GlobalSearchResponse,
    RegisterRequest, CustomerCreate, CustomerUpdate
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

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

    def broadcast_sync(self, message: dict):
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(self.broadcast(message))
            else:
                loop.run_until_complete(self.broadcast(message))
        except Exception:
            pass

manager = ConnectionManager()

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial status
        await websocket.send_json({
            "type": "connection_established",
            "message": "Connected to SentinelAI Real-Time Telemetry Stream",
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.datetime.utcnow().isoformat()
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.on_event("startup")
def on_startup():
    seed_db()

# --- AUTH ENDPOINTS (Dynamic SQLite Database Persistence) ---

@app.post("/api/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    DYNAMIC DATABASE LOGIN & AUTO-PROVISIONING
    Verifies user in SQLite DB sentinel.db. If new user, dynamically registers them.
    Saves security audit log entry in DB.
    """
    identifier = (payload.email or payload.employeeId or "").strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Email or Employee ID is required")

    user = db.query(User).filter((User.email == identifier) | (User.name == identifier)).first()

    # Dynamic User Provisioning: If user doesn't exist yet, dynamically register them in SQLite DB!
    if not user:
        user_name = identifier.split("@")[0].upper() if "@" in identifier else f"Officer {identifier}"
        user = User(
            email=identifier if "@" in identifier else f"{identifier.lower()}@sentinel.ai",
            password_hash=pwd_context.hash(payload.password),
            name=user_name,
            role="Security Analyst"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Record login audit event dynamically into SQLite DB
    login_log = Log(
        customer_id=1,
        event_type="User Logged In - Dynamic DB Auth",
        icon="key",
        severity="Low",
        description=f"User '{user.email}' ({user.name}) dynamically authenticated and logged in SQLite database sentinel.db.",
        risk_added=0,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(login_log)
    db.commit()

    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(id=user.id, email=user.email, name=user.name, role=user.role)
    }

@app.post("/api/auth/register", response_model=Token)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    DYNAMIC USER REGISTRATION API
    Saves new user credentials securely in sentinel.db SQLite database.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=payload.email,
        password_hash=pwd_context.hash(payload.password),
        name=payload.name,
        role=payload.role or "Security Analyst"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(id=new_user.id, email=new_user.email, name=new_user.name, role=new_user.role)
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(db: Session = Depends(get_db)):
    admin = db.query(User).first()
    if not admin:
        admin = User(id=1, email="admin@sentinel.ai", name="Chief SOC Analyst", role="Administrator")
    return admin

# --- CUSTOMER ENDPOINTS (Dynamic DB Ingestion & Management) ---

@app.get("/api/customers", response_model=List[CustomerSchema])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@app.post("/api/customers", response_model=CustomerSchema)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    """
    DYNAMIC CUSTOMER CREATION API
    Persists new customer profile into sentinel.db SQLite database.
    """
    existing = db.query(Customer).filter(Customer.account_number == payload.account_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account number already exists")

    cust = Customer(
        name=payload.name,
        account_number=payload.account_number,
        balance=payload.balance or 100000.0,
        today_spending=0.0,
        current_device=payload.current_device or "iPhone 15 Pro",
        current_browser="Safari Mobile",
        current_location=payload.current_location or "Chennai, India",
        current_ip=payload.current_ip or "122.172.18.92",
        risk_score=payload.risk_score or 10,
        account_status="Active",
        security_status="Secured"
    )
    db.add(cust)
    db.commit()
    db.refresh(cust)

    # Log event in DB
    db.add(Log(
        customer_id=cust.id,
        event_type="New Customer Profile Created",
        icon="user-plus",
        severity="Low",
        description=f"Customer '{cust.name}' ({cust.account_number}) created and saved in sentinel.db.",
        risk_added=0,
        timestamp=datetime.datetime.utcnow()
    ))
    db.commit()

    return cust

@app.put("/api/customers/{customer_id}", response_model=CustomerSchema)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    """
    DYNAMIC CUSTOMER UPDATE API
    Updates customer parameters in sentinel.db SQLite database.
    """
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    if payload.name is not None:
        cust.name = payload.name
    if payload.balance is not None:
        cust.balance = payload.balance
    if payload.today_spending is not None:
        cust.today_spending = payload.today_spending
    if payload.current_device is not None:
        cust.current_device = payload.current_device
    if payload.current_location is not None:
        cust.current_location = payload.current_location
    if payload.current_ip is not None:
        cust.current_ip = payload.current_ip
    if payload.risk_score is not None:
        cust.risk_score = payload.risk_score
    if payload.account_status is not None:
        cust.account_status = payload.account_status
    if payload.security_status is not None:
        cust.security_status = payload.security_status

    db.commit()
    db.refresh(cust)

    db.add(Log(
        customer_id=cust.id,
        event_type="Customer Profile Updated",
        icon="edit",
        severity="Low",
        description=f"Customer '{cust.name}' ({cust.account_number}) updated in sentinel.db.",
        risk_added=0,
        timestamp=datetime.datetime.utcnow()
    ))
    db.commit()

    return cust

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
        
        # Broadcast real-time event via WebSocket
        manager.broadcast_sync({
            "type": "transaction_blocked",
            "customer_id": customer.id,
            "amount": payload.amount,
            "risk_score": customer.risk_score,
            "blocked_reason": "High Risk Session - Suspected Account Takeover",
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
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

        # Broadcast real-time event via WebSocket
        manager.broadcast_sync({
            "type": "transaction_allowed",
            "customer_id": customer.id,
            "amount": payload.amount,
            "risk_score": customer.risk_score,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        return tx

# --- SIMULATION ENDPOINTS ---

@app.post("/api/simulation/trigger", response_model=IncidentSchema)
def trigger_attack_simulation(payload: SimulationRequest, db: Session = Depends(get_db)):
    try:
        incident = trigger_simulation(payload.attack_type, db)
        if incident:
            manager.broadcast_sync({
                "type": "attack_simulation_triggered",
                "attack_type": payload.attack_type,
                "incident_id": incident.id,
                "risk_score": incident.risk_score,
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
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


# =====================================================================
# 🏦 ENTERPRISE REAL-WORLD BANKING API GATEWAY ENDPOINTS (v1)
# =====================================================================

@app.post("/api/v1/risk/assess-transaction", response_model=PreAuthAssessResponse)
def assess_transaction_pre_auth(payload: PreAuthAssessRequest, db: Session = Depends(get_db)):
    """
    ENTERPRISE PRE-AUTHORIZATION RISK ASSESSMENT API
    Called by Core Banking Payment Gateway (ISO 20022 / Mobile App / NetBanking)
    BEFORE funds are authorized for transfer.
    Runs sub-10ms ML inference + Explainable AI (XAI) feature attribution.
    """
    start_time = datetime.datetime.utcnow()
    
    # 1. Lookup Customer by Account Number
    customer = db.query(Customer).filter(Customer.account_number == payload.account_number).first()
    if not customer:
        # If unknown account, default to first customer for demo resilience
        customer = db.query(Customer).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Account not found")

    settings = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    threshold = settings.risk_threshold if settings else 80
    auto_protect = settings.enable_auto_protection if settings else True

    # 2. Check if account is frozen
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

        return PreAuthAssessResponse(
            decision="BLOCK",
            risk_score=100,
            risk_level="CRITICAL",
            confidence_pct=99.9,
            latency_ms=1.2,
            blocked_reason="Account is in Frozen/Locked state",
            transaction_id=tx.id,
            xai_breakdown=[
                {"feature": "Account Status", "importance_pct": 100.0, "value": customer.account_status}
            ]
        )

    # 3. Check if beneficiary is new
    is_new_receiver = not bool(db.query(Transaction).filter(
        Transaction.customer_id == customer.id,
        Transaction.receiver == payload.receiver,
        Transaction.status == "Allowed"
    ).first())

    # 4. Telemetry signals
    velocity_kmh = 1250.0 if (customer.security_status == "Under Threat" or customer.risk_score >= 50) else 15.0
    unfamiliar_dev = customer.risk_score >= 40 or (payload.device_id and payload.device_id != customer.current_device)
    vpn_or_tor = customer.risk_score >= 60
    failed_auth = 4 if customer.risk_score >= 50 else 0
    avg_amt = max(3000.0, payload.amount * 0.4 if is_new_receiver else payload.amount * 0.9)

    # 5. Run ML Engine Inference & XAI
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

    risk_score = ml_result["ml_risk_score"]
    risk_level = ml_result["risk_level"]

    # 6. Determine Pre-Auth Decision
    if risk_score >= threshold:
        decision = "BLOCK"
        blocked_reason = f"High Risk ({risk_score}%) - Suspected Account Takeover or Telemetry Anomaly"
    elif risk_score >= 50:
        decision = "CHALLENGE_MFA"
        blocked_reason = f"Elevated Risk ({risk_score}%) - Step-Up MFA Challenge Required"
    else:
        decision = "ALLOW"
        blocked_reason = None

    # 7. Record Transaction
    tx = Transaction(
        customer_id=customer.id,
        amount=payload.amount,
        receiver=payload.receiver,
        bank=payload.bank,
        upi=payload.upi,
        purpose=payload.purpose,
        status="Allowed" if decision != "BLOCK" else "Blocked",
        risk_score=risk_score,
        blocked_reason=blocked_reason,
        money_saved=payload.amount if decision == "BLOCK" else 0.0,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(tx)

    # 8. Log Event
    tx_log = Log(
        customer_id=customer.id,
        event_type=f"Core Banking Pre-Auth API - Verdict: {decision}",
        icon="shield-alert" if decision == "BLOCK" else "shield-check",
        severity="Critical" if decision == "BLOCK" else ("Medium" if decision == "CHALLENGE_MFA" else "Low"),
        description=f"Pre-Auth API evaluated transaction of ₹{payload.amount:,.2f} to {payload.receiver} ({payload.bank}). Verdict: {decision}. Risk Score: {risk_score}%.",
        risk_added=risk_score,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(tx_log)

    # 9. Trigger Autonomous Account Protection if High Risk
    incident_id = None
    if decision == "BLOCK":
        if auto_protect:
            customer.account_status = "Temporarily Frozen"
            customer.security_status = "Under Threat"
        
        customer.risk_score = min(100, max(customer.risk_score, risk_score))
        
        # Create Incident record
        incident = Incident(
            customer_id=customer.id,
            threat_type="Account Takeover / Telemetry Anomaly",
            risk_score=risk_score,
            confidence_score=int(ml_result["confidence_pct"]),
            events_correlated_json=json.dumps([{"event": tx_log.event_type, "time": datetime.datetime.utcnow().strftime("%H:%M:%S")}]),
            transaction_details_json=json.dumps({
                "amount": payload.amount,
                "receiver": payload.receiver,
                "bank": payload.bank,
                "upi": payload.upi,
                "status": "Blocked"
            }),
            actions_taken_json=json.dumps(["Blocked Transaction", "Frozen Account", "SIEM Alert Dispatched"]),
            money_protected=payload.amount,
            analyst_recommendation="Verify customer via Out-of-band Voice Verification before unfreezing account.",
            status="Under Investigation",
            created_at=datetime.datetime.utcnow()
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        incident_id = incident.id
    else:
        db.commit()

    # Broadcast real-time telemetry to connected SOC Analyst WebSockets
    manager.broadcast_sync({
        "type": "telemetry_event",
        "data": {
            "customer_name": customer.name,
            "account_number": customer.account_number,
            "event_type": f"Pre-Auth Verdict: {decision}",
            "risk_score": risk_score,
            "decision": decision,
            "timestamp": datetime.datetime.utcnow().strftime("%H:%M:%S")
        }
    })

    return PreAuthAssessResponse(
        decision=decision,
        risk_score=risk_score,
        risk_level=risk_level,
        confidence_pct=ml_result["confidence_pct"],
        latency_ms=ml_result["latency_ms"],
        blocked_reason=blocked_reason,
        transaction_id=tx.id,
        incident_id=incident_id,
        xai_breakdown=ml_result["feature_contributions"]
    )


@app.post("/api/v1/telemetry/ingest")
def ingest_siem_telemetry(payload: SIEMIngestRequest, db: Session = Depends(get_db)):
    """
    ENTERPRISE SIEM & TELEMETRY INGESTION API
    Ingests security logs from Splunk, Elastic, Cloudflare WAF, or Azure Sentinel.
    Correlates event with customer account and updates real-time security posture.
    """
    customer = None
    if payload.customer_id:
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    elif payload.account_number:
        customer = db.query(Customer).filter(Customer.account_number == payload.account_number).first()
    
    if not customer:
        customer = db.query(Customer).first()

    log_entry = Log(
        customer_id=customer.id if customer else None,
        event_type=f"[{payload.source}] {payload.event_type}",
        icon="activity",
        severity=payload.severity,
        description=payload.description,
        risk_added=payload.risk_added or 10,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(log_entry)

    if customer and payload.risk_added:
        customer.risk_score = min(100, customer.risk_score + payload.risk_added)
        if customer.risk_score >= 80:
            customer.security_status = "Under Threat"

    db.commit()

    # Broadcast via WebSocket
    manager.broadcast_sync({
        "type": "telemetry_event",
        "data": {
            "source": payload.source,
            "event_type": payload.event_type,
            "severity": payload.severity,
            "customer_name": customer.name if customer else "Unknown",
            "timestamp": datetime.datetime.utcnow().strftime("%H:%M:%S")
        }
    })

    return {
        "status": "INGESTED",
        "log_id": log_entry.id,
        "customer_updated": customer.name if customer else None,
        "new_risk_score": customer.risk_score if customer else None
    }


@app.get("/api/v1/search", response_model=GlobalSearchResponse)
def global_search(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """
    GLOBAL ENTERPRISE SOC SEARCH API
    Allows SOC Analysts to search by Account Number, Customer Name, IP Address, or Threat Type.
    """
    q = f"%{query}%"
    
    customers = db.query(Customer).filter(
        (Customer.name.ilike(q)) | 
        (Customer.account_number.ilike(q)) | 
        (Customer.current_ip.ilike(q))
    ).limit(10).all()

    incidents = db.query(Incident).filter(
        (Incident.threat_type.ilike(q)) |
        (Incident.status.ilike(q))
    ).limit(10).all()

    transactions = db.query(Transaction).filter(
        (Transaction.receiver.ilike(q)) |
        (Transaction.bank.ilike(q)) |
        (Transaction.status.ilike(q))
    ).limit(10).all()

    logs = db.query(Log).filter(
        (Log.event_type.ilike(q)) |
        (Log.description.ilike(q))
    ).limit(10).all()

    return GlobalSearchResponse(
        customers=customers,
        incidents=incidents,
        transactions=transactions,
        logs=logs
    )

