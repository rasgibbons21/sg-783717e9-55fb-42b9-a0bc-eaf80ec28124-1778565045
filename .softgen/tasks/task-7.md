---
title: Admin Dashboard
status: todo
priority: medium
type: feature
tags: [admin, analytics]
created_by: agent
created_at: 2026-05-09T04:36:27Z
position: 7
---

## Notes
Protected admin panel at /admin with analytics, user management, broker tracking. Dark mode with sage/gold accents.

## Checklist
- [ ] Create Admin.tsx at /admin with hardcoded password protection
- [ ] Stat cards: total users, Pro subscribers, monthly revenue, broker clicks
- [ ] Revenue breakdown bar chart: subscriptions vs affiliate vs featured
- [ ] Live users table: name, email, plan, join date, online status
- [ ] Search bar: filter users by name or email
- [ ] Inline plan upgrade/downgrade buttons per user
- [ ] Broker clicks log showing traffic by broker
- [ ] Dark mode theme with sage green and gold accents

## Acceptance
- Admin login works with hardcoded password
- All stats pull from Supabase and display correctly
- User plan changes persist to Supabase