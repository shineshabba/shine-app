"""
FastAPI application entry point for Shine App Backend.

Run with:
  cd ~/shine-app/backend
  source venv/bin/activate
  uvicorn main:app --host 127.0.0.1 --port 8000

Security:
  - CORS restricted to Vercel origins + localhost (API-06)
  - Rate limiting 60 req/min per tg_user_id via slowapi (API-07)
  - All protected endpoints require X-Telegram-Init-Data header
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from auth import get_user_id_for_limiter

# Rate limiter by tg_user_id (per API-07, T-01-05)
limiter = Limiter(key_func=get_user_id_for_limiter)

app = FastAPI(
    title="Shine App API",
    version="1.0.0",
    description="Backend API for Shine VPN Telegram Mini App",
)

# slowapi middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS (per API-06): Vercel + localhost only
# NOTE: allow_origins wildcard *.vercel.app does NOT work in starlette.
# Use allow_origin_regex instead (see RESEARCH.md Pitfall 2).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["X-Telegram-Init-Data", "Content-Type"],
)

# Routers will be connected in Plan 02 after router files are created:
# from routers import health, me, config
# app.include_router(health.router, prefix="/api")
# app.include_router(me.router, prefix="/api")
# app.include_router(config.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """Health endpoint for load balancer / uptime monitoring. No auth required."""
    return {"status": "ok"}
