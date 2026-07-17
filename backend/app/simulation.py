from sqlalchemy.orm import Session
from .models import Customer, Log, Incident, SystemSettings, Transaction
import datetime
import json
import random

# Mapping of attack types to their telemetry events
ATTACK_TEMPLATES = {
    "Phishing Attack": [
        ("Suspicious Email Link Clicked", "mail", "Medium", "User clicked a link in a suspicious phishing email offering reward points.", 20),
        ("Unfamiliar IP Detected", "wifi", "Low", "Session opened from unrecognized IP range 185.220.101.44", 15),
        ("VPN Detected", "globe", "Medium", "Connection routed through NordVPN proxy servers.", 25)
    ],
    "Credential Theft": [
        ("Failed Login Attempt", "lock", "Low", "First authentication attempt failed: Bad password", 10),
        ("Login Successful", "shield", "Low", "Authentication succeeded on third attempt from Windows 11 PC", 0),
        ("Password Changed", "key", "High", "Account password updated via web self-service portal", 15),
        ("Multiple OTP Failures", "lock", "Medium", "OTP authentication failed twice during profile update", 15)
    ],
    "Session Hijack": [
        ("Unfamiliar Browser", "smartphone", "Medium", "Session cookie injected into a new Chrome 124 browser profile", 20),
        ("VPN Detected", "globe", "Medium", "Connection routed through ExpressVPN Munich servers", 25),
        ("Impossible Travel", "plane", "High", "Access requested from Berlin, Germany within 5 minutes of Chennai, India login", 30),
        ("TOR Detected", "shield-alert", "High", "Connection routing detected via TOR Exit Node", 35)
    ],
    "VPN Login": [
        ("VPN Detected", "globe", "Medium", "Connection established using IP 46.112.83.204 (commercial VPN range)", 25),
        ("Login Successful", "shield", "Low", "Successful login from VPN endpoint", 0),
        ("Device Check", "smartphone", "Low", "Device posture check: Normal iPhone OS version", 0)
    ],
    "Malware Infection": [
        ("Rooted Device", "alert-triangle", "High", "Device integrity check failed: Root access/Jailbreak detected", 30),
        ("Malware Detected", "bug", "Critical", "Banking Trojan signature (Anubis/Pegasus clone) detected in memory background processes", 40)
    ],
    "Account Takeover": [
        ("New Device Detected", "smartphone", "Medium", "Unfamiliar Samsung S23 logged into account", 20),
        ("VPN Detected", "globe", "Medium", "Connection routed through IP 185.220.101.5 (Proxy)", 25),
        ("Impossible Travel", "plane", "High", "Login session jumped across continents in 10 minutes", 30),
        ("Rooted Device", "alert-triangle", "High", "Samsung S23 running customized jailbroken OS environment", 30),
        ("New Beneficiary Added", "user-plus", "Medium", "UPI Payee 'Hacker Wallet' registered successfully", 20)
    ],
    "Insider Threat": [
        ("Unusual Login Hours", "clock", "Medium", "Account logged into at 03:14 AM (Normal login: 09:00 AM - 07:00 PM)", 15),
        ("Rapid Transfers", "activity", "High", "Initiated 3 high-value transactions within 60 seconds", 20),
        ("Failed OTP Attempt", "lock", "Medium", "OTP authentication expired during beneficiary validation", 15)
    ]
}

def trigger_simulation(attack_type: str, db: Session) -> Incident:
    # Get a customer to target (we'll target Sarah Jenkins [id=1] or another active user)
    # If customer 6 is already frozen, target Rajesh Patel (id=2) or Sarah Jenkins (id=1)
    customer = db.query(Customer).filter(Customer.id == 1).first()
    if not customer:
        customer = db.query(Customer).first()
    
    if not customer:
        raise ValueError("No customers found to target in simulation")

    # Reset customer status for a fresh attack run (except John Doe)
    if customer.id == 1:
        customer.account_status = "Active"
        customer.security_status = "Secured"
        customer.risk_score = 10
        db.commit()

    # Load attack logs templates
    events = ATTACK_TEMPLATES.get(attack_type, [])
    if not events:
        raise ValueError(f"Unknown attack type: {attack_type}")

    now = datetime.datetime.utcnow()
    logs_added = []
    total_risk_added = 0

    # 1. Create Telemetry Logs
    for idx, (event_name, icon, severity, desc, risk_add) in enumerate(events):
        log = Log(
            customer_id=customer.id,
            event_type=event_name,
            icon=icon,
            severity=severity,
            description=desc,
            risk_added=risk_add,
            timestamp=now - datetime.timedelta(seconds=(len(events) - idx) * 10)
        )
        db.add(log)
        logs_added.append(log)
        total_risk_added += risk_add

    # Apply risk to customer
    customer.risk_score = min(100, customer.risk_score + total_risk_added)
    
    # 2. Check settings and auto protect
    settings = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    threshold = settings.risk_threshold if settings else 80
    auto_protect = settings.enable_auto_protection if settings else True

    actions_taken = []
    incident = None

    if customer.risk_score >= threshold:
        customer.security_status = "Under Threat"
        if auto_protect:
            customer.account_status = "Temporarily Frozen"
            actions_taken = [
                "Blocked Outgoing Transactions",
                f"Temporarily Suspended Account {customer.account_number}",
                "Terminated Attacker Session",
                f"Isolated IP Address {customer.current_ip}",
                "Dispatched Biometric Reset Notification to Registered Phone"
            ]
        else:
            actions_taken = ["Flagged High Risk Session - Awaiting Analyst Approval"]
            
        # Create an Incident Report
        # Simulate a transaction that was blocked
        blocked_tx_amount = random.randint(15000, 95000)
        tx_details = {
            "amount": float(blocked_tx_amount),
            "receiver": "Unknown Offshore Wallet",
            "bank": "Cayman Islands Security Trust",
            "upi": f"fraudster_{random.randint(100,999)}@upi",
            "purpose": "Emergency Crypto Exchange"
        }
        
        # Insert Blocked Transaction in DB
        blocked_tx = Transaction(
            customer_id=customer.id,
            amount=tx_details["amount"],
            receiver=tx_details["receiver"],
            bank=tx_details["bank"],
            upi=tx_details["upi"],
            purpose=tx_details["purpose"],
            status="Blocked",
            risk_score=customer.risk_score,
            blocked_reason="High Risk Session - Suspected Account Takeover",
            money_saved=tx_details["amount"],
            timestamp=now
        )
        db.add(blocked_tx)
        db.commit()

        # Build correlated events list for Incident
        correlated_events = []
        for l in logs_added:
            correlated_events.append({
                "time": l.timestamp.strftime("%H:%M:%S"),
                "event": l.event_type,
                "risk": l.risk_added,
                "description": l.description
            })

        # Create Incident Report
        incident = Incident(
            customer_id=customer.id,
            threat_type=attack_type,
            risk_score=customer.risk_score,
            confidence_score=random.randint(85, 99),
            events_correlated_json=json.dumps(correlated_events),
            transaction_details_json=json.dumps(tx_details),
            actions_taken_json=json.dumps(actions_taken),
            money_protected=tx_details["amount"],
            analyst_recommendation=f"Review active device fingerprints. Verify customer identity via secure voice prompt. Reset Multi-Factor Authentication credentials for {customer.name}.",
            status="Blocked" if auto_protect else "Under Investigation",
            created_at=now
        )
        db.add(incident)
        
    db.commit()
    if incident:
        db.refresh(incident)
    return incident
