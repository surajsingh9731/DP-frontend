# Landing page — GIGW 3.0 / WCAG 2.1 AA checklist

Verified against the checklist in `docs/architecture/R1-ui-ux-plan.md` §6,
for the public landing page (`PublicShellComponent` + `LandingComponent` +
`ComingSoonComponent`) specifically. **Re-verified in full for the v2
redesign below** — the color values changed, so the v1 numbers in this
file's git history no longer apply and were not assumed to still hold.

Scope note: per an explicit mid-task scope instruction, this pass covers
only the landing page and its already-specified "coming soon" placeholder
routes. Where a checklist item depends on a screen or feature outside that
scope (e.g. the accessibility statement page), that is recorded below as
deferred, not silently skipped.

## Redesign note (v2) — where this palette actually comes from

The first pass used an invented "GIGW-safe" palette rather than a real
source, and the user correctly called this out. For v2:

- **This session's network policy blocks general web browsing outright.**
  Confirmed explicitly (not assumed) before redesigning: `WebFetch` failed
  with DNS errors on every host tried, including unrelated ones
  (`docs.anthropic.com`); a direct `curl` through the egress proxy to
  `india.gov.in`, `sprinto.com`, `www.google.com`, and `example.com` all
  returned the same `403 connect_rejected` ("host not allowed for this
  session"), and the proxy's own status endpoint lists a short allow-list
  (npm/PyPI/crates/Anthropic's own API) with no general web host on it.
  `WebSearch` is a separate, first-party mechanism and does work.
- Because of that, india.gov.in could not be screenshotted directly. The
  closest *verifiable* anchor to "india.gov.in's coloring" available in
  this session is India's own **official flag colour codes** (Bureau of
  Indian Standards reference, confirmed via `WebSearch` against
  flagcolorcodes.com): India Saffron `#FF671F`, white, India Green
  `#046A38`, and the Ashoka Chakra navy blue `#06038D`. These are real,
  citable government-defined codes, not a guess.
- The **UX4G design system itself** (the thing "UX4G" literally refers to)
  could also not be screenshotted, but `registry.npmjs.org` *is*
  allow-listed for this session, so its real, currently-published CSS was
  downloaded directly: `npm pack ux4g-web-components@latest` → its
  `package/styles/ux4g.css` defines `--ux4g-color-red-700: #b3251e`, which
  independently matches the danger color already chosen here (`#B3261E`)
  almost exactly — kept as-is rather than coincidentally "fixed."
- For Sprinto, `WebSearch` surfaced a real, named source: Studio Huncho's
  own case study for Sprinto's brand/website rebuild describes "editorial
  typography, a confident maroon and blue palette" and framework badges
  (SOC 2/ISO/NIST) "redrawn as brand assets" rather than stock seals,
  organizing the site as "a guided argument… from chaos to compliant."
  Per the user's explicit instruction, Sprinto's own palette was **not**
  copied — only the structural/quality-bar lessons were (a bold, large
  hero headline; a credibility band; a colorful, varied module grid
  instead of one repeated icon color; generous section spacing; a strong
  final CTA band).
- The existing restored brand mark (`public/brand/logo.svg`) is a fixed
  violet `#5434B8` badge. Rather than let the new GOI-navy primary and the
  logo's violet clash, the primary ramp is built to **bridge** them: the
  official navy anchors the dark end (`--color-primary-900: #06038D`), the
  logo's own violet is reused directly as a mid-tone accent
  (`--color-primary-500: #5434B8` — literally copied from the SVG fill,
  not re-picked), and an indigo between the two (`--color-primary-700:
  #2E2A8C`) is the main "brand blue" used for buttons and links.

## 1. Contrast ≥4.5:1 for text, ≥3:1 for large text/icons

Computed with the standard WCAG relative-luminance formula (not eyeballed).
Every pair actually used on the redesigned landing page:

| Pair | Where used | Ratio |
|---|---|---|
| `#1A1A2E` text on `#FFFFFF` | Body text on white | 17.06:1 |
| `#1A1A2E` text on `#F6F5FB` | Body text on page background | 15.74:1 |
| `#44475A` text on `#FFFFFF` | Secondary text | 9.15:1 |
| `#44475A` text on `#F6F5FB` | Secondary text on alt background | 8.44:1 |
| `#2E2A8C` text on `#FFFFFF` | Links, `.button--secondary` text (hero/audience) | 11.50:1 |
| `#FFFFFF` text on `#2E2A8C` | `.button--primary` | 11.50:1 |
| `#06038D` text on `#FFFFFF` | Large/bold text on white | 14.94:1 |
| `#FFFFFF` text on `#06038D` | Stats band + closing band background text | 14.94:1 |
| `#5434B8` (logo violet) text on `#FFFFFF` | Notice-module icon | 8.20:1 |
| `#06038D` on `#E9E6FB` | Hero eyebrow chip, retention-module icon | 12.22:1 |
| `#2E2A8C` on `#E9E6FB` | Register-module icon | 9.41:1 |
| `#5434B8` on `#E9E6FB` | Notice-module icon (alt pairing check) | 6.71:1 |
| `#046A38` (official India Green) on `#FFFFFF` | Consent-module icon, trust-strip tick | 6.72:1 |
| `#046A38` on `#E1F3E8` | Consent-module icon on its tint | 5.82:1 |
| `#8A4300` (darkened India Saffron) on `#FFFFFF` | Rights-module icon | 7.28:1 |
| `#8A4300` on `#FFF0E3` | Rights-module icon on its tint | 6.53:1 |
| `#B3261E` (≈ official UX4G red-700) on `#FFFFFF` | Breach-module icon | 6.54:1 |
| `#B3261E` on `#FBE4E1` | Breach-module icon on its tint | 5.38:1 |

All clear the 4.5:1 text floor with margin. The undarkened official saffron
(`#FF671F`, 2.91:1 on white) is used **only** as the purely decorative
`.tricolor-strip` — a thin accent line under the header and on the closing
band that carries no text or icon meaning, so WCAG's contrast requirement
doesn't apply to it; it was never used for any text, icon, or control.

One color was deliberately *not* used at full saturation for this reason:
the official India Saffron measured 2.91:1 against white, under even the
relaxed 3:1 icon floor, so the "rights" module's warning-family icon uses
`#8A4300` (the same saffron hue, darkened) instead, rather than the raw
flag color.

## 2. Touch targets ≥44×44px, ≥8px spacing

- Language toggle buttons, text-size toggle, the brand/logo link, back-to-
  home link, and both CTA button variants all set
  `min-height`/`min-width: var(--touch-target-min)` (`44px`).
- Spacing between adjacent controls uses `var(--space-2)` (8px) at the
  tightest (language toggle group) up to `var(--space-4)`–`var(--space-5)`
  for CTA/card groups — never below the 8px floor.

## 3. Every control has a visible label or `aria-label`; no placeholder-only labels

- Language toggle: visible text ("English" / "हिन्दी") on both options.
- Text-size toggle: the only icon-only control on the page (`A+`, visually
  decorative, `aria-hidden="true"`) — carries an explicit `aria-label`
  stating the action, plus `aria-pressed` for its state.
- The restored logo/brand link in the header has no visible text of its
  own (image `alt=""`, decorative, since the link needs one accessible
  name, not two) — the link itself carries `aria-label="Sahmati — home"`.
- Back-to-home link, both CTA links, closing secondary link: visible text.
- No form inputs exist on this page yet, so "no placeholder-only label"
  doesn't apply yet.

## 4. Visible focus ring on every interactive element

- A global `:focus-visible` rule (`src/styles/_base.scss`) applies a 3px
  outline by default; nothing sets `outline: none` without a replacement.
- Two sections override it deliberately, because they now share the same
  background as the sitewide default ring color: the stats band and the
  closing band both use `--color-primary-900` as their background, so the
  default ring (also `--color-primary-900`) would be invisible on them
  (~1:1). Both scope `:focus-visible` to `outline-color: #fff`, which
  reaches 14.94:1 against `#06038D` — far past the WCAG 1.4.11 non-text
  floor (3:1). Caught by actually computing ring-vs-background contrast
  for every distinct background on the page, not assumed safe.

## 5. `lang="hi"` on Devanagari text when the surrounding page is `lang="en"`, and vice versa

- `PublicShellComponent` binds `[attr.lang]="language()"` on its own host
  element — the real content boundary for every public screen — rather
  than writing to `document.documentElement`.
- Each language-toggle option carries its own `lang="en"` / `lang="hi"`
  regardless of which language is currently active.
- Judgment call, recorded rather than silently applied: short technical/
  compliance acronyms embedded in Hindi copy (`GIGW 3.0`, `WCAG 2.1 AA`,
  `DPDP`) are not individually wrapped in `<span lang="en">` — treated as
  untranslated standard identifiers, consistent with WCAG guidance that
  proper nouns/standard codes without a determined pronunciation in the
  surrounding language don't require per-term tagging.

## 6. Keyboard-reachable scroll areas

No internally-scrolling region exists on the landing page — nothing to
regress here. Noted for carry-forward when a scrollable area is built.

## 7. Works at 200% zoom without horizontal scroll or clipped content

Verified by construction, not a live browser test (no display in this
environment): every size is `rem`/`%`/`fr`-based, CTA rows use
`flex-wrap`, the module/audience/stats grids use `repeat(N, 1fr)` with a
`gap`, and the hero headline uses `clamp()` rather than a fixed size. A
real-browser check before production sign-off is still recommended and is
flagged here rather than claimed as directly observed.

## 8. `prefers-reduced-motion` and the in-app reduce-motion toggle suppress non-essential motion

- `_tokens.scss` collapses `--motion-duration` under
  `@media (prefers-reduced-motion: reduce)`; `_base.scss` forces every
  `animation`/`transition`/`scroll-behavior` near-zero under the same
  query as a safety net.
- The only motion on the page is a hover elevation/shadow lift on module
  cards and the standard button hover, both using the token and both
  purely responsive to interaction, not autoplaying — already covered.
- The in-app reduce-motion *toggle* (a settings-page control independent
  of OS preference) still has only its CSS hook prepared
  (`:root[data-motion='reduced']`); no UI wires it yet. Recorded as
  deferred — that control belongs on an accessibility settings page, out
  of scope for this pass.

## 9. Status changes announced via `aria-live`, not color/icon alone

Static content, no dynamic status changes. `ComingSoonComponent`'s message
region keeps `role="status"` (implicit `aria-live="polite"`).

## 10. Accessibility statement page shipped with R1, not deferred

**Still not shipped.** Recorded as a known, deliberate gap: an explicit
scope instruction limits this pass to the landing page and its two
"coming soon" placeholder routes. Next item to pick up for the public
shell.

## Other OWASP-relevant notes

- No inline event-handler strings — all interactivity uses Angular's
  `(click)` template binding.
- No `innerHTML` binding and no `bypassSecurityTrust*` anywhere — all
  copy renders through plain Angular text interpolation (auto-escaped).
- No secrets or environment values in this bundle; the page makes no
  network calls.
- Fonts (Mukta, Latin + Devanagari) are self-hosted via
  `@fontsource/mukta` — no third-party font CDN request on the public
  path.
- The restored brand SVGs/PNGs (`public/brand/*`) are static, pre-existing
  assets served as files (`<img>` tags, external `.svg` sources) — never
  inlined via `innerHTML`, so they go through the browser's normal image
  pipeline, not Angular's HTML sanitizer at all.
