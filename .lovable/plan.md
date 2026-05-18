## Why Vercel now shows NOT_FOUND

When we removed `vercel.json`, `build:vercel`, `index.vercel.html`, `vite.vercel.config.ts`, and `src/vercel-client.tsx`, Vercel lost its build instructions. The default `vite build` in this project produces a **Cloudflare Worker** bundle (via `@cloudflare/vite-plugin`) — not a static site or a Vercel function. So Vercel deploys, finds no `index.html` and no serverless function at `/`, and returns `NOT_FOUND`.

This is the fundamental mismatch: **this project is TanStack Start configured for Cloudflare Workers. Vercel is a different runtime.** There is no "just deploy it" path.

### Your two real options

**Option A — Use Lovable hosting (recommended, zero work)**
Your app already works perfectly at `https://learnstock.lovable.app`. Lovable runs the exact runtime this project is built for. Click Publish and you're done. Custom domain support is available in Project Settings → Domains.

**Option B — Make it deploy to Vercel properly**
This is a real migration, not a config tweak. We'd need to:
1. Remove `@cloudflare/vite-plugin` from `vite.config.ts`
2. Add the TanStack Start Vercel preset (`target: 'vercel'` in the Start config)
3. Re-test all server functions (`/integrations/supabase/auth-middleware`, AI gateway calls, etc.) under Vercel's Node runtime
4. Move any Cloudflare-specific bindings to Vercel env vars
5. Add a minimal `vercel.json` only if needed

Risk: server functions that worked on Cloudflare may behave differently on Vercel (cold starts, env-var injection timing, edge vs node runtime). Expect a debug cycle.

### Recommendation

Go with **Option A**. The app already works on Lovable hosting — same code, same runtime as the preview. Vercel here adds engineering cost without benefit unless you have a specific reason (existing Vercel org, team workflow, etc.).

### If you want Option B

Reply "do option B" and I'll plan the migration in detail (separate plan, since it's non-trivial). Before I do, tell me **why** you need Vercel specifically — if it's just "I want a public URL", Lovable's Publish does that immediately.

---

### Teaching the concepts (per your request)

**Why NOT_FOUND on Vercel:** Vercel's edge router looks for either (a) a static file matching the URL in your output directory, or (b) a serverless/edge function registered for the route. With no build output and no functions, every URL is unrouted → `NOT_FOUND` (not 500, not blank — specifically "I have nothing to serve here").

**Mental model — "runtime ≠ framework":** TanStack Start is the framework. The *runtime* (where the server code actually runs) is configured separately: Cloudflare Workers, Node on Vercel, Bun, Deno, etc. Each runtime has different APIs, env-var semantics, and build outputs. A build configured for one runtime won't run on another.

**Warning signs in the future:**
- A project has a `wrangler.toml`, `@cloudflare/vite-plugin`, or `cloudflare:` imports → it's targeting Workers. Don't drop it on Vercel/Netlify without a target switch.
- A `vercel.json` with a hand-written `rewrites` rule pointing every URL to `index.html` → someone is forcing an SSR app to behave as a SPA. Usually breaks because the SSR app expects a server entry.
- "It works in preview but 404s in production" → almost always a runtime/build mismatch, not application code.

**Alternative approaches & trade-offs:**
- **Lovable hosting:** Zero config, matches dev environment. Trade-off: tied to Lovable.
- **Vercel with proper Start preset:** Industry-standard host, good DX. Trade-off: real migration work.
- **Cloudflare Pages (the native target):** This project is already built for Workers — Pages would deploy with minimal changes. Trade-off: less mainstream than Vercel.
- **Static export + any CDN:** Only works if you remove all server functions. You have auth and AI gateway server fns, so this isn't viable here.
