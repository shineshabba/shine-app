"""
GET /api/health endpoint — liveness check, no auth required.
"""
from fastapi import APIRouter
from models import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """GET /api/health — проверка живости backend (API-03). Без авторизации."""
    return HealthResponse(status="ok")
