## What's happening

The 404 URL is:

```
https://learnstock-…vercel.app/~oauth/initiate?provider=google&redirect_uri=…
```

`/~oauth/initiate` is **not** a route in your app. It's a special path that Lovable's edge proxy intercepts and forwards to `oauth.lovable.app` (the OAuth broker). That proxy only runs on Lovable-hosted domains (`*.lovable.app` and Lovable custom domains).

Vercel has no such proxy, so:
1. Browser hits `/~oauth/initiate` on `*.vercel.app`.
2. Vercel SPA fallback serves `index.html`.
3. TanStack Router has no `/~oauth/initiate` route → renders your 404 page.

This is a hosting-architecture limit, not a code bug. **Managed Google sign-in via Lovable Cloud cannot work on a Vercel domain.** No amount of `vercel.json` rewrites or client code changes will fix it — the OAuth broker simply isn't reachable from there.

## Your options (pick one)

### Option A — Use the Lovable-hosted site (recommended, zero work)

Stop using the Vercel URL for the app and use:

- `https://learnstock.lovable.app` (already published)

Google sign-in + admin panel will Just Work there because the `/~oauth/*` proxy exists. You can keep Vercel for nothing, or delete the project on Vercel and remove `vercel.json`, `index.vercel.html`, `vite.vercel.config.ts`, `src/vercel-client.tsx`, and the `build:vercel` script to clean the repo.

### Option B — Keep Vercel, switch to "bring-your-own" Google OAuth

Replace Lovable's managed OAuth with direct Supabase OAuth. This means:

1. You create a Google Cloud OAuth client (Console → APIs & Services → Credentials).
2. Add the Supabase callback URL (`https://tpwpgqskhjwctubfiyeh.supabase.co/auth/v1/callback`) to "Authorized redirect URIs" in Google.
3. Paste the Google **Client ID** and **Client Secret** into Lovable Cloud → Users → Auth Settings → Google provider.
4. In code, swap `lovable.auth.signInWithOAuth("google", …)` for `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/app" } })`.
5. Add `https://learnstock-…vercel.app/app` (and any other Vercel URLs) to Supabase Auth → URL Configuration → Redirect URLs.

Trade-offs:
- You need a Google Cloud account and have to manage the OAuth consent screen yourself.
- Every new Vercel preview URL is different — you'd need to add each one to Supabase redirect URLs, or use Vercel's stable production URL only.

### Option C — Hybrid: Vercel as a redirect to Lovable

Replace the Vercel SPA with a tiny `index.html` that does `window.location.href = "https://learnstock.lovable.app"`. The Vercel URL keeps working as a bookmark but the real app lives on Lovable.

## Recommendation

**Option A.** You already have `learnstock.lovable.app` published, OAuth works there, the admin panel works there, and there's no extra config. Vercel adds nothing here besides a second URL that breaks auth.

If you specifically need a `.vercel.app` (or your own custom domain) and want to keep Vercel: go with **Option B** and I'll wire up the code + give you the exact Google Cloud + Supabase steps.

## Which do you want?

Reply with **A**, **B**, or **C** and I'll execute it.
