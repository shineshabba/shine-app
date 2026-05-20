# Requirements — Shine Mini App v1

## v1 Requirements

### Infrastructure & Deploy

- [ ] **INFRA-01**: Backend FastAPI развёрнут как systemd service на VPS, порт 8000
- [ ] **INFRA-02**: nginx vhost для `api.shineee.space` с Let's Encrypt SSL
- [ ] **INFRA-03**: DNS A-запись `api.shineee.space` → IP VPS, TTL 60-300s
- [ ] **INFRA-04**: Frontend задеплоен на Vercel с авто-деплоем из git
- [ ] **INFRA-05**: Mini App зарегистрирован в BotFather и подключен к `@shine_connect_bot`

### Authentication

- [ ] **AUTH-01**: Backend валидирует Telegram initData через HMAC-SHA256 с bot token
- [ ] **AUTH-02**: Frontend передаёт initData в каждом API-запросе (header `X-Telegram-Init-Data`)
- [ ] **AUTH-03**: Backend извлекает `tg_user_id` только из валидированного initData (никогда из тела запроса)
- [ ] **AUTH-04**: Незарегистрированный юзер (не в БД) видит экран-заглушку «Пройдите /start в боте @shine_connect_bot»
- [ ] **AUTH-05**: Истёкший initData (старше 24 часов) отклоняется backend'ом

### Dashboard

- [ ] **DASH-01**: Главный экран открывается из бота кнопкой `web_app` (InlineKeyboardButton с url=`https://shine-app.vercel.app`)
- [ ] **DASH-02**: Показывает статус подписки: «Активна до 20.06.2026» / «Не активна — оформите»
- [ ] **DASH-03**: Показывает VLESS-конфиг с кнопками «Копировать ссылку» и «Показать QR» (full-screen QR overlay)
- [ ] **DASH-04**: Показывает индикатор устройств: «Лимит: 5 устройств» (без real-time счётчика подключённых в v1)
- [ ] **DASH-05**: Кнопка «Оформить подписку» / «Продлить» открывает Tribute URL через `tg.openTelegramLink()`
- [ ] **DASH-06**: Если подписка не активна — VLESS-конфиг скрыт, видна только кнопка оплаты
- [ ] **DASH-07**: Применяется Telegram theme (light/dark в зависимости от темы клиента)
- [ ] **DASH-08**: Кнопка «Поддержка» — список инструкций по устройствам (iOS / Android / Windows / Mac) и кнопка «Написать админу» (открывает чат с админом)

### Backend API

- [ ] **API-01**: `GET /api/me` — возвращает профиль юзера (имя, статус подписки, дата окончания, лимит устройств)
- [ ] **API-02**: `GET /api/config` — возвращает VLESS-ссылку для текущего юзера (403 если подписка не активна)
- [ ] **API-03**: `GET /api/health` — проверка живости backend
- [ ] **API-04**: Backend переиспользует `services/db.py` и `services/xui.py` из существующего проекта `~/vpn-bot`
- [ ] **API-05**: Все эндпойнты возвращают JSON, документация через FastAPI auto-docs (`/docs`)
- [ ] **API-06**: CORS настроен: разрешён только Vercel-домен фронта
- [ ] **API-07**: Rate limit per юзер (например 60 запросов/мин) для защиты от спама

### Frontend

- [ ] **FE-01**: React 19 + Vite 6 + TypeScript + Tailwind CSS 4
- [ ] **FE-02**: Использует `@telegram-apps/sdk-react` для интеграции с Telegram
- [ ] **FE-03**: Bundle gzipped < 300KB
- [ ] **FE-04**: Open время на 4G < 2 секунд
- [ ] **FE-05**: Поддержка темы Telegram (light/dark) автоматически
- [ ] **FE-06**: Все тексты на русском (без многоязычности в v1)
- [ ] **FE-07**: Адаптивная вёрстка под mobile (минимум 320px)
- [ ] **FE-08**: Loading-состояния и error boundaries

### Bot Integration

- [ ] **BOT-01**: В `@shine_connect_bot` добавлена кнопка `[🚀 Открыть приложение]` в главном меню (для активных подписчиков и для unpaid)
- [ ] **BOT-02**: Кнопка использует `WebAppInfo` с URL фронтенда
- [ ] **BOT-03**: Старые кнопки «Мой конфиг» остаются как fallback (на случай если Mini App не работает)

## v2 Requirements (deferred)

- [ ] **AI-01**: AI-чат через Groq (Llama 3.3 / DeepSeek) с историей в БД
- [ ] **AI-02**: Дневной лимит /ai (30/день per юзер)
- [ ] **AI-03**: Генератор картинок через Gemini 2.5 Flash Image
- [ ] **AI-04**: Дневной лимит /img (10/день per юзер)
- [ ] **AI-05**: Галерея сгенерированных картинок в Mini App
- [ ] **DEV-01**: Real-time счётчик подключённых устройств (через xray API stats)
- [ ] **DEV-02**: Возможность отзывать конкретные устройства/IP

## Out of Scope

- **Регистрация внутри Mini App** — остаётся в боте, не дублируем FSM
- **Лента новостей / статус серверов** — для этого есть закрытая группа `Shine|Members`
- **Платежи внутри Mini App** — Tribute обрабатывает в своём интерфейсе, мы делаем редирект
- **Многоязычность** — только русский
- **Web вне Telegram (PWA, отдельный сайт)** — только Mini App
- **Admin-функции в Mini App** — остаются в `@Virtuspronorm_bot`
- **Темизация / кастомные темы** — используется встроенная Telegram theme
- **Аналитика юзеров** — не нужна для 19 юзеров, добавим если будет рост
- **Push-уведомления** — Telegram уже умеет, нет смысла дублировать
- **Offline mode** — Mini App всегда online (Telegram требует интернет)

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 3 | Pending |
| INFRA-05 | Phase 3 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 1 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| DASH-04 | Phase 2 | Pending |
| DASH-05 | Phase 2 | Pending |
| DASH-06 | Phase 2 | Pending |
| DASH-07 | Phase 2 | Pending |
| DASH-08 | Phase 2 | Pending |
| API-01 | Phase 1 | Pending |
| API-02 | Phase 1 | Pending |
| API-03 | Phase 1 | Pending |
| API-04 | Phase 1 | Pending |
| API-05 | Phase 1 | Pending |
| API-06 | Phase 1 | Pending |
| API-07 | Phase 1 | Pending |
| FE-01 | Phase 2 | Pending |
| FE-02 | Phase 2 | Pending |
| FE-03 | Phase 2 | Pending |
| FE-04 | Phase 2 | Pending |
| FE-05 | Phase 2 | Pending |
| FE-06 | Phase 2 | Pending |
| FE-07 | Phase 2 | Pending |
| FE-08 | Phase 2 | Pending |
| BOT-01 | Phase 3 | Pending |
| BOT-02 | Phase 3 | Pending |
| BOT-03 | Phase 3 | Pending |

**Coverage:** 36/36 v1 requirements mapped to phases. No orphans.
