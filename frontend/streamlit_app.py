import streamlit as st
import requests
import tempfile
from pathlib import Path

# -------------------------
# CONFIG
# -------------------------
BACKEND_URL = "http://127.0.0.1:8000"

st.set_page_config(
    page_title="AI Call Analyzer",
    page_icon="📞",
    layout="wide"
)

# -------------------------
# GLOBAL CSS (INLINE ONLY)
# -------------------------
st.markdown("""
<style>

/* =========================
   GLOBAL FIXES
========================= */

html {
    scroll-behavior: smooth;
}

a {
    text-decoration: none !important;
}

.main {
    padding: 0 !important;
}

/* REMOVE STREAMLIT EMPTY WHITE BARS */
div[data-testid="stVerticalBlock"]:has(> div:empty) {
    display: none !important;
}

div[data-testid="stVerticalBlock"] {
    background: transparent !important;
    box-shadow: none !important;
}

div:empty {
    display: none !important;
}

/* =========================
   ANIMATIONS
========================= */

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(25px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* =========================
   HERO SECTION
========================= */

.hero {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 4.5rem 6rem;
    border-radius: 0 0 36px 36px;

    background:
        linear-gradient(
            90deg,
            rgba(0,0,0,0.45) 0%,
            rgba(0,0,0,0.25) 45%,
            rgba(0,0,0,0.1) 100%
        ),
        url('https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1600&q=80');

    background-size: cover;
    background-position: center;
    color: white;
}

.hero-left {
    max-width: 55%;
}

.tag {
    font-size: 2rem;
    letter-spacing: 0.12em;
    color: #22d3ee;
    font-weight: 800;
    margin-bottom: 1.2rem;
    animation: fadeIn 1s ease forwards;
}

.hero-title {
    font-size: 3.4rem;
    font-weight: 800;
    line-height: 1.15;
    animation: fadeUp 1.2s ease forwards;
}

.hero-sub {
    margin-top: 1.2rem;
    font-size: 1.35rem;
    color: #e5e7eb;
    max-width: 90%;
    animation: fadeUp 1.4s ease forwards;
}

/* =========================
   HERO BUTTONS
========================= */

.hero-actions {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.action-btn {
    background: rgba(255,255,255,0.78);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);

    border-radius: 18px;
    padding: 1.2rem 1.8rem;

    display: flex;
    align-items: center;
    gap: 0.9rem;

    font-size: 1.1rem;
    font-weight: 700;

    cursor: pointer;
    color: #111827 !important;

    box-shadow: 0 14px 30px rgba(0,0,0,0.18);
    transition: all 0.25s ease;
    animation: fadeUp 1.6s ease forwards;
}

.action-btn:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 22px 45px rgba(0,0,0,0.3);
    background: rgba(255,255,255,0.9);
}

/* =========================
   SECTIONS
========================= */

.section {
    padding: 3.5rem 6rem;
    animation: fadeUp 0.9s ease both;
}

.card {
    background: white;
    border-radius: 22px;
    padding: 2.2rem;
    box-shadow: 0 12px 30px rgba(0,0,0,0.08);
    animation: fadeUp 1s ease both;
}

/* =========================
   JUMP BUTTONS
========================= */

.jump-btns {
    display: flex;
    gap: 0.7rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
}

.jump-btn {
    background: #eef2ff;
    color: #4338ca;
    border: none;
    padding: 0.55rem 1.1rem;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.jump-btn:hover {
    transform: translateY(-2px);
}

</style>
""", unsafe_allow_html=True)

# -------------------------
# HERO SECTION
# -------------------------
st.markdown("""
<div class="hero">
  <div class="hero-left">
    <div class="tag">TeleXpert Indore</div>
    <div class="hero-title">
        Automate your call analysis<br>
        from the first touchpoint
    </div>
    <div class="hero-sub">
        Upload call audio, get transcription, AI analysis,
        and agent-level insights instantly.
    </div>
  </div>

  <div class="hero-actions">
    <a href="#upload" class="action-btn">📥 Import Call Audio</a>
    <a href="#transcription" class="action-btn">📝 Transcription</a>
    <a href="#analysis" class="action-btn">⚡ AI Analysis</a>
  </div>
</div>
""", unsafe_allow_html=True)

# -------------------------
# UPLOAD SECTION
# -------------------------
st.markdown('<span id="upload"></span>', unsafe_allow_html=True)
st.markdown('<div class="section">', unsafe_allow_html=True)
st.markdown('<div class="card">', unsafe_allow_html=True)

st.subheader("📥 Import Call Audio")

uploaded_file = st.file_uploader(
    "Upload call recording",
    type=["mp3", "wav"]
)

if uploaded_file:
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(uploaded_file.name).suffix) as tmp:
        tmp.write(uploaded_file.read())
        audio_path = tmp.name

    st.audio(audio_path)
    analyze = st.button("Analyze Call")
else:
    analyze = False

st.markdown('</div></div>', unsafe_allow_html=True)

# -------------------------
# ANALYSIS
# -------------------------
if analyze:
    response = requests.post(
        f"{BACKEND_URL}/analyze-call/",
        params={"audio_file_path": audio_path},
        timeout=600
    )
    result = response.json()

    transcript = result.get("transcript")
    analysis = result.get("analysis")

    # Transcription
    st.markdown('<span id="transcription"></span>', unsafe_allow_html=True)
    st.markdown('<div class="section">', unsafe_allow_html=True)
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.subheader("📝 Transcription")
    st.text_area("", transcript, height=320)
    st.markdown('</div></div>', unsafe_allow_html=True)

    # AI Analysis
    st.markdown('<span id="analysis"></span>', unsafe_allow_html=True)
    st.markdown('<div class="section">', unsafe_allow_html=True)
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.subheader("⚡ AI Analysis")
    st.json(analysis)

    st.markdown("""
    <div class="jump-btns">
        <a href="#agent" class="jump-btn">🤖 Agent Actions</a>
        <a href="#next" class="jump-btn">🧭 Next Steps</a>
        <a href="#customer" class="jump-btn">👤 Customer View</a>
        <a href="#agentview" class="jump-btn">🧑‍💼 Agent View</a>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('</div></div>', unsafe_allow_html=True)

    def detail_section(id_, title, content):
        st.markdown(f'<span id="{id_}"></span>', unsafe_allow_html=True)
        st.markdown('<div class="section">', unsafe_allow_html=True)
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.subheader(title)
        st.write(content)
        st.markdown('</div></div>', unsafe_allow_html=True)

    if isinstance(analysis, dict):
        detail_section("agent", "🤖 Agent Actions", analysis.get("actions_taken_by_agent"))
        detail_section("next", "🧭 Next Steps", analysis.get("next_steps"))
        detail_section("customer", "👤 Customer View", analysis.get("summary_from_customer_perspective"))
        detail_section("agentview", "🧑‍💼 Agent View", analysis.get("summary_from_agent_perspective"))
