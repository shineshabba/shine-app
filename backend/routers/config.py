import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from auth import validate_init_data
from models import ConfigResponse
from limiter import limiter
from services.db import get_user, is_access_active
from services.xui import XUIClient

router = APIRouter()
_xui = XUIClient()


@router.get("/config", response_model=ConfigResponse)
@limiter.limit("60/minute")
async def get_config(
    request: Request,
    user_data: dict = Depends(validate_init_data),
):
    tg_user_id = user_data["id"]
    request.state.tg_user_id = tg_user_id

    loop = asyncio.get_running_loop()
    user = await loop.run_in_executor(None, get_user, tg_user_id)

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if not is_access_active(user):
        raise HTTPException(status_code=403, detail="Subscription not active")

    client_id = user["client_id"]
    if not client_id:
        raise HTTPException(status_code=404, detail="VPN config not found")

    username = user["tg_username"] or str(tg_user_id)
    config = await _xui.get_client_config(tg_user_id, username)

    if not config:
        raise HTTPException(status_code=404, detail="VPN config not found in x-ui")

    vless_url = _xui.build_vless_link(config["client_id"], config["inbound"])
    return ConfigResponse(vless_url=vless_url)
