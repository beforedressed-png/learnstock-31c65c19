# Make it modern & interactive

Motion register: bold (4/5) — visible but never gimmicky. Scope: landing + dashboard polish. All effects respect `prefers-reduced-motion` and are GPU-only (transform/opacity).

## Landing (`src/routes/index.tsx`)

1. **Animated gradient mesh hero background**
   Two slowly drifting radial-gradient blobs behind the hero, blurred and blended. Pure CSS keyframes, no JS. Replaces the static background.

2. **Magnetic CTA buttons**
   New `useMagnetic` hook translates the button toward the cursor (max ~8px) on `mousemove`, springs back on leave. Applied to the 3 primary CTAs.

3. **3D tilt feature cards**
   New `useTilt` hook reads pointer position and applies `rotateX/rotateY` (max ~6°) with perspective. Applied to feature, step, and stat cards. Pairs with existing `btn-shimmer`.

4. **Count-up stat numbers**
   New `useCountUp` hook animates numbers from 0 → target over ~1.2s once the stat enters view (IntersectionObserver, runs once).

5. **Marquee trust strip**
   Thin infinite-scroll row of tags ("OpenAI · Anthropic · Gemini · Mistral · …") between hero and features. CSS `@keyframes` translate, duplicated content for seamless loop, pauses on hover.

6. **Smooth in-page scroll + section anchor offsets**
   `scroll-behavior: smooth` and refined `scroll-margin-top` so header CTAs / back-to-top feel polished.

## Dashboard polish (`src/components/MetadataWorkspace.tsx` + related)

- Reuse `useTilt` (very subtle, ~2°) on the main workspace panels.
- Add `btn-shimmer` to remaining primary actions that don't have it.
- Soft hover lift (`translateY(-2px)` + shadow) on result/list cards.
- Same gradient-mesh wash, much dimmer, behind the dashboard header.

## Tokens / CSS (`src/styles.css`)

- New `--gradient-mesh-a`, `--gradient-mesh-b` color tokens (oklch).
- `.mesh-bg`, `.marquee`, `.tilt-card`, `.magnetic` utility classes.
- All animations gated behind `@media (prefers-reduced-motion: no-preference)`.

## New files

- `src/hooks/use-magnetic.ts`
- `src/hooks/use-tilt.ts`
- `src/hooks/use-count-up.ts`
- `src/components/MarqueeStrip.tsx`
- `src/components/MeshBackground.tsx`

## Out of scope

No parallax, no cursor spotlight, no scroll-snap (jumpy), no heavy libs (Three.js/Lottie). Pure CSS + tiny rAF hooks.