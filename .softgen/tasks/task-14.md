---
title: Push Notifications for Price Alerts
status: in_progress
priority: high
type: feature
tags: [notifications, pwa, portfolio]
created_by: agent
created_at: 2026-05-14T16:43:43Z
position: 14
---

## Notes
Implement push notification system to alert users when their tracked stocks have significant price movements.

Users need to:
- Grant notification permission via browser prompt
- Set price alert thresholds (% change triggers)
- Enable/disable notifications per stock
- Receive notifications for major price movements
- View notification history

Technical requirements:
- Service worker push notification support
- Notification permission handling
- Price alert preferences storage
- Integration with watchlist/portfolio
- Notification settings UI in profile

## Checklist
- [x] Update service worker to handle push notifications
- [x] Add notification permission request flow
- [x] Create price_alerts table in Supabase
- [x] Create notification settings UI in Profile page
- [x] Add price alert preferences to Portfolio/Watchlist
- [x] Implement notification testing functionality
- [x] Store notification tokens in Supabase
- [x] Add Dahlia's encouraging notification copy