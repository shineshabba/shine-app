# Phase 2: Frontend Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 02-frontend-dashboard-react-mini-app
**Areas discussed:** Архитектура экранов, VPN-конфиг UX, Визуальный стиль, Экран поддержки

---

## Архитектура экранов

| Option | Description | Selected |
|--------|-------------|----------|
| Один экран (SPA) | Всё на одной странице, QR overlay, поддержка как bottom sheet | ✓ |
| 2 экрана (Главный + Поддержка) | React Router, отдельный экран поддержки | |

**Header формат:**
| Option | Selected |
|--------|----------|
| «Привет, [Name]» + статус рядом | |
| Просто имя слева + иконка/тема справа | ✓ |

**Порядок блоков:**
| Option | Selected |
|--------|----------|
| Подписка → Конфиг → Поддержка | ✓ |
| Подписка → Оплата → Конфиг | |

**Кнопка Поддержки:**
| Option | Selected |
|--------|----------|
| ghost/outline кнопка внизу | |
| icon + текст «Поддержка» | ✓ |

---

## VPN-конфиг UX

| Option | Description | Selected |
|--------|-------------|----------|
| Truncated ссылка | Первые ~40 символов + «...», ссылка видна | ✓ |
| Только кнопки без ссылки | Блок без текста, только Копировать/QR | |

**QR overlay:**
| Option | Selected |
|--------|----------|
| Full-screen modal, тап вне закрывает | ✓ |
| Bottom sheet с QR | |

**Feedback после копирования:**
| Option | Selected |
|--------|----------|
| Кнопка меняется: «Скопировано ✓» на 1-2 сек | ✓ |
| Telegram toast/snackbar | |

---

## Визуальный стиль

| Option | Description | Selected |
|--------|-------------|----------|
| Telegram native | Белые карточки, мягкие тени, фон Telegram | ✓ |
| Кастомный тёмный/брендовый | Своя цветовая схема | |
| Тёмный с Telegram-переменными | Компромисс | |

**Акцентный цвет:**
| Option | Selected |
|--------|----------|
| Telegram accent (button_color из themeParams) | ✓ |
| Фиксированный (#2481CC или др.) | |

**Индикатор подписки:**
| Option | Selected |
|--------|----------|
| Зелёный badge / зелёный текст | ✓ |
| Карточка с цветной полосой/бордером | |

---

## Экран поддержки

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom sheet / drawer | Выезжает снизу, главный экран за спиной | ✓ |
| Отдельный экран | React Router, полный переход | |

**Инструкции по платформам:**
| Option | Selected |
|--------|----------|
| Accordion: iOS/Android/Windows/Mac разворачивается | ✓ |
| Всё сразу без accordion | |

**Кнопка «Написать админу»:**
| Option | Selected |
|--------|----------|
| tg://диплинк на @Virtuspronorm_bot | |
| t.me/shineshabba | ✓ |

**User's clarification:** Username администратора — `@shineshabba` (скорректировано с @shine_shabba)

---

## Claude's Discretion

- Конкретный текст инструкций по платформам
- Анимации и переходы
- Способ реализации bottom sheet
- Иконки
- Структура файлов проекта
- Error boundary реализация
