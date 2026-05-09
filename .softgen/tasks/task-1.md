---
title: Onboarding Flow
status: in_progress
priority: high
type: feature
tags: [auth, onboarding]
created_by: agent
created_at: 2026-05-09T04:36:27Z
position: 1
---

## Notes
4-step onboarding capturing user preferences. Dahlia intro on welcome screen. Save all data to Supabase users table.

## Checklist
- [x] Create Onboarding.tsx with 4-step wizard: Welcome, Experience, Goals, Risk Tolerance
- [ ] Welcome screen: Bloom logo, tagline, Dahlia intro card with pulsing avatar, CTA buttons
- [ ] Experience selection: Beginner/Intermediate/Advanced radio cards
- [ ] Goals selection: multi-select chips for 4 investment goals
- [ ] Risk tolerance: Conservative/Moderate/Aggressive cards
- [ ] Save preferences to Supabase users table on completion
- [ ] Redirect to /home after onboarding
- [ ] Show "I already have an account" login button on welcome

## Acceptance
- User completes 4 steps and data persists in Supabase
- Dahlia's welcome message displays with pulsing flower avatar
- Onboarding skips for returning users