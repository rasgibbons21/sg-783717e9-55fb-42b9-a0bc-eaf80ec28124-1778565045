---
title: Brokers Screen
status: todo
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
- [ ] Create Brokers.tsx with disclaimer at top
- [ ] List 4 brokers: Robinhood (featured), Webull (featured), Fidelity, Charles Schwab
- [ ] Each broker card: logo, name, description, key features, CTA button
- [ ] Featured brokers: gold badge, "Start Investing" button
- [ ] Non-affiliate: outline "Learn More" button
- [ ] Track clicks to broker_clicks table in Supabase
- [ ] Featured brokers NOT ranked higher — mixed list order

## Acceptance
- Disclaimer displays at top
- Clicking broker button logs to broker_clicks table
- Featured badges visible only on affiliates