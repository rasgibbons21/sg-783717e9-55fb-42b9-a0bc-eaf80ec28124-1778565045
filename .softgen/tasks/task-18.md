---
title: "Replace PayPal with Stripe"
status: "in_progress"
priority: "high"
type: "feature"
tags: ["payments", "stripe", "subscription"]
created_by: "agent"
created_at: "2026-05-26T05:40:00Z"
position: 18
---

## Notes
Migrate subscription flow from PayPal to Stripe.
- Use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`, `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID`.
- Handle success and cancel redirects.
- Remove all old PayPal code.

## Checklist
- [ ] Install `stripe` and `@stripe/stripe-js` packages
- [ ] Delete `paypalService.ts` and `/api/paypal/*` files
- [ ] Create `/api/stripe/create-checkout-session.ts` endpoint
- [ ] Create `/subscription/success.tsx` page
- [ ] Update `subscription.tsx` to use Stripe Checkout
- [ ] Test build and ensure no PayPal references remain

## Acceptance
- User can select Monthly or Yearly plan and click to subscribe
- User is redirected to Stripe Hosted Checkout
- Successful payment goes to success page
- Canceled payment returns to pricing page
- No PayPal code exists in the repo