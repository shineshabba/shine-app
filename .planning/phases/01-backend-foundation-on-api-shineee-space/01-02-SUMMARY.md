---
phase: 01-backend-foundation-on-api-shineee-space
plan: "02"
subsystem: backend
tags: [fastapi, routers, api, rate-limiting, tdd]
dependency_graph:
  requires:
    - auth.validate_init_data (from Plan 01)
    - models.UserProfile, models.ConfigResponse, models.HealthResponse (from Plan 01)
    - main.app, slowapi Limiter (from Plan 01)
    - services/db.py stub (from Plan 01)
    - services/xui.py stub (from Plan 01)
  provides:
    - GET /api/health (no auth)
    - GET /api/me (validate_init_data, 404 for unknown users)
    - GET /api/config (validate_init_data, 403 for inactive subscription)
    - limiter.limiter (shared Limiter instance — extracted to break circular import)
    - GET /docs (Swagger UI)
  affects:
    - backend/main.py (routers wired in)
tech_stack:
  added: []
  patterns:
    - TDD RED→GREEN for router wiring
    - Shared limiter module to break circular import
    - asyncio.get_event_loop().run_in_executor for sync db/xui calls
    - tg_user_id from validate_init_data only (never from request params)
key_files:
  created:
    - backend/routers/health.py
    - backend/routers/me.py
    - backend/routers/config.py
    - backend/limiter.py
    - backend/tests/test_routers.py
  modified:
    - backend/main.py (routers wired in, limiter moved to limiter.py)
decisions:
  - "limiter extracted to backend/limiter.py to break circular import (main imports routers, routers imported limiter from main)"
  - "db.py and xui.py calls wrapped in run_in_executor — both are sync; avoids blocking FastAPI event loop"
  - "tg_user_id set on request.state before db calls so slowapi key_func can use it for rate limiting"
metrics:
  duration_seconds: 420
  completed_date: "2026-05-20"
  tasks_completed: 2
  tasks_total: 2
  files_created: 5
  files_modified: 1
---

# Phase 01 Plan 02: API Routers Summary

Three FastAPI routers (health, me, config) with HMAC auth dependency, rate limiting,
and TDD-verified behavior — 11/11 tests GREEN.

## What Was Built

### Files Created

| File | Purpose |
|------|---------|
| `backend/routers/health.py` | GET /api/health — liveness check, no auth |
| `backend/routers/me.py` | GET /api/me — user profile from SQLite via validate_init_data |
| `backend/routers/config.py` | GET /api/config — VLESS URL for active subscribers |
| `backend/limiter.py` | Shared slowapi Limiter instance (extracted to avoid circular import) |
| `backend/tests/test_routers.py` | 6 router integration tests (all GREEN) |

### Modified Files

| File | Change |
|------|--------|
| `backend/main.py` | Import from `limiter.py`, add `app.include_router` for all three routers, remove inline limiter definition and commented-out stubs |

### Verified Behavior

- `GET /api/health` → 200 `{"status": "ok"}` without auth header
- `GET /api/me` without header → 422 (FastAPI required header validation)
- `GET /api/me` with invalid initData → 401
- `GET /api/config` with invalid initData → 401
- `GET /docs` → 200 (Swagger UI)
- `/openapi.json` contains `/api/health`, `/api/me`, `/api/config`
- 11/11 pytest tests pass (5 auth + 6 router)

### Security Properties (Threat Model)

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-02-01: tg_user_id spoofing | `user_data["id"]` from `validate_init_data` only — never from query/body | Implemented |
| T-02-02: config leak for inactive users | 403 returned before `xui.py` is called | Implemented |
| T-02-03: DoS via heavy xui calls | `@limiter.limit("60/minute")` on /api/config | Implemented |
| T-02-04: stack trace leakage | FastAPI default: no traceback in JSON error | Inherited |
| T-02-05: SQLite concurrent write | WAL mode in db.py, backend read-only | Inherited from Plan 01 |

## Test Results

```
tests/test_auth.py::test_valid_init_data PASSED
tests/test_auth.py::test_missing_hash PASSED
tests/test_auth.py::test_invalid_signature PASSED
tests/test_auth.py::test_expired_init_data PASSED
tests/test_auth.py::test_url_encoded_init_data PASSED
tests/test_routers.py::test_health_no_auth PASSED
tests/test_routers.py::test_me_missing_header PASSED
tests/test_routers.py::test_me_invalid_init_data PASSED
tests/test_routers.py::test_config_invalid_init_data PASSED
tests/test_routers.py::test_docs_available PASSED
tests/test_routers.py::test_openapi_schema PASSED

11 passed in 0.35s
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Circular import between main.py and routers**

- **Found during:** Task 2 (TDD GREEN phase — ImportError on test collection)
- **Issue:** `main.py` imports `routers.me` → `routers.me` imports `limiter` from `main` → circular dependency, `ImportError: cannot import name 'limiter' from 'main'`
- **Fix:** Extracted `limiter = Limiter(key_func=get_user_id_for_limiter)` to a new `backend/limiter.py` module. Both `main.py` and routers import from `limiter.py` instead.
- **Files modified:** `backend/limiter.py` (created), `backend/main.py`, `backend/routers/me.py`, `backend/routers/config.py`
- **Commits:** `6af451b`

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| `get_user_by_tg_id` field mapping | `backend/routers/me.py` L44-54 | Actual vpn-bot SQLite column names unknown (VPS SSH unavailable). Checks multiple candidate names: `subscription_active`, `is_active`, `active`, etc. |
| `get_client_config` function | `backend/services/xui.py` | Stub builds VLESS URL from best-guess x-ui API structure. Replace with actual from VPS when SSH available. |

These stubs do not prevent the plan's goal (API routing with auth and rate limiting). They will produce correct behavior once real `services/db.py` and `services/xui.py` are deployed from VPS (Plan 03).

## Readiness for Plan 03 (systemd deployment)

The backend is ready for VPS deployment:
- `uvicorn main:app --host 127.0.0.1 --port 8000` starts cleanly
- All endpoints registered and verified
- Remaining work: copy real `services/db.py` and `services/xui.py` from `~/vpn-bot/` on VPS, create `.env`, configure systemd unit and nginx vhost

## Self-Check

### Created Files Exist

- `backend/routers/health.py`: FOUND
- `backend/routers/me.py`: FOUND
- `backend/routers/config.py`: FOUND
- `backend/limiter.py`: FOUND
- `backend/tests/test_routers.py`: FOUND
- `backend/main.py`: FOUND (modified)

### Commits Exist

- `bfa36e7`: feat(01-02): create health, me, config API routers — FOUND
- `931c2d2`: test(01-02): add failing tests for router wiring (RED) — FOUND
- `6af451b`: feat(01-02): wire routers in main.py, fix circular import via limiter.py — FOUND

## Self-Check: PASSED
