# Roadmap — Shine Mini App v1

**Granularity:** Coarse
**Total v1 requirements:** 36
**Phases:** 3
**Coverage:** 36/36 v1 requirements mapped

## Phases

- [ ] **Phase 1: Backend Foundation on api.shineee.space** — FastAPI service + Telegram initData auth + endpoints + nginx/SSL on api.shineee.space, переиспользуя SQLite и x-ui API существующего бота
- [ ] **Phase 2: Frontend Dashboard (React Mini App)** — React/Vite/Tailwind фронт с авторизацией через initData и главным экраном: статус подписки, VLESS-конфиг, QR, кнопки оплаты и поддержки
- [ ] **Phase 3: Deployment + Bot Integration** — Деплой фронта на Vercel, регистрация Mini App в BotFather, кнопка `web_app` в `@shine_connect_bot`, end-to-end запуск из Telegram

## Phase Details

### Phase 1: Backend Foundation on api.shineee.space

**Goal**: Backend готов принимать авторизованные запросы из Mini App и возвращать профиль/конфиг юзера

**Depends on**: Nothing (first phase)

**Requirements**: INFRA-01, INFRA-02, INFRA-03, AUTH-01, AUTH-03, AUTH-05, API-01, API-02, API-03, API-04, API-05, API-06, API-07

**Success Criteria** (what must be TRUE):
  1. `https://api.shineee.space/api/health` отвечает 200 OK через валидный Let's Encrypt SSL
  2. `GET /api/me` с валидным `X-Telegram-Init-Data` возвращает профиль реального юзера из существующей SQLite БД (статус подписки, дата окончания, лимит устройств)
  3. `GET /api/config` возвращает VLESS-ссылку для активного подписчика и 403 для неактивного, переиспользуя `services/xui.py`
  4. Запрос с подделанным или истёкшим (>24ч) initData отклоняется с 401; `tg_user_id` берётся только из валидированного initData
  5. Backend работает как systemd-сервис на порту 8000, CORS разрешает только Vercel-домен, rate-limit ~60 req/min per user, `/docs` доступен

**Plans**: TBD

### Phase 2: Frontend Dashboard (React Mini App)

**Goal**: React Mini App показывает юзеру за один экран всё нужное: статус подписки, конфиг VPN, QR, кнопки оплаты и поддержки

**Depends on**: Phase 1

**Requirements**: AUTH-02, AUTH-04, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, FE-01, FE-02, FE-03, FE-04, FE-05, FE-06, FE-07, FE-08

**Success Criteria** (what must be TRUE):
  1. Главный экран активного подписчика показывает: имя, «Активна до DD.MM.YYYY», VLESS-ссылку с кнопками «Копировать» и «Показать QR» (full-screen overlay), индикатор «Лимит: 5 устройств»
  2. Неактивный подписчик видит только кнопку «Оформить/Продлить подписку», которая открывает Tribute через `tg.openTelegramLink()`; VLESS-конфиг скрыт
  3. Незарегистрированный юзер (не в БД) видит экран-заглушку «Пройдите /start в боте @shine_connect_bot»
  4. Все тексты на русском, применяется Telegram theme (light/dark), вёрстка работает на mobile от 320px, есть loading-состояния и error boundary
  5. Кнопка «Поддержка» открывает список инструкций (iOS/Android/Windows/Mac) и кнопку «Написать админу» (deep-link в Telegram)
  6. Bundle gzipped < 300KB, open time на 4G < 2s; каждый API-запрос содержит header `X-Telegram-Init-Data`

**Plans**: TBD
**UI hint**: yes

### Phase 3: Deployment + Bot Integration

**Goal**: Юзер открывает Mini App кнопкой в боте `@shine_connect_bot` и видит работающий дашборд end-to-end

**Depends on**: Phase 2

**Requirements**: INFRA-04, INFRA-05, DASH-01, BOT-01, BOT-02, BOT-03

**Success Criteria** (what must be TRUE):
  1. Frontend задеплоен на Vercel с авто-деплоем из git, доступен по публичному HTTPS-URL
  2. Mini App зарегистрирован в BotFather и привязан к `@shine_connect_bot` с URL Vercel-фронта
  3. В главном меню `@shine_connect_bot` есть кнопка «🚀 Открыть приложение» (`WebAppInfo`), которая открывает Mini App внутри Telegram
  4. Старые кнопки «Мой конфиг» остаются в боте как fallback
  5. Реальный юзер из 19 существующих может открыть Mini App из бота, авторизоваться, увидеть свой статус и скопировать конфиг — полный сценарий работает на iOS и Android Telegram

**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Backend Foundation on api.shineee.space | 0/0 | Not started | - |
| 2. Frontend Dashboard (React Mini App) | 0/0 | Not started | - |
| 3. Deployment + Bot Integration | 0/0 | Not started | - |

## Deferred to v2

- AI-01..AI-05 (Groq AI-чат, Gemini генератор картинок, лимиты, галерея)
- DEV-01, DEV-02 (real-time счётчик устройств, revoke по IP)

---
*Created: 2026-05-20*
