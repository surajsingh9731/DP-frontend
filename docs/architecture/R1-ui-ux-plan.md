# Sahmati R1 — frontend UI/UX plan

> Note on sourcing: `anthropic-skills:ui-ux-pro-max`'s palette/pattern search
> script was not available in this environment (only its `SKILL.md` was
> installed) — the skill's own instructions say not to fabricate a database
> match in that case. This plan applies that skill's **priority table and
> workflow by judgment** instead, combined with UX4G (gov.in) as the fixed
> visual system (mandated by the brief, not a style the search tool would
> choose anyway) and GIGW 3.0 / WCAG 2.1 AA as binding constraints. It is
> judgment-based guidance, not a retrieved design-system match.

## 1. Who's using this, under what conditions

- **Owner/staff** (schools/coaching centres): non-technical, phone-first,
  occasional desktop (reception tablet / office). Time-pressured; needs
  "what do I do next", not a dashboard full of numbers.
- **Parent (public, no-login)**: basic Android phone, 3G, may not read
  English comfortably → Hindi default where detectable, audio notice
  option, large-text mode. Never asked to install anything.
- **Partner/platform-admin**: desktop-first, lower priority for R1 polish.

This drives two *distinct* layout shells, not one responsive shell trying
to serve both:

1. **Authenticated shell** (owner/staff/viewer) — top app bar with org/branch
   switcher, bottom/side nav, UX4G card-based content areas.
2. **Public shell** (data principal) — no nav chrome at all beyond a back
   link and language/audio/text-size toggle; single-column, single-task
   per screen, large touch targets, works with zero JS beyond Angular's
   own hydration (no animation-dependent reveal of critical content, since
   §7 of the priority table flags "no reduced-motion" as an anti-pattern
   and 3G users may have motion/data constraints).

## 2. Priority-table application (judgment-based, no DB match)

| Priority | Applied decision for Sahmati |
|---|---|
| 1 Accessibility | 4.5:1 contrast is a **hard gate** on every UX4G token pair used (verify, don't assume UX4G's defaults already clear AA — some gov design systems ship AA-borderline amber/warning colors). Every icon-only control (QR button, language toggle) gets an `aria-label`; never emoji as icon. |
| 2 Touch & interaction | 44×44px minimum on **every** OTP digit box, every table action, every nav item — this is the item the original brief explicitly names. Loading feedback on OTP submit, consent submit (never a silent 2s hang). |
| 3 Performance | Public consent/notice page target <3s on 3G (brief NFR): no heavy JS chart libs on that path, lazy-load everything behind the authenticated shell, reserve layout space for the readiness/countdown cards (avoid CLS from async-loaded dashboard numbers). |
| 4 Style selection | Fixed: UX4G components throughout; no competing visual system introduced for "polish". SVG icons only (UX4G's own icon set), never emoji. |
| 5 Layout & responsive | Public shell: single column always, no horizontal scroll ever (QR/notice text must reflow). Authenticated shell: mobile-first, desktop is a wider version of the same component tree, not a separate design. |
| 6 Typography & color | Base 16px minimum, Mukta for Latin+Devanagari (brief's own choice), 1.5 line-height especially for Hindi line wrapping. Semantic tokens only (`--color-danger`, `--color-warning`, `--color-success` — already the ink/violet/amber/red/green palette from the brief) — never a raw hex in a component. |
| 7 Animation | Motion is informational only (e.g. a countdown tick, a status-change confirmation), never decorative. Every transition respects `prefers-reduced-motion`; the "reduce motion" toggle in accessibility settings (brief §13.5) forces this regardless of OS setting. |
| 8 Forms & feedback | Every error inline, next to its field, in the active language — never a single top-of-page error summary alone (though a summary may *also* exist for screen-reader users per WCAG 3.3.1/3.3.3). OTP entry: helper text states attempts remaining before lockout. |
| 9 Navigation | Public shell has no nav to overload — just back + exit. Authenticated shell: ≤5 primary groups, deep-linkable org/branch/module URLs so a WhatsApp/email link lands exactly on the relevant record. |
| 10 Charts/data | Dashboard readiness/live-checks: never color-alone status (always text label + icon + color, since red/green color-blindness is common and this is a compliance tool where a missed status has legal weight). |

## 3. Shared UI primitive set (build these once, in `core/ui/`)

| Primitive | Used by | Key states |
|---|---|---|
| `StatusBannerComponent` | every screen with an error/status message | success / warning / danger / info — already established pattern, keep it |
| `OtpInputComponent` | login, public verification | digit boxes ≥44px, auto-advance, paste-friendly, screen-reader announces "digit N of 6" |
| `CountdownBadgeComponent` | breach desk (72h/6h), rights (90-day), retention due dates | live-updating `aria-live="polite"` text equivalent, not color-only |
| `TaskCardComponent` | dashboard live checks, rights work items | owner, next action, status badge, link to source record — matches the brief's "every check opens a task with an owner" requirement |
| `LanguageToggleComponent` | global, public + authenticated | persists choice, sets `lang` attribute on the relevant subtree (not just a CSS class) |
| `AudioNoticeButtonComponent` | public notice page | text-to-speech or pre-recorded audio per language, with a visible playing/paused state |
| `DeclaredVerifiedBadgeComponent` | evidence/retention/rights per-place outcomes (R2+, stub now) | Declared complete / System-verified / Unknown / Failed / Exception — never collapses to a single "done" |

## 4. Empty / loading / error / unauthorized states — per screen type

| Screen type | Empty | Loading | Error | Unauthorized/expired |
|---|---|---|---|---|
| Authenticated list/dashboard (register, rights queue, breach log) | "Nothing yet" + the action that creates the first one | Skeleton matching final layout (no CLS jump) | Inline `StatusBanner` danger + retry button, never a blank screen | Redirect to login, preserve intended destination for post-login return |
| Authenticated form (register entry, notice builder) | N/A (form is the empty state) | Disable submit + spinner on the button itself, not a full-page overlay | Field-level errors inline + a `StatusBanner` summary for screen readers | Same as above |
| Public notice page | Org not yet published → safe "not available yet" page, never a 404 or stack trace | Skeleton of the notice card shape | "Temporarily unavailable" + a phone-number fallback (brief requirement) — never substitute another org's notice | No login wall exists for the notice itself; an invalid org slug shows the generic unavailable page, not an error revealing whether the slug almost matched something |
| Public OTP verification | N/A | "Sending code…" / "Checking…" with live region announcement | Wrong/expired OTP inline on the OTP field; rate-limit shows a resend timer, not a raw error code | Expired verified session returns to the verification step, never silently to a stale cached view |

## 5. Public-vs-authenticated layout distinction (concrete)

- Two Angular route groups: `publicRoutes` (no guard, no session-bearing
  interceptor) and `appRoutes` (behind the session guard). They do **not**
  share a layout component — `PublicShellComponent` vs `AppShellComponent`
  — because sharing one shell and conditionally hiding nav is exactly the
  kind of implicit coupling that leaks an authenticated affordance into the
  public page by accident.
- The public shell never imports anything from `features/<authenticated
  module>` — only from `core/`. A public screen that needs the "same"
  consent form as the authenticated reception-tablet mode gets it via a
  shared `core/forms` form definition, not a cross-feature import.

## 6. GIGW 3.0 / WCAG 2.1 AA checklist (binding, re-verified per screen before merge)

- [ ] Contrast ≥4.5:1 for text, ≥3:1 for large text/icons.
- [ ] All touch targets ≥44×44px with ≥8px spacing.
- [ ] Every control has a visible label or `aria-label`; no placeholder-only labels.
- [ ] Visible focus ring on every interactive element (never `outline: none` without a replacement).
- [ ] `lang="hi"` set on any Devanagari text node when the surrounding page is `lang="en"`, and vice versa.
- [ ] Keyboard-reachable scroll areas (brief's own prior axe-core finding — do not regress this).
- [ ] Works at 200% zoom without horizontal scroll or clipped content.
- [ ] `prefers-reduced-motion` and the in-app reduce-motion toggle both suppress non-essential motion.
- [ ] Status changes announced via `aria-live`, not color/icon alone.
- [ ] Accessibility statement page with feedback contact (brief §accessibility) shipped with R1, not deferred.
