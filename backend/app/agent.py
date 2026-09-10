from .gemini_client import generate_response


class CallAnalysisAgent:
    """
    Single responsibility agent:
    - Takes full transcript
    - Performs factual reasoning
    - Returns structured call analysis
    """

    def run(self, transcript: str) -> dict:
        prompt = f"""
You are a senior call quality analyst.

You are given a transcript of a phone call between
a customer and a call center agent.

Your task is to reason about the conversation and return
a structured analysis.

RULES:
- DO NOT hallucinate
- DO NOT assume facts
- DO NOT perform sentiment analysis
- Stick strictly to the transcript

Transcript:
\"\"\"{transcript}\"\"\"

Return STRICT JSON:
{{
  "call_purpose": "",
  "customer_issue": "",
  "actions_taken_by_agent": "",
  "resolution_status": "Resolved | Unresolved | Follow-up needed",
  "next_steps": "",
  "summary_from_customer_perspective": "",
  "summary_from_agent_perspective": ""
}}
"""

        response = generate_response(prompt)
        return self._safe_json(response)

    def _safe_json(self, text: str) -> dict:
        import json
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
