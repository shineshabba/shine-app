import sqlite3
import os
from contextlib import contextmanager
from datetime import datetime, timezone

DB_PATH = os.path.expanduser("~/vpn-bot/users.db")
TOS_VERSION = "1.0"


def init_db():
    with _conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                tg_user_id     INTEGER PRIMARY KEY,
                tg_username    TEXT,
                tg_full_name   TEXT,
                phone_number   TEXT,
                phone_verified INTEGER DEFAULT 0,
                first_name     TEXT,
                last_name      TEXT,
                referral_source TEXT,
                tos_accepted_at TEXT,
                registered_at  TEXT,
                client_id      TEXT,
                is_registered  INTEGER DEFAULT 0,
                admin_reviewed INTEGER DEFAULT 0,
                access_until   TEXT,
                created_at     TEXT
            );

            CREATE TABLE IF NOT EXISTS payments (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id         INTEGER,
                confirmed_at    TEXT,
                period_days     INTEGER DEFAULT 30,
                confirmed_by    INTEGER,
                note            TEXT
            );

            CREATE TABLE IF NOT EXISTS acceptance_log (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id          INTEGER,
                timestamp        TEXT,
                document_version TEXT
            );
        """)
        # Migration: добавляем колонку если её нет (для существующих БД)
        try:
            conn.execute("ALTER TABLE users ADD COLUMN admin_reviewed INTEGER DEFAULT 0")
        except Exception:
            pass  # Колонка уже существует


@contextmanager
def _conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_user(tg_user_id: int):
    with _conn() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE tg_user_id = ?", (tg_user_id,)
        ).fetchone()


def get_all_registered():
    with _conn() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE is_registered = 1"
        ).fetchall()


def upsert_user(**kwargs):
    with _conn() as conn:
        uid = kwargs["tg_user_id"]
        existing = conn.execute(
            "SELECT 1 FROM users WHERE tg_user_id = ?", (uid,)
        ).fetchone()
        if existing:
            fields = {k: v for k, v in kwargs.items() if k != "tg_user_id"}
            if not fields:
                return
            sets = ", ".join(f"{k} = ?" for k in fields)
            vals = list(fields.values()) + [uid]
            conn.execute(f"UPDATE users SET {sets} WHERE tg_user_id = ?", vals)
        else:
            keys = ", ".join(kwargs.keys())
            placeholders = ", ".join("?" * len(kwargs))
            conn.execute(
                f"INSERT INTO users ({keys}) VALUES ({placeholders})",
                list(kwargs.values())
            )


def set_admin_reviewed(tg_user_id: int):
    """Отметить что admin рассмотрел заявку (нажал любую кнопку)."""
    with _conn() as conn:
        conn.execute(
            "UPDATE users SET admin_reviewed = 1 WHERE tg_user_id = ?",
            (tg_user_id,)
        )


def set_approved(tg_user_id: int, client_id: str, days: int = 30):
    from datetime import timedelta
    until = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
    with _conn() as conn:
        conn.execute(
            "UPDATE users SET client_id = ?, access_until = ?, admin_reviewed = 1 WHERE tg_user_id = ?",
            (client_id, until, tg_user_id)
        )


def extend_access(tg_user_id: int, days: int, confirmed_by: int):
    from datetime import timedelta
    with _conn() as conn:
        row = conn.execute(
            "SELECT access_until FROM users WHERE tg_user_id = ?", (tg_user_id,)
        ).fetchone()
        if row and row["access_until"]:
            try:
                base = datetime.fromisoformat(row["access_until"])
                if base < datetime.now(timezone.utc):
                    base = datetime.now(timezone.utc)
            except Exception:
                base = datetime.now(timezone.utc)
        else:
            base = datetime.now(timezone.utc)

        until = (base + timedelta(days=days)).isoformat()
        conn.execute(
            "UPDATE users SET access_until = ?, admin_reviewed = 1 WHERE tg_user_id = ?",
            (until, tg_user_id)
        )
        conn.execute(
            "INSERT INTO payments (user_id, confirmed_at, period_days, confirmed_by) VALUES (?, ?, ?, ?)",
            (tg_user_id, now_iso(), days, confirmed_by)
        )
    return until


def expire_user(tg_user_id: int):
    with _conn() as conn:
        conn.execute(
            "UPDATE users SET access_until = ? WHERE tg_user_id = ?",
            (now_iso(), tg_user_id)
        )


def log_tos(user_id: int):
    with _conn() as conn:
        conn.execute(
            "INSERT INTO acceptance_log (user_id, timestamp, document_version) VALUES (?, ?, ?)",
            (user_id, now_iso(), TOS_VERSION)
        )


def is_access_active(user_row) -> bool:
    if user_row is None:
        return False
    until = user_row["access_until"]
    if not until:
        return False
    try:
        return datetime.fromisoformat(until) > datetime.now(timezone.utc)
    except Exception:
        return False


def get_expiring_users(days_before: int = 3):
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    cutoff = (now + timedelta(days=days_before)).isoformat()
    with _conn() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE access_until IS NOT NULL "
            "AND access_until <= ? AND access_until >= ? AND is_registered = 1",
            (cutoff, now.isoformat())
        ).fetchall()
