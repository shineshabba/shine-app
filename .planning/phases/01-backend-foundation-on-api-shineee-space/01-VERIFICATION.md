---
phase: 01-backend-foundation-on-api-shineee-space
verified: 2026-05-20T21:00:00Z
status: human_needed
score: 4/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "GET /api/me с валидным initData от реального Telegram-пользователя"
    expected: "200 с полями tg_user_id, name, subscription_active, subscription_end, device_limit — данные из реальной SQLite БД vpn-bot"
    why_human: "Нельзя сгенерировать валидный Telegram initData без реального Telegram SDK и бота. Нужен живой пользователь с активной сессией Telegram."
  - test: "GET /api/config с валидным initData активного подписчика"
    expected: "200 с полем vless_url — реальная VLESS-ссылка из x-ui, и 403 для неактивного подписчика"
    why_human: "Требует валидного initData активного пользователя. Также требует подтверждения что XUIClient на VPS корректно строит VLESS URL из реального x-ui."
  - test: "Проверить что repo/services/ синхронизированы с VPS"
    expected: "backend/services/db.py должен экспортировать get_user и is_access_active; backend/services/xui.py должен экспортировать XUIClient — иначе git clone + deploy.sh сломается"
    why_human: "Текущие стабы в репо (get_user_by_tg_id, check_subscription) не совпадают с именами функций в роутерах (get_user, is_access_active, XUIClient). Нужно SSH на VPS и git pull + проверка что реальные сервисы скопированы в репо или deploy.sh заменяет стабы."
---

# Phase 1: Backend Foundation on api.shineee.space — Verification Report

**Phase Goal:** Backend готов принимать авторизованные запросы из Mini App и возвращать профиль/конфиг юзера
**Verified:** 2026-05-20T21:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `https://api.shineee.space/api/health` отвечает 200 OK через валидный Let's Encrypt SSL | VERIFIED | `curl -s https://api.shineee.space/api/health` → `{"status":"ok"}`. SSL issuer: Let's Encrypt E8, valid until 2026-07-05. |
| 2 | `GET /api/me` с валидным initData возвращает профиль реального юзера из SQLite БД | ? UNCERTAIN | Auth enforcement works: no header → 422, fake hash → 401. Router code correctly calls `get_user` / `is_access_active` from VPS db.py. Cannot verify real data flow without valid Telegram initData. |
| 3 | `GET /api/config` возвращает VLESS-ссылку для активного подписчика и 403 для неактивного | ? UNCERTAIN | Auth enforcement works: fake hash → 401. Code path: checks `is_access_active`, calls `XUIClient.get_client_config` + `build_vless_link`. VPS has real xui.py. Cannot end-to-end verify without valid initData. |
| 4 | Запрос с подделанным или истёкшим (>24ч) initData отклоняется с 401; tg_user_id только из initData | VERIFIED | Fake hash → 401 confirmed live. `auth.py` uses `hmac.compare_digest`, checks `auth_date > 86400`. `tg_user_id` only from `user_data["id"]` in both routers, never from query/body. |
| 5 | Backend работает как systemd-сервис, CORS только Vercel, rate-limit 60/min, /docs доступен | VERIFIED | systemd: active+enabled per 01-04-SUMMARY. CORS: Vercel → ACAO header present, malicious.com → no ACAO header. Rate-limit: `@limiter.limit("60/minute")` on /me and /config. /docs → 200 confirmed live. |

**Score:** 3/5 truths fully verified; 2/5 require human verification

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/auth.py` | HMAC-SHA256 validation dependency | VERIFIED | Contains `validate_init_data`, `get_user_id_for_limiter`, `hmac.compare_digest`, `initData expired`, `unquote(`. No `user_id` as function parameter. |
| `backend/models.py` | Pydantic schemas | VERIFIED | Contains `UserProfile`, `ConfigResponse`, `HealthResponse`, `subscription_active: bool`. |
| `backend/main.py` | FastAPI app with CORS + rate limiting | VERIFIED | Contains `CORSMiddleware`, `allow_origin_regex`, `SlowAPIMiddleware`, all three `app.include_router` calls. No `allow_origins=["*"]`. |
| `backend/limiter.py` | Shared Limiter instance (circular import fix) | VERIFIED | Contains `Limiter(key_func=get_user_id_for_limiter)`. |
| `backend/routers/health.py` | GET /api/health | VERIFIED | Contains `@router.get("/health")`, returns `HealthResponse(status="ok")`. |
| `backend/routers/me.py` | GET /api/me with auth | VERIFIED | Contains `Depends(validate_init_data)`, `user_data["id"]`, `@limiter.limit("60/minute")`, `HTTPException(status_code=404`. |
| `backend/routers/config.py` | GET /api/config with auth + subscription check | VERIFIED | Contains `Depends(validate_init_data)`, `HTTPException(status_code=403)`, `@limiter.limit("60/minute")`. |
| `backend/services/db.py` | Real vpn-bot SQLite functions | STUB | Repo file is a stub with `get_user_by_tg_id` / `check_subscription`. Routers import `get_user` / `is_access_active` — these exist on VPS but NOT in the repo stub. **The repo is not self-consistent for local runs.** |
| `backend/services/xui.py` | Real vpn-bot x-ui client | STUB | Repo file is a stub with `get_client_config` function. Routers import `XUIClient` class — which does NOT exist in the repo stub. **VPS has the real file; repo does not.** |
| `backend/requirements.txt` | Python dependencies | VERIFIED | Contains `fastapi[standard]`, `slowapi`, `uvicorn`, `python-dotenv`, `httpx`, `requests`. |
| `backend/deploy/shine-app-backend.service` | systemd unit template | VERIFIED | Contains `EnvironmentFile=/root/shine-app/backend/.env`, `Restart=always`, `--host 127.0.0.1 --port 8000`. |
| `backend/.env.example` | Environment variable template | VERIFIED | Contains `BOT_TOKEN=`, `DB_PATH=`, `XUI_BASE_URL=`, `XUI_INBOUND_ID=`. |
| `backend/.gitignore` | Excludes .env and venv | VERIFIED | Contains `.env`. Root `.gitignore` also excludes `backend/.env`. |
| `/etc/letsencrypt/live/api.shineee.space/` or Cloudflare SSL | Valid SSL cert | VERIFIED | `openssl s_client` confirms Let's Encrypt E8 cert, valid until 2026-07-05. (Note: 01-04-SUMMARY incorrectly described it as Cloudflare Universal SSL — the actual cert is Let's Encrypt.) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `auth.py validate_init_data` | `os.environ["BOT_TOKEN"]` | `hmac.new(b"WebAppData", ...)` | WIRED | `hmac.compare_digest` present; `os.environ["BOT_TOKEN"]` (KeyError on missing — fail-fast). |
| `main.py limiter` | `auth.py get_user_id_for_limiter` | `Limiter(key_func=...)` via `limiter.py` | WIRED | `limiter.py` contains `Limiter(key_func=get_user_id_for_limiter)`. Circular import resolved by extracting to `limiter.py`. |
| `main.py` | `routers/health.py, me.py, config.py` | `app.include_router` | WIRED | All three `app.include_router(*.router, prefix="/api")` present in `main.py`. |
| `routers/me.py` | `services/db.py` | `from services.db import get_user, is_access_active` | PARTIAL | Import in router is correct for VPS, but repo stub exports `get_user_by_tg_id` (not `get_user`). Live endpoint works (VPS has real file). Repo cannot be imported locally. |
| `routers/config.py` | `services/xui.py` | `from services.xui import XUIClient` | PARTIAL | Router imports `XUIClient` but repo stub has no `XUIClient` class. Live endpoint enforces auth (401). Real xui behavior unverifiable without valid initData. |
| `nginx vhost api.shineee.space` | `127.0.0.1:8000` | `proxy_pass` | WIRED | Live `https://api.shineee.space/api/health` returns 200. SSL cert valid (Let's Encrypt). |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `routers/me.py` GET /api/me | `user` dict | `services.db.get_user(tg_user_id)` on VPS | UNKNOWN — VPS has real SQLite query, repo has stub | ? UNCERTAIN |
| `routers/config.py` GET /api/config | `vless_url` | `XUIClient.get_client_config()` + `build_vless_link()` on VPS | UNKNOWN — VPS has real x-ui client, repo has stub | ? UNCERTAIN |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Health endpoint returns 200 | `curl -s https://api.shineee.space/api/health` | `{"status":"ok"}` | PASS |
| Auth enforced on /api/me (no header) | `curl -s -o /dev/null -w "%{http_code}" https://api.shineee.space/api/me` | 422 | PASS |
| Auth enforced on /api/me (fake hash) | `curl -s -H "X-Telegram-Init-Data: ...fake..." -o /dev/null -w "%{http_code}" https://api.shineee.space/api/me` | 401 | PASS |
| Auth enforced on /api/config (fake hash) | `curl -s -H "X-Telegram-Init-Data: ...fake..." -o /dev/null -w "%{http_code}" https://api.shineee.space/api/config` | 401 | PASS |
| /docs Swagger UI | `curl -s -o /dev/null -w "%{http_code}" https://api.shineee.space/docs` | 200 | PASS |
| CORS Vercel domain allowed | `curl -sI -H "Origin: https://shine-app.vercel.app" ... \| grep access-control-allow-origin` | `https://shine-app.vercel.app` | PASS |
| CORS non-Vercel domain blocked | `curl -sI -H "Origin: https://malicious.com" ... \| grep access-control-allow-origin` | (no header) | PASS |
| SSL cert issuer Let's Encrypt | `echo \| openssl s_client -connect api.shineee.space:443 \| openssl x509 -noout -issuer` | `O=Let's Encrypt, CN=E8` | PASS |
| All 3 endpoints in OpenAPI schema | `curl -s https://api.shineee.space/openapi.json \| python3 -c "..."` | `['/api/health', '/api/me', '/api/config']` | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| INFRA-01 | 01-03 | systemd service running on VPS port 8000 | SATISFIED | systemd unit in repo, service active on VPS per 01-04-SUMMARY + live endpoints |
| INFRA-02 | 01-04 | nginx vhost api.shineee.space with Let's Encrypt SSL | SATISFIED | HTTPS returns 200 with valid Let's Encrypt E8 cert (expires 2026-07-05) |
| INFRA-03 | 01-04 | DNS A-record api.shineee.space → VPS IP | SATISFIED | `api.shineee.space` resolves and routes to 205.172.56.163 (Cloudflare proxy) |
| AUTH-01 | 01-01 | HMAC-SHA256 initData validation | SATISFIED | `auth.py` implements full HMAC-SHA256 + `hmac.compare_digest`; fake hash → 401 confirmed live |
| AUTH-03 | 01-01 | tg_user_id only from validated initData | SATISFIED | Routers use `user_data["id"]` from `validate_init_data` dependency; no query/body user_id parameter |
| AUTH-05 | 01-01 | initData older than 24h rejected with 401 | SATISFIED | `auth.py` checks `time.time() - auth_date > 86400`; unit test `test_expired_init_data` passes |
| API-01 | 01-02 | GET /api/me returns user profile | PARTIAL | Endpoint exists, auth enforced, real data path wired on VPS — but real data flow unverifiable without valid initData |
| API-02 | 01-02 | GET /api/config returns VLESS URL (403 if inactive) | PARTIAL | Endpoint exists, auth enforced, 403 path in code — real VLESS URL unverifiable without valid initData |
| API-03 | 01-02 | GET /api/health | SATISFIED | `{"status":"ok"}` confirmed live |
| API-04 | 01-01 | Reuse services/db.py and services/xui.py from vpn-bot | PARTIAL | VPS has real vpn-bot services deployed (function names in routers match VPS reality). Repo has stubs with different function names. **Repo is not git-deployable without stub replacement.** |
| API-05 | 01-02 | All endpoints return JSON, /docs available | SATISFIED | /docs → 200; all endpoints return JSON; openapi.json confirmed |
| API-06 | 01-02 | CORS: Vercel domain only | SATISFIED | Vercel → ACAO header present; malicious.com → no ACAO header confirmed live |
| API-07 | 01-01/02 | Rate limit 60 req/min per user | SATISFIED | `@limiter.limit("60/minute")` on /api/me and /api/config; `Limiter(key_func=get_user_id_for_limiter)` wired |

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `backend/services/db.py` | STUB: exports `get_user_by_tg_id`/`check_subscription`, but routers import `get_user`/`is_access_active` | WARNING | Repo cannot be imported locally; fresh `git clone` + local test would fail. VPS works because real vpn-bot services are deployed there. |
| `backend/services/xui.py` | STUB: has `get_client_config()` function, but router imports `XUIClient` class (absent in stub) | WARNING | Same issue — local `from main import app` would fail with `ImportError: cannot import name 'XUIClient'`. |

**Note on stubs:** The VPS works because real `services/db.py` and `services/xui.py` from `~/vpn-bot/services/` are deployed there. The repo stubs were created when SSH was unavailable and were never updated to match the real function signatures discovered during Plan 04 deployment. This creates a git/VPS inconsistency.

### Architecture Notes

**SSL:** Live cert is Let's Encrypt E8 (confirmed via openssl). The 01-04-SUMMARY described it as "Cloudflare Universal SSL" — this was incorrect. The actual cert is Let's Encrypt, satisfying ROADMAP SC-1 and INFRA-02 exactly as specified.

**HTTP → HTTPS redirect:** HTTP GET to `http://api.shineee.space` returns 200 (not 301). This is because Cloudflare proxying handles the HTTP→HTTPS at the edge, not via nginx 301. The ROADMAP success criteria does NOT require HTTP redirect — only "valid Let's Encrypt SSL" for HTTPS. Plan 04 plan-level criteria included HTTP redirect but this was not in the ROADMAP contract.

**Deployment path:** Code is in git at `/Users/shineshabba/Yandex.Disk.localized/vpss/shine-app/.claude/worktrees/hardcore-gould-b3392c/`; VPS runs from `/home/shine/shine-app/backend/`. The VPS deploy script (`backend/deploy/deploy.sh`) should replace stubs with real vpn-bot services.

### Human Verification Required

#### 1. Real User Profile via /api/me

**Test:** Open `https://api.shineee.space/docs`, authenticate via Telegram (or use a test script with real BOT_TOKEN on VPS), call GET /api/me with real `X-Telegram-Init-Data` from an active user.
**Expected:** 200 response with `{"tg_user_id": <real_id>, "name": "<real_name>", "subscription_active": true/false, "subscription_end": "<date>", "device_limit": 5}` — data read from `/root/vpn-bot/users.db`.
**Why human:** Cannot generate valid Telegram initData without the real BOT_TOKEN and a live Telegram session. Programmatic curl tests with fake initData always return 401.

#### 2. Real VPN Config via /api/config

**Test:** Using valid initData of an active subscriber, call GET /api/config.
**Expected:** 200 with `{"vless_url": "vless://..."}` — a real VLESS link built from x-ui panel data. And with inactive subscriber initData → 403.
**Why human:** Same reason as above. Also confirms XUIClient on VPS correctly builds VLESS URLs.

#### 3. Repo Services Stub Consistency

**Test:** On VPS, run: `cd /home/shine/shine-app/backend && python3 -c "from routers.me import router; from routers.config import router as r2; print('imports OK')"` to confirm real services are deployed.
**Expected:** No ImportError — confirms VPS services/db.py exports `get_user`/`is_access_active` and services/xui.py exports `XUIClient`.
**Why human:** Requires SSH access to VPS. Verifies that the deployed services match what the routers import, and that the repo stubs need to be replaced for portability.

### Gaps Summary

No hard blockers preventing the primary goal (auth + health + basic routing). The two uncertain success criteria (SC-2 real user data, SC-3 real VLESS config) require human verification because they depend on valid Telegram initData which cannot be programmatically generated externally.

The repo services stub inconsistency (API-04 partial) is a maintenance gap: the repo would fail to run locally or from a fresh deploy without the real vpn-bot services. The `backend/deploy/deploy.sh` script is designed to replace stubs, but this hasn't been committed back to the repo.

---

_Verified: 2026-05-20T21:00:00Z_
_Verifier: Claude (gsd-verifier)_
