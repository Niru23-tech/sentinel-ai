from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings
from .models import Base, User, Customer, Log, Transaction, Incident, SystemSettings
from passlib.context import CryptContext
import datetime
import json
import random

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_db():
    db = SessionLocal()
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)

        # 1. System Settings
        if not db.query(SystemSettings).filter(SystemSettings.id == 1).first():
            settings_obj = SystemSettings(
                id=1,
                risk_threshold=80,
                enable_ai=True,
                enable_auto_protection=True,
                enable_learning_mode=True
            )
            db.add(settings_obj)
            db.commit()

        # 2. Users (Analyst Operator)
        if not db.query(User).filter(User.email == "admin@sentinel.ai").first():
            admin_user = User(
                email="admin@sentinel.ai",
                password_hash=pwd_context.hash("admin123"),
                name="Chief SOC Analyst",
                role="Administrator"
            )
            db.add(admin_user)
            db.commit()

        # 3. Customers (10 banking customers)
        if db.query(Customer).count() == 0:
            customers = [
                Customer(
                    id=1, name="Sarah Jenkins", account_number="ACC-998243", balance=145000.0, today_spending=12000.0,
                    current_device="iPhone 15 Pro", current_browser="Safari Mobile", current_location="Chennai, India",
                    current_ip="122.172.18.92", risk_score=15, account_status="Active", security_status="Secured"
                ),
                Customer(
                    id=2, name="Rajesh Patel", account_number="ACC-334190", balance=412000.0, today_spending=0.0,
                    current_device="MacBook Pro", current_browser="Chrome", current_location="Mumbai, India",
                    current_ip="103.241.12.18", risk_score=5, account_status="Active", security_status="Secured"
                ),
                Customer(
                    id=3, name="Anita Sen", account_number="ACC-109348", balance=87500.0, today_spending=3500.0,
                    current_device="Windows 11 PC", current_browser="Edge", current_location="Kolkata, India",
                    current_ip="182.74.88.54", risk_score=10, account_status="Active", security_status="Secured"
                ),
                Customer(
                    id=4, name="David Miller", account_number="ACC-884210", balance=210000.0, today_spending=45000.0,
                    current_device="iPad Air", current_browser="Safari Mobile", current_location="New Delhi, India",
                    current_ip="115.110.201.7", risk_score=20, account_status="Active", security_status="Secured"
                ),
                Customer(
                    id=5, name="Priya Sharma", account_number="ACC-776123", balance=345000.0, today_spending=0.0,
                    current_device="OnePlus 11", current_browser="Chrome Mobile", current_location="Bangalore, India",
                    current_ip="49.207.130.45", risk_score=12, account_status="Active", security_status="Secured"
                ),
                Customer(
                    id=6, name="John Doe", account_number="ACC-124987", balance=95000.0, today_spending=0.0,
                    current_device="Samsung Galaxy S23 (Rooted)", current_browser="Tor Browser", current_location="Frankfurt, Germany (via VPN)",
                    current_ip="185.220.101.5", risk_score=85, account_status="Temporarily Frozen", security_status="Under Threat"
                ),
                Customer(
                    id=7, name="Michael Chang", account_number="ACC-554109", balance=620000.0, today_spending=8000.0,
                    current_device="iPhone 13", current_browser="Safari Mobile", current_location="Singapore",
                    current_ip="202.166.15.82", risk_score=8, account_status="Active", security_status="Secured"
                ),
                Customer(
                    id=8, name="Elena Rostova", account_number="ACC-229487", balance=180000.0, today_spending=0.0,
                    current_device="Lenovo ThinkPad", current_browser="Firefox", current_location="Moscow, Russia",
                    current_ip="46.112.83.204", risk_score=15, account_status="Active", security_status="Secured"
                ),
                Customer(
                    id=9, name="Amit Verma", account_number="ACC-448201", balance=290000.0, today_spending=500.0,
                    current_device="Google Pixel 8", current_browser="Chrome Mobile", current_location="Hyderabad, India",
                    current_ip="157.51.92.14", risk_score=0, account_status="Active", security_status="Secured"
                ),
                Customer(
                    id=10, name="Vikram Malhotra", account_number="ACC-663842", balance=540000.0, today_spending=15000.0,
                    current_device="MacBook Air", current_browser="Safari", current_location="Pune, India",
                    current_ip="117.211.89.33", risk_score=18, account_status="Active", security_status="Secured"
                )
            ]
            for cust in customers:
                db.add(cust)
            db.commit()

        # Seed Transactions (Around 20 historical transactions)
        if db.query(Transaction).count() == 0:
            tx_data = [
                (1, 5000.0, "Ajay Kumar", "HDFC Bank", "ajay@upi", "Rent"),
                (1, 7000.0, "Amazon India", "ICICI Bank", None, "Shopping"),
                (3, 1500.0, "Zomato", "SBI", "zomato@upi", "Food Delivery"),
                (3, 2000.0, "Electricity Board", "Axis Bank", None, "Utility Bill"),
                (4, 30000.0, "Sarah Jenkins", "HDFC Bank", "sarah@upi", "Lent Money"),
                (4, 15000.0, "Apple Store", "Citi Bank", None, "Gadgets"),
                (7, 8000.0, "Stripe Inc", "DBS Bank", None, "Software Subscription"),
                (9, 500.0, "Uber India", "Paytm Bank", "uber@upi", "Ride Fare"),
                (10, 10000.0, "Rohan Sharma", "ICICI Bank", "rohan@upi", "Transfer"),
                (10, 5000.0, "Nike Store", "HDFC Bank", None, "Shoes"),
                # Add some more
                (2, 25000.0, "Investment Corp", "SBI", "mutualfund@upi", "SIP Investment"),
                (5, 12000.0, "Rent Owner", "Axis Bank", "owner@upi", "Rent"),
                (8, 45000.0, "Travel Agency", "Sberbank", None, "Flight Booking"),
                (8, 5000.0, "Restaurant", "Sberbank", None, "Dining"),
                (2, 1200.0, "Starbucks", "ICICI Bank", "starbucks@upi", "Coffee"),
                (3, 900.0, "BookMyShow", "SBI", "movies@upi", "Tickets"),
                (4, 5000.0, "Petrol Pump", "Axis Bank", None, "Fuel"),
                (5, 800.0, "Pharmacy", "HDFC Bank", "meds@upi", "Medicine"),
                (7, 300.0, "App Store", "DBS Bank", None, "Cloud Storage"),
                # Blocked transaction for John Doe (Customer 6)
                (6, 45000.0, "Hacker Wallet", "Unknown Offshore Bank", "malicious_addr@upi", "Urgent Transfer")
            ]
            
            now = datetime.datetime.utcnow()
            for i, (c_id, amt, recv, bank, upi, purpose) in enumerate(tx_data):
                is_blocked = (c_id == 6)
                tx = Transaction(
                    customer_id=c_id,
                    amount=amt,
                    receiver=recv,
                    bank=bank,
                    upi=upi,
                    purpose=purpose,
                    status="Blocked" if is_blocked else "Allowed",
                    risk_score=90 if is_blocked else random.randint(5, 25),
                    blocked_reason="High Risk Session - Suspected Account Takeover" if is_blocked else None,
                    money_saved=amt if is_blocked else 0.0,
                    timestamp=now - datetime.timedelta(hours=(20-i)*2)
                )
                db.add(tx)
            db.commit()

        # Seed Security Telemetry Logs (Around 50 logs)
        if db.query(Log).count() == 0:
            telemetry_events = [
                # Customer 1 (Sarah Jenkins) - Normal logs
                (1, "Login Successful", "shield", "Low", "Successful login from registered device 'iPhone 15 Pro'", 0, 10),
                (1, "Device Check", "smartphone", "Low", "Device posture check: iOS 17.4.1 (Non-Rooted)", 0, 8),
                (1, "Network Activity", "wifi", "Low", "IP 122.172.18.92 verified (ISP: Airtel Broadband)", 0, 6),
                
                # Customer 2 (Rajesh Patel) - Normal logs
                (2, "Login Successful", "shield", "Low", "Successful login via web portal on MacBook Pro", 0, 12),
                (2, "Network Activity", "wifi", "Low", "IP 103.241.12.18 verified (ISP: Tata Communications)", 0, 10),
                
                # Customer 3 (Anita Sen) - Normal logs
                (3, "Login Successful", "shield", "Low", "Successful login from Windows 11 PC using Edge browser", 0, 5),
                (3, "Network Activity", "wifi", "Low", "IP 182.74.88.54 verified (ISP: Alliance Broadband)", 0, 4),
                
                # Customer 6 (John Doe) - Attack Sequence (Critical Threat)
                (6, "Login Successful", "shield", "Low", "Successful login from registered device 'John's Phone'", 0, 14),
                (6, "New Device Detected", "smartphone", "Medium", "Unfamiliar device Samsung Galaxy S23 initiated login session", 20, 12),
                (6, "VPN Detected", "globe", "Medium", "Connection routed through NordVPN Frankfurt servers", 25, 10),
                (6, "TOR Detected", "shield-alert", "High", "Connection routing detected via TOR Exit Node", 35, 8),
                (6, "Impossible Travel", "plane", "High", "Session location jumped from Delhi, India to Frankfurt, Germany in 10 minutes", 30, 6),
                (6, "Rooted Device", "alert-triangle", "High", "Device integrity check failed: Root access/Jailbreak detected on Samsung Galaxy S23", 30, 4),
                (6, "Malware Detected", "bug", "Critical", "EDR scanner detected suspicious banking trojan signature in active background services", 40, 2),
                (6, "New Beneficiary Added", "user-plus", "Medium", "New UPI beneficiary 'Hacker Wallet' added successfully", 20, 1),
                (6, "Password Changed", "key", "High", "Account password updated via Tor Browser session", 15, 0.5),
                (6, "Failed OTP Attempt", "lock", "Medium", "OTP authentication failed twice for transaction clearance", 15, 0.2),

                # Add filler normal logs for other customers to reach 50+ logs
            ]
            
            # Fill out the list up to 50 with realistic events for customers
            now = datetime.datetime.utcnow()
            for c_id, event, icon, sev, desc, risk_add, hours_ago in telemetry_events:
                log = Log(
                    customer_id=c_id,
                    event_type=event,
                    icon=icon,
                    severity=sev,
                    description=desc,
                    risk_added=risk_add,
                    timestamp=now - datetime.timedelta(hours=hours_ago)
                )
                db.add(log)
            
            # Generate filler logs
            fill_events = [
                ("Login Successful", "shield", "Low", "Successful login from registered device", 0),
                ("Device Check", "smartphone", "Low", "Device posture check: Normal operating system status", 0),
                ("Network Activity", "wifi", "Low", "Standard domestic ISP network connection", 0),
                ("Session Renewed", "refresh-cw", "Low", "User session successfully extended", 0)
            ]
            
            for i in range(35):
                c_id = random.choice([1, 2, 3, 4, 5, 7, 8, 9, 10])
                ev = random.choice(fill_events)
                cust = db.query(Customer).filter(Customer.id == c_id).first()
                log = Log(
                    customer_id=c_id,
                    event_type=ev[0],
                    icon=ev[1],
                    severity=ev[2],
                    description=f"{ev[3]} for {cust.name if cust else 'customer'}",
                    risk_added=ev[4],
                    timestamp=now - datetime.timedelta(hours=random.randint(12, 120))
                )
                db.add(log)

            db.commit()

        # Seed Incident Report for John Doe (Customer 6)
        if db.query(Incident).count() == 0:
            correlated_events = [
                {"time": "09:12 AM", "event": "New Device Detected", "risk": 20, "description": "Samsung Galaxy S23 logged in"},
                {"time": "09:14 AM", "event": "VPN Connection Active", "risk": 25, "description": "NordVPN Server (Frankfurt, Germany)"},
                {"time": "09:15 AM", "event": "Impossible Travel Triggered", "risk": 30, "description": "Delhi to Frankfurt in under 10 minutes"},
                {"time": "09:18 AM", "event": "Root Access Detected", "risk": 30, "description": "Device Sandbox integrity compromised"},
                {"time": "09:20 AM", "event": "Malware Process Warning", "risk": 40, "description": "EDR detected Pegasus Trojan clone"},
                {"time": "09:22 AM", "event": "New Beneficiary Registered", "risk": 20, "description": "Added UPI receiver 'Hacker Wallet'"}
            ]
            
            tx_details = {
                "amount": 45000.0,
                "receiver": "Hacker Wallet",
                "bank": "Unknown Offshore Bank",
                "upi": "malicious_addr@upi",
                "purpose": "Urgent Transfer"
            }
            
            actions_taken = [
                "Blocked Outgoing UPI Transaction of ₹45,000",
                "Froze Customer Account ACC-124987",
                "Terminated Rogue Tor/VPN Session",
                "Locked Attacker IP 185.220.101.5",
                "SMS/Email Warning Dispatched to Registered Mobile"
            ]

            incident = Incident(
                id=1,
                customer_id=6,
                threat_type="Account Takeover Attempt",
                risk_score=95,
                confidence_score=98,
                events_correlated_json=json.dumps(correlated_events),
                transaction_details_json=json.dumps(tx_details),
                actions_taken_json=json.dumps(actions_taken),
                money_protected=45000.0,
                analyst_recommendation="Contact customer John Doe immediately on registered landline. Require in-person KYC and biometric reset before unlocking account. Block IP address 185.220.101.5 permanently.",
                status="Blocked",
                created_at=now - datetime.timedelta(minutes=30)
            )
            db.add(incident)
            db.commit()

    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()
