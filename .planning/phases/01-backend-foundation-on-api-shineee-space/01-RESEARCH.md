# Phase 1: Backend Foundation on api.shineee.space — Research

**Researched:** 2026-05-20
**Domain:** FastAPI + systemd + nginx/SSL + Telegram initData HMAC validation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Backend деплоится в `~/shine-app/backend/` на VPS. Изолированный systemd-сервис.
- **D-02:** Git pull workflow: репо на GitHub, обновление через `git pull` + `systemctl restart shine-app-backend`.
- **D-03:** `services/db.py` и `services/xui.py` **копируются** (не symlink) из `~/vpn-bot/services/` в `~/shine-app/backend/services/`.
- **D-04:** SQLite база остаётся на `~/vpn-bot/users.db`. Backend читает напрямую (read-only).
- **D-05:** `GET /api/me` возвращает `{tg_user_id, name, subscription_active, subscription_end, device_limit}`. Нет юзера в DB — 404.
- **D-06:** `GET /api/config` — VLESS-ссылка для активного, 403 для неактивного. Точный JSON формат на усмотрение Claude.
- **D-07:** Секреты в `.env` (не в git). systemd читает через `EnvironmentFile`.
- **D-08:** Полный список env-переменных Claude определяет из `services/db.py` и `services/xui.py`. Минимум: `BOT_TOKEN`, `DB_PATH`, вероятно `XUI_BASE_URL`, `XUI_PASSWORD`, `XUI_INBOUND_ID`.

### Claude's Discretion

- Формат JSON-ошибок (401, 403, 404, 422) — выбирает Claude (стандартный FastAPI)
- Rate limiting implementation (slowapi или вручную)
- Структура проекта внутри `backend/`
- Полный список env-переменных

### Deferred Ideas (OUT OF SCOPE)

None — обсуждение оставалось в рамках фазы.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Backend FastAPI развёрнут как systemd service на VPS, порт 8000 | systemd unit file с EnvironmentFile, uvicorn/gunicorn, Restart=always |
| INFRA-02 | nginx vhost для `api.shineee.space` с Let's Encrypt SSL | certbot + nginx конфиг с proxy_pass localhost:8000 |
| INFRA-03 | DNS A-запись `api.shineee.space` → IP VPS | Настройка DNS через провайдера, TTL 60-300s |
| AUTH-01 | Backend валидирует Telegram initData через HMAC-SHA256 с bot token | Алгоритм: HMAC("WebAppData", bot_token) → HMAC(data_check_string, secret) |
| AUTH-03 | `tg_user_id` только из валидированного initData | Middleware извлекает user из распарсенного initData после валидации |
| AUTH-05 | Истёкший initData (>24ч) отклоняется | Проверка `auth_date` + `time.time()` в middleware |
| API-01 | `GET /api/me` — профиль юзера | Зависит от db.py; схема в D-05 |
| API-02 | `GET /api/config` — VLESS-ссылка или 403 | Зависит от xui.py; схема в D-06 |
| API-03 | `GET /api/health` — проверка живости | Простой endpoint, без auth |
| API-04 | Переиспользует `services/db.py` и `services/xui.py` | Копирование файлов, возможная адаптация под FastAPI (async/sync) |
| API-05 | JSON-ответы, `/docs` Swagger доступен | FastAPI auto-docs включён по умолчанию |
| API-06 | CORS разрешает только Vercel-домен | `allow_origin_regex` для `*.vercel.app` + localhost |
| API-07 | Rate limit ~60 req/min per user | slowapi с лимитером по user_id из initData |
</phase_requirements>

---

## Summary

Фаза 1 — это серверная инфраструктура: FastAPI-приложение на Python 3.12, работающее как systemd-сервис на существующем VPS, за nginx с SSL-терминацией на домене `api.shineee.space`. Ключевая задача — правильно реализовать Telegram initData HMAC-SHA256 валидацию как middleware, чтобы все защищённые endpoint'ы получали `tg_user_id` исключительно из криптографически проверенных данных.

Проект переиспользует уже существующий рабочий код бота (`services/db.py` и `services/xui.py`) — это значительно снижает риски. Основные трудозатраты: настройка инфраструктуры (systemd + nginx + SSL + DNS), реализация auth-middleware, и тонкое копирование существующих сервисов без поломки их зависимостей.

Верификация на финале — curl-тесты к живому HTTPS-endpoint'у с реальным initData (или тестовым токеном), проверка отклонения подделанных запросов.

**Первичная рекомендация:** FastAPI 0.136.1 + uvicorn 0.47.0 + slowapi 0.1.9 + python-dotenv 1.2.2 — всё стандартное, хорошо задокументированное.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fastapi | 0.136.1 | ASGI web framework, auto Swagger/OpenAPI | Де-факто стандарт для Python API, хорошо совместим с async и pydantic |
| uvicorn | 0.47.0 | ASGI сервер (для systemd ExecStart) | Рекомендован FastAPI официально, `fastapi[standard]` включает его |
| pydantic | 2.13.4 | Схемы запросов/ответов, валидация | Встроен в FastAPI, обязателен |
| python-dotenv | 1.2.2 | Загрузка `.env` в dev-режиме | Стандарт для конфигурации через env |
| slowapi | 0.1.9 | Rate limiting (Starlette/FastAPI) | Единственная зрелая библиотека rate limit для FastAPI, аналог flask-limiter |
| httpx | 0.28.1 | Async HTTP-клиент для xui.py | Если xui.py использует requests — заменить на httpx для async; если синхронный — оставить requests |

[VERIFIED: pypi.org — версии проверены на 2026-05-20]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gunicorn | ~23.x | Process manager + uvicorn workers | Опционально: для multi-worker продакшена (на VPS с 1-2 vCPU не критично) |
| requests | ~2.x | HTTP-клиент (sync) | Если xui.py уже использует requests и нет необходимости делать async |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| slowapi | ручной rate limit через dict + middleware | Самописный вариант проще, но без TTL-cleanup, утечки памяти при большом количестве users |
| uvicorn (direct) | gunicorn + uvicorn workers | gunicorn даёт graceful reload и несколько процессов, но для 19 users избыточно |

**Installation (на VPS):**
```bash
cd ~/shine-app/backend
python3 -m venv venv
source venv/bin/activate
pip install "fastapi[standard]" slowapi python-dotenv httpx
```

**Version verification:** [VERIFIED: pypi.org]
```
fastapi      0.136.1   (2024-12-18)
uvicorn      0.47.0
slowapi      0.1.9     (2024-02-05)
pydantic     2.13.4
python-dotenv 1.2.2
httpx        0.28.1
```

---

## Architecture Patterns

### Recommended Project Structure

```
~/shine-app/backend/
├── main.py              # FastAPI app, middleware, routers
├── auth.py              # Telegram initData validation middleware / dependency
├── routers/
│   ├── me.py            # GET /api/me
│   ├── config.py        # GET /api/config
│   └── health.py        # GET /api/health
├── services/
│   ├── db.py            # Скопировано из ~/vpn-bot/services/db.py
│   └── xui.py           # Скопировано из ~/vpn-bot/services/xui.py
├── models.py            # Pydantic response schemas
├── requirements.txt
├── .env                 # Секреты (НЕ в git), читается через EnvironmentFile в systemd
└── venv/                # Virtualenv (НЕ в git)
```

### Pattern 1: Telegram initData Validation Dependency

**Что:** FastAPI Dependency, которая извлекает и валидирует `X-Telegram-Init-Data` header.
**Когда использовать:** Инжектируется во все защищённые endpoint'ы. `GET /api/health` — без него.

**Алгоритм валидации** [CITED: docs.telegram-mini-apps.com/platform/init-data]:
1. Распарсить initData как query string (`urllib.parse.parse_qs`)
2. Извлечь и удалить `hash` из параметров
3. Отсортировать оставшиеся пары по ключу, склеить через `\n` → `data_check_string`
4. `secret_key = HMAC-SHA256(key="WebAppData", msg=bot_token.encode())`
5. `computed_hash = HMAC-SHA256(key=secret_key, msg=data_check_string.encode()).hexdigest()`
6. Сравнить `computed_hash == hash` через `hmac.compare_digest`
7. Проверить `auth_date`: `time.time() - int(auth_date) < 86400` (24 часа)

```python
# Source: docs.telegram-mini-apps.com/platform/init-data
import hashlib
import hmac
import time
from urllib.parse import unquote, parse_qsl
from fastapi import Header, HTTPException, Depends
import os

def validate_init_data(x_telegram_init_data: str = Header(...)) -> dict:
    try:
        parsed = dict(parse_qsl(unquote(x_telegram_init_data), keep_blank_values=True))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid initData format")

    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=401, detail="Missing hash")

    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed.items())
    )

    bot_token = os.environ["BOT_TOKEN"]
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed_hash, received_hash):
        raise HTTPException(status_code=401, detail="Invalid initData signature")

    auth_date = int(parsed.get("auth_date", 0))
    if time.time() - auth_date > 86400:
        raise HTTPException(status_code=401, detail="initData expired")

    import json
    user_data = json.loads(parsed.get("user", "{}"))
    return user_data  # содержит id, first_name, etc.
```

### Pattern 2: Rate Limiting с slowapi по user_id

**Что:** slowapi декоратор лимитирует запросы по `tg_user_id`, не по IP (пользователи за NAT/VPN).
**Когда использовать:** На всех API endpoint'ах, кроме `/api/health`.

```python
# Source: slowapi docs + github.com/laurentS/slowapi
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

def get_user_id(request: Request) -> str:
    # Извлекаем user_id из уже провалидированного state (если middleware сохраняет)
    # Или fallback к IP для /health
    return str(getattr(request.state, "tg_user_id", get_remote_address(request)))

limiter = Limiter(key_func=get_user_id)

@app.get("/api/me")
@limiter.limit("60/minute")
async def get_me(request: Request, user: dict = Depends(validate_init_data)):
    ...
```

### Pattern 3: systemd Unit File с EnvironmentFile

```ini
# /etc/systemd/system/shine-app-backend.service
[Unit]
Description=Shine App Backend (FastAPI)
After=network.target

[Service]
User=root
WorkingDirectory=/root/shine-app/backend
EnvironmentFile=/root/shine-app/backend/.env
ExecStart=/root/shine-app/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

[ASSUMED] Пользователь на VPS — `root`. Если нет, нужно заменить на реального пользователя.

### Pattern 4: nginx vhost для api.shineee.space

```nginx
# /etc/nginx/sites-available/api.shineee.space
server {
    listen 80;
    server_name api.shineee.space;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.shineee.space;

    ssl_certificate /etc/letsencrypt/live/api.shineee.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.shineee.space/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Pattern 5: CORS с allow_origin_regex для Vercel

```python
# Source: fastapi.tiangolo.com/tutorial/cors/
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["X-Telegram-Init-Data", "Content-Type"],
)
```

[VERIFIED: fastapi.tiangolo.com/tutorial/cors/ — `allow_origin_regex` поддерживается]

### Anti-Patterns to Avoid

- **`allow_origins=["*"]` с `allow_credentials=True`:** Браузеры отклоняют такую конфигурацию. Всегда указывать явные origins или использовать `allow_origin_regex`.
- **user_id в query params или теле запроса:** CLAUDE.md прямо запрещает. user_id только из валидированного initData.
- **Хранить `.env` в git:** EnvironmentFile в systemd указывает на файл вне репозитория.
- **Запускать FastAPI напрямую через `python main.py`:** Использовать uvicorn/gunicorn как ExecStart в systemd.
- **hmac сравнение через `==`:** Использовать `hmac.compare_digest()` для защиты от timing attacks.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Свой dict + счётчик + TTL | slowapi | Memory-safe, thread-safe, поддерживает различные окна (sliding window), автоматическая очистка |
| CORS | Ручные заголовки в каждом endpoint | CORSMiddleware | Корректно обрабатывает preflight OPTIONS, все edge-cases уже покрыты |
| Request validation | Ручной парсинг JSON | Pydantic schemas | Type coercion, error messages, OpenAPI spec генерируется автоматически |
| HMAC сравнение | `==` оператор | `hmac.compare_digest()` | Защита от timing attack |
| SSL/TLS | Самоподписанный cert | certbot + Let's Encrypt | Telegram требует валидный SSL для Mini App |

**Key insight:** В этой фазе нет нужды изобретать ничего нового — весь стек отлично задокументирован и используется тысячами продакшн-сервисов.

---

## Common Pitfalls

### Pitfall 1: initData уже URL-encoded в заголовке

**Что идёт не так:** initData приходит дважды URL-encoded из Telegram SDK на фронте. Если не сделать `unquote()` перед `parse_qsl()`, hash не совпадёт.
**Почему:** Telegram SDK кодирует данные, и при передаче в HTTP-заголовке браузер может добавить ещё одно кодирование.
**Как избежать:** Всегда делать `urllib.parse.unquote(x_telegram_init_data)` перед парсингом.
**Признак:** hash-валидация всегда возвращает 401, даже с заведомо корректным initData.

### Pitfall 2: CORS для *.vercel.app — нельзя через allow_origins

**Что идёт не так:** `allow_origins=["https://*.vercel.app"]` — wildcard в allow_origins НЕ работает в starlette/fastapi. Glob-паттерны не поддерживаются.
**Как избежать:** Использовать `allow_origin_regex=r"https://.*\.vercel\.app"` — это отдельный параметр middleware.
**Признак:** CORS preflight 403 с Vercel-домена несмотря на наличие `*.vercel.app` в allow_origins.

### Pitfall 3: SQLite concurrent read — WAL mode

**Что идёт не так:** По умолчанию SQLite в DELETE journal mode блокирует читателей при записи бота. Если бот активно пишет в users.db во время API-запроса — будет `database is locked`.
**Как избежать:** При открытии соединения включить WAL mode: `conn.execute("PRAGMA journal_mode=WAL")`. Это позволяет читать параллельно с записью.
**Признак:** Периодические ошибки 500 при высокой активности бота.

### Pitfall 4: services/xui.py может быть синхронным (requests)

**Что идёт не так:** Если xui.py использует `requests` — блокирующий вызов в async FastAPI endpoint будет блокировать event loop.
**Как избежать:** Оборачивать синхронные вызовы через `asyncio.get_event_loop().run_in_executor(None, sync_func)` или заменить `requests` на `httpx` с async API.
**Признак:** Медленные ответы при concurrent запросах к `/api/config`.

### Pitfall 5: certbot для нового поддомена при уже существующем cert

**Что идёт не так:** На VPS уже есть Let's Encrypt cert для `shineee.space`. certbot не добавит `api.shineee.space` автоматически.
**Как избежать:** Запросить cert явно: `certbot --nginx -d api.shineee.space`. Или переиспользовать существующий wildcard cert если он есть для `*.shineee.space`.
**Признак:** nginx падает с `ssl_certificate: file not found`.

### Pitfall 6: systemd EnvironmentFile — путь должен быть абсолютным

**Что идёт не так:** `EnvironmentFile=.env` не работает — systemd не знает рабочего каталога сервиса при загрузке переменных.
**Как избежать:** Всегда абсолютный путь: `EnvironmentFile=/root/shine-app/backend/.env`.

---

## Code Examples

### Минимальный main.py

```python
# Source: fastapi.tiangolo.com + slowapi docs
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from routers import me, config, health
from auth import get_user_id

limiter = Limiter(key_func=get_user_id)

app = FastAPI(title="Shine App API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["X-Telegram-Init-Data", "Content-Type"],
)

app.include_router(health.router, prefix="/api")
app.include_router(me.router, prefix="/api")
app.include_router(config.router, prefix="/api")
```

### GET /api/me Response Schema

```python
# models.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

class UserProfile(BaseModel):
    tg_user_id: int
    name: str
    subscription_active: bool
    subscription_end: Optional[date]
    device_limit: int

class ConfigResponse(BaseModel):
    vless_url: str

class HealthResponse(BaseModel):
    status: str  # "ok"
```

### Стандартные JSON-ошибки (FastAPI default)

FastAPI по умолчанию возвращает:
```json
{"detail": "Invalid initData signature"}
```
Это стандартный формат — менять не нужно. [VERIFIED: fastapi.tiangolo.com]

---

## Environment Variables — Полный список

На основе анализа контекста (db.py и xui.py из vpn-bot не доступны для прямого чтения, но D-08 в CONTEXT.md содержит полный перечень вероятных переменных):

| Variable | Source | Purpose |
|----------|--------|---------|
| `BOT_TOKEN` | Telegram BotFather | HMAC-SHA256 initData validation |
| `DB_PATH` | D-04 | Абсолютный путь к SQLite: `/root/vpn-bot/users.db` |
| `XUI_BASE_URL` | D-08 (вероятно) | URL x-ui panel: `http://127.0.0.1:21008` |
| `XUI_PASSWORD` | D-08 (вероятно) | Пароль x-ui admin |
| `XUI_INBOUND_ID` | CONTEXT.md canonical_refs | `2` (inbound для VPN-клиентов) |

[ASSUMED] Точные имена переменных для xui.py — необходимо проверить реальный файл `~/vpn-bot/services/xui.py` на VPS при выполнении плана.

---

## Runtime State Inventory

Фаза 1 — создание нового сервиса, не переименование. Однако есть важные аспекты:

| Category | Items | Action Required |
|----------|-------|-----------------|
| Stored data | SQLite `~/vpn-bot/users.db` — read-only для backend | Нет миграции, только read доступ |
| Live service config | x-ui panel на `127.0.0.1:21008` — уже работает | Нет изменений, xui.py читает существующие данные |
| OS-registered state | nginx — уже работает с cert для `shineee.space` | Добавить новый vhost `api.shineee.space`, получить cert |
| Secrets/env vars | BOT_TOKEN уже используется в vpn-bot `.env` | Создать новый `.env` для backend, скопировать переменные |
| Build artifacts | `~/vpn-bot/` — существующий бот не трогается | Только копирование services/ файлов |

**Критично:** Бот (`~/vpn-bot/`) и backend (`~/shine-app/backend/`) работают на одной SQLite БД параллельно. WAL mode обязателен.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3.12 | FastAPI + services | [ASSUMED] ✓ | 3.12 (CONTEXT.md: "Python 3.12") | — |
| nginx | nginx vhost + SSL proxy | [ASSUMED] ✓ | уже работает (shineee.space) | — |
| certbot | Let's Encrypt для api.shineee.space | [ASSUMED] ✓ | уже использовался для shineee.space | — |
| systemd | Сервис-менеджер | [ASSUMED] ✓ | Linux VPS стандарт | — |
| SQLite | users.db | [ASSUMED] ✓ | Уже используется ботом | — |
| x-ui panel | xui.py → VLESS конфиги | [ASSUMED] ✓ | `127.0.0.1:21008` (CONTEXT.md) | — |
| git | Деплой через git pull | [ASSUMED] ✓ | VPS стандарт | — |

**Проверка среды на VPS** (должна быть первым шагом плана):
```bash
python3 --version  # должен быть 3.12
nginx -v
certbot --version
systemctl --version
```

[ASSUMED] Все зависимости предположены доступными на основе CONTEXT.md. Требуется верификация при первом подключении к VPS.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-----------------|--------------|--------|
| flask + gunicorn | FastAPI + uvicorn | ~2020-2022 | Async native, auto-docs, type hints |
| ручная JWT-auth | Telegram initData HMAC | Telegram Mini Apps (2022+) | Не нужна отдельная auth-система |
| `requests` sync | `httpx` async | FastAPI era | Не блокирует event loop |
| pip глобально | venv + pip | всегда best practice | Изоляция зависимостей сервиса |

**Deprecated/outdated:**
- `flask-limiter` для FastAPI: используется slowapi (форк для Starlette/FastAPI)
- `aiohttp` в качестве ASGI сервера: стандарт теперь uvicorn

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Пользователь на VPS — `root` | Architecture Patterns (systemd unit) | Unit file не запустится, нужно заменить User= |
| A2 | `~/vpn-bot/services/xui.py` использует `requests` (sync) | Common Pitfalls #4 | Если уже async (httpx) — pitfall не актуален |
| A3 | На VPS Python 3.12 доступен как `python3` | Environment Availability | Возможно нужен `python3.12` или установка через pyenv |
| A4 | certbot уже установлен на VPS | Environment Availability | Нужна установка: `apt install certbot python3-certbot-nginx` |
| A5 | Имена env vars в xui.py: XUI_BASE_URL, XUI_PASSWORD, XUI_INBOUND_ID | Environment Variables | При копировании xui.py могут потребоваться другие переменные |

---

## Open Questions

1. **Какие именно функции используются из `services/xui.py` для получения VLESS-конфига?**
   - Что известно: xui.py работает с x-ui API, получает VLESS-конфиги клиентов
   - Что неясно: существует ли функция "получить конфиг по tg_user_id" или нужно реализовать маппинг
   - Рекомендация: Читать `~/vpn-bot/services/xui.py` и `~/vpn-bot/services/db.py` в Wave 0 плана, до написания `routers/config.py`

2. **Существует ли wildcard cert `*.shineee.space` на VPS?**
   - Что известно: nginx уже работает с cert для `shineee.space`
   - Что неясно: это cert для `shineee.space` + `www.shineee.space` или wildcard `*.shineee.space`
   - Рекомендация: Проверить `ls /etc/letsencrypt/live/` на VPS. Если wildcard — использовать его для `api.shineee.space` без нового certbot-запроса.

3. **Совместимость slowapi с FastAPI 0.136.1 (Python 3.12)?**
   - Что известно: slowapi 0.1.9 заявляет поддержку Python до 3.12
   - Что неясно: Проверена ли совместимость с новейшими FastAPI
   - Рекомендация: [LOW confidence] Протестировать при установке. Альтернатива — простой в-памяти rate limiter через middleware если slowapi не работает.

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: pypi.org/pypi/fastapi] — версия 0.136.1, дата релиза
- [VERIFIED: pypi.org/pypi/uvicorn] — версия 0.47.0
- [VERIFIED: pypi.org/pypi/slowapi] — версия 0.1.9 (2024-02-05)
- [VERIFIED: pypi.org/pypi/pydantic] — версия 2.13.4
- [VERIFIED: pypi.org/pypi/python-dotenv] — версия 1.2.2
- [VERIFIED: pypi.org/pypi/httpx] — версия 0.28.1
- [CITED: docs.telegram-mini-apps.com/platform/init-data] — алгоритм HMAC-SHA256 валидации, формат data_check_string, auth_date
- [CITED: fastapi.tiangolo.com/tutorial/cors/] — CORSMiddleware, allow_origin_regex

### Secondary (MEDIUM confidence)
- [WebSearch → slowapi.readthedocs.io] — rate limiting patterns для FastAPI
- [WebSearch → slingacademy.com] — FastAPI + nginx + Let's Encrypt deployment pattern
- [WebSearch → devopslogs.net] — systemd unit file для uvicorn

### Tertiary (LOW confidence)
- [ASSUMED] Структура `services/xui.py` и `services/db.py` — не читались напрямую (файлы на VPS, не в worktree)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — все версии верифицированы через PyPI
- Architecture: HIGH — паттерны подтверждены официальными доками FastAPI и Telegram Mini Apps
- Pitfalls: MEDIUM — большинство из практического опыта с данным стеком, часть [ASSUMED]
- Infrastructure (systemd/nginx): MEDIUM — стандартные паттерны, но точные пути и пользователь VPS [ASSUMED]

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (FastAPI/uvicorn обновляются часто, slowapi стабилен)
