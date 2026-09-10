# 📞 AI Call Analyzer (CallAgent)

AI Call Analyzer is an end-to-end **Call Center Audio Analysis System** that takes an audio call recording (`.mp3` / `.wav`), converts it into a transcript using **AssemblyAI Speech-to-Text**, generates a structured call analysis using **Google Gemini**, stores the results in **PostgreSQL**, and displays everything in a modern **Streamlit UI** with download support.

This project is built to simulate real-world call center quality monitoring and customer support call analysis workflows.

---

## ✅ Key Features

### 🎧 Audio Handling
- Upload call audio files (`.mp3`, `.wav`)
- Plays the uploaded audio inside the UI

### 🗣 Speech-to-Text (STT)
- Transcribes call audio using **AssemblyAI API**
- Produces a readable transcript for the full call

### 🧠 AI Call Analysis (Gemini)
Gemini analyzes the call transcript and returns a **structured JSON** output containing:
- `call_purpose`
- `customer_issue`
- `actions_taken_by_agent`
- `resolution_status`
- `next_steps`
- `summary_from_customer_perspective`
- `summary_from_agent_perspective`

### 🗄 Database Storage (PostgreSQL)
- Stores every processed call in PostgreSQL
- Saves transcript and analysis in JSON format
- Useful for future analytics / dashboards

### 📥 Download Support (Streamlit)
- Download transcript as `.txt`
- Download analysis as `.json`

---

## 🔥 Project Pipeline (Working Flow)

           Streamlit UI
                ↓ (Upload audio)
     Temporary audio file saved
                ↓
   FastAPI Backend (/analyze-call)
                ↓
     AssemblyAI → Transcript
                ↓
Gemini AI → Structured Call Analysis JSON
                ↓
      PostgreSQL DB (calls table)
                ↓
Results returned to Streamlit UI + Downloads


---

## 🧩 Tech Stack

### Backend
- **FastAPI** – REST API framework
- **Uvicorn** – ASGI server

### AI + Processing
- **AssemblyAI** – Speech-to-Text conversion
- **Google Gemini** – Call reasoning & structured summary generation

### Database
- **PostgreSQL**
- **JSONB** field support for storing AI output

### Frontend
- **Streamlit** – UI dashboard

## 📁 Folder Structure

Call_Agent/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI routes + controller logic
│       ├── agent.py             # Gemini reasoning agent (CallAnalysisAgent)
│       ├── stt.py               # AssemblyAI transcription module
│       ├── gemini_client.py     # Gemini API connector
│       ├── db_operations.py     # PostgreSQL insert/save logic
│       └── __init__.py
│
├── frontend/
│   └── streamlit_app.py         # Streamlit UI (upload, analyze, show, download)
│
├── requirements.txt
├── .env.example                 # Environment variable template
├── .gitignore
└── README.md



---

## 🔐 Environment Variables Setup

This project uses a `.env` file for sensitive credentials.

### ✅ Create `.env` in project root

Create a file named `.env` (same folder as README.md) and add:

```env
ASSEMBLY_API_KEY=your_assemblyai_key_here
GEMINI_API_KEY=your_gemini_api_key_here

DB_HOST=localhost
DB_PORT=5432
DB_NAME=callagent
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here


🐘 PostgreSQL Database Setup


✅ Step 1: Create Database

Open pgAdmin → Query Tool and run:

CREATE DATABASE callagent;

✅ Step 2: Create Table

Open the callagent DB → Query Tool and run:

CREATE TABLE calls (
    id SERIAL PRIMARY KEY,
    audio_file TEXT,
    transcript TEXT,
    analysis_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



▶️ Run Backend (FastAPI)


From the project root:

uvicorn backend.app.main:app --reload

Backend will run on:

✅ http://127.0.0.1:8000

Swagger UI:

✅ http://127.0.0.1:8000/docs

▶️ Run Frontend (Streamlit)

Open a new terminal, activate environment again:

venv\Scripts\activate
streamlit run frontend/streamlit_app.py


Frontend will run on:

✅ http://localhost:8501

🧪 Testing the Project

Open Streamlit UI: http://localhost:8501

Upload .mp3 or .wav

Click Analyze Call

Output shown:

Transcript

AI analysis JSON

Download:

Transcript .txt

Analysis .json

Verify DB entries using pgAdmin



🔎 PostgreSQL Queries (To View Saved Data)



✅ View all calls
SELECT * FROM calls ORDER BY id DESC;

✅ View transcript + pretty analysis JSON (latest call)
SELECT
    id,
    transcript,
    jsonb_pretty(analysis_json) AS analysis
FROM calls
ORDER BY id DESC
LIMIT 1;

✅ Extract analysis fields as columns
SELECT
    id,
    analysis_json->>'call_purpose' AS call_purpose,
    analysis_json->>'customer_issue' AS customer_issue,
    analysis_json->>'actions_taken_by_agent' AS actions_taken_by_agent,
    analysis_json->>'resolution_status' AS resolution_status,
    analysis_json->>'next_steps' AS next_steps
FROM calls
ORDER BY id DESC;


📌 API Endpoint Details


✅ POST /analyze-call/

Analyzes a call recording using STT + Gemini

Request (query param):

audio_file_path : string (local file path)

Response:

{
  "transcript": "...",
  "analysis": {
    "call_purpose": "...",
    "customer_issue": "...",
    "actions_taken_by_agent": "...",
    "resolution_status": "...",
    "next_steps": "...",
    "summary_from_customer_perspective": "...",
    "summary_from_agent_perspective": "..."
  }
}

⚠️ Common Errors & Fixes
❌ 1) PostgreSQL Password Error

Error:

password authentication failed for user "postgres"


✅ Fix:

Ensure DB_PASSWORD in .env is correct

Reset password in pgAdmin if required

❌ 2) .env not loaded

✅ Fix:

Ensure .env is in the project root

Restart terminal + backend

❌ 3) Missing modules

Error:

ModuleNotFoundError


✅ Fix:

-pip install -r requirements.txt

🛡️ Security Notes

-Never commit .env to GitHub

-Use .env.example for sharing config

-Rotate API keys if exposed anywhere publicly

🌟 Future Enhancements (Optional)

-Call history page in Streamlit

-Search/filter calls by purpose or status

-Analytics dashboard (charts)

-Authentication & Admin panel

-Cloud deployment (Render / Streamlit Cloud)

👨‍💻 Author

Radhika Yadav
GitHub: https://github.com/Radhikaydv-git

Yuvraj Kushwah
GitHub: https://github.com/Yuvraj9685

⭐ Support

If you like this project, give it a ⭐ on GitHub and share feedback!
If you want, I can also provide:
✅ `requirements.txt` (complete)  
✅ `.env.example` file  
✅ Clean deployment steps (cloud hosting)
