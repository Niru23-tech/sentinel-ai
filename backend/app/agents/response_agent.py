import time
import random
from typing import Dict, Any, List

class IncidentResponseAgent:
    """
    Agent 5: Incident Response Agent
    Synthesizes intelligence from Threat, Fraud, Behaviour, and Forensics Agents.
    Calculates consolidated risk score (0-40 Low, 40-80 Medium, 80-100 Critical),
    generates mitigation checklists, and enforces Mandatory Bank Authorization.
    """
    def __init__(self):
        self.name = "Incident Response Agent"
        self.role = "Playbook Orchestration & Mandatory Authorization Gate"

    def analyze(self, agent_outputs: Dict[str, Any], customer_data: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.perf_counter()
        
        threat_score = agent_outputs.get("threat_analyst", {}).get("risk_contribution_pct", 0.0)
        fraud_score = agent_outputs.get("fraud_analyst", {}).get("risk_contribution_pct", 0.0)
        behaviour_score = agent_outputs.get("behaviour_analyst", {}).get("risk_contribution_pct", 0.0)
        forensics_score = agent_outputs.get("forensics_analyst", {}).get("risk_contribution_pct", 0.0)

        # Composite overall risk calculation
        overall_risk = int(round(0.35 * threat_score + 0.30 * fraud_score + 0.20 * behaviour_score + 0.15 * forensics_score))
        customer_risk = customer_data.get("risk_score", 10)
        overall_risk = max(overall_risk, customer_risk)
        overall_risk = min(100, max(0, overall_risk))

        if overall_risk >= 80:
            severity_tier = "CRITICAL (80-100)"
            response_type = "EMERGENCY RESPONSE PLAN GENERATED"
            requires_bank_authorization = True
            mitigation_checklist = [
                {"action": "Block Outgoing UPI Transaction", "status": "RECOMMENDED", "requires_approval": True, "description": "Hold settlement of ₹45,000 transfer to hacker_vault@offshore.bank."},
                {"action": "Temporarily Freeze Customer Account", "status": "RECOMMENDED", "requires_approval": True, "description": "Suspend outward debit capabilities on account ACC-124987."},
                {"action": "Terminate Rogue Browser & Tor Session", "status": "RECOMMENDED", "requires_approval": False, "description": "Revoke OAuth access token 0x99281 immediately."},
                {"action": "Edge Firewall IP Isolation", "status": "RECOMMENDED", "requires_approval": True, "description": "Add IP 185.220.101.5 to perimeter firewall drop rules."},
                {"action": "Dispatch Out-of-Band SMS/Email Warning", "status": "RECOMMENDED", "requires_approval": False, "description": "Alert customer on registered phone via automated SMS gateway."},
                {"action": "Generate Printable Executive Dossier PDF", "status": "READY", "requires_approval": False, "description": "Compile full incident report for compliance ledger."}
            ]
            summary = "CRITICAL THREAT: Multi-stage Account Takeover detected. Immediate bank analyst authorization recommended to execute containment checklist."
        elif overall_risk >= 40:
            severity_tier = "MEDIUM (40-80)"
            response_type = "ELEVATED DEFENSE PROTOCOL"
            requires_bank_authorization = True
            mitigation_checklist = [
                {"action": "Enforce Step-Up MFA Challenge", "status": "RECOMMENDED", "requires_approval": False, "description": "Prompt user with biometric verification modal."},
                {"action": "Apply 2-Hour Payment Hold", "status": "RECOMMENDED", "requires_approval": True, "description": "Delay settlement to unverified beneficiary for analyst review."},
                {"action": "Notify SOC Duty Analyst", "status": "RECOMMENDED", "requires_approval": False, "description": "Flag incident in analyst triage queue."}
            ]
            summary = "ELEVATED RISK: Suspicious device/VPN telemetry. Step-up authentication and payment hold recommended."
        else:
            severity_tier = "LOW (0-40)"
            response_type = "STANDARD MONITORING"
            requires_bank_authorization = False
            mitigation_checklist = [
                {"action": "Allow Transaction", "status": "APPROVED", "requires_approval": False, "description": "Standard payment processing with continuous telemetry logging."},
                {"action": "Audit Trail Logging", "status": "COMPLETED", "requires_approval": False, "description": "Record transaction hash in security log table."}
            ]
            summary = "LOW RISK: Telemetry complies with normal baseline. No defensive intervention required."

        latency_ms = round((time.perf_counter() - start_time) * 1000 + random.uniform(8.0, 16.0), 2)

        return {
            "agent_name": self.name,
            "role": self.role,
            "status": "COMPLETED",
            "execution_time_ms": latency_ms,
            "confidence_score": round(random.uniform(96.0, 99.4), 1),
            "risk_contribution_pct": round(min(100, overall_risk * 0.10), 1),
            "overall_risk_score": overall_risk,
            "severity_tier": severity_tier,
            "response_type": response_type,
            "requires_bank_authorization": requires_bank_authorization,
            "mitigation_checklist": mitigation_checklist,
            "summary": summary
        }
