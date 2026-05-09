---
title: Home Screen
status: done
priority: high
type: feature
tags: [home, market-data]
created_by: agent
created_at: 2026-05-09T04:36:27Z
position: 2
---

## Notes
Main dashboard with personalized greeting, live market data, Dahlia's picks, market movers. Bottom nav with 5 tabs.

## Checklist
- [x] Create Home.tsx with Layout wrapper and bottom navigation
- [x] Personalized greeting using user's first name from Supabase
- [x] Bloom Pro badge if user.plan_type is "pro"
- [x] Market summary bar: S&P 500, NASDAQ, DOW, VIX with live data from Finnhub
- [x] Dahlia's Picks Today: horizontal scroll of stock cards with ticker, name, price, change badge, insight quote box, CTA button
- [x] Disclaimer strip at bottom
- [x] Integrate Dahlia returning user popup on first load

## Acceptance
- Live market data updates from Finnhub API
- User sees personalized greeting with their first name
- Tapping a stock card navigates to Stock Analysis screen