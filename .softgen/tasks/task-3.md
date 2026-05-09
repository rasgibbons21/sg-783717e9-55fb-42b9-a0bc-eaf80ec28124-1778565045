---
title: Stock Analysis Screen
status: todo
priority: high
type: feature
tags: [analysis, charts, news]
created_by: agent
created_at: 2026-05-09T04:36:27Z
position: 3
---

## Notes
Full analysis page with TradingView chart, Dahlia's girlfriend-tone analysis, ETF breakdown (if applicable), latest news.

## Checklist
- [ ] Create StockAnalysis.tsx with dynamic route /stock/[ticker]
- [ ] Top section: stock name, ticker, current price, % change
- [ ] TradingView lightweight chart with 1D/1W/1M/3M/1Y tabs
- [ ] Dahlia's analysis card: avatar, name, role, sentiment tag, full paragraph analysis, signature "— Dahlia 🌺"
- [ ] ETF expandable breakdown (if asset_type === 'etf'): Top 5 holdings, sector mix pill chart, Dahlia summary, dividend badge
- [ ] Latest News section: headlines from Finnhub with source and timestamp
- [ ] Disclaimer at bottom
- [ ] ETF data from Financial Modeling Prep API

## Acceptance
- TradingView chart renders with working timeframe tabs
- Dahlia's analysis displays in warm girlfriend tone with no jargon
- ETF breakdown expands on tap showing holdings and sector mix