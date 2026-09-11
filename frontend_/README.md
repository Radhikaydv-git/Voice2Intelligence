# Call Insights Hub

I have an existing AI Call Analyzer project.

IMPORTANT:

I ONLY want you to redesign/replace the FRONTEND.

DO NOT modify, rewrite, replace, refactor, or create a new backend.

DO NOT change:

- FastAPI backend

- Python files

- AssemblyAI integration

- Gemini integration

- PostgreSQL/database

- API endpoints

- API request format

- AI analysis logic

- transcription logic

- environment variables

- existing project functionality

The existing backend must remain exactly as it is.

I want to replace ONLY the current Streamlit frontend with a modern React/TypeScript dashboard UI.

PROJECT NAME:

TeleXpert Indore / AI Call Analyzer

CURRENT BACKEND:

FastAPI running locally at:

http://127.0.0.1:8000

EXISTING API:

GET /

POST /upload-audio/

POST /analyze-call/

IMPORTANT EXISTING ANALYSIS FLOW:

The current frontend uploads/handles an MP3 or WAV file and then calls:

POST /analyze-call/

with the query parameter:

audio_file_path

Example:

/analyze-call/?audio_file_path=<path>

Do NOT change this API contract.

The backend returns:

{

  "transcript": "...",

  "analysis": {

    "actions_taken_by_agent": "...",

    "next_steps": "...",

    "summary_from_customer_perspective": "...",

    "summary_from_agent_perspective": "..."

  }

}

The new frontend must consume this existing response.

--------------------------------------------------

FRONTEND DESIGN

--------------------------------------------------

Create ONLY a frontend dashboard.

Make it look like a polished professional AI call-center analytics application.

Do NOT make it look like Streamlit.

Use:

- React

- TypeScript

- Tailwind CSS

- shadcn/ui

- Lucide icons

- Recharts where appropriate

Design style:

- Modern SaaS dashboard

- Clean

- Professional

- Premium

- Minimal

- White/light gray background

- Dark navy text

- Subtle blue/cyan accent

- Rounded cards

- Soft borders

- Very subtle shadows

- Excellent spacing

- Responsive

- Desktop-first

--------------------------------------------------

LAYOUT

--------------------------------------------------

Create a permanent left sidebar.

Sidebar:

TeleXpert Indore

AI Call Analyzer

Navigation:

Dashboard

Calls

Analyze Call

Analytics

Bottom:

Settings

Backend status:

● Connected

--------------------------------------------------

TOP BAR

--------------------------------------------------

Top navigation should contain:

Dashboard title

Search calls...

Notification icon

User profile

--------------------------------------------------

DASHBOARD

--------------------------------------------------

Create the main dashboard page.

Header:

"Call Analytics Dashboard"

Subtitle:

"Monitor, analyze and understand customer conversations."

Create four KPI cards:

Total Calls

Analyzed Calls

Resolved Calls

Follow-up Required

Use clean icons and large numbers.

Use realistic demo numbers ONLY for the visual dashboard until real backend data is available.

--------------------------------------------------

MAIN DASHBOARD CONTENT

--------------------------------------------------

Create a two-column layout.

LEFT:

"Call Activity"

Line/bar chart showing call activity over time.

RIGHT:

"Call Resolution"

Donut chart:

Resolved

Unresolved

Follow-up Required

Below this create:

"Recent Calls"

A clean table with:

Call ID

Audio File

Call Purpose

Resolution

Date

Action

Each row should have a "View" button.

--------------------------------------------------

ANALYZE CALL PAGE

--------------------------------------------------

This page is the main functional frontend.

Create a large professional upload card.

Title:

"Analyze a Call"

Subtitle:

"Upload a customer conversation and get AI-powered insights."

Large drag-and-drop upload area.

Supported formats:

MP3, WAV

Show upload icon.

Button:

"Choose Audio"

After selecting a file show:

Filename

File size

Audio player

Remove button

Primary button:

"Analyze Call"

Do NOT redesign or change the backend API.

The frontend must communicate with the existing FastAPI backend.

Use the existing API behavior exactly.

--------------------------------------------------

PROCESSING STATE

--------------------------------------------------

When analysis is running, show a beautiful processing screen.

Steps:

Uploading audio

Transcribing conversation

Analyzing with AI

Saving results

Use animated progress indicators.

Do not fake the final result when making the real API request.

--------------------------------------------------

RESULT PAGE

--------------------------------------------------

After successful analysis, show a professional Call Analysis page.

Header:

"Call Analysis"

Show:

Audio filename

Call status

Analysis completed

--------------------------------------------------

CALL OVERVIEW

--------------------------------------------------

Create four cards:

Call Purpose

Customer Issue

Resolution Status

Next Steps

If a particular value is not returned by the existing backend, do not invent it.

Display only available data.

--------------------------------------------------

TRANSCRIPT

--------------------------------------------------

Create a beautiful transcript section.

Title:

"Conversation Transcript"

Do NOT display the transcript as raw JSON.

Format it as a readable conversation.

If speaker labels are present, display them as:

AGENT

Customer

with visually distinct speaker blocks.

Use a scrollable transcript area.

--------------------------------------------------

AI INSIGHTS

--------------------------------------------------

Create a section:

"AI Call Insights"

Create separate cards for:

Agent Actions

Next Steps

Customer Perspective

Agent Perspective

Map them directly to:

actions_taken_by_agent

next_steps

summary_from_customer_perspective

summary_from_agent_perspective

Do not modify the data.

--------------------------------------------------

CALLS PAGE

--------------------------------------------------

Create a calls history page.

Use a clean table:

Call ID

Audio File

Call Purpose

Status

Created

View

Include:

Search

Status filter

Date filter

Use demo data for the visual layout if the current backend does not provide a calls-list endpoint.

DO NOT create or modify backend endpoints just to support this page.

--------------------------------------------------

ANALYTICS PAGE

--------------------------------------------------

Create a visually impressive analytics dashboard using the available frontend data/demo data.

Charts:

Call volume

Resolution distribution

Call status

Analysis activity

Do not modify the backend to generate these statistics.

--------------------------------------------------

SETTINGS

--------------------------------------------------

Simple settings page.

Show:

Application:

TeleXpert Indore

Backend:

http://127.0.0.1:8000

Connection:

Connected / Disconnected

Do not display API keys.

--------------------------------------------------

IMPORTANT BACKEND RULE

--------------------------------------------------

The backend is already completed.

Treat it as a black box.

DO NOT:

- modify backend code

- create a new backend

- change API endpoints

- change database

- change AssemblyAI

- change Gemini

- change PostgreSQL

- change Python

- change .env

- change API request structure

ONLY build the frontend.

--------------------------------------------------

API CONNECTION

--------------------------------------------------

Use:

VITE_API_URL

with local development value:

http://127.0.0.1:8000

The frontend should call the existing backend.

For the current analysis functionality, preserve:

POST /analyze-call/

with:

audio_file_path

exactly as the existing Streamlit frontend does.

--------------------------------------------------

UX

--------------------------------------------------

Make the dashboard feel like a real commercial product.

Use:

- Smooth page transitions

- Skeleton loading

- Toast notifications

- Empty states

- Error states

- Loading states

- Responsive design

- Accessible buttons

- Clean typography

- Professional icons

Avoid excessive gradients.

Avoid excessive animations.

Avoid unnecessary decorative elements.

The primary focus should be:

CALL ANALYSIS.

The final result should look significantly more professional than the existing Streamlit interface while keeping the exact same backend functionality.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tele-clarity-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d15c702d-e0da-45c5-a787-b388da1d02e0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
