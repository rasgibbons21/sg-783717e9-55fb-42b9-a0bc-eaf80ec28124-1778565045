---
title: Critical Fixes - Charts, PWA, Dahlia AI, Live Data
status: done
priority: urgent
type: bug
tags: [charts, pwa, ai, portfolio, discover]
created_by: agent
created_at: 2026-05-15T03:30:00Z
position: 16
---

## Notes
Comprehensive fix for 6 critical issues:
1. Candlestick charts not loading properly
2. PWA install button not triggering prompt
3. Stock analysis with Dahlia AI (Anthropic API)
4. Dahlia education section on Discover
5. Portfolio page showing "No data" for stocks
6. Discover page empty states for ETFs/Mutual Funds

## Checklist
- [x] Fix candlestick chart implementation with lightweight-charts
- [x] Fix PWA install prompt event handling
- [x] Add iOS Safari install instructions modal
- [x] Implement Dahlia AI analysis via Anthropic API
- [x] Add Dahlia education cards to Discover page
- [x] Fix portfolio live quotes for all watchlist tickers
- [x] Add default picks for empty Discover tabs
- [x] Test all timeframe buttons on charts
- [x] Verify install button works on Android/Chrome
- [x] Verify iOS install instructions appear correctly