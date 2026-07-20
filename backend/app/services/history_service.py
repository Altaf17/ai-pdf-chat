import sqlite3
import os
from datetime import datetime, timezone

_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "chat_history.db")
_DB_PATH = os.path.abspath(_DB_PATH)


def _conn() -> sqlite3.Connection:
    con = sqlite3.connect(_DB_PATH, check_same_thread=False)
    con.row_factory = sqlite3.Row
    return con


def init_db():
    with _conn() as con:
        con.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_id    TEXT NOT NULL,
                role      TEXT NOT NULL,
                text      TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        con.execute("CREATE INDEX IF NOT EXISTS idx_doc_id ON messages(doc_id)")


def save_message(doc_id: str, role: str, text: str):
    with _conn() as con:
        con.execute(
            "INSERT INTO messages (doc_id, role, text, created_at) VALUES (?, ?, ?, ?)",
            (doc_id, role, text, datetime.now(timezone.utc).isoformat()),
        )


def get_history(doc_id: str) -> list[dict]:
    with _conn() as con:
        rows = con.execute(
            "SELECT role, text, created_at FROM messages WHERE doc_id = ? ORDER BY id",
            (doc_id,),
        ).fetchall()
    return [dict(r) for r in rows]
