---
title: Subscription Screen
status: todo
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
- [ ] Create Subscription.tsx with monthly/yearly toggle (Save 40% badge on yearly)
- [ ] Two plan cards: Free (3 picks/week, basic features) and Pro ($7.99/mo, unlimited)
- [ ] Feature comparison list
- [ ] PayPal JavaScript SDK integration with subscription buttons
- [ ] On successful payment: update users.plan_type to 'pro', create subscriptions record
- [ ] On cancellation: revert to 'free', update subscriptions.status to 'cancelled'
- [ ] Show current plan badge if user is already subscribed

## Acceptance
- PayPal subscription button works and redirects correctly
- User plan updates in Supabase on successful payment
- Subscription ID and status saved to subscriptions table