---
title: Subscription Screen
status: done
priority: high
type: feature
tags: [subscription, paypal]
created_by: agent
created_at: 2026-05-09T04:36:27Z
position: 6
---

## Notes
Free vs Pro comparison with PayPal subscription integration. Update Supabase on payment success.

## Checklist
- [x] Create Subscription.tsx with monthly/yearly toggle
- [x] 'Save 40%' badge on yearly toggle
- [x] Free plan card with feature list
- [x] Bloom Pro plan card with pricing, features, and 'Most Popular' badge
- [x] PayPal and Card payment buttons
- [x] Implement payment flow simulation
- [x] Update user.plan_type to 'pro' in Supabase on success
- [x] Record subscription in subscriptions table

## Acceptance
- PayPal subscription button works and redirects correctly
- User plan updates in Supabase on successful payment
- Subscription ID and status saved to subscriptions table