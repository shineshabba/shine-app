"""
Telegram initData HMAC-SHA256 validation dependency for FastAPI.

Security: implements all mitigations from threat model:
  T-01-01: hmac.compare_digest() prevents timing attacks
  T-01-02: HMAC-SHA256 signature check on all data
  T-01-03: auth_date expiry check (24h / 86400s)
  T-01-04: tg_user_id extracted ONLY from validated initData
  T-01-08: BOT_TOKEN via os.environ[] (KeyError if missing — fail-fast)
"""
import hashlib
import hmac
import json
import os
import time
from urllib.parse import unquote, parse_qsl

from fastapi import Header, HTTPException, Request


def validate_init_data(x_telegram_init_data: str = Header(...)) -> dict:
    """
    Validate Telegram initData (AUTH-01, AUTH-03, AUTH-05).

    Returns user dict from initData (contains 'id', 'first_name', etc.).
    Raises HTTPException(401) for invalid, missing, or expired initData.

    tg_user_id is extracted ONLY from this validated dict — never from
    request body or query parameters (AUTH-03, T-01-04).
    """
    try:
        parsed = dict(parse_qsl(unquote(x_telegram_init_data), keep_blank_values=True))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid initData format")

    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=401, detail="Missing hash")

    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed.items())
    )

    # T-01-08: KeyError if BOT_TOKEN missing — intentional fail-fast
    bot_token = os.environ["BOT_TOKEN"]
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    # T-01-01: constant-time comparison prevents timing attacks
    if not hmac.compare_digest(computed_hash, received_hash):
        raise HTTPException(status_code=401, detail="Invalid initData signature")

    # T-01-03: reject initData older than 24 hours
    auth_date = int(parsed.get("auth_date", 0))
    if time.time() - auth_date > 86400:
        raise HTTPException(status_code=401, detail="initData expired")

    user_data = json.loads(parsed.get("user", "{}"))
    return user_data


def get_user_id_for_limiter(request: Request) -> str:
    """
    Key function for slowapi rate limiter.

    Returns str(tg_user_id) if stored in request.state (set after validation),
    otherwise falls back to client IP address for unauthenticated endpoints.
    """
    tg_user_id = getattr(request.state, "tg_user_id", None)
    if tg_user_id:
        return str(tg_user_id)
    return request.client.host if request.client else "unknown"
