---
title: Market News Component for Watchlist
status: done
priority: medium
type: feature
tags: [news, home, watchlist]
created_by: agent
created_at: 2026-05-14T23:07:00Z
position: 15
---

## Notes
Add a Market News section to the Home page that displays recent news articles for stocks in the user's watchlist. Fetch from Finnhub API and display in a clean card layout with Pansy's girlfriend-tone commentary.

## Checklist
- [x] Create MarketNews component
- [x] Fetch user's watchlist tickers from Supabase
- [x] Query Finnhub API for news on those tickers
- [x] Display news cards with image, headline, source, timestamp
- [x] Add Pansy's intro text with flower emoji
- [x] Link each article to external source
- [x] Handle empty state when no watchlist exists
- [x] Add loading skeleton
- [x] Style to match Bloom's dark theme

## Acceptance
- Market News section appears on Home page
- Shows news for user's tracked stocks only
- News articles are clickable and open in new tab
- Empty state appears if user has no watchlist