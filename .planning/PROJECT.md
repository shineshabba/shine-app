# Shine Mini App

## What This Is

Telegram Mini App для VPN-сервиса **Shine** — клиентский UI внутри Telegram, открывающийся из бота `@shine_connect_bot`. Заменяет текущий chat-based интерфейс на полноценный визуальный дашборд с управлением подпиской, конфигом и (в будущих фазах) встроенными AI-инструментами. Целевая аудитория — действующие 19 юзеров сервиса и новые подписчики через Tribute.

## Core Value

Юзер открывает Mini App и за один экран видит **статус подписки + конфиг VPN** без поиска по чату. Если эта функция не работает — Mini App не имеет смысла.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **DASH-01**: Mini App открывается из бота кнопкой `web_app`, авторизует юзера через Telegram initData
- [ ] **DASH-02**: На главном экране показывается статус подписки (активна/нет, дата до)
- [ ] **DASH-03**: На главном экране показывается VPN-конфиг (VLESS-ссылка) с кнопкой «Копировать» и QR-кодом во весь экран
- [ ] **DASH-04**: Виден лимит устройств (5) и индикатор «использовано»
- [ ] **DASH-05**: Кнопка «Оформить/Продлить подписку» открывает Tribute (deep link)
- [ ] **DASH-06**: Кнопка «Поддержка» — список инструкций по устройствам + «Написать в чат»
- [ ] **DASH-07**: Незарегистрированный юзер видит экран-заглушку «Пройдите /start в боте»
- [ ] **DASH-08**: Backend-эндпойнты переиспользуют существующую SQLite БД и x-ui API
- [ ] **AI-01**: AI-чат через Groq (Llama/DeepSeek) с историей сессий (v2)
- [ ] **AI-02**: Генератор картинок через Gemini 2.5 Flash Image (v2)
- [ ] **AI-03**: Дневные лимиты на AI-запросы per юзер (v2)

### Out of Scope

- **Регистрация внутри Mini App** — FSM остаётся в боте, Mini App только для зарегистрированных (упрощает auth и снижает риск багов)
- **Лента новостей / статус серверов внутри Mini App** — для этого есть закрытая группа `Shine|Members`, Mini App остаётся сфокусированным
- **Чат с админом внутри Mini App** — кнопка просто открывает диалог с админом в Telegram
- **Платежи внутри Mini App** — Tribute обрабатывает платежи в своём интерфейсе, мы делаем редирект
- **Многоязычность** — только русский, целевая аудитория русскоязычная
- **PWA / десктоп / web вне Telegram** — только Telegram Mini App, без отдельного web-сайта
- **Управление в админке через Mini App** — admin-функции остаются в `@Virtuspronorm_bot`

## Context

**Существующая инфраструктура:**
- VPS `205.172.56.163` (Hostkey, Германия): xray (XHTTP/8443) + nginx + Let's Encrypt cert на `shineee.space`
- Двухботовая архитектура: `@shine_connect_bot` (клиентский) + `@Virtuspronorm_bot` (админский)
- SQLite `~/vpn-bot/users.db` с 19 зарегистрированными юзерами, таблицы: `users`, `payments`, `acceptance_log`
- x-ui панель на `127.0.0.1:21008`, inbound XHTTP с `XUI_INBOUND_ID=2`, лимит 5 IP per client
- Подписочная модель через Tribute (`https://t.me/tribute/app?startapp=sVHH`)
- Закрытая группа `Shine|Members` (`-1003915381589`) — Tribute управляет членством, бот ловит `chat_member` events
- Существующий бот написан на aiogram 3.7.0, Python 3.12

**Юридический контекст:**
- Сервис позиционируется как «закрытое сообщество с цифровыми инструментами», не «VPN-сервис»
- Tribute страница: «Shine Network — Закрытое сообщество для тех, кто следит за цифровой независимостью»
- В UI Mini App избегаем слова «VPN», «прокси», «обход блокировок»
- Самозанятость владельца, чеки выбиваются вручную в «Мой налог»

## Constraints

- **Tech stack**: Frontend = React + Vite + TypeScript + Tailwind CSS + `@telegram-apps/sdk-react`. Backend = FastAPI + Python 3.12. — Современный стек для Telegram Mini Apps, переиспользует существующий Python-код бота.
- **Hosting**: Frontend = Vercel (free tier, авто-деплой). Backend = тот же VPS 205.172.56.163 как отдельный systemd-сервис на порту 8000. — Бесплатно, разделение ответственности (падение API не валит бота).
- **Domain**: `api.shineee.space` для backend (отдельный nginx vhost + Let's Encrypt). Frontend на `*.vercel.app` или кастомном поддомене позже. — Чистая изоляция, проще масштабировать.
- **Auth**: Только Telegram initData HMAC validation. Нет cookies, нет JWT, нет отдельной auth-системы. — Telegram уже знает кто юзер, нет смысла дублировать.
- **Performance**: Mini App должен open < 2s на мобильном 4G. Bundle < 300KB gzipped. — Telegram users impatient, и в РФ нестабильный интернет.
- **No JS-frameworks for backend**: FastAPI остаётся на Python чтобы переиспользовать `services/db.py` и `services/xui.py` из существующего бота. — Не дублируем БД-логику.
- **Security**: Все эндпойнты валидируют Telegram initData. Backend не доверяет фронту (никаких user_id в query). — Защита от подделки запросов.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mini App вместо нативного web-сайта | Юзер уже в Telegram, нативная авторизация, нативные UI компоненты | — Pending |
| Регистрация остаётся в боте, не в Mini App | FSM уже работает, перенос = большая работа и баги | — Pending |
| Backend как отдельный systemd-сервис, не часть бота | Изоляция: падение API не валит бот, можно перезапускать независимо | — Pending |
| `api.shineee.space` как поддомен | Чистая граница ответственности, не пересекается с xray /xh | — Pending |
| Vercel для фронта | Бесплатно, авто-HTTPS, авто-деплой из git, идеален для Telegram Mini Apps | — Pending |
| Auth только через Telegram initData | Не нужны cookies/JWT, Telegram уже доверенный источник | — Pending |
| Vite + React + TS + Tailwind | Стандарт 2025 для Mini Apps, малый bundle, быстрая разработка | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-20 after initialization*
