# Wave 4: E2E Verification & Bug Fixes — Summary

**Date:** 2026-05-21
**Status:** COMPLETE ✅

## Goal
Verify end-to-end: Mini App opens in real Telegram iOS and shows working dashboard.

## Bugs Found & Fixed

### Bug 1: Trailing newline in VITE_API_URL
- **Symptom:** "Нет соединения с сервером" (fetch() threw network error)
- **Root cause:** Vercel env var `VITE_API_URL` was stored with trailing `\n` → URL became `https://api.shineee.space\n` (invalid)
- **Fix:** Removed env var from Vercel, added `.trim()` to `API_BASE` in `frontend/src/api/client.ts`

### Bug 2: Cloudflare Bot Fight Mode blocking Telegram iOS WebView
- **Symptom:** Error persisted even after Bug 1 fix — backend logs showed zero requests from Telegram iOS
- **Root cause:** `api.shineee.space` proxied through Cloudflare. Cloudflare's Bot Fight Mode blocked WKWebView requests from Telegram iOS (treats them as bots)
- **Fix:** Added Vercel server-side rewrite proxy in `frontend/vercel.json`:
  ```json
  "rewrites": [{ "source": "/api/:path*", "destination": "https://api.shineee.space/api/:path*" }]
  ```
  Frontend now fetches `/api/me` (same-origin) → no CORS, no Cloudflare inspection

### Bug 3: `sqlite3.Row.get()` AttributeError → HTTP 500
- **Symptom:** "Ошибка сервера: 500" after proxy fix
- **Root cause:** `routers/me.py` and `routers/config.py` called `.get()` on `sqlite3.Row` objects (which don't support dict-style `.get()`)
- **Fix:** Wrapped with `dict(user).get(...)` in both files on VPS

## E2E Result
Mini App opens in Telegram iOS showing:
- User name "Александр" (from Telegram initData + DB lookup)
- Subscription block: "Не активна" (correct — subscription expired)
- "Оформить подписку" CTA button
- "Поддержка" button in footer

**Phase 3 goal achieved:** Юзер открывает Mini App кнопкой в боте @shine_connect_bot и видит работающий дашборд end-to-end ✅
