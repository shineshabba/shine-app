---
phase: 01-backend-foundation-on-api-shineee-space
plan: "01"
subsystem: backend
tags: [fastapi, auth, hmac, pydantic, cors, rate-limiting]
dependency_graph:
  requires: []
  provides:
    - auth.validate_init_data (FastAPI dependency for all protected routes)
    - auth.get_user_id_for_limiter (slowapi key_func)
    - models.UserProfile, models.ConfigResponse, models.HealthResponse
    - main.app (FastAPI instance)
    - main.limiter (slowapi Limiter instance)
    - services/db.py (stub — replace from VPS ~/vpn-bot/services/db.py)
    - services/xui.py (stub — replace from VPS ~/vpn-bot/services/xui.py)
  affects: []
tech_stack:
  added:
    - fastapi[standard]==0.136.1
    - uvicorn==0.47.0
    - slowapi==0.1.9
    - python-dotenv==1.2.2
    - httpx==0.28.1
    - requests==2.32.3
    - pytest==8.3.5
  patterns:
    - FastAPI Dependency injection for auth
    - TDD (RED→GREEN) for auth validation
    - allow_origin_regex for *.vercel.app CORS
    - slowapi Limiter with tg_user_id key_func
key_files:
  created:
    - backend/auth.py
    - backend/models.py
    - backend/main.py
    - backend/services/db.py (stub)
    - backend/services/xui.py (stub)
    - backend/requirements.txt
    - backend/.env.example
    - backend/tests/test_auth.py
    - backend/__init__.py
    - backend/services/__init__.py
    - backend/routers/__init__.py
    - backend/tests/__init__.py
    - backend/.gitignore
  modified: []
decisions:
  - "xui.py stub uses sync requests (not httpx) — matches assumed vpn-bot implementation; wrap in run_in_executor in Plan 02 if needed"
  - "db.py stub includes WAL mode pragma for concurrent read safety (T-01-06)"
  - "services copied as stubs because VPS SSH port 22 is closed; files structured to be drop-in replaceable"
metrics:
  duration_seconds: 289
  completed_date: "2026-05-20"
  tasks_completed: 3
  tasks_total: 3
  files_created: 13
  files_modified: 0
---

# Phase 01 Plan 01: Backend Skeleton Summary

FastAPI backend skeleton with HMAC auth, Pydantic schemas, CORS+rate-limiting,
and interface-compatible service stubs for SQLite and x-ui integration.

## What Was Built

### Files Created

| File | Purpose |
|------|---------|
| `backend/auth.py` | Telegram initData HMAC-SHA256 validation FastAPI Dependency |
| `backend/models.py` | Pydantic response schemas: UserProfile, ConfigResponse, HealthResponse |
| `backend/main.py` | FastAPI app with CORSMiddleware + SlowAPIMiddleware |
| `backend/services/db.py` | SQLite access stub (replace from VPS when SSH available) |
| `backend/services/xui.py` | x-ui API client stub (replace from VPS when SSH available) |
| `backend/requirements.txt` | Python dependencies |
| `backend/.env.example` | Environment variable template |
| `backend/tests/test_auth.py` | 5 tests for auth.py (all GREEN) |
| `backend/.gitignore` | Excludes .env, venv/, __pycache__ |

### Verified Behavior

- `from main import app, limiter` — imports without error
- `uvicorn main:app` starts successfully, `/api/health` returns `{"status":"ok"}`
- 5/5 pytest tests pass for auth validation
- CORS: `allow_origin_regex=r"https://.*\.vercel\.app"` — wildcard via regex
- Rate limiter: `Limiter(key_func=get_user_id_for_limiter)` — 60/min per tg_user_id

## Function Names in db.py (Stub)

For Plan 02 router implementation:

| Function | Signature | Returns |
|----------|-----------|---------|
| `get_user_by_tg_id` | `(tg_user_id: int) -> Optional[dict]` | User row dict or None |
| `check_subscription` | `(tg_user_id: int) -> Optional[dict]` | `{active, end_date, device_limit}` or None |

**Note:** These are stub implementations. The actual function names/signatures from `~/vpn-bot/services/db.py` must be verified when SSH access is restored. Plan 02 routers should import from `services.db` and use these names — update if they differ.

## Function Names in xui.py (Stub)

For Plan 02 router implementation:

| Function | Signature | Returns |
|----------|-----------|---------|
| `get_client_config` | `(tg_user_id: int) -> Optional[str]` | VLESS URL string or None |
| `get_inbound_clients` | `() -> list` | List of x-ui client dicts |

**Note:** Stub assumes `tg_user_id` is stored in x-ui client `email` or `remark` field. Verify from actual `~/vpn-bot/services/xui.py` when VPS SSH is accessible.

**xui.py uses:** sync `requests` library (not async httpx). Plan 02 must wrap calls in `asyncio.get_event_loop().run_in_executor(None, func)` to avoid blocking the FastAPI event loop.

## Environment Variables

Complete list for `.env` on VPS:

| Variable | Value | Source |
|----------|-------|--------|
| `BOT_TOKEN` | Telegram bot token from BotFather | Required for HMAC validation |
| `DB_PATH` | `/root/vpn-bot/users.db` | SQLite path (D-04) |
| `XUI_BASE_URL` | `http://127.0.0.1:21008` | x-ui panel URL |
| `XUI_PASSWORD` | (admin password) | x-ui admin credentials |
| `XUI_INBOUND_ID` | `2` | VPN inbound ID (from CONTEXT.md) |

**Important:** Verify `XUI_PASSWORD` variable name against actual `~/vpn-bot/services/xui.py` — the stub assumes this name. Additional variables (e.g., `XUI_USERNAME`) may be needed.

## xui.py: sync or async?

**Stub uses:** `requests` (synchronous). This is consistent with the assumption that the vpn-bot was written before the FastAPI migration.

**Action needed for Plan 02:** Wrap xui.py calls in async routers:
```python
import asyncio
vless_url = await asyncio.get_event_loop().run_in_executor(
    None, get_client_config, tg_user_id
)
```

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written.

### Infrastructure Deviations

**[Infrastructure Gate] VPS SSH Unreachable**
- **Found during:** Task 1 (attempt to SSH to 205.172.56.163)
- **Issue:** Port 22 refused connection on all common SSH ports (22, 222, 2222, 2200, 8022, 4444, 10022). VPS reachable on port 443 but SSH unavailable.
- **Impact:** Could not copy actual `services/db.py` and `services/xui.py` from `~/vpn-bot/services/`
- **Mitigation:** Created interface-compatible stubs in the git repo. Stubs are drop-in replaceable once SSH is restored.
- **VPS deployment steps (when SSH is available):**
  ```bash
  ssh root@205.172.56.163
  mkdir -p ~/shine-app/backend/services ~/shine-app/backend/routers ~/shine-app/backend/tests
  # Pull this code:
  cd ~/shine-app && git pull
  # Replace stubs with actual vpn-bot services:
  cp ~/vpn-bot/services/db.py ~/shine-app/backend/services/db.py
  cp ~/vpn-bot/services/xui.py ~/shine-app/backend/services/xui.py
  # Verify env vars in xui.py match .env.example
  grep -E "os\.environ|os\.getenv" ~/shine-app/backend/services/xui.py
  # Install and test:
  cd ~/shine-app/backend && python3 -m venv venv
  source venv/bin/activate && pip install -r requirements.txt
  python3 -m pytest tests/test_auth.py -v
  python3 -c "from main import app; print('OK')"
  ```

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| `get_user_by_tg_id` implementation | `backend/services/db.py` | ~37 | Actual schema unknown — VPS SSH unavailable |
| `check_subscription` implementation | `backend/services/db.py` | ~56 | Best-guess field names (subscription_end / sub_end / paid_until) |
| `get_client_config` implementation | `backend/services/xui.py` | ~52 | Actual vpn-bot mapping logic unknown — VPS SSH unavailable |
| `_get_session` XUI login | `backend/services/xui.py` | ~26 | Assumes username="admin" — verify actual xui.py |

These stubs are replaced when actual vpn-bot services are copied from VPS (per D-03).

## Self-Check

### Created Files Exist
- `backend/auth.py`: FOUND
- `backend/models.py`: FOUND
- `backend/main.py`: FOUND
- `backend/services/db.py`: FOUND
- `backend/services/xui.py`: FOUND
- `backend/requirements.txt`: FOUND
- `backend/.env.example`: FOUND
- `backend/tests/test_auth.py`: FOUND

### Commits Exist
- `da3eff2`: chore(01-01): scaffold backend structure and service stubs
- `5d9055d`: test(01-01): add failing tests for auth.py HMAC validation
- `6dfb809`: feat(01-01): implement auth.py HMAC validation and models.py schemas
- `0a66548`: feat(01-01): create main.py with FastAPI app, CORS, and rate limiting

## Self-Check: PASSED
