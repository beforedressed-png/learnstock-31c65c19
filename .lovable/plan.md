## Fix Vercel freeze

The freeze on `learnstock-*.vercel.app/app` is caused by a custom static SPA bootstrap (`index.vercel.html` + `src/vercel-client.tsx` + a manual `vercel.json` rewrite) that boots TanStack Router on the client without the TanStack Start SSR/server entry. That hybrid setup runs a busy render path in production and hangs the page.

### Changes

1. **Delete the custom Vercel client entry**
   - Remove `index.vercel.html`
   - Remove `src/vercel-client.tsx`

2. **Simplify `vercel.json`**
   - Remove the rewrite to `index.vercel.html`
   - Use TanStack Start's standard Vercel output (framework auto-detect, no custom rewrites). The build already emits the proper Vercel handler.

3. **Restore `src/routes/app.tsx` and `src/components/AccessGate.tsx`** to use the normal router (no vercel-only branches), so the same code path runs in preview and on Vercel.

4. **Verify** by rebuilding and reloading the Vercel URL — the `/app` route should hydrate normally instead of freezing.

### Why this works

TanStack Start is a full-stack framework. Bypassing its server entry with a hand-rolled SPA HTML file means the router boots without the data/SSR shell it expects, which is what causes the production hang you're seeing (and why preview works fine — preview uses the correct entry).

After this, redeploy on Vercel and the freeze is gone.
