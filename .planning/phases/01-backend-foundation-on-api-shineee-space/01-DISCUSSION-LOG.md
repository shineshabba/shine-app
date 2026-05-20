# Phase 1: Backend Foundation — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 01-backend-foundation-on-api-shineee-space
**Areas discussed:** Deploy location, services reuse, API response schema, deploy workflow, secrets

---

## Deploy Location

| Option | Description | Selected |
|--------|-------------|----------|
| ~/shine-app/backend/ | Отдельная папка рядом с ботом | ✓ |
| ~/vpn-bot/mini-app/ | Внутри папки бота | |

**User's choice:** ~/shine-app/backend/ (recommended)

---

## services/ Reuse

| Option | Description | Selected |
|--------|-------------|----------|
| Копировать файлы в backend | Изолированная копия db.py и xui.py | ✓ |
| Symlink на ~/vpn-bot/services/ | Один файл — два проекта | |

**User's choice:** Копировать файлы (recommended)

---

## /api/me Response Schema

| Option | Description | Selected |
|--------|-------------|----------|
| Минимально для дашборда | tg_user_id, name, subscription_active, subscription_end, device_limit | ✓ |
| Всё из DB сразу | Все поля таблицы users | |

**User's choice:** Минимально для дашборда (recommended)

---

## Deploy Workflow

| Option | Description | Selected |
|--------|-------------|----------|
| git pull на сервере | GitHub repo + git pull + systemctl restart | ✓ |
| rsync вручную | Копировать файлы без git | |

**User's choice:** git pull на сервере (recommended)

---

## Secrets

| Option | Description | Selected |
|--------|-------------|----------|
| .env файл на VPS | EnvironmentFile в systemd unit | ✓ |
| systemd Environment директивами | Секреты прямо в .service файле | |

**User's choice:** .env файл на VPS (recommended)

---

## .env переменные

| Option | Description | Selected |
|--------|-------------|----------|
| Ты решай | Claude определяет из кода services/ | ✓ |

**Notes:** Claude сам определит нужные переменные, изучив db.py и xui.py при планировании.

---

## Claude's Discretion

- Формат JSON-ошибок
- Rate limiting реализация
- Структура проекта (роутеры, middleware)
- Полный список env-переменных

## Deferred Ideas

None.
