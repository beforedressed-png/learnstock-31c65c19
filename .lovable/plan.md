## Goal
Make the dashboard fully public (no sign-in, no approval gate) and rename all "Get Access" CTAs to "Get Started Free".

## Changes

### 1. `src/routes/app.tsx` — remove the auth gate
- Delete the `useAuth` / `signOut` / `SignInGate` imports.
- Remove the `auth.loading` spinner branch and the `if (!approved) return <SignInGate />` block.
- Remove the header pieces that depend on auth: user email, "Admin" link, "Sign out" button. Keep the logo, "Home" link, and the rest of the dashboard UI.
- Result: anyone visiting `/app` immediately sees the Metadata Workspace.

### 2. `src/routes/index.tsx` — rename CTAs
- Change all 3 occurrences of `Get Access` → `Get Started Free` (header CTA, hero CTA, and the final section CTA around line 410).

### 3. Leave alone (no harm, can be removed later if you want)
- `src/components/SignInGate.tsx`, `src/hooks/use-auth.ts`, `/admin` route, `access_requests` table — unused after this change but harmless. I'll keep them so we don't break anything else and you can delete them in a follow-up if you confirm you don't want admin/approval at all.

## What stays the same
- Landing page design, dashboard UI, image-generation logic, Gemini key flow — all untouched.
- No database migration needed.

## Result
- `/app` works for everyone, no login screen.
- Every "Get Access" button on the landing page now reads "Get Started Free".