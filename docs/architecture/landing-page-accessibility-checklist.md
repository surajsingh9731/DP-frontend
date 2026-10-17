# Landing page — GIGW 3.0 / WCAG 2.1 AA checklist

Verified against the checklist in `docs/architecture/R1-ui-ux-plan.md` §6,
for the public landing page (`PublicShellComponent` + `LandingComponent` +
`ComingSoonComponent`) specifically, before this pass was merged.

Scope note: per an explicit mid-task scope instruction, this pass covers
only the landing page and its already-specified "coming soon" placeholder
routes. Where a checklist item depends on a screen or feature outside that
scope (e.g. the accessibility statement page), that is recorded below as
deferred, not silently skipped.

## 1. Contrast ≥4.5:1 for text, ≥3:1 for large text/icons

Computed with the standard WCAG relative-luminance formula (not eyeballed —
the plan explicitly flags some gov design-system defaults, especially
amber/warning, as AA-borderline). Every pair actually used on the landing
page:

| Pair | Where used | Ratio |
|---|---|---|
| `#1A1A2E` text on `#FFFFFF` | Body text on white (hero heading, module/audience titles) | 17.06:1 |
| `#1A1A2E` text on `#F4F6FB` | Body text on page background | 15.78:1 |
| `#44475A` text on `#FFFFFF` | Secondary text (hero subheading, module/audience descriptions) | 9.15:1 |
| `#44475A` text on `#F4F6FB` | Secondary text on audience card background | 8.46:1 |
| `#0B3D91` text on `#FFFFFF` | Links, `.button--link` | 10.04:1 |
| `#FFFFFF` text on `#0B3D91` | `.button--primary` | 10.04:1 |
| `#072A66` text on `#FFFFFF` | `.button--secondary` text | 13.71:1 |
| `#072A66` text on `#D7E9FF` | Hero eyebrow chip | 11.09:1 |
| `#FFFFFF` text on `#0B3D91` (closing section) | Closing CTA heading/body/secondary link | 10.04:1 |
| `#146C33` icon on `#FFFFFF` | Trust-strip tick icon (large/decorative, ≥3:1 floor) | 6.52:1 |

All pairs clear the 4.5:1 floor for text with margin; the one icon-only
pair clears the relaxed 3:1 floor by more than 2×. The full token-level
math (including pairs not used on this page yet, kept for future screens)
is in `src/styles/_tokens.scss`'s comments and was computed with a short
script (relative luminance → contrast ratio), not assumed.

One color was changed specifically because of this check: a first-pass
success green (`#1E7F43`) measured 4.37:1 against its own light tint
background (`#E3F3E8`) — just under the 4.5:1 floor — so it was darkened
to `#146C33` (6.52:1 on white, 5.68:1 on the tint) before being used
anywhere.

## 2. Touch targets ≥44×44px, ≥8px spacing

- Language toggle buttons, text-size toggle, back-to-home link, and both
  CTA button variants all set `min-height`/`min-width: var(--touch-target-min)`
  (`44px`).
- Spacing between adjacent controls uses `var(--space-2)` (8px) at the
  tightest (language toggle group) up to `var(--space-4)` (16px) for CTA
  groups — never below the 8px floor.

## 3. Every control has a visible label or `aria-label`; no placeholder-only labels

- Language toggle: visible text ("English" / "हिन्दी") on both options.
- Text-size toggle: the only icon-only control on the page (`A+`, visually
  decorative, `aria-hidden="true"`) — carries an explicit `aria-label` that
  states the action ("Larger text" / "Normal text", in the active
  language) plus `aria-pressed` for its current state.
- Back-to-home link, both CTA links: visible text, no icon-only links.
- The landing page has no form inputs, so the "no placeholder-only label"
  anti-pattern doesn't apply yet; it becomes relevant once a public form
  (OTP, consent) is built.

## 4. Visible focus ring on every interactive element

- A global `:focus-visible` rule (`src/styles/_base.scss`) applies a 3px
  outline to every interactive element by default; nothing in this pass
  sets `outline: none` without a replacement.
- One default was overridden deliberately: the closing CTA section's
  background is `--color-primary-700`, and the sitewide default ring
  color (`--color-primary-900`) only reaches **1.36:1** against that
  background — below the WCAG 1.4.11 non-text-contrast floor (3:1). That
  section scopes `:focus-visible` to `outline-color: #fff` instead, which
  reaches 10.04:1. This was caught by computing the ring-vs-background
  contrast, not by assuming the sitewide default was safe everywhere.

## 5. `lang="hi"` on Devanagari text when the surrounding page is `lang="en"`, and vice versa

- `PublicShellComponent` binds `[attr.lang]="language()"` on its own host
  element — the component is the actual content boundary for every public
  screen, so the attribute sits on "the relevant subtree" rather than
  being set imperatively on `document.documentElement` from a service
  that can't know which subtree is the real page boundary in every
  context.
- Inside the language toggle itself, each option carries its own
  `lang="en"` / `lang="hi"` regardless of which language is currently
  active, so "हिन्दी" is correctly marked `lang="hi"` even while the
  surrounding toggle (and page) is `lang="en"`, and "English" is marked
  `lang="en"` even while the page is `lang="hi"`.
- Judgment call, recorded rather than silently applied: short
  technical/compliance acronyms embedded in Hindi copy (`GIGW 3.0`,
  `WCAG 2.1 AA`, `DPDP`) are not wrapped in `<span lang="en">`. These are
  treated as untranslated standard identifiers (akin to a brand name),
  consistent with WCAG's own guidance that proper nouns and terms with no
  determined human-language pronunciation don't require per-term language
  tagging. Wrapping them would also have required an `innerHTML`-bound
  template instead of plain text interpolation, which this app avoids
  everywhere else for XSS-safety (see OWASP note below) — not a reason on
  its own, but it reinforced the call.

## 6. Keyboard-reachable scroll areas

No internally-scrolling region exists on the landing page (no overflow
containers) — nothing to regress here on this screen. Noted for carry-
forward when a scrollable area (e.g. a long notice text block) is built.

## 7. Works at 200% zoom without horizontal scroll or clipped content

Verified by construction rather than a live browser test in this
environment (no display available here): every size on the page is
`rem`/`%`/`fr`-based (no fixed-`px` container widths), the hero/closing
CTAs use `flex-wrap`, the module and audience grids use `repeat(N, 1fr)`
with a `gap` (no fixed-width tracks that could force overflow), and
`.public-shell__main` has a `max-width` but no fixed `width`. This should
hold at 200% zoom, but a real-browser check (zoom to 200%, confirm no
horizontal scrollbar and no clipped text) is recommended before
production sign-off — flagged here rather than claimed as directly
observed.

## 8. `prefers-reduced-motion` and the in-app reduce-motion toggle suppress non-essential motion

- `src/styles/_tokens.scss` collapses `--motion-duration` to `0.01ms`
  under `@media (prefers-reduced-motion: reduce)`, and
  `src/styles/_base.scss` additionally forces every `animation`/
  `transition`/`scroll-behavior` to near-zero under the same query, as a
  safety net for any rule that didn't opt into the token.
- The landing page itself has no decorative motion at all — only
  `background-color` transitions on hover/press, which already respect
  the query above. There is nothing non-essential to additionally
  suppress on this specific page.
- The *in-app* reduce-motion toggle (brief §13.5, a settings-page control
  independent of OS preference) has its CSS hook prepared
  (`:root[data-motion='reduced']` in `_tokens.scss`) but no UI control
  wires it yet — that control belongs on an accessibility settings page,
  which is out of scope for this pass. Recorded as deferred, not silently
  dropped.

## 9. Status changes announced via `aria-live`, not color/icon alone

The landing page is static content with no dynamic status changes.
`ComingSoonComponent`'s message region uses `role="status"` (implicit
`aria-live="polite"`) so a screen-reader user landing on it after
following a CTA hears the "coming soon" message announced, even though
it's not a true runtime status change.

## 10. Accessibility statement page shipped with R1, not deferred

**Not shipped in this pass.** The plan calls for this to ship with R1, not
be deferred — recorded here as a known gap rather than silently skipped,
because an explicit mid-task scope instruction limited this pass to the
landing page itself plus the two already-specified "coming soon"
placeholder routes (`/get-started`, `/sign-in`), and no further routes.
This should be the next item picked up for the public shell.

## Other OWASP-relevant notes from this pass

- No inline event-handler strings anywhere — all interactivity uses
  Angular's `(click)` template binding, compiled by Angular rather than
  evaluated as a literal DOM `onclick` attribute.
- No `innerHTML` binding and no use of `bypassSecurityTrust*` anywhere in
  this pass — all copy (English and Hindi) renders through plain Angular
  text interpolation, which is auto-sanitized/escaped by default.
- No secrets, API base URLs, or environment values are in this bundle —
  the landing page renders from static, hand-written copy only and makes
  no network calls.
- Fonts (Mukta, Latin + Devanagari) are self-hosted via `@fontsource/mukta`
  rather than loaded from a third-party font CDN, so the public path makes
  no extra cross-origin request and leaks no visitor data to a font host.
