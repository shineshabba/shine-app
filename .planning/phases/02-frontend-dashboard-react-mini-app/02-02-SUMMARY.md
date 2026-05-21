---
phase: 02-frontend-dashboard-react-mini-app
plan: "02"
subsystem: frontend
tags: [api-client, typescript, react-components, error-handling, telegram-mini-app]
dependency_graph:
  requires: [02-01-PLAN.md]
  provides: [apiClient, UserProfile, ConfigResponse, ApiError, LoadingScreen, ErrorScreen, UnregisteredScreen, ErrorBoundary]
  affects: [frontend/src/App.tsx, future dashboard plan]
tech_stack:
  added: []
  patterns: [fetch-with-auth-header, react-error-boundary, css-only-animation, telegram-initdata-from-window]
key_files:
  created:
    - frontend/src/types/api.ts
    - frontend/src/api/client.ts
    - frontend/src/components/LoadingScreen.tsx
    - frontend/src/components/ErrorScreen.tsx
    - frontend/src/components/UnregisteredScreen.tsx
    - frontend/src/components/ErrorBoundary.tsx
  modified:
    - frontend/src/vite-env.d.ts
    - frontend/src/main.tsx
    - .gitignore
decisions:
  - "Used init() from @telegram-apps/sdk-react instead of SDKProvider — matches existing main.tsx pattern established in 02-01"
  - "initData read exclusively from window.Telegram?.WebApp?.initData — never constructed manually (T-02-08)"
  - "CSS-only spinner (no animation library) — keeps bundle minimal"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-21T06:37:59Z"
  tasks_completed: 2
  files_created: 6
  files_modified: 3
---

# Phase 02 Plan 02: API Client, TypeScript Types, and State Screens Summary

**One-liner:** Fetch wrapper with X-Telegram-Init-Data auth header + Loading/Error/Unregistered/ErrorBoundary state screens using Tailwind CSS and Telegram theme vars.

## What Was Built

### Task 1: TypeScript types and API client

**frontend/src/types/api.ts** — TypeScript interfaces mirroring Pydantic models from `backend/models.py`:
- `UserProfile` — `tg_user_id`, `name`, `subscription_active`, `subscription_end: string | null`, `device_limit`
- `ConfigResponse` — `vless_url: string`
- `HealthResponse` — `status: 'ok'`
- `ApiErrorCode` — union type `401 | 403 | 404 | 'network' | 'unknown'`
- `ApiError` — extends `Error` with `code: ApiErrorCode`

**frontend/src/api/client.ts** — single fetch wrapper:
- `getInitData()` reads only from `window.Telegram?.WebApp?.initData` (never constructed manually)
- `apiFetch<T>()` adds `X-Telegram-Init-Data` header to every request; maps HTTP status codes to typed `ApiError`
- `apiClient.getMe()` → `GET /api/me` → `UserProfile`
- `apiClient.getConfig()` → `GET /api/config` → `ConfigResponse`

**frontend/src/vite-env.d.ts** — added `Window.Telegram` interface for type-safe access to Telegram WebApp SDK.

### Task 2: State screen components

| Component | Trigger | Key feature |
|-----------|---------|-------------|
| `LoadingScreen` | While both API calls in flight | CSS-only `@keyframes spin` spinner, `role="status"`, `aria-label="Загрузка..."` |
| `ErrorScreen` | Network error or 5xx | `WifiOff` icon, `onRetry` callback, «Повторить» button |
| `UnregisteredScreen` | `ApiError(404)` | `UserX` icon, «Аккаунт не найден», «Пройдите /start в боте @shine_connect_bot» |
| `ErrorBoundary` | Uncaught React render error | Class component, `getDerivedStateFromError`, reload button |

**frontend/src/main.tsx** — updated to wrap `<App />` inside `<ErrorBoundary>`.

## Verification Results

```
npm run typecheck: Exit 0 (no TypeScript errors)
npm run build:     ✓ built in 1.02s
                   dist/assets/index-B0m66I5B.js  186.55 kB │ gzip: 58.89 kB  (< 300 KB limit)
grep X-Telegram-Init-Data: FOUND in client.ts
grep VPN|прокси|обход in components/: no matches (constraint satisfied)
grep dangerouslySetInnerHTML: no matches (constraint satisfied)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Config] Added frontend/dist and node_modules to .gitignore**
- **Found during:** Post-task git status check
- **Issue:** Build artifacts and dependencies were untracked; would have been committed
- **Fix:** Added `frontend/dist/`, `frontend/node_modules/`, `frontend/package-lock.json` to root `.gitignore`
- **Files modified:** `.gitignore`
- **Commit:** f7f9fb9

**2. [Plan variance] Used `init()` instead of `SDKProvider` in main.tsx**
- The prompt specification used `init()` (matching the existing 02-01 pattern); the plan's Task 2 action showed `SDKProvider`. Followed the prompt as authoritative — `init()` is the correct approach for `@telegram-apps/sdk-react` v3.

## Known Stubs

None — no components render data yet; all state screens are pure presentational UI with no data sources needed.

## Threat Flags

None — no new network endpoints or auth paths introduced. `getInitData()` correctly reads only from `window.Telegram?.WebApp?.initData` (T-02-08 mitigated).
