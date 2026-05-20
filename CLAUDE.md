<!-- GSD:project-start source:PROJECT.md -->
## Project

**Shine Mini App**

Telegram Mini App для VPN-сервиса **Shine** — клиентский UI внутри Telegram, открывающийся из бота `@shine_connect_bot`. Заменяет текущий chat-based интерфейс на полноценный визуальный дашборд с управлением подпиской, конфигом и (в будущих фазах) встроенными AI-инструментами. Целевая аудитория — действующие 19 юзеров сервиса и новые подписчики через Tribute.

**Core Value:** Юзер открывает Mini App и за один экран видит **статус подписки + конфиг VPN** без поиска по чату. Если эта функция не работает — Mini App не имеет смысла.

### Constraints

- **Tech stack**: Frontend = React + Vite + TypeScript + Tailwind CSS + `@telegram-apps/sdk-react`. Backend = FastAPI + Python 3.12. — Современный стек для Telegram Mini Apps, переиспользует существующий Python-код бота.
- **Hosting**: Frontend = Vercel (free tier, авто-деплой). Backend = тот же VPS 205.172.56.163 как отдельный systemd-сервис на порту 8000. — Бесплатно, разделение ответственности (падение API не валит бота).
- **Domain**: `api.shineee.space` для backend (отдельный nginx vhost + Let's Encrypt). Frontend на `*.vercel.app` или кастомном поддомене позже. — Чистая изоляция, проще масштабировать.
- **Auth**: Только Telegram initData HMAC validation. Нет cookies, нет JWT, нет отдельной auth-системы. — Telegram уже знает кто юзер, нет смысла дублировать.
- **Performance**: Mini App должен open < 2s на мобильном 4G. Bundle < 300KB gzipped. — Telegram users impatient, и в РФ нестабильный интернет.
- **No JS-frameworks for backend**: FastAPI остаётся на Python чтобы переиспользовать `services/db.py` и `services/xui.py` из существующего бота. — Не дублируем БД-логику.
- **Security**: Все эндпойнты валидируют Telegram initData. Backend не доверяет фронту (никаких user_id в query). — Защита от подделки запросов.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
