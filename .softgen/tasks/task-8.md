---
title: Pansy Popup System
status: done
priority: medium
type: feature
tags: [pansy, popups]
created_by: agent
created_at: 2026-05-09T04:36:27Z
position: 8
---

## Notes
Context-aware Pansy popups appearing at bottom of screen. 3 states: first visit, returning user, market tip. Session-based dismissal.

## Checklist
- [x] Create PansyPopup component with 3 states: first_visit, returning, market_tip
- [x] First visit message: introduction with flower emoji avatar
- [x] Returning user message: personalized greeting using user's first name
- [x] Market tip message: gold-bordered card triggered by significant market movement
- [x] Implement session-based dismiss (no reappear in same session)
- [x] X button to dismiss popup
- [x] Integrate into Home screen

## Acceptance
- First-time visitors see Pansy's introduction popup
- Returning users see personalized greeting
- Popups dismiss and don't reappear in same session