---
phase: 01-backend-foundation-on-api-shineee-space
plan: "03"
subsystem: backend
tags: [systemd, deploy, gitignore, infrastructure]
dependency_graph:
  requires:
    - plan-01-01 (backend skeleton, .env.example)
  provides:
    - backend/deploy/shine-app-backend.service (systemd unit template)
    - backend/deploy/deploy.sh (deployment automation script)
    - .gitignore (root-level, excludes backend/.env and venv)
  affects:
    - VPS deployment (plan 05 or manual)
tech_stack:
  added: []
  patterns:
    - systemd EnvironmentFile pattern with absolute path
    - Deploy artifact in git repo (deploy/ subdirectory)
    - Root .gitignore + backend/.gitignore layered protection for .env
key_files:
  created:
    - backend/deploy/shine-app-backend.service
    - backend/deploy/deploy.sh
    - .gitignore
  modified: []
decisions:
  - "systemd unit stored as deploy artifact in repo (not directly on VPS) — SSH unavailable, same gate as Plan 01-01"
  - "deploy.sh automates full VPS setup: git pull + venv + services copy + systemd install + health check"
  - "chmod 600 .env enforced in deploy.sh (T-03-01 mitigation)"
metrics:
  duration_seconds: 300
  completed_date: "2026-05-20"
  tasks_completed: 1
  tasks_total: 1
  files_created: 3
  files_modified: 0
---

# Phase 01 Plan 03: systemd Unit File + .env + Autostart Summary

systemd unit file (EnvironmentFile pattern, --host 127.0.0.1), root .gitignore, and deploy.sh script committed to repo as deployment artifacts; VPS activation pending SSH access.

## What Was Built

### Files Created

| File | Purpose |
|------|---------|
| `backend/deploy/shine-app-backend.service` | systemd unit file template — EnvironmentFile, Restart=always, uvicorn on 127.0.0.1:8000 |
| `backend/deploy/deploy.sh` | Full deployment script: git pull + venv + services copy + systemd install + health verify |
| `.gitignore` | Root-level: excludes `backend/.env`, `backend/venv/`, OS artifacts |

### Service File Key Configuration

```ini
[Service]
User=root
WorkingDirectory=/root/shine-app/backend
EnvironmentFile=/root/shine-app/backend/.env   # absolute path (Pitfall 6)
ExecStart=/root/shine-app/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 1
Restart=always
RestartSec=5
```

Security constraints honored:
- `--host 127.0.0.1` (not 0.0.0.0) — T-03-03
- `EnvironmentFile` with absolute path — prevents systemd load failure (RESEARCH Pitfall 6)
- `Restart=always` — crash recovery

### .env Variables (from 01-01-SUMMARY.md)

The `.env` to be created on VPS must contain:

| Variable | Value | Source |
|----------|-------|--------|
| `BOT_TOKEN` | Telegram bot token | BotFather / `~/vpn-bot/.env` |
| `DB_PATH` | `/root/vpn-bot/users.db` | D-04 constraint |
| `XUI_BASE_URL` | `http://127.0.0.1:21008` | x-ui panel default |
| `XUI_PASSWORD` | (admin password) | `~/vpn-bot/.env` |
| `XUI_INBOUND_ID` | `2` | CONTEXT.md canonical |

Note: `XUI_USERNAME` may also be needed — verify against actual `~/vpn-bot/services/xui.py` when SSH is restored.

### VPS User

[ASSUMED] `root` — based on RESEARCH.md Assumption A1. Service file uses `User=root` and `/root/shine-app/` paths. If VPS user differs, update `User=` and all `/root/` paths in the service file before deployment.

### Deployment Steps (when SSH restored)

```bash
# 1. Copy .env values from vpn-bot
ssh root@205.172.56.163 "cat ~/vpn-bot/.env 2>/dev/null"

# 2. Create .env on VPS
ssh root@205.172.56.163 "
  cp ~/shine-app/backend/.env.example ~/shine-app/backend/.env
  nano ~/shine-app/backend/.env   # fill in real values
  chmod 600 ~/shine-app/backend/.env
"

# 3. Run deploy script
bash backend/deploy/deploy.sh

# 4. Verify
ssh root@205.172.56.163 "systemctl is-active shine-app-backend"
ssh root@205.172.56.163 "curl -s http://127.0.0.1:8000/api/health"
```

## .env Git Protection

Two layers:

| Layer | File | Entry |
|-------|------|-------|
| Root-level | `.gitignore` | `backend/.env` |
| Backend-level | `backend/.gitignore` | `.env` |

Verified: `git ls-files backend/.env` returns empty — `.env` is not tracked.

## Deviations from Plan

### Infrastructure Gate (same as Plan 01-01)

**[Infrastructure Gate] VPS SSH Unreachable**
- **Found during:** Task 1 (attempt to SSH to 205.172.56.163 port 22)
- **Issue:** Port 22 refused connection. VPS reachable on port 443 but SSH unavailable.
- **Impact:** Cannot create `/etc/systemd/system/shine-app-backend.service` directly on VPS, cannot create `backend/.env`, cannot run `systemctl enable/start`.
- **Mitigation:** Stored systemd unit file and deploy.sh as git artifacts in `backend/deploy/`. All VPS-side actions deferred to deploy.sh execution.
- **Files committed:** `backend/deploy/shine-app-backend.service`, `backend/deploy/deploy.sh`

**This is the same gate documented in 01-01-SUMMARY.md.** Resolution is unblocking SSH access.

## Threat Surface Scan

No new network endpoints introduced. The `backend/deploy/` directory contains deployment scripts only — no runtime code.

Threat mitigations from plan's threat model:

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-03-01 | Deferred | `chmod 600 .env` in deploy.sh (runs on VPS when SSH available) |
| T-03-02 | Mitigated | `.gitignore` at root + `backend/.gitignore` both exclude `.env` |
| T-03-03 | Mitigated | `--host 127.0.0.1` in service file ExecStart |
| T-03-04 | Accepted | `User=root` — acceptable for 19-user service |
| T-03-05 | Accepted | `Restart=always` — crash-loop acceptable for this scale |

## Service Status

| Check | Expected | Actual |
|-------|----------|--------|
| `systemctl is-active shine-app-backend` | `active` | PENDING (SSH gate) |
| `systemctl is-enabled shine-app-backend` | `enabled` | PENDING (SSH gate) |
| `curl http://127.0.0.1:8000/api/health` | `{"status":"ok"}` | PENDING (SSH gate) |
| `git ls-files backend/.env` | (empty) | PASSED |
| Service file contains `EnvironmentFile=` | YES | PASSED (in repo artifact) |
| Service file contains `Restart=always` | YES | PASSED |
| Service file contains `--host 127.0.0.1` | YES | PASSED |
| Service file NOT contains `0.0.0.0` | YES | PASSED |

## Known Stubs

None — this plan has no application-level stubs. The deploy artifacts are complete and correct. VPS activation is blocked by SSH infrastructure gate, not by incomplete code.

## Self-Check

### Created Files Exist

- `backend/deploy/shine-app-backend.service`: FOUND
- `backend/deploy/deploy.sh`: FOUND
- `.gitignore`: FOUND

### Commits Exist

- `261501b`: chore(01-03): add systemd unit file, root .gitignore, and deploy script

## Self-Check: PASSED
