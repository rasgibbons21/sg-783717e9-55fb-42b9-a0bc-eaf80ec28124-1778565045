---
title: Dahlia Popup System
status: todo
priority: medium
type: feature
tags: [dahlia, popups]
created_by: agent
created_at: 2026-05-09T04:36:27Z
position: 8
---

## Notes
Context-aware Dahlia popups appearing at bottom of screen. 3 states: first visit, returning user, market tip. Session-based dismissal.

## Checklist
- [ ] Create DahliaPopup.tsx component
- [ ] State 1 — First visit: "Hi I'm Dahlia..." intro message
- [ ] State 2 — Returning user: "Welcome back [name]..." greeting with user's first name
- [ ] State 3 — Market tip: gold-bordered card for significant market movements
- [ ] Dahlia avatar: flower emoji 🌺 with gold gradient background
- [ ] X dismiss button on all popups
- [ ] Session-based logic: never show same popup twice per session
- [ ] Track dismissals in sessionStorage

## Acceptance
- First-time visitors see intro popup
- Returning users see personalized greeting
- Popups dismiss and don't reappear in same session