I found the likely Vercel-specific problem: the current gate still depends on the React/TanStack route mounting and client-side `useEffect` reading `?accessKey=...`. If Vercel serves `/app?accessKey=...` differently, hydrates late, or the static fallback is misconfigured, the unlock can appear stuck even though it works on Lovable hosting.

Plan to make this reliable on Vercel:

1. Replace the `/app` access-key submit flow with a plain browser-safe hash flow
   - The form will submit to `/app#access=learnstockbatch1accesskey343` instead of `/app?accessKey=...`.
   - This avoids Vercel query-string routing/caching/fallback issues entirely.
   - Hash values never hit the server, so Vercel cannot rewrite, cache, or mishandle them.

2. Add an earliest-possible unlock script to `index.vercel.html`
   - Before React loads, a tiny inline script checks `location.hash` for `access=`.
   - If the key is correct, it writes the access flag to `localStorage` and removes the hash.
   - This makes Vercel unlock before TanStack Router/React starts.

3. Keep the React gate as backup only
   - `/app` will still check `localStorage` after hydration.
   - If the user already unlocked once, `/app` opens directly.
   - If the key is wrong, the gate still shows the error.

4. Add Vercel static SPA fallback if missing
   - Add a small `vercel.json` rewrite so `/app` always serves `/index.html` on Vercel.
   - This prevents direct `/app` visits from failing or serving the wrong file.

5. Verify locally against the Vercel build path
   - Check lint for changed files.
   - Test the exact Vercel-style URL flow: `/app#access=learnstockbatch1accesskey343` opens the dashboard.

This is intentionally not another React input fix. It removes Vercel from the unlock path as much as possible.