---
title: Home Screen
status: todo
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
- [ ] Create Home.tsx with personalized greeting using user's first name from Supabase
- [ ] Show Bloom Pro badge if user.plan_type === 'pro'
- [ ] Live market summary bar: S&P 500, NASDAQ, DOW, VIX from Finnhub API
- [ ] Horizontal scroll "Dahlia's Picks Today" section with stock cards (5-7 picks)
- [ ] Stock card: ticker, company, price, % change badge, one-line Dahlia insight in gold-bordered quote, "Read Dahlia's take →" button
- [ ] Market Movers list: top gainers/losers from Finnhub
- [ ] Bottom nav: Home, Discover, Portfolio, Brokers, Profile with pill indicators
- [ ] Disclaimer strip at bottom: "Educational content only. Not financial advice..."
- [ ] All Dahlia picks labeled "Dahlia's Pick 🌺"

## Acceptance
- Live market data updates from Finnhub API
- User sees personalized greeting with their first name
- Tapping a stock card navigates to Stock Analysis screen