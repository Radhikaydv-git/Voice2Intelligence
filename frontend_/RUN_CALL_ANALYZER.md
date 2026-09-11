# Run this React frontend with your existing Call Analyzer backend

## Main project

Place this project at:
`C:\Users\Radhika Yadav\Downloads\call_agent-main\frontend`

Keep `backend/`, `data/`, `.env`, PostgreSQL, and the old Streamlit frontend unchanged.

## Terminal 1 — backend
```powershell
cd "C:\Users\Radhika Yadav\Downloads\call_agent-main"
.\venv\Scripts\Activate.ps1
python -m uvicorn backend.app.main:app --reload
```

## Terminal 2 — frontend
```powershell
cd "C:\Users\Radhika Yadav\Downloads\call_agent-main\frontend"
npm install
npm run dev
```
Open the localhost URL printed by Vite, normally `http://localhost:5173`.

## Connection
The browser calls `/api/`. Vite proxies that prefix to the existing FastAPI server at `http://127.0.0.1:8000`.

Real Analyze Call flow:
1. POST `/api/upload-audio/` with the selected MP3/WAV.
2. Receive the server-side `file_path`.
3. POST `/api/analyze-call/?audio_file_path=...`.
4. Existing AssemblyAI, Gemini and PostgreSQL code runs.
5. Transcript and analysis are displayed in React.

No backend file needs to be changed.

The Dashboard/Calls/Analytics demo totals remain demo values for now because the existing backend has no endpoint to list stored calls or calculate dashboard statistics. Add such endpoints later if desired.
