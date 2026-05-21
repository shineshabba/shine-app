---
phase: 01-backend-foundation-on-api-shineee-space
fixed_at: 2026-05-21T00:00:00Z
review_path: .planning/phases/01-backend-foundation-on-api-shineee-space/01-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-05-21T00:00:00Z
**Source review:** .planning/phases/01-backend-foundation-on-api-shineee-space/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (2 Critical, 5 Warning)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: CORS `allow_origin_regex` is unanchored — allows origin spoofing

**Files modified:** `backend/main.py`
**Commit:** efc948f
**Applied fix:** Replaced `r"https://.*\.vercel\.app"` with `r"^https://[a-zA-Z0-9][a-zA-Z0-9\-]*\.vercel\.app$"` — added start/end anchors and restricted subdomain to alphanumeric characters with hyphens.

---

### CR-02: Unhandled `json.JSONDecodeError` in `validate_init_data` returns HTTP 500

**Files modified:** `backend/auth.py`
**Commit:** 9ed26ba
**Applied fix:** Wrapped `json.loads(parsed.get("user", "{}"))` in a `try/except json.JSONDecodeError` block that raises `HTTPException(status_code=401, detail="Invalid user data in initData")` instead of propagating a 500.

---

### WR-01: `asyncio.get_event_loop()` is deprecated in coroutines — use `get_running_loop()`

**Files modified:** `backend/routers/config.py`, `backend/routers/me.py`
**Commit:** 98713cf
**Applied fix:** Replaced `asyncio.get_event_loop()` with `asyncio.get_running_loop()` in both router files (config.py line 22, me.py line 21).

---

### WR-02: Unguarded `user["client_id"]` dict access — KeyError crashes with HTTP 500

**Files modified:** `backend/routers/config.py`
**Commit:** 2f0caeb
**Applied fix:** Changed `user["client_id"]` to `user.get("client_id")` — the subsequent `if not client_id` guard was already in place and now safely handles a missing key.

---

### WR-03: Unguarded `user["tg_full_name"]` access — KeyError crashes with HTTP 500

**Files modified:** `backend/routers/me.py`
**Commit:** 7ba0956
**Applied fix:** Changed `user["tg_full_name"] or user["first_name"]` to `user.get("tg_full_name") or user.get("first_name")` — both dict accesses now use `.get()` to safely return `None` on missing keys.

---

### WR-04: `device_limit` hardcoded as magic number — not sourced from database

**Files modified:** `backend/routers/me.py`
**Commit:** 5ba0379
**Applied fix:** Added `DEVICE_LIMIT_DEFAULT = 5` module-level constant and changed `device_limit=5` to `device_limit=user.get("device_limit", DEVICE_LIMIT_DEFAULT)` so the value comes from the database when available.

---

### WR-05: `systemd` service runs as `root` — unnecessarily broad privilege

**Files modified:** `backend/deploy/shine-app-backend.service`
**Commit:** 1a9a2e5
**Applied fix:** Changed `User=root` to `User=shineapp` and added inline deployment comments documenting the required VPS setup steps (`adduser`, `chown`, `setfacl`) needed before the service can be started under the new user.

---

_Fixed: 2026-05-21T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
