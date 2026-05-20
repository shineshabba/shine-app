"""
GET /api/me endpoint — user profile from SQLite.

Security (T-02-01):
  tg_user_id is extracted ONLY from validate_init_data result (validated initData),
  never from request body or query parameters.
"""
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from auth import validate_init_data
from models import UserProfile
from limiter import limiter
from services.db import get_user_by_tg_id

router = APIRouter()


@router.get("/me", response_model=UserProfile)
@limiter.limit("60/minute")
async def get_me(
    request: Request,
    user_data: dict = Depends(validate_init_data),
):
    """
    GET /api/me — профиль юзера (API-01, D-05).

    tg_user_id берётся ТОЛЬКО из user_data (из валидированного initData),
    никогда из query/body (AUTH-03, T-02-01).
    """
    tg_user_id = user_data["id"]  # from validated initData, AUTH-03

    # Store in request.state for slowapi key_func
    request.state.tg_user_id = tg_user_id

    # db.py uses sync sqlite3 — run in executor to avoid blocking the event loop
    loop = asyncio.get_event_loop()
    user = await loop.run_in_executor(None, get_user_by_tg_id, tg_user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found. Please /start in @shine_connect_bot")

    # Map db row fields to UserProfile schema
    # Actual field names depend on vpn-bot schema (stub uses best-guess names)
    sub_active = bool(
        user.get("subscription_active")
        or user.get("is_active")
        or user.get("active")
    )
    sub_end = (
        user.get("subscription_end")
        or user.get("sub_end")
        or user.get("paid_until")
        or user.get("expiry_date")
    )

    return UserProfile(
        tg_user_id=tg_user_id,
        name=user.get("name") or user.get("first_name") or "User",
        subscription_active=sub_active,
        subscription_end=sub_end,
        device_limit=int(user.get("device_limit") or user.get("devices_limit") or 5),
    )
