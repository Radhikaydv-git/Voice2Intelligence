import json
import psycopg2
from psycopg2 import OperationalError, DatabaseError


def save_call_analysis(data: dict, transcript, audio_file: str):
    """
    Stores call transcript and AI analysis safely as JSON.
    """

    query = """
    INSERT INTO calls (
        audio_file,
        transcript,
        analysis_json
    )
    VALUES (%s, %s, %s);
    """

    conn = None

    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="callcenter_db",
            user="postgres",
            password="postgres123",
        )

        with conn.cursor() as cur:
            cur.execute(
                query,
                (
                    audio_file,
                    json.dumps(transcript, ensure_ascii=False),  # 🔥 FIX
                    json.dumps(data, ensure_ascii=False)         # 🔥 FIX
                )
            )

        conn.commit()

    except (OperationalError, DatabaseError) as db_err:
        if conn:
            conn.rollback()
        raise RuntimeError(f"Database error: {db_err}")

    finally:
        if conn:
            conn.close()
