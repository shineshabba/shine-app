# STATE — Shine Mini App

## Project Reference

**Core Value**: Юзер открывает Mini App и за один экран видит статус подписки + конфиг VPN без поиска по чату.

**Current Focus**: Phase 02 in progress — Frontend React Mini App dashboard.

## Current Position

- **Milestone**: v1 MVP
- **Phase**: 02 — Frontend Dashboard React Mini App
- **Plan**: 02-05 (next)
- **Status**: In progress — Phase 02 Plan 04 complete
- **Progress**: `[████████░░] Phase 02 active`

## Performance Metrics

- Phases completed: 1/3 (Phase 01 complete)
- Requirements validated: 0/36 (v1)
- Plans executed: 10 (01-01 through 01-05 complete, 02-01 through 02-04 complete)
- Test pass rate: n/a

## Accumulated Context

### Decisions

- Frontend: React 19 + Vite 6 + TypeScript + Tailwind 4 + `@telegram-apps/sdk-react`
- Backend: FastAPI on existing VPS as systemd service, port 8000
- Domain: `api.shineee.space` (separate nginx vhost + Let's Encrypt)
- Hosting: Vercel for frontend (free tier, auto-deploy from git)
- Auth: Telegram initData HMAC validation only (no cookies, no JWT)
- Backend reuses `services/db.py` and `services/xui.py` from `~/vpn-bot`
- Registration stays in bot (FSM), Mini App is for registered users only
- Used `init()` from `@telegram-apps/sdk-react` (not SDKProvider) in main.tsx — consistent with 02-01 setup
- initData read exclusively from `window.Telegram?.WebApp?.initData` — never constructed manually (security constraint T-02-08)
- CSS-only spinner in LoadingScreen — no animation library, keeps bundle minimal

### Open TODOs

- Execute 02-05 (Vercel deploy + production wiring)

### Blockers

- None

## Session Continuity

**Last session**: 2026-05-21 — Phase 02 Plan 04 executed: QrModal, SupportSheet, wired overlays in App.tsx. Commit: c8bbfca.

**Next action**: Execute 02-05 (Vercel deploy + production wiring).

---
*Last updated: 2026-05-21*
