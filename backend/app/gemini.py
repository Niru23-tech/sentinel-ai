import os
import json
import google.generativeai as genai
from sqlalchemy.orm import Session
from .models import SystemSettings, Incident, Customer
import logging

logger = logging.getLogger(__name__)

MOCK_BANKING_ANALYSES = {
    "Phishing Attack": {
        "summary": "Phishing link execution followed by unauthorized network telemetry routing.",
        "description": "AI detected a phishing link click event on the customer's registered email/SMS logs, followed by an immediate login session initiated from an unfamiliar IP address using a commercial VPN server.",
        "root_cause": "Social engineering via SMS/Email leading to active session token harvesting or credential disclosure.",
        "affected_assets": "Customer banking session, Account security credentials",
        "recommendations": "1. Dispatch automatic password reset link.\n2. Revoke active web session cookies.\n3. Request user to run malware sweep on mobile device.",
        "next_step": "The attacker will attempt to modify contact details or add a new beneficiary to initiate transfers.",
        "risk_score": 45,
        "confidence_score": 88
    },
    "Credential Theft": {
        "summary": "Suspected brute force / credential stuffing resulting in successful login and password change.",
        "description": "AI identified multiple failed authentication attempts on different browsers, followed by a successful login, a password change, and consecutive OTP delivery failures.",
        "root_cause": "Compromised credentials (credential stuffing or password spraying) without robust Multi-Factor Authentication.",
        "affected_assets": "Web portal credentials, Account security password",
        "recommendations": "1. Reset and disable the active password.\n2. Invalidate active OTP tokens.\n3. Force multi-factor enrollment upon next login.",
        "next_step": "The attacker will attempt to initiate transactions under the newly changed password.",
        "risk_score": 50,
        "confidence_score": 90
    },
    "Session Hijack": {
        "summary": "Active session hijacked and routed through Tor network with impossible physical travel.",
        "description": "AI correlated a standard login from Chennai, India with an active Tor connection requesting transaction authorization from Berlin, Germany just 5 minutes later. This represents impossible physical travel.",
        "root_cause": "Session hijacking via cookie theft, malware stager, or active browser-in-the-middle proxy.",
        "affected_assets": "Active browser session token, UPI channels",
        "recommendations": "1. Terminate all active browser sessions immediately.\n2. Place 24-hour cooling freeze on outgoing UPI transactions.\n3. Blacklist IP addresses associated with Tor Exit Node.",
        "next_step": "Attacker will try to clear the account balance using immediate offshore wire transfers.",
        "risk_score": 90,
        "confidence_score": 95
    },
    "VPN Login": {
        "summary": "Login initiated via commercial VPN service.",
        "description": "A successful login was established using a known commercial VPN provider (NordVPN/ExpressVPN). The device fingerprint matches the customer's registered profile, but the IP route is spoofed.",
        "root_cause": "Customer using a VPN for privacy, or attacker attempting to mask location.",
        "affected_assets": "Web login session",
        "recommendations": "1. Log the event as low-risk anomaly.\n2. Require second-factor verification if transaction is initiated.\n3. Monitor for subsequent location jumps.",
        "next_step": "Awaiting customer transactions to verify legitimateness of session.",
        "risk_score": 25,
        "confidence_score": 85
    },
    "Malware Infection": {
        "summary": "Banking Trojan signature detected on rooted mobile client device.",
        "description": "Mobile endpoint protection telemetry reported that the customer's mobile app is running on a rooted/jailbroken environment and identified a resident banking Trojan process (Anubis/Pegasus clone) actively monitoring screen layouts.",
        "root_cause": "Installation of an infected, side-loaded Android package (APK) by the customer.",
        "affected_assets": "Registered mobile device, Mobile banking app sandbox",
        "recommendations": "1. Freeze mobile banking access channel.\n2. Send push alert instructing user to uninstall suspicious software.\n3. Require physical device verification before unblocking.",
        "next_step": "Malware will attempt to harvest OTP SMS codes and bypass transactional verification screens.",
        "risk_score": 70,
        "confidence_score": 92
    },
    "Account Takeover": {
        "summary": "CRITICAL: Account Takeover (ATO) attempt in progress with new device, impossible travel, and beneficiary registration.",
        "description": "AI detected a critical threat sequence: the customer logged in from a new device in Frankfurt, Germany (NordVPN) while their registered phone is in Delhi, India. They immediately added a beneficiary ('Hacker Wallet') and initiated an urgent transaction of ₹45,000.",
        "root_cause": "Combined credential theft, device sandbox compromise, and session hijacking routed through geo-masking proxies.",
        "affected_assets": "ACC-124987 total balance, UPI transfer gateway",
        "recommendations": "1. Block outgoing UPI transaction of ₹45,000 immediately.\n2. Temporarily suspend account ACC-124987.\n3. Log out attacker and lock IP address 185.220.101.5.\n4. Notify client via SMS and out-of-band phone call.",
        "next_step": "Attacker will attempt to bypass lockouts using card-not-present (CNP) fraud or alternate banking channels.",
        "risk_score": 95,
        "confidence_score": 98
    },
    "Insider Threat": {
        "summary": "Anomalous transaction frequency and volume at unusual login hours.",
        "description": "Customer session initiated at 03:14 AM showing high-velocity transfers (3 transfers within 60 seconds) close to the daily transfer limits. Device footprint matches, but behavior is highly anomalous.",
        "root_cause": "Coerced transactions, theft of physical unlocked device, or insider fraud.",
        "affected_assets": "Savings balance, Instant UPI transfer limit",
        "recommendations": "1. Temporarily freeze transaction processing for 6 hours.\n2. Require biometric authentication (FaceID/Fingerprint) to resume transfers.\n3. Trigger automated verification callback.",
        "next_step": "Attacker will attempt to exhaust remaining daily credit and transfer limits.",
        "risk_score": 75,
        "confidence_score": 89
    }
}

def analyze_incident_with_ai(incident_id: int, db: Session) -> dict:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        return {"error": "Incident not found"}
        
    customer = db.query(Customer).filter(Customer.id == incident.customer_id).first()
    cust_info = f"Name: {customer.name}, Account: {customer.account_number}, Device: {customer.current_device}, IP: {customer.current_ip}, Location: {customer.current_location}" if customer else "Unknown Customer"
    
    settings = db.query(SystemSettings).filter(SystemSettings.id == 1).first()
    api_key = settings.gemini_api_key if settings else ""
    demo_mode = settings.enable_learning_mode if settings else True # mapped for settings panel
    
    # Identify the threat category
    threat_cat = incident.threat_type
    if threat_cat not in MOCK_BANKING_ANALYSES:
        # fallback categorizer
        title_upper = incident.threat_type.upper()
        if "PHISHING" in title_upper:
            threat_cat = "Phishing Attack"
        elif "CREDENTIAL" in title_upper or "THEFT" in title_upper:
            threat_cat = "Credential Theft"
        elif "HIJACK" in title_upper or "SESSION" in title_upper:
            threat_cat = "Session Hijack"
        elif "VPN" in title_upper:
            threat_cat = "VPN Login"
        elif "MALWARE" in title_upper or "INFECTION" in title_upper:
            threat_cat = "Malware Infection"
        elif "TAKEOVER" in title_upper or "ATO" in title_upper:
            threat_cat = "Account Takeover"
        elif "INSIDER" in title_upper:
            threat_cat = "Insider Threat"
        else:
            threat_cat = "Account Takeover"

    # If demo mode is on or no API key, use mock template
    if not api_key:
        logger.info("Using mock banking analysis for incident %s", incident_id)
        mock_data = MOCK_BANKING_ANALYSES.get(threat_cat, MOCK_BANKING_ANALYSES["Account Takeover"]).copy()
        mock_data["incident_id"] = incident_id
        mock_data["affected_assets"] = f"{cust_info} (Current Status: {customer.account_status if customer else 'Unknown'})"
        return mock_data

    # Otherwise call Gemini API
    try:
        genai.configure(api_key=api_key)
        
        prompt = f"""
You are SentinelAI, an autonomous banking cybersecurity correlation & fraud prevention engine.
Analyze the following cyber threat incident targeting a banking customer and return a JSON structure.

Incident details:
- ID: {incident.id}
- Threat Type: {incident.threat_type}
- Current Risk Score: {incident.risk_score}
- Target Customer Profile: {cust_info}
- Correlated Events: {incident.events_correlated_json}
- Transaction Attempt: {incident.transaction_details_json}
- Actions Taken: {incident.actions_taken_json}

You must return EXACTLY a JSON string with these keys:
"summary": A concise executive summary of the threat.
"description": A detailed, human-readable explanation of why the AI raised the alert and how the cyber events correlate with the transactional attempt.
"root_cause": The root cause of the compromise (e.g. phishing, session theft).
"affected_assets": List of impacted systems or banking channels.
"recommendations": A numbered list of recommended security responses for analysts.
"next_step": The predicted next step of the cybercriminal.
"risk_score": An integer (0 to 100) representing the threat severity.
"confidence_score": An integer (0 to 100) representing your confidence in this assessment.

Do not include any markdown styling like ```json or trailing comments. Return raw JSON text only.
"""
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        data = json.loads(text)
        return data
        
    except Exception as e:
        logger.error("Gemini API call failed: %s. Falling back to mock banking data.", str(e))
        mock_data = MOCK_BANKING_ANALYSES.get(threat_cat, MOCK_BANKING_ANALYSES["Account Takeover"]).copy()
        mock_data["incident_id"] = incident_id
        mock_data["affected_assets"] = f"{cust_info} (Current Status: {customer.account_status if customer else 'Unknown'})"
        mock_data["ai_error"] = str(e)
        return mock_data
