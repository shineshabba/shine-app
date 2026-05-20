"""
SQLite database access service.

STUB: This file is a placeholder. On the VPS, replace with:
  cp ~/vpn-bot/services/db.py ~/shine-app/backend/services/db.py

Expected functions based on vpn-bot architecture:
  - get_user_by_tg_id(tg_user_id: int) -> dict | None
  - check_subscription(tg_user_id: int) -> dict | None
  - get_all_users() -> list[dict]

The actual implementation reads from ~/vpn-bot/users.db (SQLite).
Tables: users, payments, acceptance_log

Deploy command:
  ssh root@205.172.56.163 "cp ~/vpn-bot/services/db.py ~/shine-app/backend/services/db.py"
"""
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from typing import Optional

DB_PATH = os.environ.get("DB_PATH", "/root/vpn-bot/users.db")


@contextmanager
def get_connection():
    """Open SQLite connection in WAL mode (read-safe with concurrent bot writes)."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
    finally:
        conn.close()


def get_user_by_tg_id(tg_user_id: int) -> Optional[dict]:
    """
    Fetch user record by Telegram user ID.
    Returns dict with user fields or None if not found.

    STUB: Replace with actual implementation from ~/vpn-bot/services/db.py
    """
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE tg_user_id = ?", (tg_user_id,)
        ).fetchone()
        return dict(row) if row else None


def check_subscription(tg_user_id: int) -> Optional[dict]:
    """
    Check subscription status for a user.
    Returns subscription dict or None.

    STUB: Replace with actual implementation from ~/vpn-bot/services/db.py
    Expected keys: active (bool), end_date (str|None), device_limit (int)
    """
    user = get_user_by_tg_id(tg_user_id)
    if not user:
        return None

    # STUB: actual logic depends on vpn-bot schema
    # This is a best-guess implementation
    end_date_str = user.get("subscription_end") or user.get("sub_end") or user.get("paid_until")
    active = False
    end_date = None

    if end_date_str:
        try:
            end_date = datetime.fromisoformat(str(end_date_str)).date()
            active = end_date >= datetime.now().date()
        except (ValueError, TypeError):
            pass

    return {
        "active": active,
        "end_date": end_date,
        "device_limit": 5,  # per PROJECT.md: limit 5 IP per client
    }
