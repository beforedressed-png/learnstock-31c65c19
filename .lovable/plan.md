# Fix: typing in Suffix (and similar) inputs freezes the /app page

## What's happening

On `/app`, `AppPage` calls `useGenSettings()` and passes `settings` + `update` to both `ControlsSidebar` (the left panel) and `MetadataWorkspace` (the entire right side: uploader, action bar, results grid with image previews, keyword chips, etc.).

Every keystroke in the Suffix / Prefix / Negative / Custom Prompt / Custom Keywords inputs calls `update(...)`, which:

1. Updates `settings` in `AppPage`.
2. Re-renders `AppPage`, which re-renders **both** children.
3. `MetadataWorkspace` only actually *uses* `settings` inside the `runGeneration` handler — it does not need to render based on it — but it still re-renders the whole tree (every `ItemCard`, every keyword chip, every preview image) on each character.

With even a handful of uploaded images, this is enough to make typing feel completely frozen ("hand kore koi response nai"). The bug is a render-architecture problem, not a logic bug — that's why the Suffix toggle/input also feels sluggish to interact with in the browser.

## The fix

Convert `gen-settings` into a small external store using `useSyncExternalStore` (same pattern already used by `src/lib/keys-store.ts`), and have `MetadataWorkspace` read settings via a non-subscribing getter inside its event handler.

### 1. Rewrite `src/lib/gen-settings.ts`

- Keep `GenSettings`, `ExportPlatform`, `DEFAULTS` types/exports unchanged.
- Add a module-level store with `subscribe` / `getSnapshot` / `setSettings`.
- On first `subscribe`, hydrate from `localStorage` (key stays `learnstock.gen-settings.v2` so saved settings carry over).
- On every mutation, write to `localStorage` synchronously (no extra effect).
- Export:
  - `useGenSettings()` — subscribes via `useSyncExternalStore`. Used by `ControlsSidebar`. Returns `{ settings, update }`.
  - `getGenSettings()` — returns the current snapshot without subscribing. Used by `MetadataWorkspace` inside `runGeneration` so it always reads the latest values without re-rendering on changes.

### 2. Update `src/routes/app.tsx`

- Stop calling `useGenSettings()` here.
- Render `<ControlsSidebar />` (no props) and `<MetadataWorkspace />` (no props).

### 3. Update `src/components/ControlsSidebar.tsx`

- Drop the `Props` interface; call `const { settings, update } = useGenSettings()` inside the component.
- Everything else stays the same. This component is intentionally the one that re-renders on each keystroke — it's small and cheap.

### 4. Update `src/components/MetadataWorkspace.tsx`

- Drop the `settings` prop and the `Props` interface.
- Replace the two reads inside `runGeneration` (`settings.titleLength`, `settings.prefixEnabled`, etc., and the `applyPostProcessing(raw, settings)` call) with a single `const settings = getGenSettings();` line at the top of `runGeneration`.
- `applyPostProcessing` itself is unchanged.

### Result

Typing in the Suffix input now only re-renders `ControlsSidebar` (a few hundred DOM nodes), not the entire results workspace. The page stays responsive even with many uploaded images, and the saved-to-localStorage behavior is preserved.

## Out of scope

- No visual changes.
- No changes to the Gemini/Grok generation logic.
- No changes to the keys store, auth, or routing.
