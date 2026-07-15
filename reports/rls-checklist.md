# RLS Policy Checklist — Browser-Side Supabase Queries

All queries below run from the browser using the **anon key**.
Each needs a Supabase RLS policy ensuring users can only access their own rows.

## Priority: HIGH (missing user_id scoping in application code)

| File | Table | Operation | Current Scoping | Required RLS Policy |
|---|---|---|---|---|
| `src/services/goalsService.ts` | `savings_goals` | SELECT | **None — relies entirely on RLS** | `SELECT WHERE auth.uid() = user_id` |
| `src/services/goalsService.ts` | `savings_goals` | INSERT | caller supplies `user_id` | `INSERT WITH CHECK (auth.uid() = user_id)` |
| `src/services/goalsService.ts` | `savings_goals` | UPDATE | `.eq("id", id)` — **no user_id** | `UPDATE USING (auth.uid() = user_id)` |
| `src/services/goalsService.ts` | `savings_goals` | DELETE | `.eq("id", id)` — **no user_id** | `DELETE USING (auth.uid() = user_id)` |
| `src/services/notificationService.ts` | `price_alerts` | UPDATE | `.eq("id", alertId)` — **no user_id** | `UPDATE USING (auth.uid() = user_id)` |
| `src/services/notificationService.ts` | `price_alerts` | DELETE | `.eq("id", alertId)` — **no user_id** | `DELETE USING (auth.uid() = user_id)` |
| `src/services/userService.ts` | `profiles` | SELECT (all) | **None — `getAllUsers()`** | `SELECT WHERE auth.uid() = id` (breaks getAllUsers — move to admin API route) |

## Priority: MEDIUM (scoped by user_id in code, RLS is defense-in-depth)

| File | Table | Operation | Current Scoping | Required RLS Policy |
|---|---|---|---|---|
| `src/pages/home.tsx` | `watchlist` | SELECT | `.eq("user_id", userId)` | `SELECT WHERE auth.uid() = user_id` |
| `src/services/notificationService.ts` | `notification_tokens` | UPSERT | `user_id` in payload | `INSERT/UPDATE WITH CHECK (auth.uid() = user_id)` |
| `src/services/notificationService.ts` | `notification_tokens` | DELETE | `.eq("user_id", userId)` | `DELETE USING (auth.uid() = user_id)` |
| `src/services/notificationService.ts` | `price_alerts` | UPSERT | `user_id` in payload | `INSERT WITH CHECK (auth.uid() = user_id)` |
| `src/services/notificationService.ts` | `price_alerts` | SELECT | `.eq("user_id", userId)` | `SELECT WHERE auth.uid() = user_id` |
| `src/services/userService.ts` | `profiles` | SELECT | `.eq("id", user.id)` | `SELECT WHERE auth.uid() = id` |
| `src/services/userService.ts` | `profiles` | UPSERT/UPDATE | `.eq("id", userId)` | `UPDATE USING (auth.uid() = id)` |
| `src/services/userService.ts` | `profiles` | INSERT | `id: user.id` | `INSERT WITH CHECK (auth.uid() = id)` |
| `src/services/authService.ts` | `profiles` | INSERT | `id: data.user.id` | `INSERT WITH CHECK (auth.uid() = id)` |
| `src/services/authService.ts` | `profiles` | SELECT | `.eq("email", email)` | `SELECT WHERE auth.uid() = id` (or restrict to own row) |
| `src/contexts/SubscriptionContext.tsx` | `profiles` | SELECT | `.eq("id", user.id)` | `SELECT WHERE auth.uid() = id` |
| `src/pages/profile.tsx` | `profiles` | SELECT/UPDATE | `.eq("id", session.user.id)` | `SELECT/UPDATE WHERE auth.uid() = id` |
| `src/pages/onboarding.tsx` | `profiles` | UPSERT | `id: user.id` | `INSERT/UPDATE WITH CHECK (auth.uid() = id)` |
| `src/pages/auth/callback.tsx` | `profiles` | SELECT | `.eq("id", session.user.id)` | `SELECT WHERE auth.uid() = id` |
| `src/pages/stock/[ticker].tsx` | `profiles` | SELECT | `.eq("id", session.user.id)` | `SELECT WHERE auth.uid() = id` |
| `src/pages/learn.tsx` | `lesson_progress` | SELECT/UPSERT | `.eq("user_id", userId)` | `SELECT/INSERT/UPDATE WHERE auth.uid() = user_id` |
| `src/pages/learn.tsx` | `profiles` | SELECT/UPDATE | `.eq("id", userId)` | `SELECT/UPDATE WHERE auth.uid() = id` |
| `src/pages/delete-account.tsx` | `account_deletion_requests` | INSERT | `email` in payload | `INSERT WITH CHECK (true)` (public insert, no user_id column) |

## Summary of required tables

| Table | Scoping Column | Policies Needed |
|---|---|---|
| `profiles` | `id` | SELECT, INSERT, UPDATE on own row |
| `savings_goals` | `user_id` | SELECT, INSERT, UPDATE, DELETE on own rows |
| `watchlist` | `user_id` | SELECT on own rows |
| `price_alerts` | `user_id` | SELECT, INSERT, UPDATE, DELETE on own rows |
| `notification_tokens` | `user_id` | INSERT, UPDATE, DELETE on own rows |
| `lesson_progress` | `user_id` | SELECT, INSERT, UPDATE on own rows |
| `account_deletion_requests` | _(none)_ | INSERT only (public) |

## Action items before deploying RLS

1. Verify each table has RLS **enabled** (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
2. Create policies per the table above
3. Move `userService.getAllUsers()` to a server-side admin API route (it fetches all profiles with no scoping)
4. Add `user_id` filter to `goalsService` update/delete calls as defense-in-depth
5. Add `user_id` filter to `notificationService` toggleAlert/deleteAlert calls
6. Test each operation with two different user accounts to confirm isolation
