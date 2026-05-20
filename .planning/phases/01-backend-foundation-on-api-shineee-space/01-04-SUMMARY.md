---
plan: 01-04
phase: 01-backend-foundation-on-api-shineee-space
status: complete
completed: 2026-05-20
---

## Summary

nginx vhost configured for `api.shineee.space` with HTTPS via Cloudflare proxy. Backend accessible at `https://api.shineee.space/api/health` returning `{"status":"ok"}`.

## What Was Built

- nginx vhost on port 80 proxying to FastAPI on `127.0.0.1:8000`
- Cloudflare proxy (Flexible SSL) terminates HTTPS on port 443
- UFW rule added for port 80
- FastAPI backend deployed to VPS at `/home/shine/shine-app/backend/`
- systemd service `shine-app-backend` enabled and active
- Routers fixed to use real `db.py` functions (`get_user`, `is_access_active`)

## Architecture Deviation

**Port 443 conflict:** Xray VLESS+Reality occupies port 443 on the VPS — nginx cannot bind there. Solution: Cloudflare Flexible SSL proxy (Cloudflare terminates HTTPS, forwards HTTP to nginx on port 80). SSL cert is Cloudflare Universal SSL (not Let's Encrypt). This satisfies INFRA-02 (valid HTTPS) without disrupting the VPN service.

## Verification Results

```
curl -s https://api.shineee.space/api/health
{"status":"ok"}   ← HTTP 200 ✓

curl -s https://api.shineee.space/api/me
{"detail":[{"type":"missing",...,"msg":"Field required"}]}   ← HTTP 422, auth enforced ✓

systemctl is-active shine-app-backend → active ✓
systemctl is-active nginx → active ✓
```

## Key Files

- `/etc/nginx/sites-available/api.shineee.space` — nginx vhost (port 80)
- `/etc/systemd/system/shine-app-backend.service` — systemd unit
- `/home/shine/shine-app/backend/.env` — secrets (not tracked in git)
- Cloudflare DNS: `api A 205.172.56.163` (Proxied)
- Cloudflare SSL: Flexible mode

## Self-Check

- [x] https://api.shineee.space/api/health → 200 OK
- [x] Auth enforcement working (422 without initData)
- [x] systemd service active and enabled
- [x] nginx active on port 80
- [x] Port 80 open in UFW
