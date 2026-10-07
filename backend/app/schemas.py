from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: Optional[str] = None
    employeeId: Optional[str] = None
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Security Analyst"

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional['UserResponse'] = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    class Config:
        from_attributes = True

# Customer Schema
class CustomerSchema(BaseModel):
    id: int
    name: str
    account_number: str
    balance: float
    today_spending: float
    current_device: str
    current_browser: str
    current_location: str
    current_ip: str
    risk_score: int
    account_status: str
    security_status: str
    class Config:
        from_attributes = True

class CustomerCreate(BaseModel):
    name: str
    account_number: str
    balance: Optional[float] = 100000.0
    current_device: Optional[str] = "iPhone 15 Pro"
    current_browser: Optional[str] = "Safari Mobile"
    current_location: Optional[str] = "Chennai, India"
    current_ip: Optional[str] = "122.172.18.92"
    risk_score: Optional[int] = 10

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    balance: Optional[float] = None
    today_spending: Optional[float] = None
    current_device: Optional[str] = None
    current_location: Optional[str] = None
    current_ip: Optional[str] = None
    risk_score: Optional[int] = None
    account_status: Optional[str] = None
    security_status: Optional[str] = None

# Log Schema
class LogSchema(BaseModel):
    id: int
    timestamp: datetime
    customer_id: Optional[int]
    event_type: str
    icon: str
    severity: str
    description: Optional[str]
    risk_added: int
    class Config:
        from_attributes = True

# Transaction Schema
class TransactionSchema(BaseModel):
    id: int
    customer_id: int
    amount: float
    receiver: str
    bank: str
    upi: Optional[str]
    purpose: Optional[str]
    status: str
    risk_score: int
    blocked_reason: Optional[str]
    money_saved: float
    timestamp: datetime
    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    customer_id: int
    amount: float
    receiver: str
    bank: str
    upi: Optional[str] = None
    purpose: Optional[str] = None

# Incident Schema
class IncidentSchema(BaseModel):
    id: int
    customer_id: int
    threat_type: str
    risk_score: int
    confidence_score: int
    events_correlated_json: Optional[str]
    transaction_details_json: Optional[str]
    actions_taken_json: Optional[str]
    money_protected: float
    analyst_recommendation: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerSchema] = None
    class Config:
        from_attributes = True

# System Settings Schema
class SystemSettingsSchema(BaseModel):
    risk_threshold: int
    enable_ai: bool
    enable_auto_protection: bool
    enable_learning_mode: bool
    class Config:
        from_attributes = True

# Simulation Request
class SimulationRequest(BaseModel):
    attack_type: str

# Report Schema
class ReportSchema(BaseModel):
    id: int
    incident_id: int
    executive_summary: str
    timeline_json: str
    ai_analysis_json: str
    recommendations: str
    created_at: datetime
    class Config:
        from_attributes = True

# ML Prediction Schemas
class MLPredictRequest(BaseModel):
    amount: float
    avg_amount: Optional[float] = 3000.0
    velocity_kmh: Optional[float] = 0.0
    is_unfamiliar_device: Optional[bool] = False
    is_vpn_or_tor: Optional[bool] = False
    failed_auth_count: Optional[int] = 0
    is_unverified_receiver: Optional[bool] = False

# --- ENTERPRISE REAL BANKING SCHEMAS ---

class PreAuthAssessRequest(BaseModel):
    account_number: str
    amount: float
    receiver: str
    bank: str
    upi: Optional[str] = None
    purpose: Optional[str] = None
    device_id: Optional[str] = "iPhone 15 Pro"
    ip_address: Optional[str] = "122.172.18.92"
    latitude: Optional[float] = 13.0827
    longitude: Optional[float] = 80.2707

class FeatureContribution(BaseModel):
    feature: str
    importance_pct: float
    value: str

class PreAuthAssessResponse(BaseModel):
    decision: str  # ALLOW, CHALLENGE_MFA, BLOCK
    risk_score: int
    risk_level: str
    confidence_pct: float
    latency_ms: float
    blocked_reason: Optional[str] = None
    transaction_id: Optional[int] = None
    incident_id: Optional[int] = None
    xai_breakdown: List[FeatureContribution] = []

class SIEMIngestRequest(BaseModel):
    source: str = Field(default="Splunk SIEM / Cloudflare WAF")
    event_type: str
    severity: str = "Medium"
    description: str
    customer_id: Optional[int] = None
    account_number: Optional[str] = None
    ip_address: Optional[str] = None
    risk_added: Optional[int] = 15

class GlobalSearchResponse(BaseModel):
    customers: List[CustomerSchema] = []
    incidents: List[IncidentSchema] = []
    transactions: List[TransactionSchema] = []
    logs: List[LogSchema] = []



