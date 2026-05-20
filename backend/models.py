"""
Pydantic response schemas for Shine App API.

These models define the API contract consumed by the frontend (Plan 03).
"""
from datetime import date
from typing import Optional

from pydantic import BaseModel


class UserProfile(BaseModel):
    """Response schema for GET /api/me (D-05)."""
    tg_user_id: int
    name: str
    subscription_active: bool
    subscription_end: Optional[date] = None  # None if never subscribed
    device_limit: int


class ConfigResponse(BaseModel):
    """Response schema for GET /api/config (D-06)."""
    vless_url: str


class HealthResponse(BaseModel):
    """Response schema for GET /api/health (API-03)."""
    status: str  # always "ok"
