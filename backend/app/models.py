from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="Security Analyst")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    account_number = Column(String, unique=True, index=True, nullable=False)
    balance = Column(Float, default=100000.0)
    today_spending = Column(Float, default=0.0)
    current_device = Column(String, default="iPhone 15 Pro")
    current_browser = Column(String, default="Safari Mobile")
    current_location = Column(String, default="Chennai, India")
    current_ip = Column(String, default="122.172.18.92")
    risk_score = Column(Integer, default=10)  # 0 to 100
    account_status = Column(String, default="Active")  # Active, Temporarily Frozen, Locked
    security_status = Column(String, default="Secured")  # Secured, Under Threat, Compromised

    logs = relationship("Log", back_populates="customer", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="customer", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="customer", cascade="all, delete-orphan")

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    event_type = Column(String, nullable=False)  # Login Successful, VPN Detected, Malware, TOR, etc.
    icon = Column(String, default="activity")  # lucide icon identifier
    severity = Column(String, default="Low")  # Low, Medium, High, Critical
    description = Column(Text, nullable=True)
    risk_added = Column(Integer, default=0)

    customer = relationship("Customer", back_populates="logs")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    receiver = Column(String, nullable=False)
    bank = Column(String, nullable=False)
    upi = Column(String, nullable=True)
    purpose = Column(String, nullable=True)
    status = Column(String, default="Allowed")  # Allowed, Blocked
    risk_score = Column(Integer, default=10)
    blocked_reason = Column(String, nullable=True)
    money_saved = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="transactions")

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    threat_type = Column(String, nullable=False)  # Phishing Attack, Account Takeover, etc.
    risk_score = Column(Integer, default=50)
    confidence_score = Column(Integer, default=70)
    events_correlated_json = Column(Text, nullable=True)  # JSON-serialized list of security logs
    transaction_details_json = Column(Text, nullable=True)  # JSON-serialized transaction info
    actions_taken_json = Column(Text, nullable=True)  # JSON-serialized responses (e.g., Block, Freeze, Alert Customer)
    money_protected = Column(Float, default=0.0)
    analyst_recommendation = Column(Text, nullable=True)
    status = Column(String, default="Under Investigation")  # Resolved, Blocked, Under Investigation
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="incidents")

class SystemSettings(Base):
    __tablename__ = "system_settings"
    id = Column(Integer, primary_key=True, default=1)
    risk_threshold = Column(Integer, default=80)
    enable_ai = Column(Boolean, default=True)
    enable_auto_protection = Column(Boolean, default=True)
    enable_learning_mode = Column(Boolean, default=True)

class AgentExecution(Base):
    __tablename__ = "agent_executions"
    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(String, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    agent_name = Column(String, nullable=False)
    status = Column(String, default="COMPLETED")
    execution_time_ms = Column(Float, default=0.0)
    confidence_score = Column(Float, default=95.0)
    risk_contribution_pct = Column(Float, default=0.0)
    findings_json = Column(Text, nullable=True)
    recommendations_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AgentFindings(Base):
    __tablename__ = "agent_findings"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("agent_executions.id"), nullable=False)
    category = Column(String, nullable=False)
    severity = Column(String, default="Medium")
    finding_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class IncidentReports(Base):
    __tablename__ = "incident_reports"
    id = Column(Integer, primary_key=True, index=True)
    report_code = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    executive_summary = Column(Text, nullable=False)
    overall_risk_score = Column(Integer, default=50)
    attack_category = Column(String, nullable=False)
    mitre_mapping_json = Column(Text, nullable=True)
    business_impact_json = Column(Text, nullable=True)
    pdf_report_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RiskAnalysis(Base):
    __tablename__ = "risk_analysis"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    overall_risk_percentage = Column(Integer, default=50)
    threat_category = Column(String, nullable=False)
    attack_confidence = Column(Float, default=95.0)
    priority = Column(String, default="P1 - CRITICAL")
    recommended_action = Column(Text, nullable=False)
    investigation_status = Column(String, default="COMPLETED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InvestigationHistory(Base):
    __tablename__ = "investigation_history"
    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    analyst_name = Column(String, default="Chief SOC Analyst")
    overall_risk = Column(Integer, default=50)
    threat_type = Column(String, nullable=False)
    status = Column(String, default="COMPLETED")
    full_payload_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

