# Phase 2: Frontend Dashboard (React Mini App) - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

React Mini App — один экран дашборда с тремя блоками (подписка, VLESS-конфиг, поддержка). QR-код показывается как full-screen modal overlay. Поддержка открывается как bottom sheet. Нет роутинга, нет отдельных страниц. Фронтенд подключается к бэкенду Phase 1 на `https://api.shineee.space`.

</domain>

<decisions>
## Implementation Decisions

### Архитектура экранов

- **D-01:** Одна страница (SPA без React Router). Весь контент на одном экране — скролл если нужен.
- **D-02:** QR-код — full-screen modal overlay поверх экрана (тап вне overlay закрывает).
- **D-03:** Экран поддержки — bottom sheet/drawer, выезжает снизу, не заменяет главный экран.
- **D-04:** Header: имя юзера слева (из `/api/me`, поле `name`) + иконка/элемент справа (опционально, Claude's discretion).
- **D-05:** Порядок блоков сверху вниз: Header → Блок подписки → Блок конфига → Кнопка поддержки.
- **D-06:** Кнопка поддержки: icon + текст «Поддержка», внизу экрана.

### VPN-конфиг UX

- **D-07:** VLESS-ссылка показывается truncated (~40 символов + «...») в read-only поле или тексте внутри блока конфига.
- **D-08:** Два действия рядом: кнопка «Копировать» и кнопка «QR-код». После нажатия «Копировать» кнопка меняется на «Скопировано ✓» на 1-2 секунды, затем возвращается.
- **D-09:** QR-код — full-screen modal: белый/тёмный фон под QR, сам QR максимально большой, закрывается тапом вне или кнопкой ×.

### Визуальный стиль

- **D-10:** Telegram native look: карточки (`bg-[--tg-theme-bg-color]`, `rounded-2xl`, мягкие тени), фон из `--tg-theme-secondary-bg-color`. Автоматически адаптируется к light/dark теме Telegram.
- **D-11:** Акцентный цвет кнопок и интерактивных элементов — `--tg-theme-button-color` из themeParams. Текст на кнопках — `--tg-theme-button-text-color`.
- **D-12:** Активная подписка: зелёный badge/текст («✅ Активна до DD.MM.YYYY» зелёным). Неактивная: красный/серый («❌ Не активна»).
- **D-13:** Лимит устройств: «Лимит: 5 устройств» — простой текст, без прогресс-бара (real-time счётчик — v2).

### Экраны состояний

- **D-14:** Незарегистрированный юзер (API 404): заглушка «Пройдите /start в боте @shine_connect_bot» — никакого конфига не показывать.
- **D-15:** Неактивная подписка: блок конфига скрыт полностью, показывается кнопка «Оформить подписку» → `tg.openTelegramLink('https://t.me/tribute/app?startapp=sVHH')`.
- **D-16:** Loading state: skeleton/спиннер пока грузятся `/api/me` и `/api/config`.
- **D-17:** Error state: если API недоступен — сообщение об ошибке + кнопка «Повторить».

### Экран поддержки

- **D-18:** Bottom sheet с accordion — 4 секции: iOS, Android, Windows, Mac. Каждая разворачивается по тапу.
- **D-19:** Контент инструкций — краткий текст + ссылка на инструкцию (Claude's discretion — текст придумывает Claude, можно заглушку «Скоро» или базовый шаг «Скопируй ссылку → вставь в приложение»).
- **D-20:** Кнопка «Написать админу» в конце bottom sheet: `tg.openTelegramLink('https://t.me/shineshabba')`.

### Claude's Discretion

- Конкретный текст инструкций по платформам (iOS/Android/Windows/Mac) — Claude пишет разумный базовый вариант
- Анимации и переходы — умеренные, нативные для Telegram
- Точный способ реализации bottom sheet — нативный CSS/Tailwind или лёгкая библиотека
- Иконки — любая open-source иконочная библиотека (например lucide-react), минимализм
- Структура файлов проекта — стандарт Vite + React
- Error boundary — стандартная реализация React

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & API
- `.planning/PROJECT.md` — vision, constraints, out-of-scope (VPN → «цифровые инструменты»)
- `.planning/REQUIREMENTS.md` — все FE-*, DASH-*, AUTH-02, AUTH-04 требования Phase 2
- `.planning/ROADMAP.md` — Phase 2 success criteria и phase boundary
- `backend/models.py` — Pydantic схемы `UserProfile` и `ConfigResponse` (контракт API)

### Phase 1 Backend (что уже задеплоено)
- `.planning/phases/01-backend-foundation-on-api-shineee-space/01-04-SUMMARY.md` — архитектура бэкенда, Cloudflare Flexible SSL, nginx на порту 80
- `.planning/phases/01-backend-foundation-on-api-shineee-space/01-05-SUMMARY.md` — финальные эндпойнты и статус

### Tech Stack
- Stack: React 19 + Vite 6 + TypeScript + Tailwind CSS 4 + `@telegram-apps/sdk-react`
- Auth header: `X-Telegram-Init-Data` на каждый запрос
- API base: `https://api.shineee.space`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/models.py` — `UserProfile` (tg_user_id, name, subscription_active, subscription_end, device_limit) и `ConfigResponse` (vless_url) — это контракт для API-клиента на фронте

### Established Patterns
- Backend использует `X-Telegram-Init-Data` header — фронт должен передавать `window.Telegram.WebApp.initData` в этом header
- Telegram initData доступен через `@telegram-apps/sdk-react` хук `useInitData()` или напрямую через `window.Telegram.WebApp.initData`

### Integration Points
- `GET https://api.shineee.space/api/me` → UserProfile
- `GET https://api.shineee.space/api/config` → ConfigResponse (только если subscription_active=true)
- Ошибки: 404 = не зарегистрирован, 403 = подписка не активна, 401 = невалидный initData

</code_context>

<specifics>
## Specific Ideas

- Admin link: `t.me/shineshabba` — открывать через `tg.openTelegramLink('https://t.me/shineshabba')`
- Tribute link: `https://t.me/tribute/app?startapp=sVHH` — кнопка «Оформить/Продлить»
- Фраза для незарегистрированного юзера: «Пройдите /start в боте @shine_connect_bot»
- Никогда не использовать слова «VPN», «прокси», «обход блокировок» в UI — «конфигурация», «подключение», «доступ»

</specifics>

<deferred>
## Deferred Ideas

- Real-time счётчик подключённых устройств — v2 (DEV-01)
- Возможность отзывать устройства — v2 (DEV-02)
- AI-чат и генератор картинок — v2 (AI-01..AI-05)
- Многоязычность — Out of Scope

</deferred>

---

*Phase: 02-frontend-dashboard-react-mini-app*
*Context gathered: 2026-05-21*
