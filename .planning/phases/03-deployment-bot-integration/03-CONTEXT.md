# Phase 3: Deployment + Bot Integration - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Задеплоить фронтенд на Vercel с кастомным доменом app.shineee.space, зарегистрировать Mini App в BotFather, добавить кнопку «🚀 Открыть приложение» в @shine_connect_bot (ReplyKeyboard + MenuButton через BotFather), и провести end-to-end проверку полного сценария с реальным юзером.

</domain>

<decisions>
## Implementation Decisions

### Vercel Deployment

- **D-01:** Vercel project root directory = `frontend/` (не корень репо).
- **D-02:** Кастомный домен сразу: `app.shineee.space` → CNAME на Vercel. Let's Encrypt на стороне Vercel.
- **D-03:** BotFather и WebAppInfo: URL = `https://app.shineee.space`.
- **D-04:** `VITE_API_URL` вынести из хардкода в env var. В коде: `import.meta.env.VITE_API_URL`. В Vercel dashboard: `VITE_API_URL=https://api.shineee.space`. Для локальной разработки: `.env.local` с `VITE_API_URL=http://localhost:8000`.

### GitHub Setup

- **D-05:** GitHub репо: `shine-app` (github.com/shineshabba/shine-app). Верхний уровень — весь монорепо (backend/ + frontend/).
- **D-06:** Vercel подключается к GitHub репо, деплоит только `frontend/` subdirectory при push в main.

### Bot Integration

- **D-07:** Кнопка «🚀 Открыть приложение» — ReplyKeyboardMarkup + BotFather MenuButton (webapp_url).
- **D-08:** Кнопка показывается **всем юзерам** без проверки статуса подписки. Mini App сам разбирается со статусом и показывает нужный экран.
- **D-09:** Старых кнопок «Мой конфиг» в боте нет — fallback не нужен. Просто добавляем новую кнопку.
- **D-10:** Код бота в `~/vpn-bot/` на VPS правится **прямо через SSH**. Плановщик генерирует конкретные SSH-команды с diff изменений.
- **D-11:** Плановщик сам смотрит структуру бота через SSH (`~/vpn-bot/`) чтобы найти /start handler и место для ReplyKeyboard.

### Testing & Validation

- **D-12:** End-to-end проверка: исполнитель делает curl /health, curl /api/me с тестовым initData, затем ручная инструкция для пользователя открыть Mini App из бота на реальном Telegram.
- **D-13:** Проверяется полный сценарий: открыть из бота → авторизация → увидеть статус и конфиг.

### Claude's Discretion

- Конкретные параметры vercel.json (если нужен) — Claude определяет
- Структура CNAME записи (через какого DNS провайдера) — Claude уточняет через SSH (nginx/DNS setup уже известен из Phase 1)
- Порядок шагов деплоя (GitHub push → Vercel connect → DNS → BotFather) — Claude оптимизирует
- Проверка корректности DNS propagation — Claude включает в план

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 & 2 Context
- `.planning/phases/01-backend-foundation-on-api-shineee-space/01-CONTEXT.md` — решения по backend, VPS, nginx
- `.planning/phases/02-frontend-dashboard-react-mini-app/02-CONTEXT.md` — решения по фронтенду, компоненты

### Requirements
- `.planning/REQUIREMENTS.md` — INFRA-04, INFRA-05, DASH-01, BOT-01, BOT-02, BOT-03
- `.planning/ROADMAP.md` — Phase 3 success criteria

### Existing Frontend
- `frontend/src/api/client.ts` — здесь хардкодный API_BASE, нужно заменить на `import.meta.env.VITE_API_URL`
- `frontend/vite.config.ts` — build config, manualChunks уже настроены
- `frontend/package.json` — зависимости и scripts

### Existing Backend
- `backend/main.py` — CORS уже настроен на `*.vercel.app` regex + кастомные домены нужно добавить
- VPS infrastructure: nginx на `205.172.56.163`, существующий cert для `shineee.space`

### Bot (на VPS)
- `~/vpn-bot/` на VPS `205.172.56.163` — код бота, структуру изучить через SSH при планировании
- Бот: `@shine_connect_bot`, aiogram 3.7.0, Python 3.12

No external ADRs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/api/client.ts` — API client с `API_BASE` константой, нужно минимальное изменение
- CORS в `backend/main.py` уже поддерживает `*.vercel.app` regex — нужно добавить `app.shineee.space`
- Nginx на VPS уже настроен для `api.shineee.space` — аналогичная конфигурация для `app.shineee.space` (CNAME → Vercel, не VPS)

### Established Patterns
- Phase 1 деплой: git pull + systemctl restart на VPS через SSH — аналогичный workflow для бота
- Backend уже работает как systemd сервис — паттерн известен

### Integration Points
- Vercel: `frontend/` subdirectory → `https://app.shineee.space`
- BotFather: WebApp URL = `https://app.shineee.space`
- Bot ReplyKeyboard: `~/vpn-bot/` /start handler — изучить и добавить WebAppInfo кнопку
- CORS: добавить `https://app.shineee.space` в allow_origins в `backend/main.py`

</code_context>

<specifics>
## Specific Ideas

- Vercel project name: `shine-app` (совпадает с GitHub repo)
- GitHub repo: `github.com/shineshabba/shine-app`
- Mini App URL для BotFather и WebAppInfo: `https://app.shineee.space`
- DNS для app.shineee.space: CNAME запись → Vercel (не A-запись на VPS)
- VITE_API_URL в Vercel env: `https://api.shineee.space`

</specifics>

<deferred>
## Deferred Ideas

None — обсуждение оставалось в рамках фазы.

</deferred>

---

*Phase: 03-deployment-bot-integration*
*Context gathered: 2026-05-21*
