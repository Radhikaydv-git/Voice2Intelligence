from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_response(prompt: str) -> str:
    response = client.models.generate_content(
        model="models/gemini-3.6-flash",
        contents=prompt
    )
    return response.text
