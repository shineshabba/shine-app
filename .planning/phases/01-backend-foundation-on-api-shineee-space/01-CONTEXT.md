# Phase 1: Backend Foundation on api.shineee.space - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

FastAPI backend service развёрнут на VPS как systemd-сервис. Принимает авторизованные запросы из Telegram Mini App через Telegram initData HMAC validation. Возвращает профиль юзера и VLESS-конфиг через `/api/me` и `/api/config`. Работает за nginx с SSL на `api.shineee.space`. Переиспользует SQLite БД и x-ui API из существующего бота.

</domain>

<decisions>
## Implementation Decisions

### Deploy Location & Structure
- **D-01:** Backend деплоится в `~/shine-app/backend/` на VPS — отдельная папка рядом с ботом (`~/vpn-bot/`). Изолированный systemd-сервис.
- **D-02:** Git pull workflow: репо на GitHub, на сервере обновление через `git pull` + `systemctl restart shine-app-backend`. Плановщик включает шаги создания/инициализации репо если его нет.

### Reuse of Existing Services
- **D-03:** `services/db.py` и `services/xui.py` из `~/vpn-bot/services/` **копируются** в `~/shine-app/backend/services/`. Не symlink, не shared import. При обновлениях в боте — вручную переносить изменения.
- **D-04:** SQLite база остаётся на старом пути (`~/vpn-bot/users.db`). Backend читает её напрямую (read-only для данных подписки).

### API Response Schema
- **D-05:** `GET /api/me` возвращает минимальный набор для дашборда:
  ```json
  {
    "tg_user_id": 123456789,
    "name": "Ivan",
    "subscription_active": true,
    "subscription_end": "2026-06-20",
    "device_limit": 5
  }
  ```
  Если юзер в DB но подписка истекла — `subscription_active: false`, `subscription_end` — дата истечения.
  Если юзера нет в DB — 404 (frontend покажет заглушку «Пройдите /start в боте»).
- **D-06:** `GET /api/config` возвращает VLESS-ссылку для активного подписчика, 403 для неактивного. Claude определяет точный JSON-формат при планировании.

### Secrets & Environment
- **D-07:** Секреты в `.env` файле на VPS (не в git). systemd читает через `EnvironmentFile`.
- **D-08:** Claude определяет полный список env-переменных самостоятельно, изучив `services/db.py` и `services/xui.py` при планировании. Минимум: `BOT_TOKEN`, `DB_PATH`. Вероятно также: `XUI_BASE_URL`, `XUI_PASSWORD`, `XUI_INBOUND_ID` (если они нужны для xui.py).

### Claude's Discretion
- Формат JSON-ошибок (401, 403, 404, 422) — Claude выбирает стандартный FastAPI формат
- Rate limiting implementation (slowapi или вручную) — Claude выбирает
- Структура проекта внутри backend/ (роутеры, middleware, модели) — Claude выбирает разумную
- Полный список env-переменных — Claude определяет из кода services/

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Services (критично — переиспользуются)
- `~/vpn-bot/services/db.py` — работа с SQLite, функции получения юзера по tg_user_id, проверка подписки
- `~/vpn-bot/services/xui.py` — работа с x-ui API, получение VLESS-конфига клиента
- `~/vpn-bot/users.db` — SQLite БД с таблицами users, payments, acceptance_log

### Infrastructure
- VPS IP: `205.172.56.163`, nginx уже работает с cert на `shineee.space`
- x-ui panel: `127.0.0.1:21008`, inbound `XUI_INBOUND_ID=2`
- Существующий бот: `~/vpn-bot/`, Python 3.12, aiogram 3.7.0

### Phase Requirements
- INFRA-01, INFRA-02, INFRA-03: systemd + nginx + SSL
- AUTH-01, AUTH-03, AUTH-05: Telegram initData validation
- API-01..API-07: эндпойнты, CORS, rate limit

No external ADRs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `~/vpn-bot/services/db.py`: функции доступа к SQLite — скопировать в backend/services/db.py
- `~/vpn-bot/services/xui.py`: x-ui API клиент — скопировать в backend/services/xui.py
- Путь к БД: `~/vpn-bot/users.db` (backend открывает для чтения)

### Established Patterns
- Бот уже проверяет подписку через db.py — переиспользуем ту же логику
- xui.py уже умеет создавать/получать клиентов — нужна функция получения VLESS-конфига по tg_user_id

### Integration Points
- nginx на VPS: добавить новый vhost `api.shineee.space` → `localhost:8000`
- systemd: новый unit `shine-app-backend.service`
- SQLite: read-only доступ, бот и backend работают с одной БД параллельно

</code_context>

<specifics>
## Specific Ideas

- Backend должен запускаться **независимо от бота** — падение backend не аффектит бота
- `/docs` (Swagger) должен быть доступен для ручного тестирования эндпойнтов
- CORS: разрешать только Vercel-домен (`*.vercel.app` и будущий кастомный домен) + `localhost` для разработки

</specifics>

<deferred>
## Deferred Ideas

None — обсуждение оставалось в рамках фазы.

</deferred>

---

*Phase: 01-backend-foundation-on-api-shineee-space*
*Context gathered: 2026-05-20*
