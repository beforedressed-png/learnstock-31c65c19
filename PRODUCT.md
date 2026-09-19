# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Independent stock-image contributors preparing image batches for marketplaces, especially Adobe Stock. They work in repeated upload-and-submit cycles and need trustworthy metadata without tedious manual keywording.

## Product Purpose

Learn Stock analyzes a batch of contributor images with a user-supplied AI key and produces ready-to-review titles, single-word keywords, categories, and marketplace export files. Success means less metadata busywork and a faster path from image folder to a compliant submission.

## Positioning

It is a contributor-side workspace that keeps image processing and API credentials in the user's browser while structuring output for stock marketplace requirements.

## Operating Context

Users upload image batches, set marketplace and generation preferences, review generated metadata, make corrections, and export CSV or ZIP deliverables. The workspace also includes a vector conversion utility.

## Capabilities and Constraints

- Uses user-provided Gemini or Grok API keys stored locally in the browser.
- Supports batch metadata generation and CSV/ZIP export.
- Existing routes include a public product page, the contributor workspace, and an admin route.
- Marketplace wording and generated metadata should remain clearly reviewable rather than presented as a guaranteed ranking outcome.

## Brand Commitments

The existing product name and logo assets, Learn Stock, remain in use. The product should feel practical, precise, and supportive of a creator's workflow.

## Evidence on Hand

Existing product copy and interface code in `src/routes`, `src/components`, and `src/assets`. No verified testimonials, customer counts, or performance benchmarks are available; future work must not invent them.

## Product Principles

- Make the next contributor action obvious.
- Turn AI output into inspectable, editable work rather than a black box.
- Keep marketplace requirements legible in the flow.
- Respect creator ownership and privacy.
- Favor batch momentum over visual noise.

## Accessibility & Inclusion

Keyboard-accessible controls, visible focus states, readable contrast, and reduced-motion support are required for the web interface.
