"""
GET /api/config endpoint — VLESS URL for active subscribers.

Security:
  T-02-01: tg_user_id from validate_init_data only
  T-02-02: VLESS URL returned ONLY after confirming subscription_active=True
"""
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from auth import validate_init_data
from models import ConfigResponse
from limiter import limiter
from services.db import get_user_by_tg_id
from services.xui import get_client_config

router = APIRouter()


@router.get("/config", response_model=ConfigResponse)
@limiter.limit("60/minute")
async def get_config(
    request: Request,
    user_data: dict = Depends(validate_init_data),
):
    """
    GET /api/config — VLESS-ссылка для активного подписчика (API-02, D-06).

    Returns 403 if subscription is not active (T-02-02).
    tg_user_id is NEVER accepted as a request parameter (AUTH-03, T-02-01).
    """
    tg_user_id = user_data["id"]  # from validated initData, AUTH-03

    # Store in request.state for slowapi key_func
    request.state.tg_user_id = tg_user_id

    loop = asyncio.get_event_loop()

    # Check subscription status first — T-02-02: VLESS never generated for inactive users
    user = await loop.run_in_executor(None, get_user_by_tg_id, tg_user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    is_active = bool(
        user.get("subscription_active")
        or user.get("is_active")
        or user.get("active")
    )
    if not is_active:
        raise HTTPException(status_code=403, detail="Subscription not active")

    # xui.py is synchronous (uses requests) — wrap in executor (T-02-03)
    vless_url = await loop.run_in_executor(None, get_client_config, tg_user_id)

    if not vless_url:
        raise HTTPException(status_code=404, detail="VPN config not found")

    return ConfigResponse(vless_url=vless_url)
