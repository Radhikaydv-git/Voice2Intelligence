# =======================
# ENV LOADING (FIRST)
# =======================
from dotenv import load_dotenv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH, override=True)

ASSEMBLYAI_KEY = os.getenv("ASSEMBLY_API_KEY")

print("DEBUG ENV PATH:", ENV_PATH)
print("DEBUG FINAL KEY PRESENT:", bool(ASSEMBLYAI_KEY))

# =======================
# CONFIGURE ASSEMBLYAI
# =======================
import assemblyai as aai

if not ASSEMBLYAI_KEY:
    raise RuntimeError("ASSEMBLYAI_API_KEY not loaded")

aai.settings.api_key = ASSEMBLYAI_KEY

# =======================
# FASTAPI IMPORTS
# =======================
from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil

# =======================
# INTERNAL IMPORTS
# =======================
from .stt import transcribe_audio
from .agent import CallAnalysisAgent
from .db_operations import save_call_analysis

# =======================
# APP INIT (ONCE)
# =======================
app = FastAPI(title="Call Analyzer API")

agent = CallAnalysisAgent()

# =======================
# UPLOAD DIRECTORY
# =======================
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# =======================
# ROOT ENDPOINT
# =======================
@app.get("/")
def root():
    return {
        "status": "Call Analyzer API running",
        "env_loaded": True
    }

# =======================
# AUDIO UPLOAD ENDPOINT
# =======================
@app.post("/upload-audio/")
def upload_audio(file: UploadFile = File(...)):
    if not file.filename.endswith((".wav", ".mp3")):
        raise HTTPException(
            status_code=400,
            detail="Only .wav or .mp3 files are allowed"
        )

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Audio uploaded successfully",
        "file_path": str(file_path)
    }

# =======================
# ANALYZE CALL ENDPOINT
# =======================
@app.post("/analyze-call/")
def analyze_call(audio_file_path: str):
    try:
        # 1️⃣ Transcribe audio
        transcript = transcribe_audio(audio_file_path)

        # 2️⃣ Analyze transcript using Gemini agent
        analysis = agent.run(transcript)

        # 3️⃣ Save to database
        save_call_analysis(
            data=analysis,
            transcript=transcript,
            audio_file=audio_file_path
        )

        # 4️⃣ Return response
        return {
            "transcript": transcript,
            "analysis": analysis
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
