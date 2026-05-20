---
phase: 01-backend-foundation-on-api-shineee-space
reviewed: 2026-05-20T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - .gitignore
  - backend/.env.example
  - backend/.gitignore
  - backend/__init__.py
  - backend/auth.py
  - backend/deploy/deploy.sh
  - backend/deploy/shine-app-backend.service
  - backend/limiter.py
  - backend/main.py
  - backend/models.py
  - backend/requirements.txt
  - backend/routers/__init__.py
  - backend/routers/config.py
  - backend/routers/health.py
  - backend/routers/me.py
  - backend/services/__init__.py
  - backend/tests/__init__.py
  - backend/tests/test_auth.py
  - backend/tests/test_routers.py
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-20T00:00:00Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

Reviewed the full FastAPI backend foundation for the Shine Mini App. The overall structure is sound: HMAC validation is correct, rate limiting is wired up, and CORS settings follow the intended design. Two critical issues were found — an unanchored CORS origin regex that allows subdomain spoofing, and an unhandled `json.JSONDecodeError` in the auth path that produces a 500 instead of a 401. Five warnings cover deprecated async patterns, unsafe dict access, a hardcoded magic number, and a service running as root. Three info items cover local dev ergonomics and test coverage gaps.

---

## Critical Issues

### CR-01: CORS `allow_origin_regex` is unanchored — allows origin spoofing

**File:** `backend/main.py:40`
**Issue:** The regex `r"https://.*\.vercel\.app"` has no start/end anchors. Starlette matches the regex against the full `Origin` header value, but without anchors a crafted origin like `https://evil.vercel.app.attacker.com` matches because `.*` consumes `evil` and `\.vercel\.app` matches `.vercel.app` mid-string. An attacker hosting `attacker.com` with a path component matching the pattern could trick a loose regex engine. Use strict anchors and a restricted character class for the subdomain.

**Fix:**
```python
allow_origin_regex=r"^https://[a-zA-Z0-9][a-zA-Z0-9\-]*\.vercel\.app$",
```

---

### CR-02: Unhandled `json.JSONDecodeError` in `validate_init_data` returns HTTP 500

**File:** `backend/auth.py:60`
**Issue:** `json.loads(parsed.get("user", "{}"))` is not wrapped in a try/except. If Telegram sends a `user` field with malformed JSON (or an attacker sends a crafted header), `json.JSONDecodeError` propagates uncaught through FastAPI's exception handlers and returns a 500 Internal Server Error rather than the expected 401. This also leaks stack-trace detail in non-production FastAPI builds.

**Fix:**
```python
try:
    user_data = json.loads(parsed.get("user", "{}"))
except json.JSONDecodeError:
    raise HTTPException(status_code=401, detail="Invalid user data in initData")
return user_data
```

---

## Warnings

### WR-01: `asyncio.get_event_loop()` is deprecated in coroutines — use `get_running_loop()`

**File:** `backend/routers/config.py:22`, `backend/routers/me.py:21`
**Issue:** Calling `asyncio.get_event_loop()` from within a running coroutine is deprecated since Python 3.10 and emits a `DeprecationWarning`. In Python 3.12 (the project's target runtime) this may behave unexpectedly if no current event loop is set on the thread. The correct call inside an `async def` is `asyncio.get_running_loop()`, which is guaranteed to return the loop that is currently executing the coroutine.

**Fix:**
```python
# config.py line 22 and me.py line 21 — replace:
loop = asyncio.get_event_loop()
# with:
loop = asyncio.get_running_loop()
```

---

### WR-02: Unguarded `user["client_id"]` dict access — KeyError crashes with HTTP 500

**File:** `backend/routers/config.py:31`
**Issue:** `client_id = user["client_id"]` uses direct key access on the dict returned by `get_user`. If the underlying database row has no `client_id` column (schema mismatch) or the service stub returns a dict without that key, this raises `KeyError` and FastAPI returns 500. The `None` check on the next line assumes the key already exists.

**Fix:**
```python
client_id = user.get("client_id")
if not client_id:
    raise HTTPException(status_code=404, detail="VPN config not found")
```

---

### WR-03: Unguarded `user["tg_full_name"]` access — KeyError crashes with HTTP 500

**File:** `backend/routers/me.py:29`
**Issue:** `user["tg_full_name"]` uses direct key access. Same class of problem as WR-02 — a schema mismatch or missing column returns a KeyError 500 instead of a graceful response. The surrounding `or` chain implies the value may be absent, but that intent requires `.get()` to be safe.

**Fix:**
```python
name=user.get("tg_full_name") or user.get("first_name") or "User",
```

---

### WR-04: `device_limit` hardcoded as magic number — not sourced from database

**File:** `backend/routers/me.py:32`
**Issue:** `device_limit=5` is hardcoded. The `UserProfile` model exposes this field as part of the API contract consumed by the frontend. If a user's actual limit differs (or limits change), the frontend will display the wrong value silently. This should either be sourced from the database or defined as a named constant.

**Fix:**
```python
# Option A: constant at module top
DEVICE_LIMIT_DEFAULT = 5
# ...
device_limit=user.get("device_limit", DEVICE_LIMIT_DEFAULT),

# Option B (preferred once db schema is confirmed):
device_limit=user["device_limit"],
```

---

### WR-05: `systemd` service runs as `root` — unnecessarily broad privilege

**File:** `backend/deploy/shine-app-backend.service:7`
**Issue:** `User=root` means a vulnerability in the FastAPI app or its dependencies would give an attacker full root access to the VPS. The app only needs read access to the SQLite database at `/root/vpn-bot/users.db` and the ability to make HTTP calls to the local x-ui panel. A dedicated low-privilege user is the standard mitigation.

**Fix:**
```ini
User=shineapp
# Before deploying, on the VPS:
#   adduser --system --no-create-home --group shineapp
#   chown shineapp:shineapp /root/shine-app/backend/.env
#   # Grant read-only access to the vpn-bot database:
#   setfacl -m u:shineapp:r /root/vpn-bot/users.db
```

---

## Info

### IN-01: `python-dotenv` is listed in requirements but never called — `.env` not auto-loaded in local dev

**File:** `backend/requirements.txt:4`, `backend/main.py` (absent)
**Issue:** `python-dotenv==1.2.2` is listed in requirements. The systemd service loads `.env` via `EnvironmentFile=`, which works in production. However, there is no `load_dotenv()` call in `main.py`, so running `uvicorn main:app` locally without manually exporting env vars will cause `os.environ["BOT_TOKEN"]` to raise `KeyError` immediately. Developers need either a call to `load_dotenv()` in `main.py` or clear documentation in the README.

**Suggestion:**
```python
# main.py — add near top, before any os.environ access:
from dotenv import load_dotenv
load_dotenv()  # no-op if .env not present (safe for production)
```

---

### IN-02: Module-level `XUIClient()` instantiation — startup side-effects at import time

**File:** `backend/routers/config.py:10`
**Issue:** `_xui = XUIClient()` runs at module import time. If `XUIClient.__init__` reads environment variables, opens connections, or performs I/O (likely, given it wraps an HTTP panel), the module will fail to import if the environment is not fully configured — including during `pytest` test collection. This causes confusing import errors rather than clear test failures.

**Suggestion:** Use lazy initialization or FastAPI's `lifespan` hook to create the client after the app has started and the environment is confirmed loaded.

---

### IN-03: No happy-path integration tests for `/api/me` and `/api/config`

**File:** `backend/tests/test_routers.py`
**Issue:** The router tests only cover missing/invalid auth cases (negative path). There are no tests that mock `services.db.get_user` and `services.xui.XUIClient` to verify the full success path — including the correct shape of the JSON response, the `device_limit` value, and the `vless_url` format. Without these, a breaking change in the response schema would not be caught before deployment.

**Suggestion:** Add at least one success-path test per endpoint using `unittest.mock.patch` on the service layer:
```python
from unittest.mock import patch, AsyncMock

@patch.dict(os.environ, {"BOT_TOKEN": "test_token"})
@patch("routers.me.get_user", return_value={...})
def test_me_success(mock_get_user):
    init_data = make_init_data("test_token")
    resp = client.get("/api/me", headers={"X-Telegram-Init-Data": init_data})
    assert resp.status_code == 200
    assert resp.json()["tg_user_id"] == 123456789
```

---

_Reviewed: 2026-05-20T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
