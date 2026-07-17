from sqlalchemy.orm import Session
from .models import Incident, Customer
from .gemini import analyze_incident_with_ai
import json
import datetime

class MockReport:
    def __init__(self, id, incident_id, executive_summary, timeline_json, ai_analysis_json, recommendations, created_at):
        self.id = id
        self.incident_id = incident_id
        self.executive_summary = executive_summary
        self.timeline_json = timeline_json
        self.ai_analysis_json = ai_analysis_json
        self.recommendations = recommendations
        self.created_at = created_at

def generate_incident_report(incident_id: int, db: Session) -> MockReport:
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise ValueError(f"Incident {incident_id} not found")

    customer = db.query(Customer).filter(Customer.id == incident.customer_id).first()
    cust_name = customer.name if customer else "Unknown Customer"

    # Get AI Analysis
    ai_result = analyze_incident_with_ai(incident_id, db)

    # Compile Timeline
    timeline = []
    events = json.loads(incident.events_correlated_json) if incident.events_correlated_json else []
    for ev in events:
        timeline.append({
            "time": ev.get("time", "N/A"),
            "stage": ev.get("event", "Telemetry Logged"),
            "description": f"Cybersecurity event: {ev.get('description', '')}. Risk added: +{ev.get('risk', 0)}."
        })

    # Add transaction attempt
    tx = json.loads(incident.transaction_details_json) if incident.transaction_details_json else {}
    if tx:
        timeline.append({
            "time": "Immediate",
            "stage": "Transaction Attempted",
            "description": f"Customer attempted out-of-character transaction of ₹{tx.get('amount', 0):,} to {tx.get('receiver', '')}."
        })

    # Add response actions
    actions = json.loads(incident.actions_taken_json) if incident.actions_taken_json else []
    for act in actions:
        timeline.append({
            "time": "Real-time",
            "stage": "Autonomous Protection Action",
            "description": f"SentinelAI auto-defense action: {act}."
        })

    # Return MockReport object matching ReportSchema
    return MockReport(
        id=incident.id,
        incident_id=incident.id,
        executive_summary=ai_result.get("summary", f"Account Takeover vulnerability analysis for customer {cust_name}."),
        timeline_json=json.dumps(timeline),
        ai_analysis_json=json.dumps(ai_result),
        recommendations=ai_result.get("recommendations", incident.analyst_recommendation),
        created_at=incident.created_at
    )
