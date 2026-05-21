---
phase: "02"
plan: "04"
subsystem: frontend
tags: [qr-modal, support-sheet, overlays, ui]
dependency_graph:
  requires: [02-03]
  provides: [qr-overlay, support-overlay]
  affects: [App.tsx]
tech_stack:
  added: [qrcode.react]
  patterns: [bottom-sheet, full-screen-modal, accordion]
key_files:
  created:
    - frontend/src/components/QrModal.tsx
    - frontend/src/components/SupportSheet.tsx
  modified:
    - frontend/src/App.tsx
decisions:
  - QrModal uses full-screen overlay (not centred card) — maximises QR size on small phones
  - SupportSheet uses CSS max-height transition — no animation library, keeps bundle minimal
  - Accordion items hold per-platform setup instructions without any forbidden terminology
metrics:
  duration: "5 minutes"
  completed: "2026-05-21"
---

# Phase 02 Plan 04: QR Modal, Support Bottom Sheet, and Overlay Wiring Summary

**One-liner:** Full-screen QR overlay and animated bottom-sheet support panel wired into App.tsx via existing state flags.

## What Was Built

### QrModal.tsx
- Full-screen overlay rendered on `appState.status === 'ready' && appState.config`
- Renders `QRCodeSVG` from `qrcode.react` sized to `min(80vw, 80vh)` — maximises QR on any phone
- Transparent background for QR chip so it adapts to Telegram theme colour
- Close on Escape key, backdrop click, or X button
- Scroll lock via `document.body.style.overflow = 'hidden'` while open
- 150ms `fadeIn` CSS animation on open

### SupportSheet.tsx
- Slide-up bottom sheet with 300ms `translateY` transition and semi-transparent backdrop
- Handle bar and X button close; Escape key also closes
- Four accordion items (iOS, Android, Windows, macOS) with 200ms `max-height` expand animation
- Per-platform instructions use only app names and neutral action verbs — no forbidden terms
- "Написать администратору" CTA calls `window.Telegram?.WebApp?.openTelegramLink` to open `t.me/shineshabba`
- Scroll lock while open

### App.tsx changes
- Added imports for `QrModal` and `SupportSheet`
- Removed `void showQr; void showSupport` suppression stubs
- Replaced placeholder comment block with real overlay JSX controlled by existing `showQr` / `showSupport` state

## Verification Results

| Check | Result |
|-------|--------|
| `npm run typecheck` | Exit 0 — no type errors |
| `npm run build` | Exit 0 — built in 1.09s |
| Bundle size (gzip) | 69.56 kB JS — well under 300 KB limit |
| `grep shineshabba SupportSheet.tsx` | Found — admin URL correct |
| `grep -r 'VPN\|прокси\|обход' src/` | No matches — constraint satisfied |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — both components are fully wired with real data (vless_url from appState.config, openTelegramLink for admin CTA).

## Self-Check: PASSED

- `frontend/src/components/QrModal.tsx` — FOUND
- `frontend/src/components/SupportSheet.tsx` — FOUND
- `frontend/src/App.tsx` imports QrModal and SupportSheet — FOUND
- Commit c8bbfca — FOUND
