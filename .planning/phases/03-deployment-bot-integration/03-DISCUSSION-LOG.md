# Phase 3: Deployment + Bot Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 03-deployment-bot-integration
**Areas discussed:** Bot button placement, Vercel URL / домен, GitHub repo + Vercel connect, Bot code workflow

---

## Bot button placement

| Option | Description | Selected |
|--------|-------------|----------|
| ReplyKeyboard /start + Menu button | Кнопка в reply-клавиатуре + BotFather MenuButton | ✓ |
| MenuButton через BotFather только | Настраивается через BotFather /mybots, без изменения кода | |
| Inline button в сообщении /start | Кнопка внутри сообщения бота (inline keyboard) | |

**User's choice:** ReplyKeyboard + Menu button
**Notes:** Кнопка показывается всем юзерам (не только активным). Mini App сам управляет состоянием. Старых кнопок «Мой конфиг» нет — fallback не нужен.

---

## Vercel URL / домен

| Option | Description | Selected |
|--------|-------------|----------|
| *.vercel.app сейчас, домен потом | Быстрый запуск, кастомный домен позже | |
| app.shineee.space сразу | CNAME → Vercel, Let's Encrypt на стороне Vercel | ✓ |

**User's choice:** app.shineee.space сразу
**Notes:** BotFather и WebAppInfo используют этот URL сразу.

---

## GitHub repo + Vercel connect

| Option | Description | Selected |
|--------|-------------|----------|
| shine-app | github.com/shineshabba/shine-app | ✓ |
| shine-mini-app | github.com/shineshabba/shine-mini-app | |

**User's choice:** shine-app
**Notes:** VITE_API_URL выносим в env var (было хардкодом в api/client.ts). Vercel root dir = frontend/.

---

## Bot code workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Прямо на VPS через SSH | SSH → редактируем ~/vpn-bot/, рестартим сервис | ✓ |
| GitHub репо бота | git push → git pull на VPS | |

**User's choice:** Прямо на VPS через SSH
**Notes:** Плановщик сам смотрит структуру бота через SSH. BotFather URL = https://app.shineee.space. E2E проверку делает исполнитель + ручная инструкция для пользователя.

---

## Claude's Discretion

- vercel.json параметры — Claude определяет
- Структура CNAME (DNS провайдер) — уточнить через SSH
- Порядок шагов деплоя — Claude оптимизирует
- DNS propagation check — включить в план

## Deferred Ideas

None.
