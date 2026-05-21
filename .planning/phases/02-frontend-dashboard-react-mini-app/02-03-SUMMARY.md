---
phase: "02"
plan: "03"
subsystem: frontend
tags: [react, components, dashboard, telegram-mini-app]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [dashboard-ui-components, app-state-machine]
  affects: [frontend/src/App.tsx, frontend/src/components/]
tech_stack:
  added: []
  patterns: [state-machine-appstate, clipboard-fallback-copy, tg-theme-css-vars]
key_files:
  created:
    - frontend/src/components/Header.tsx
    - frontend/src/components/SubscriptionBlock.tsx
    - frontend/src/components/ConfigBlock.tsx
    - frontend/src/components/PaymentButton.tsx
    - frontend/src/components/SupportButton.tsx
  modified:
    - frontend/src/App.tsx
decisions:
  - "void showQr; void showSupport used to suppress unused-variable TS warnings for state wired in Plan 04"
  - "Clipboard fallback via execCommand for older in-app browsers (Telegram WebView)"
  - "PaymentButton shows 'Продлить' vs 'Оформить' based on subscription_end null-check"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-21"
  tasks_completed: 2
  files_changed: 6
---

# Phase 02 Plan 03: Dashboard Components Summary

Dashboard UI components and App state machine wired to API types — sticky header with user name, subscription status block with date formatting, config block with clipboard copy + QR stub, payment and support buttons.

## What Was Built

### Task 1: Header + SubscriptionBlock
- **Header.tsx** — sticky top bar (`h-14`, `z-10`) displaying user name (truncated at 75%) and a Settings2 icon from lucide-react. Uses TG theme CSS variables throughout.
- **SubscriptionBlock.tsx** — card showing subscription status (green checkmark if active, red X if not), optional expiry date formatted `DD.MM.YYYY`, and device limit line. Uses `role="region"` for accessibility.

### Task 2: ConfigBlock + PaymentButton + SupportButton + App.tsx
- **ConfigBlock.tsx** — shows truncated config URL (40 chars + ellipsis), two buttons: clipboard copy with 1.5s "Скопировано ✓" feedback, and QR button stub. Clipboard uses `navigator.clipboard` with `execCommand` fallback for Telegram WebView.
- **PaymentButton.tsx** — full-width button linking to Tribute (`openTelegramLink`). Label is "Продлить подписку" if `subscription_end !== null`, else "Оформить подписку".
- **SupportButton.tsx** — ghost button with Headphones icon, fires `onOpen` callback (bottom sheet wired in Plan 04).
- **App.tsx** — replaces placeholder with full state machine: `loading → error | unregistered | ready`. Fetches profile then config (config fetch skipped if subscription inactive; 403 on config treated as null not error). `showQr`/`showSupport` state declared with `void` suppression for Plan 04 wiring.

## Build Verification

```
dist/assets/index-M3ElAd4P.js     197.24 kB │ gzip: 61.75 kB
dist/assets/telegram-BJIPuwqn.js   60.38 kB │ gzip: 19.86 kB
dist/assets/index-CZjfXdit.css      8.82 kB │ gzip:  2.67 kB
Total gzip: ~86 KB (well within 300 KB constraint)
```

TypeCheck: PASSED (exit 0)
Build: PASSED (exit 0)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| Component | Stub | Reason |
|-----------|------|--------|
| App.tsx | `showQr` / `showSupport` state unused | QRModal and SupportSheet implemented in Plan 04 |
| ConfigBlock | `onShowQr` prop fires state but no modal renders | QR modal wired in Plan 04 |

These stubs are intentional — Plan 04 will resolve them.

## Commit

`52dc835` — feat(02-03): add dashboard components — Header, SubscriptionBlock, ConfigBlock, PaymentButton, SupportButton
