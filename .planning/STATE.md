# STATE — Shine Mini App

## Project Reference

**Core Value**: Юзер открывает Mini App и за один экран видит статус подписки + конфиг VPN без поиска по чату.

**Current Focus**: Initialization complete. Ready to plan Phase 1 (Backend Foundation).

## Current Position

- **Milestone**: v1 MVP
- **Phase**: — (not started)
- **Plan**: —
- **Status**: Roadmap created, awaiting phase planning
- **Progress**: `[░░░░░░░░░░] 0/3 phases`

## Performance Metrics

- Phases completed: 0/3
- Requirements validated: 0/36 (v1)
- Plans executed: 0
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

### Open TODOs

- Plan Phase 1 via `/gsd-plan-phase 1`

### Blockers

- None

## Session Continuity

**Last session**: 2026-05-20 — Project initialization (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md created).

**Next action**: `/gsd-plan-phase 1` to decompose Phase 1 (Backend Foundation) into executable plans.

---
*Last updated: 2026-05-20*
