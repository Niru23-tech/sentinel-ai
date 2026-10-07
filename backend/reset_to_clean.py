"""
SentinelAI - Clean Database & Fresh Start Script
=================================================
Wipes all demo/seeded data and creates a clean database
with only system settings and one admin SOC analyst account.

Run from backend/ folder:
  .\\venv\\Scripts\\python.exe reset_to_clean.py

After this, you can:
  1. Register your own test account via the app or API
  2. Run a real hacker simulation against your account
"""
import sys
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import engine, SessionLocal, pwd_context
from app.models import Base, User, Customer, Log, Transaction, Incident, SystemSettings, AgentExecution, AgentFindings, IncidentReports, RiskAnalysis, InvestigationHistory

print()
print("=" * 60)
print("  SentinelAI — Wiping Demo Data & Starting Fresh")
print("=" * 60)
print()

# Step 1: Drop all existing tables completely
print("[1/4] Dropping all existing tables (removing demo data)...")
Base.metadata.drop_all(bind=engine)
print("  -> All tables dropped successfully.")

# Step 2: Recreate all tables fresh
print("[2/4] Recreating all tables (clean empty schema)...")
Base.metadata.create_all(bind=engine)
print("  -> All tables recreated (empty).")

db = SessionLocal()

try:
    # Step 3: Insert only system settings
    print("[3/4] Inserting system security settings...")
    settings = SystemSettings(
        id=1,
        risk_threshold=80,
        enable_ai=True,
        enable_auto_protection=True,
        enable_learning_mode=True
    )
    db.add(settings)

    # Insert ONE SOC Admin analyst only (no demo customers)
    admin = User(
        email="admin@sentinel.ai",
        password_hash=pwd_context.hash("admin123"),
        name="Chief SOC Analyst",
        role="Administrator"
    )
    db.add(admin)
    db.commit()
    print("  -> System settings and SOC Admin account created.")

    print("[4/4] Verification...")
    user_count = db.query(User).count()
    customer_count = db.query(Customer).count()
    log_count = db.query(Log).count()
    tx_count = db.query(Transaction).count()

    print(f"  -> Users in DB:         {user_count}  (only admin SOC analyst)")
    print(f"  -> Customers in DB:     {customer_count}  (ZERO — no demo data)")
    print(f"  -> Security Logs in DB: {log_count}  (ZERO — no demo data)")
    print(f"  -> Transactions in DB:  {tx_count}  (ZERO — no demo data)")

    print()
    print("=" * 60)
    print("  DATABASE IS CLEAN!")
    print("=" * 60)
    print()
    print("  NEXT STEPS:")
    print()
    print("  1. Open the app at: http://localhost:5173")
    print()
    print("  2. To add YOUR OWN test account as a customer, call:")
    print("     POST http://localhost:8000/api/customers")
    print("     Body: {")
    print('       "name": "Your Name",')
    print('       "account_number": "ACC-XXXXXX",')
    print('       "balance": 100000.0,')
    print('       "current_device": "Your Device",')
    print('       "current_location": "Your City, India",')
    print('       "current_ip": "your.real.ip.address"')
    print("     }")
    print()
    print("  3. Or go to: http://localhost:8000/docs")
    print("     and use the interactive Swagger UI to register yourself.")
    print()
    print("  4. Then run the hacker simulation against YOUR account:")
    print("     .\\venv\\Scripts\\python.exe test_hacker_simulation.py")
    print()

finally:
    db.close()
