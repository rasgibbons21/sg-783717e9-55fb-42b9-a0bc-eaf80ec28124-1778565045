---
title: Onboarding Flow
status: done
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
- [x] Welcome screen: Bloom logo, tagline, Dahlia intro card with pulsing avatar, CTA buttons
- [x] Experience step: 3 radio cards (Beginner, Intermediate, Advanced)
- [x] Goals step: 4 radio cards with icons (Grow Wealth, Retirement, Passive Income, Emergency Fund)
- [x] Risk step: 3 radio cards (Conservative, Moderate, Aggressive)
- [x] Save preferences to Supabase users table on completion
- [x] Redirect to /home after completion
- [x] Add Google sign-in button for returning users

## Acceptance
- User completes 4 steps and data persists in Supabase
- Dahlia's welcome message displays with pulsing flower avatar
- Onboarding skips for returning users