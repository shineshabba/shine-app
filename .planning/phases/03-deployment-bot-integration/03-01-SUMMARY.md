---
phase: "03"
plan: "01"
subsystem: frontend-api-cors-github
tags: [deployment, env-vars, cors, github]
dependency_graph:
  requires: []
  provides: [github-repo, env-var-api-url, cors-custom-domain]
  affects: [frontend/src/api/client.ts, backend/main.py]
tech_stack:
  added: []
  patterns: [vite-env-vars, cors-explicit-origin]
key_files:
  created:
    - frontend/.env.example
  modified:
    - frontend/src/api/client.ts
    - backend/main.py
    - .gitignore
decisions:
  - "Fallback ?? 'https://api.shineee.space' keeps build working without .env.local"
  - "Added https://app.shineee.space explicitly to CORS allow_origins, not as wildcard"
  - "Pushed claude/hardcore-gould-b3392c as main to GitHub (full feature history)"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-21"
  tasks_completed: 2
  files_changed: 4
---

# Phase 03 Plan 01: Codebase Prep for Deployment — Summary

**One-liner:** Replaced hardcoded API_BASE with VITE_API_URL env var, added app.shineee.space to CORS, created .env.example, and pushed monorepo to github.com/shineshabba/shine-app.

## What Was Done

- Replaced `const API_BASE = 'https://api.shineee.space'` with `import.meta.env.VITE_API_URL ?? 'https://api.shineee.space'` in `frontend/src/api/client.ts`
- Added `https://app.shineee.space` to `allow_origins` in `backend/main.py` CORSMiddleware (kept `allow_origin_regex` for `*.vercel.app` preview deployments)
- Created `frontend/.env.example` documenting `VITE_API_URL` for local dev and Vercel dashboard
- Added `frontend/tsconfig.app.tsbuildinfo` to `.gitignore` (build artifact)
- Created GitHub repo `github.com/shineshabba/shine-app` (public) and pushed full monorepo history to `main`
- Verified `npm run build` in `frontend/` passes without errors (bundle: 88KB gzipped)

## Key Decisions

- Fallback `?? 'https://api.shineee.space'` ensures build doesn't break without `.env.local` in dev
- CORS: added explicit `https://app.shineee.space` origin, not wildcard — matches threat model T-03-02 mitigation
- Pushed `claude/hardcore-gould-b3392c` (full feature history) as `main` to GitHub since local `main` branch was at an earlier commit before phase 2 work

## Artifacts

- `frontend/src/api/client.ts`: uses `import.meta.env.VITE_API_URL`
- `frontend/.env.example`: created, documents `VITE_API_URL=http://localhost:8000`
- `backend/main.py`: `https://app.shineee.space` in `allow_origins`, `allow_origin_regex` and `allow_credentials` unchanged
- `.gitignore`: `frontend/tsconfig.app.tsbuildinfo` added
- GitHub: `https://github.com/shineshabba/shine-app` — public repo, monorepo in `main`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 5ac16ff | feat(03-01): use VITE_API_URL env var, add CORS for app.shineee.space, create .env.example |
| 2 | 445473a | chore(03-01): add tsconfig.app.tsbuildinfo to gitignore, push monorepo to GitHub |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Added tsconfig.app.tsbuildinfo to .gitignore**
- **Found during:** Task 2 (git status after build)
- **Issue:** `frontend/tsconfig.app.tsbuildinfo` was untracked after running `npm run build` — TypeScript incremental build cache should not be committed
- **Fix:** Added to `.gitignore`
- **Files modified:** `.gitignore`
- **Commit:** 445473a

None other — plan executed as written.

## Next

Plan 03-02: Vercel deploy + DNS for `app.shineee.space`

## Self-Check: PASSED

- [x] `frontend/src/api/client.ts` contains `import.meta.env.VITE_API_URL` — verified
- [x] `backend/main.py` contains `https://app.shineee.space` — verified
- [x] `frontend/.env.example` exists and contains `VITE_API_URL=` — verified
- [x] `github.com/shineshabba/shine-app` exists — verified via `gh repo view`
- [x] `npm run build` passes — verified (bundle 88KB gzipped)
- [x] Commits 5ac16ff and 445473a exist in git log — verified
