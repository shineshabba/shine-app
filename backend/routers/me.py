import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from auth import validate_init_data
from models import UserProfile
from limiter import limiter
from services.db import get_user, is_access_active

router = APIRouter()


@router.get("/me", response_model=UserProfile)
@limiter.limit("60/minute")
async def get_me(
    request: Request,
    user_data: dict = Depends(validate_init_data),
):
    tg_user_id = user_data["id"]
    request.state.tg_user_id = tg_user_id

    loop = asyncio.get_event_loop()
    user = await loop.run_in_executor(None, get_user, tg_user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found. Please /start in @shine_connect_bot")

    return UserProfile(
        tg_user_id=tg_user_id,
        name=user["tg_full_name"] or user["first_name"] or "User",
        subscription_active=is_access_active(user),
        subscription_end=user["access_until"],
        device_limit=5,
    )
