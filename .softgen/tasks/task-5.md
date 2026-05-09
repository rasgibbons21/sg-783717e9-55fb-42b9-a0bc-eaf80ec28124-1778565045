---
title: Brokers Screen
status: done
priority: medium
type: feature
tags: [brokers, affiliates]
created_by: agent
created_at: 2026-05-09T04:36:27Z
position: 5
---

## Notes
List of brokers with featured (affiliate) and non-affiliate options. Track clicks to Supabase.

## Checklist
- [x] Create Brokers.tsx listing Webull, Robinhood, Fidelity, Schwab
- [x] Top disclaimer about affiliate commissions
- [x] Broker cards: logo/icon, name, description, features
- [x] Featured badges on affiliate brokers
- [x] Primary 'Start Investing' button for affiliates, outline 'Learn More' for non-affiliates
- [x] Clicking broker button logs to broker_clicks table
- [x] Featured badges visible only on affiliates

## Acceptance
- Disclaimer displays at top
- Clicking broker button logs to broker_clicks table
- Featured badges visible only on affiliates