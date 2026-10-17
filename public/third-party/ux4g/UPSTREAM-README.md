# ux4g-web-components

[![npm version](https://img.shields.io/npm/v/ux4g-web-components.svg)](https://www.npmjs.com/package/ux4g-web-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

CSS bundle, design tokens, utilities, and runtime module for the **UX4G Design System**.

This is the single package you need — it provides the complete CSS system, interactive behaviors, and all component classes. Use directly in HTML, Angular, or React via standard CSS classes.

---

## What's New in 3.0.2

- **Dark mode theme included:** Full `:root[data-theme="dark"]` overrides for text, backgrounds, borders, shadows, and component-specific styles
- **53 components bundled:** Including Select (custom single/multi with chips, search, keyboard nav)
- **57 citizen journey patterns** (up from 15): Full coverage of Identity, Payment, Dashboard, Notifications, Search & Discovery, Application & Submission, Consent & Declaration, and Status Tracker flows
- **36 utility modules** (up from 28): Added scroll, child-spacing, divide, float, line-clamp, outline, effects, transforms, transitions, and ring utilities
- **px-to-rem conversion:** All component and utility values now use rem for better accessibility scaling
- **Button cascade fix (v2.0.1):** Default button dimensions use `:where()` at zero specificity — size classes always win regardless of CSS source order
- **Position utilities streamlined:** Responsive position utilities now percentage-only for smaller bundle; pixel offsets remain in base file
- **Semantic radius token aliases:** `--ux4g-radius-xs` through `--ux4g-radius-full` for named radius scale
- **594 primitive + 554 semantic design tokens** available as CSS custom properties
- **iPad/tablet responsive fixes** across Footer, Mega Menu, Card, Alert, Modal, Pagination, OTP
- **v2.0.2 (docs):** Corrected migration class names, documented new utility categories in all guides, fixed CDN placeholder in AI prompt

See [CHANGELOG.md](./CHANGELOG.md) for full details.

---

## Component & Utility Quick Reference

> **For LLMs and AI tools:** This section provides a complete inventory of all components and utilities available in this package. Every component below can be used via CSS classes — no JavaScript framework required.

### All Available Components (53 — CSS classes)

| Component | Base Class | Variants | Sizes | Example |
|---|---|---|---|---|
| **Button** | `ux4g-btn-{variant}` | `primary`, `outline-primary`, `tonal-primary`, `text-primary`, `danger`, `outline-danger`, `text-danger`, `outline-neutral`, `text-neutral` | `ux4g-btn-xl/lg/md/sm/xs` | `<button class="ux4g-btn-primary ux4g-btn-m ">Save</button>` |
| **Icon Button** | `ux4g-icon-btn ux4g-icon-btn-{variant}` | `primary`, `outline-primary`, `tonal-primary`, `text-primary` | `ux4g-icon-btn-xl/lg/md/sm/xs` | `<button class="ux4g-icon-btn ux4g-icon-btn-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">home</i></button>` |
| **Spinner** | `ux4g-spinner-{variant}-{type}` | `primary`, `inverse`, `danger` × `full`, `split`, `partial` | `ux4g-spinner-xl/lg/md/sm/xs` | `<span class="ux4g-spinner-primary-full" role="status"></span>` |
| **Link** | `ux4g-text-link-{size}` | `default`, `neutral` | `sm`, `md` | `<a class="ux4g-text-link-md" href="#">Link</a>` |
| **Badge** | `ux4g-badge-{type}-{color}` | type: `dot/icon/digit`; color: `primary/success/warning/danger/info/neutral` | `ux4g-badge-s/m/l` | `<span class="ux4g-badge-dot-primary"></span>` |
| **Avatar** | `ux4g-avatar ux4g-avatar-{type}` | `status`, `profile`, `group` | `ux4g-avatar-xs/s/m/l/xl/2xl/3xl` | `<div class="ux4g-avatar ux4g-avatar-status ux4g-avatar-m"><img src="..." alt=""></div>` |
| **Image** | `ux4g-ratio-{ratio}` | `ux4g-img-overlay`, `ux4g-img-rounded` | ratios: `1-1/4-3/3-2/16-10/16-9/2-1` | `<div class="ux4g-ratio-16-9"><img src="..." alt=""></div>` |
| **Chip** | `ux4g-{type}-chip-{size}` | `filter`, `choice`, `input` | `md`, `sm`, `xs` | `<button class="ux4g-filter-chip-md">Label</button>` |
| **Tag** | `ux4g-tag-{variant}-{color}` | `tonal/filled/outline/text` × `neutral/brand/success/warning/error/info` | `ux4g-tag-s` | `<span class="ux4g-tag-tonal-neutral">Tag</span>` |
| **Divider** | `ux4g-divider-{orientation}` | `horizontal`, `vertical` | — | `<hr class="ux4g-divider-horizontal" />` |
| **Breadcrumb** | `ux4g-breadcrumb` | `ux4g-breadcrumb-divider`, `ux4g-breadcrumb-icon` | — | `<nav class="ux4g-breadcrumb ux4g-breadcrumb-divider"><a href="#">Home</a><span>Page</span></nav>` |
| **Input** | `ux4g-input-container` | states: `default/error/success/warning` | `ux4g-input-sm/md/lg/xl` | `<div class="ux4g-input-container ux4g-input-md ux4g-input-default"><input /></div>` |
| **Checkbox** | `ux4g-checkbox` | `ux4g-checkbox-error` | `ux4g-checkbox-sm/md/lg` | `<label class="ux4g-checkbox ux4g-checkbox-md">...</label>` |
| **Radio** | `ux4g-radio` | `ux4g-radio-error` | `ux4g-radio-sm/md/lg` | `<label class="ux4g-radio ux4g-radio-md">...</label>` |
| **Switch** | `ux4g-switch` | — | `ux4g-switch-sm/md/lg` | `<label class="ux4g-switch ux4g-switch-md">...</label>` |
| **Card** | `ux4g-card` | `solid/outline` × `vertical/horizontal` | — | `<div class="ux4g-card ux4g-card-solid ux4g-card-vertical">...</div>` |
| **Dropdown** | `ux4g-dropdown` | type: `selection/button/overflow`; mode: `single/multi`; state: `default/error/success/warning` | `ux4g-dropdown-sm/md/lg` | `<div class="ux4g-dropdown ux4g-dropdown-selection ux4g-dropdown-single ux4g-dropdown-md">...</div>` |
| **Modal** | `ux4g-modal-backdrop` | backdrop: `25/50/75/blur` | `ux4g-modal-s/m/l` | `<div class="ux4g-modal-backdrop ux4g-modal-backdrop-50"><div class="ux4g-modal-box ux4g-modal-m">...</div></div>` |
| **Alert** | `ux4g-alert` | `info/success/warning/error`; type: `ux4g-alert/ux4g-context-alert` | — | `<div class="ux4g-alert ux4g-alert-info">Message</div>` |
| **Accordion** | `ux4g-accordion` | `arrow-right/arrow-left`, `bordered` | — | `<div class="ux4g-accordion ux4g-accordion-arrow-right">...</div>` |
| **Tab** | `ux4g-tab` | `underline`, `pill`, `vertical` | `ux4g-tab-sm/md/lg` | `<div class="ux4g-tab ux4g-tab-underline ux4g-tab-md">...</div>` |
| **Drawer** | `ux4g-drawer` | `right/left/top/bottom` | — | `<div class="ux4g-drawer ux4g-drawer-right">...</div>` |
| **Tooltip** | `ux4g-tooltip` | placements: `top-left/top-center/top-right/bottom-left/bottom-center/bottom-right/left-center/right-center` | `s`, `xs` | `<div class="ux4g-tooltip ux4g-tooltip-top-center ux4g-tooltip-s">Text</div>` |
| **Popover** | `ux4g-popover` | placements: `top-start/top-end/bottom-start/bottom-end/left-start/left-end/right-start/right-end` | — | `<div class="ux4g-popover ux4g-popover-right-start">...</div>` |
| **Table** | `ux4g-table` | dividers: `ux4g-table-column-dividers`, `ux4g-table-no-row-dividers`; zebra: `ux4g-table-zebra-rows/cols` | `s/m/lg` | `<table class="ux4g-table ux4g-table-m ux4g-table-column-dividers">...</table>` |
| **Pagination** | `ux4g-pagination` | `dotted`, `solid`, `translucent`, `compact`, `no-arrows` | — | `<nav class="ux4g-pagination-wrapper"><div class="ux4g-pagination">...</div></nav>` |
| **Stepper** | `ux4g-stepper` | `horizontal/vertical`, alignment: `default/center/left` | `default/s` | `<div class="ux4g-stepper ux4g-stepper-horizontal">...</div>` |
| **Navbar** | `ux4g-navbar` | sub-classes: `ux4g-navbar-wrap`, `ux4g-navbar-logo`, `ux4g-navbar-links`, `ux4g-navbar-right` | — | `<nav class="ux4g-navbar"><div class="ux4g-navbar-wrap">...</div></nav>` |
| **Carousel** | `ux4g-carousel` | — | — | `<div class="ux4g-carousel">...</div>` |
| **Footer** | `ux4g-footer-wrapper` | themes: `ux4g-footer-primary`, `ux4g-footer-dark`; layout: `ux4g-footer-row` | — | `<footer class="ux4g-footer-wrapper ux4g-footer-primary"><div class="ux4g-footer-row">...</div></footer>` |

### Utility Classes (36 modules, all `ux4g-` prefixed)

| Category | Prefix Examples | Usage |
|---|---|---|
| **Typography** | `ux4g-heading-xl-default`, `ux4g-heading-xl-strong`, `ux4g-body-m-default`, `ux4g-display-l-default` | Text styles (always include `-default` or `-strong` suffix) |
| **Colors** | `ux4g-text-neutral-primary`, `ux4g-text-brand-primary` | Text colors |
| **Background** | `ux4g-bg-primary-soft`, `ux4g-bg-neutral-primary` | Background colors |
| **Spacing** | `ux4g-p-m`, `ux4g-m-l`, `ux4g-pt-s`, `ux4g-mb-xl` | Padding/Margin (xs/s/m/l/xl/2xl/3xl) |
| **Display** | `ux4g-d-flex`, `ux4g-d-grid`, `ux4g-d-block`, `ux4g-d-none` | Display modes |
| **Flex** | `ux4g-flex-row`, `ux4g-flex-col`, `ux4g-flex-wrap` | Flex direction |
| **Align** | `ux4g-ai-center`, `ux4g-ai-start`, `ux4g-ai-end`, `ux4g-ai-stretch`, `ux4g-ai-baseline` | Align items |
| **Align Self** | `ux4g-as-start`, `ux4g-as-center`, `ux4g-as-end`, `ux4g-as-stretch` | Align self |
| **Justify** | `ux4g-jc-center`, `ux4g-jc-between`, `ux4g-jc-end`, `ux4g-jc-start`, `ux4g-jc-around`, `ux4g-jc-evenly` | Justify content |
| **Gap** | `ux4g-gap-none/xs/s/m/l/xl/2xl` | Flex/Grid gap (semantic tokens, responsive: `ux4g-gap-{bp}-{size}`) |
| **Border** | `ux4g-border`, `ux4g-bt`, `ux4g-br`, `ux4g-bb`, `ux4g-bl` | Borders (sides use shorthand: bt/br/bb/bl) |
| **Border Color** | `ux4g-border-primary`, `ux4g-border-neutral-subtle`, `ux4g-border-error` | Border color tokens |
| **Radius** | `ux4g-radius-none/s/m/l/full` | Border radius (directional: `ux4g-radius-top-s`, `ux4g-radius-tl-m`, etc.) |
| **Shadow** | `ux4g-shadow-l0/l1/l2/l3/l4` | Box shadows (l0=none, l4=strongest) |
| **Sizing** | `ux4g-w-100`, `ux4g-h-100`, `ux4g-w-auto`, `ux4g-h-auto`, `ux4g-w-screen`, `ux4g-h-screen` | Width/Height (percent: 0/25/50/75/100; special: min/max/fit/screen) |
| **Position** | `ux4g-relative`, `ux4g-absolute`, `ux4g-fixed`, `ux4g-sticky`, `ux4g-static` | Positioning |
| **Z-index** | `ux4g-z-n1/0/1/2/3`, `ux4g-z-10/20/30/40/50` | Z-index layers (n1 = -1, extended 10–50) |
| **Overflow** | `ux4g-o-hidden`, `ux4g-o-auto`, `ux4g-o-visible`, `ux4g-o-scroll` | Overflow (axis: `ux4g-o-x-hidden`, `ux4g-o-y-auto`) |
| **Visibility** | `ux4g-visible`, `ux4g-invisible` | Visibility |
| **Opacity** | `ux4g-opacity-0/5/10/20/25/30/40/50/60/70/75/80/90/95/100` | Opacity (fine-grained scale) |
| **Interaction** | `ux4g-cursor-pointer`, `ux4g-cursor-not-allowed`, `ux4g-pointer-events-none`, `ux4g-select-none` | Cursor/Events/Selection |

### Quick Setup (one-liner)

```html
<!-- CDN -->
<link rel="stylesheet" href="https://cdn.ux4g.gov.in/UX4G@3.3.2/index.css" />

<!-- npm (import in JS) -->
import 'ux4g-web-components/styles.css';
import 'ux4g-web-components/design-system';
```

---

## Installation

```bash
npm install ux4g-web-components
```

---

## Setup

### Option 1: CDN (No build tools needed)

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My UX4G Page</title>
  <link rel="stylesheet" href="https://cdn.ux4g.gov.in/UX4G@3.3.2/index.css" />
</head>
<body>
  <button class="ux4g-btn-primary ux4g-btn-m ">Get Started</button>
  <script src="https://cdn.ux4g.gov.in/UX4G@3.3.2/ux4g.js"></script>
  <script src="https://cdn.ux4g.gov.in/UX4G@3.3.2/ux4g-custom.js"></script>
</body>
</html>
```

### Option 2: Plain HTML (Local)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="node_modules/ux4g-web-components/styles/ux4g.css" />
</head>
<body>
  <button class="ux4g-btn-primary ux4g-btn-m ">Save</button>
  <script src="node_modules/ux4g-web-components/dist/runtime/design-system.js"></script>
</body>
</html>
```

### Option 3: Angular

In `angular.json`:
```json
{
  "styles": ["node_modules/ux4g-web-components/styles/ux4g.css"],
  "scripts": ["node_modules/ux4g-web-components/dist/runtime/design-system.js"]
}
```

### Option 4: React

In your entry file (`src/main.tsx`):
```tsx
import 'ux4g-web-components/styles.css';
import 'ux4g-web-components/design-system';
```

---

## Available Exports

| Export Path | Description |
|---|---|
| `ux4g-web-components/styles.css` | Pre-built CSS bundle (~8 MB, fonts embedded as base64) |
| `ux4g-web-components/design-system` | Side-effect import — auto-initializes runtime (recommended) |
| `ux4g-web-components/runtime` | `initRuntime()` / `destroyRuntime()` — explicit control |

---

## CSS Bundle

Layer order (strict — do NOT reorder):

1. **Tokens** — CSS custom properties (primitive values)
2. **Semantics** — semantic aliases and dark theme
3. **Reset** — browser normalization
4. **Foundations** — fonts and icons (base64-embedded)
5. **Layout** — container, flex-grid, grid utilities
6. **Components** — 53 component CSS files
7. **Patterns** — 57 citizen journey pattern CSS files
8. **Utilities** — 36 single-purpose helper class modules (highest specificity layer)

---

## Components

### Button

#### HTML

```html
<button class="ux4g-btn-primary ux4g-btn-m ">Filled</button>
<button class="ux4g-btn-outline-primary ux4g-btn-m ">Outline</button>
<button class="ux4g-btn-tonal-primary ux4g-btn-m ">Tonal</button>
<button class="ux4g-btn-text-primary ux4g-btn-m ">Text</button>
<button class="ux4g-btn-primary ux4g-btn-m " disabled>Disabled</button>
<button class="ux4g-btn-primary ux4g-btn-m  ux4g-radius-full">Pill</button>
```

#### Angular

```html
<button class="ux4g-btn-primary ux4g-btn-m ">Filled</button>
<button class="ux4g-btn-outline-primary ux4g-btn-m ">Outline</button>
<button class="ux4g-btn-tonal-primary ux4g-btn-m ">Tonal</button>
<button class="ux4g-btn-text-primary ux4g-btn-m ">Text</button>
<button class="ux4g-btn-primary ux4g-btn-m " disabled>Disabled</button>
<button class="ux4g-btn-primary ux4g-btn-m  ux4g-radius-full">Pill</button>
```

#### React

```tsx
<button className="ux4g-btn-primary ux4g-btn-m ">Filled</button>
<button className="ux4g-btn-outline-primary ux4g-btn-m ">Outline</button>
<button className="ux4g-btn-tonal-primary ux4g-btn-m ">Tonal</button>
<button className="ux4g-btn-text-primary ux4g-btn-m ">Text</button>
<button className="ux4g-btn-primary ux4g-btn-m " disabled>Disabled</button>
<button className="ux4g-btn-primary ux4g-btn-m  ux4g-radius-full">Pill</button>
```

#### Available Classes

| Category | Classes |
|---|---|
| Variants | `ux4g-btn-primary`, `ux4g-btn-outline-primary`, `ux4g-btn-tonal-primary`, `ux4g-btn-text-primary`, `ux4g-btn-danger`, `ux4g-btn-outline-danger`, `ux4g-btn-text-danger`, `ux4g-btn-outline-neutral`, `ux4g-btn-text-neutral` |
| Sizes | `ux4g-btn-xl`, `ux4g-btn-l `, `ux4g-btn-m ` (default), `ux4g-btn-s `, `ux4g-btn-xs` |
| Shape | `ux4g-radius-full` (pill) |

---

### Icon Button

#### HTML

```html
<button class="ux4g-icon-btn ux4g-icon-btn-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">home</i></button>
<button class="ux4g-icon-btn ux4g-icon-btn-outline-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">search</i></button>
<button class="ux4g-icon-btn ux4g-icon-btn-tonal-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">edit</i></button>
<button class="ux4g-icon-btn ux4g-icon-btn-text-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">settings</i></button>
<button class="ux4g-icon-btn ux4g-icon-btn-primary ux4g-icon-btn-md ux4g-icon-btn-pill"><i class="ux4g-icon-outlined">add</i></button>
```

#### Angular

```html
<button class="ux4g-icon-btn ux4g-icon-btn-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">home</i></button>
<button class="ux4g-icon-btn ux4g-icon-btn-outline-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">search</i></button>
<button class="ux4g-icon-btn ux4g-icon-btn-tonal-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">edit</i></button>
<button class="ux4g-icon-btn ux4g-icon-btn-text-primary ux4g-icon-btn-md"><i class="ux4g-icon-outlined">settings</i></button>
<button class="ux4g-icon-btn ux4g-icon-btn-primary ux4g-icon-btn-md ux4g-icon-btn-pill"><i class="ux4g-icon-outlined">add</i></button>
```

#### React

```tsx
<button className="ux4g-icon-btn ux4g-icon-btn-primary ux4g-icon-btn-md"><i className="ux4g-icon-outlined">home</i></button>
<button className="ux4g-icon-btn ux4g-icon-btn-outline-primary ux4g-icon-btn-md"><i className="ux4g-icon-outlined">search</i></button>
<button className="ux4g-icon-btn ux4g-icon-btn-tonal-primary ux4g-icon-btn-md"><i className="ux4g-icon-outlined">edit</i></button>
<button className="ux4g-icon-btn ux4g-icon-btn-text-primary ux4g-icon-btn-md"><i className="ux4g-icon-outlined">settings</i></button>
<button className="ux4g-icon-btn ux4g-icon-btn-primary ux4g-icon-btn-md ux4g-icon-btn-pill"><i className="ux4g-icon-outlined">add</i></button>
```

#### Available Classes

| Category | Classes |
|---|---|
| Variants | `ux4g-icon-btn-primary`, `ux4g-icon-btn-outline-primary`, `ux4g-icon-btn-tonal-primary`, `ux4g-icon-btn-text-primary` |
| Sizes | `ux4g-icon-btn-xl`, `ux4g-icon-btn-lg`, `ux4g-icon-btn-md` (default), `ux4g-icon-btn-sm`, `ux4g-icon-btn-xs` |
| Shape | `ux4g-icon-btn-pill` |

---

### Spinner

#### HTML

```html
<span class="ux4g-spinner-primary-full" role="status" aria-label="Loading"></span>
<span class="ux4g-spinner-danger-split ux4g-spinner-lg" role="status" aria-label="Loading"></span>
<span class="ux4g-spinner-inverse-partial ux4g-spinner-xs" role="status" aria-label="Loading"></span>
```

#### Angular

```html
<span class="ux4g-spinner-primary-full" role="status" aria-label="Loading"></span>
<span class="ux4g-spinner-danger-split ux4g-spinner-lg" role="status" aria-label="Loading"></span>
<span class="ux4g-spinner-inverse-partial ux4g-spinner-xs" role="status" aria-label="Loading"></span>
```

#### React

```tsx
<span className="ux4g-spinner-primary-full" role="status" aria-label="Loading" />
<span className="ux4g-spinner-danger-split ux4g-spinner-lg" role="status" aria-label="Loading" />
<span className="ux4g-spinner-inverse-partial ux4g-spinner-xs" role="status" aria-label="Loading" />
```

#### Available Classes

| Category | Classes |
|---|---|
| Pattern | `ux4g-spinner-{variant}-{type}` |
| Variants | `primary`, `inverse`, `danger` |
| Types | `full`, `split`, `partial` |
| Sizes | `ux4g-spinner-xl`, `ux4g-spinner-lg`, (md default), `ux4g-spinner-sm`, `ux4g-spinner-xs` |

---

### Link

#### HTML

```html
<a href="#" class="ux4g-text-link-md">Learn more</a>
<a href="#" class="ux4g-text-link-neutral-sm">View details</a>
<a class="ux4g-text-link-md" disabled>Disabled link</a>
```

#### Angular

```html
<a href="#" class="ux4g-text-link-md">Learn more</a>
<a href="#" class="ux4g-text-link-neutral-sm">View details</a>
<a class="ux4g-text-link-md" disabled>Disabled link</a>
```

#### React

```tsx
<a href="#" className="ux4g-text-link-md">Learn more</a>
<a href="#" className="ux4g-text-link-neutral-sm">View details</a>
<a className="ux4g-text-link-md" disabled>Disabled link</a>
```

#### Available Classes

| Category | Classes |
|---|---|
| Default | `ux4g-text-link-sm`, `ux4g-text-link-md` |
| Neutral | `ux4g-text-link-neutral-sm`, `ux4g-text-link-neutral-md` |

---

### Badge

#### HTML

```html
<span class="ux4g-badge-dot-primary"></span>
<span class="ux4g-badge-digit-danger ux4g-badge-m">5</span>
<span class="ux4g-badge-icon-success ux4g-badge-l"><i class="ux4g-icon-outlined">check</i></span>
```

#### Angular

```html
<span class="ux4g-badge-dot-primary"></span>
<span class="ux4g-badge-digit-danger ux4g-badge-m">5</span>
<span class="ux4g-badge-icon-success ux4g-badge-l"><i class="ux4g-icon-outlined">check</i></span>
```

#### React

```tsx
<span className="ux4g-badge-dot-primary"></span>
<span className="ux4g-badge-digit-danger ux4g-badge-m">5</span>
<span className="ux4g-badge-icon-success ux4g-badge-l"><i className="ux4g-icon-outlined">check</i></span>
```

#### Available Classes

| Category | Classes |
|---|---|
| Pattern | `ux4g-badge-{type}-{color}` |
| Types | `dot`, `icon`, `digit` |
| Colors | `primary`, `success`, `warning`, `danger`, `info`, `secondary`, `tertiary`, `neutral` |
| Sizes | `ux4g-badge-s`, `ux4g-badge-m`, `ux4g-badge-l` |

---

### Avatar

#### HTML

```html
<div class="ux4g-avatar ux4g-avatar-status ux4g-avatar-m">
  <img src="user.jpg" alt="User" />
</div>
<div class="ux4g-avatar ux4g-avatar-profile ux4g-avatar-l">
  <img src="profile.jpg" alt="Profile" />
</div>
<div class="ux4g-avatar-group">
  <div class="ux4g-avatar ux4g-avatar-status ux4g-avatar-s"><img src="u1.jpg" alt="" /></div>
  <div class="ux4g-avatar ux4g-avatar-status ux4g-avatar-s"><img src="u2.jpg" alt="" /></div>
</div>
```

#### Angular

```html
<div class="ux4g-avatar ux4g-avatar-status ux4g-avatar-m">
  <img src="user.jpg" alt="User" />
</div>
<div class="ux4g-avatar ux4g-avatar-profile ux4g-avatar-l">
  <img src="profile.jpg" alt="Profile" />
</div>
<div class="ux4g-avatar-group">
  <div class="ux4g-avatar ux4g-avatar-status ux4g-avatar-s"><img src="u1.jpg" alt="" /></div>
  <div class="ux4g-avatar ux4g-avatar-status ux4g-avatar-s"><img src="u2.jpg" alt="" /></div>
</div>
```

#### React

```tsx
<div className="ux4g-avatar ux4g-avatar-status ux4g-avatar-m">
  <img src="user.jpg" alt="User" />
</div>
<div className="ux4g-avatar ux4g-avatar-profile ux4g-avatar-l">
  <img src="profile.jpg" alt="Profile" />
</div>
<div className="ux4g-avatar-group">
  <div className="ux4g-avatar ux4g-avatar-status ux4g-avatar-s"><img src="u1.jpg" alt="" /></div>
  <div className="ux4g-avatar ux4g-avatar-status ux4g-avatar-s"><img src="u2.jpg" alt="" /></div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Pattern | `ux4g-avatar ux4g-avatar-{type} ux4g-avatar-{size}` |
| Types | `status`, `profile` |
| Sizes | `xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl` |
| Group | `ux4g-avatar-group` |

---

### Image

#### HTML

```html
<div class="ux4g-ratio-16-9">
  <img src="photo.jpg" alt="Photo" />
</div>
<div class="ux4g-img-overlay ux4g-img-rounded ux4g-ratio-4-3">
  <img src="photo.jpg" alt="Photo" />
  <div class="ux4g-img-overlay-content">Caption</div>
</div>
```

#### Angular

```html
<div class="ux4g-ratio-16-9">
  <img src="photo.jpg" alt="Photo" />
</div>
<div class="ux4g-img-overlay ux4g-img-rounded ux4g-ratio-4-3">
  <img src="photo.jpg" alt="Photo" />
  <div class="ux4g-img-overlay-content">Caption</div>
</div>
```

#### React

```tsx
<div className="ux4g-ratio-16-9">
  <img src="photo.jpg" alt="Photo" />
</div>
<div className="ux4g-img-overlay ux4g-img-rounded ux4g-ratio-4-3">
  <img src="photo.jpg" alt="Photo" />
  <div className="ux4g-img-overlay-content">Caption</div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Modifiers | `ux4g-img-overlay`, `ux4g-img-rounded` |
| Ratios | `ux4g-ratio-1-1`, `ux4g-ratio-4-3`, `ux4g-ratio-3-2`, `ux4g-ratio-16-10`, `ux4g-ratio-16-9`, `ux4g-ratio-2-1` |

---

### Chip

#### HTML

```html
<button class="ux4g-filter-chip-md">Category</button>
<button class="ux4g-filter-chip-md active">Active</button>
<button class="ux4g-choice-chip-sm">Choice</button>
<span class="ux4g-input-chip-xs">Tag <button class="ux4g-chip-close">&times;</button></span>
```

#### Angular

```html
<button class="ux4g-filter-chip-md">Category</button>
<button class="ux4g-filter-chip-md active">Active</button>
<button class="ux4g-choice-chip-sm">Choice</button>
<span class="ux4g-input-chip-xs">Tag <button class="ux4g-chip-close">&times;</button></span>
```

#### React

```tsx
<button className="ux4g-filter-chip-md">Category</button>
<button className="ux4g-filter-chip-md active">Active</button>
<button className="ux4g-choice-chip-sm">Choice</button>
<span className="ux4g-input-chip-xs">Tag <button className="ux4g-chip-close">&times;</button></span>
```

#### Available Classes

| Category | Classes |
|---|---|
| Pattern | `ux4g-{type}-chip-{size}` |
| Types | `filter`, `choice`, `input` |
| Sizes | `md`, `sm`, `xs` (xs only for input) |
| State | `active` |

---

### Tag

#### HTML

```html
<span class="ux4g-tag-tonal-neutral">Default</span>
<span class="ux4g-tag-filled-success ux4g-tag-s">Active</span>
<span class="ux4g-tag-outline-error">Error</span>
<span class="ux4g-tag-text-info">Info</span>
```

#### Angular

```html
<span class="ux4g-tag-tonal-neutral">Default</span>
<span class="ux4g-tag-filled-success ux4g-tag-s">Active</span>
<span class="ux4g-tag-outline-error">Error</span>
<span class="ux4g-tag-text-info">Info</span>
```

#### React

```tsx
<span className="ux4g-tag-tonal-neutral">Default</span>
<span className="ux4g-tag-filled-success ux4g-tag-s">Active</span>
<span className="ux4g-tag-outline-error">Error</span>
<span className="ux4g-tag-text-info">Info</span>
```

#### Available Classes

| Category | Classes |
|---|---|
| Pattern | `ux4g-tag-{variant}-{color}` |
| Variants | `tonal`, `filled`, `outline`, `text` |
| Colors | `neutral`, `brand`, `success`, `warning`, `error`, `info` |
| Size | `ux4g-tag-s` |

---

### Divider

#### HTML

```html
<hr class="ux4g-divider-horizontal" />
<div class="ux4g-divider-vertical"></div>
```

#### Angular

```html
<hr class="ux4g-divider-horizontal" />
<div class="ux4g-divider-vertical"></div>
```

#### React

```tsx
<hr className="ux4g-divider-horizontal" />
<div className="ux4g-divider-vertical"></div>
```

---

### Breadcrumb

#### HTML

```html
<nav class="ux4g-breadcrumb ux4g-breadcrumb-divider">
  <a href="#">Home</a>
  <a href="#">Products</a>
  <span>Current Page</span>
</nav>
```

#### Angular

```html
<nav class="ux4g-breadcrumb ux4g-breadcrumb-divider">
  <a href="#">Home</a>
  <a href="#">Products</a>
  <span>Current Page</span>
</nav>
```

#### React

```tsx
<nav className="ux4g-breadcrumb ux4g-breadcrumb-divider">
  <a href="#">Home</a>
  <a href="#">Products</a>
  <span>Current Page</span>
</nav>
```

#### Available Classes

| Category | Classes |
|---|---|
| Separators | `ux4g-breadcrumb-divider`, `ux4g-breadcrumb-icon` |

---

### Checkbox

#### HTML

```html
<label class="ux4g-checkbox ux4g-checkbox-md">
  <input type="checkbox" class="ux4g-checkbox-input" />
  <span class="ux4g-radio-control"><span class="ux4g-checkmark"></span></span>
  <span class="ux4g-checkbox-content">Accept terms</span>
</label>
```

#### Angular

```html
<label class="ux4g-checkbox ux4g-checkbox-md">
  <input type="checkbox" class="ux4g-checkbox-input" />
  <span class="ux4g-radio-control"><span class="ux4g-checkmark"></span></span>
  <span class="ux4g-checkbox-content">Accept terms</span>
</label>
```

#### React

```tsx
<label className="ux4g-checkbox ux4g-checkbox-md">
  <input type="checkbox" className="ux4g-checkbox-input" />
  <span className="ux4g-radio-control"><span className="ux4g-checkmark"></span></span>
  <span className="ux4g-checkbox-content">Accept terms</span>
</label>
```

#### Available Classes

| Category | Classes |
|---|---|
| Sizes | `ux4g-checkbox-sm`, `ux4g-checkbox-md`, `ux4g-checkbox-lg` |
| States | `ux4g-checkbox-error` |

---

### Radio

#### HTML

```html
<label class="ux4g-radio ux4g-radio-md">
  <input type="radio" name="option" class="ux4g-radio-input" />
  <span class="ux4g-radio-control"><span class="ux4g-radiomark"></span></span>
  <span class="ux4g-radio-content">Option A</span>
</label>
```

#### Angular

```html
<label class="ux4g-radio ux4g-radio-md">
  <input type="radio" name="option" class="ux4g-radio-input" />
  <span class="ux4g-radio-control"><span class="ux4g-radiomark"></span></span>
  <span class="ux4g-radio-content">Option A</span>
</label>
```

#### React

```tsx
<label className="ux4g-radio ux4g-radio-md">
  <input type="radio" name="option" className="ux4g-radio-input" />
  <span className="ux4g-radio-control"><span className="ux4g-radiomark"></span></span>
  <span className="ux4g-radio-content">Option A</span>
</label>
```

#### Available Classes

| Category | Classes |
|---|---|
| Sizes | `ux4g-radio-sm`, `ux4g-radio-md`, `ux4g-radio-lg` |
| States | `ux4g-radio-error` |

---

### Switch

#### HTML

```html
<label class="ux4g-switch ux4g-switch-md">
  <input type="checkbox" class="ux4g-switch-input" role="switch" />
  <span class="ux4g-switch-control"><span class="ux4g-switch-track"><span class="ux4g-switch-thumb"></span></span></span>
  <span class="ux4g-switch-content">Enable notifications</span>
</label>
```

#### Angular

```html
<label class="ux4g-switch ux4g-switch-md">
  <input type="checkbox" class="ux4g-switch-input" role="switch" />
  <span class="ux4g-switch-control"><span class="ux4g-switch-track"><span class="ux4g-switch-thumb"></span></span></span>
  <span class="ux4g-switch-content">Enable notifications</span>
</label>
```

#### React

```tsx
<label className="ux4g-switch ux4g-switch-md">
  <input type="checkbox" className="ux4g-switch-input" role="switch" />
  <span className="ux4g-switch-control"><span className="ux4g-switch-track"><span className="ux4g-switch-thumb"></span></span></span>
  <span className="ux4g-switch-content">Enable notifications</span>
</label>
```

#### Available Classes

| Category | Classes |
|---|---|
| Sizes | `ux4g-switch-sm`, `ux4g-switch-md`, `ux4g-switch-lg` |

---

### Card

#### HTML

```html
<div class="ux4g-card ux4g-card-solid ux4g-card-vertical">
  <div class="ux4g-card-header">Title</div>
  <div class="ux4g-card-body">Content goes here.</div>
  <div class="ux4g-card-footer">Footer</div>
</div>
```

#### Angular

```html
<div class="ux4g-card ux4g-card-solid ux4g-card-vertical">
  <div class="ux4g-card-header">Title</div>
  <div class="ux4g-card-body">Content goes here.</div>
  <div class="ux4g-card-footer">Footer</div>
</div>
```

#### React

```tsx
<div className="ux4g-card ux4g-card-solid ux4g-card-vertical">
  <div className="ux4g-card-header">Title</div>
  <div className="ux4g-card-body">Content goes here.</div>
  <div className="ux4g-card-footer">Footer</div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Variants | `ux4g-card-solid`, `ux4g-card-outline` |
| Layouts | `ux4g-card-vertical`, `ux4g-card-horizontal` |

---

### Input

#### HTML

```html
<div class="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>Email</label>
  <input type="email" placeholder="Enter email" />
</div>
<div class="ux4g-input-container ux4g-input-lg ux4g-input-error">
  <label>Password</label>
  <input type="password" />
  <span class="ux4g-input-helper">Password is required</span>
</div>
```

#### Angular

```html
<div class="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>Email</label>
  <input type="email" placeholder="Enter email" />
</div>
<div class="ux4g-input-container ux4g-input-lg ux4g-input-error">
  <label>Password</label>
  <input type="password" />
  <span class="ux4g-input-helper">Password is required</span>
</div>
```

#### React

```tsx
<div className="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>Email</label>
  <input type="email" placeholder="Enter email" />
</div>
<div className="ux4g-input-container ux4g-input-lg ux4g-input-error">
  <label>Password</label>
  <input type="password" />
  <span className="ux4g-input-helper">Password is required</span>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Sizes | `ux4g-input-sm`, `ux4g-input-md`, `ux4g-input-lg`, `ux4g-input-xl` |
| States | `ux4g-input-default`, `ux4g-input-error`, `ux4g-input-success`, `ux4g-input-warning` |

---

### Dropdown

#### HTML

```html
<div class="ux4g-dropdown ux4g-dropdown-selection ux4g-dropdown-single ux4g-dropdown-md ux4g-dropdown-default">
  <button class="ux4g-dropdown-control" aria-expanded="false">Select option</button>
  <ul class="ux4g-dropdown-menu">
    <li class="ux4g-dropdown-item">Option 1</li>
    <li class="ux4g-dropdown-item">Option 2</li>
  </ul>
</div>
```

#### Angular

```html
<div class="ux4g-dropdown ux4g-dropdown-selection ux4g-dropdown-single ux4g-dropdown-md ux4g-dropdown-default">
  <button class="ux4g-dropdown-control" aria-expanded="false">Select option</button>
  <ul class="ux4g-dropdown-menu">
    <li class="ux4g-dropdown-item">Option 1</li>
    <li class="ux4g-dropdown-item">Option 2</li>
  </ul>
</div>
```

#### React

```tsx
<div className="ux4g-dropdown ux4g-dropdown-selection ux4g-dropdown-single ux4g-dropdown-md ux4g-dropdown-default">
  <button className="ux4g-dropdown-control" aria-expanded="false">Select option</button>
  <ul className="ux4g-dropdown-menu">
    <li className="ux4g-dropdown-item">Option 1</li>
    <li className="ux4g-dropdown-item">Option 2</li>
  </ul>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Types | `ux4g-dropdown-selection`, `ux4g-dropdown-button`, `ux4g-dropdown-overflow` |
| Modes | `ux4g-dropdown-single`, `ux4g-dropdown-multi` |
| Sizes | `ux4g-dropdown-sm`, `ux4g-dropdown-md`, `ux4g-dropdown-lg` |
| States | `ux4g-dropdown-default`, `ux4g-dropdown-error`, `ux4g-dropdown-success`, `ux4g-dropdown-warning` |

---

### Modal

#### HTML

```html
<button data-modal-target="#myModal">Open Modal</button>

<div id="myModal" class="ux4g-modal-backdrop ux4g-modal-backdrop-50" role="dialog" aria-modal="true">
  <div class="ux4g-modal-box ux4g-modal-m">
    <div class="ux4g-modal-header">
      <h2>Title</h2>
      <button data-close-modal>&times;</button>
    </div>
    <div class="ux4g-modal-body">Content here</div>
    <div class="ux4g-modal-footer">
      <button class="ux4g-btn-primary ux4g-btn-m ">Confirm</button>
    </div>
  </div>
</div>
```

#### Angular

```html
<button data-modal-target="#myModal">Open Modal</button>

<div id="myModal" class="ux4g-modal-backdrop ux4g-modal-backdrop-50" role="dialog" aria-modal="true">
  <div class="ux4g-modal-box ux4g-modal-m">
    <div class="ux4g-modal-header">
      <h2>Title</h2>
      <button data-close-modal>&times;</button>
    </div>
    <div class="ux4g-modal-body">Content here</div>
    <div class="ux4g-modal-footer">
      <button class="ux4g-btn-primary ux4g-btn-m ">Confirm</button>
    </div>
  </div>
</div>
```

#### React

```tsx
<button data-modal-target="#myModal">Open Modal</button>

<div id="myModal" className="ux4g-modal-backdrop ux4g-modal-backdrop-50" role="dialog" aria-modal="true">
  <div className="ux4g-modal-box ux4g-modal-m">
    <div className="ux4g-modal-header">
      <h2>Title</h2>
      <button data-close-modal>&times;</button>
    </div>
    <div className="ux4g-modal-body">Content here</div>
    <div className="ux4g-modal-footer">
      <button className="ux4g-btn-primary ux4g-btn-m ">Confirm</button>
    </div>
  </div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Backdrop | `ux4g-modal-backdrop-25`, `ux4g-modal-backdrop-50`, `ux4g-modal-backdrop-75`, `ux4g-modal-backdrop-blur` |
| Sizes | `ux4g-modal-s`, `ux4g-modal-m`, `ux4g-modal-l` |

---

### Alert

#### HTML

```html
<div class="ux4g-alert ux4g-alert-info">
  <span>Informational message.</span>
  <button class="ux4g-alert-close">&times;</button>
</div>
<div class="ux4g-context-alert ux4g-alert-warning">
  <span>Warning: Check your input.</span>
</div>
```

#### Angular

```html
<div class="ux4g-alert ux4g-alert-info">
  <span>Informational message.</span>
  <button class="ux4g-alert-close">&times;</button>
</div>
<div class="ux4g-context-alert ux4g-alert-warning">
  <span>Warning: Check your input.</span>
</div>
```

#### React

```tsx
<div className="ux4g-alert ux4g-alert-info">
  <span>Informational message.</span>
  <button className="ux4g-alert-close">&times;</button>
</div>
<div className="ux4g-context-alert ux4g-alert-warning">
  <span>Warning: Check your input.</span>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Variants | `ux4g-alert-info`, `ux4g-alert-success`, `ux4g-alert-warning`, `ux4g-alert-error` |
| Types | `ux4g-alert`, `ux4g-context-alert` |
| Positions | `ux4g-alert-top-left`, `ux4g-alert-top-right`, `ux4g-alert-bottom-left`, `ux4g-alert-bottom-right` |

---

### Accordion

#### HTML

```html
<div class="ux4g-accordion ux4g-accordion-arrow-right">
  <div class="ux4g-accordion__item">
    <button class="ux4g-accordion__header" data-ux4g-accordion-toggle>Section 1</button>
    <div class="ux4g-accordion__body">Content for section 1</div>
  </div>
</div>

<div class="ux4g-accordion ux4g-accordion-arrow-left ux4g-accordion-bordered">
  <div class="ux4g-accordion__item">
    <button class="ux4g-accordion__header" data-ux4g-accordion-toggle>Section 1</button>
    <div class="ux4g-accordion__body">Content for section 1</div>
  </div>
</div>
```

#### Angular

```html
<div class="ux4g-accordion ux4g-accordion-arrow-right">
  <div class="ux4g-accordion__item">
    <button class="ux4g-accordion__header" data-ux4g-accordion-toggle>Section 1</button>
    <div class="ux4g-accordion__body">Content for section 1</div>
  </div>
</div>
```

#### React

```tsx
<div className="ux4g-accordion ux4g-accordion-arrow-right">
  <div className="ux4g-accordion__item">
    <button className="ux4g-accordion__header" data-ux4g-accordion-toggle>Section 1</button>
    <div className="ux4g-accordion__body">Content for section 1</div>
  </div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Arrow | `ux4g-accordion-arrow-right`, `ux4g-accordion-arrow-left` |
| Variant | `ux4g-accordion-bordered` |

---

### Tab

#### HTML

```html
<div class="ux4g-tab ux4g-tab-underline ux4g-tab-md">
  <ul class="ux4g-tab-list">
    <li class="ux4g-tab-item is-active">Tab 1</li>
    <li class="ux4g-tab-item">Tab 2</li>
    <li class="ux4g-tab-item">Tab 3</li>
  </ul>
</div>
```

#### Angular

```html
<div class="ux4g-tab ux4g-tab-underline ux4g-tab-md">
  <ul class="ux4g-tab-list">
    <li class="ux4g-tab-item is-active">Tab 1</li>
    <li class="ux4g-tab-item">Tab 2</li>
    <li class="ux4g-tab-item">Tab 3</li>
  </ul>
</div>
```

#### React

```tsx
<div className="ux4g-tab ux4g-tab-underline ux4g-tab-md">
  <ul className="ux4g-tab-list">
    <li className="ux4g-tab-item is-active">Tab 1</li>
    <li className="ux4g-tab-item">Tab 2</li>
    <li className="ux4g-tab-item">Tab 3</li>
  </ul>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Variants | `ux4g-tab-underline`, `ux4g-tab-pill` |
| Sizes | `ux4g-tab-sm`, `ux4g-tab-md`, `ux4g-tab-lg` |
| Vertical | `ux4g-tab-vertical` |

---

### Drawer

#### HTML

```html
<button data-drawer="drawer1">Open Drawer</button>

<div class="ux4g-drawer-overlay">
  <div id="drawer1" class="ux4g-drawer ux4g-drawer-right">
    <div class="ux4g-drawer-header">
      <h3>Drawer Title</h3>
      <button data-drawer-close>&times;</button>
    </div>
    <div class="ux4g-drawer-body">Drawer content</div>
  </div>
</div>
```

#### Angular

```html
<button data-drawer="drawer1">Open Drawer</button>

<div class="ux4g-drawer-overlay">
  <div id="drawer1" class="ux4g-drawer ux4g-drawer-right">
    <div class="ux4g-drawer-header">
      <h3>Drawer Title</h3>
      <button data-drawer-close>&times;</button>
    </div>
    <div class="ux4g-drawer-body">Drawer content</div>
  </div>
</div>
```

#### React

```tsx
<button data-drawer="drawer1">Open Drawer</button>

<div className="ux4g-drawer-overlay">
  <div id="drawer1" className="ux4g-drawer ux4g-drawer-right">
    <div className="ux4g-drawer-header">
      <h3>Drawer Title</h3>
      <button data-drawer-close>&times;</button>
    </div>
    <div className="ux4g-drawer-body">Drawer content</div>
  </div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Placements | `ux4g-drawer-right`, `ux4g-drawer-left`, `ux4g-drawer-top`, `ux4g-drawer-bottom` |

---

### Tooltip

#### HTML

```html
<div class="ux4g-tooltip-wrapper">
  <button>Hover me</button>
  <span class="ux4g-tooltip ux4g-tooltip-top-center-m">Tooltip text</span>
</div>
```

#### Angular

```html
<div class="ux4g-tooltip-wrapper">
  <button>Hover me</button>
  <span class="ux4g-tooltip ux4g-tooltip-top-center-m">Tooltip text</span>
</div>
```

#### React

```tsx
<div className="ux4g-tooltip-wrapper">
  <button>Hover me</button>
  <span className="ux4g-tooltip ux4g-tooltip-top-center-m">Tooltip text</span>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Placements | `ux4g-tooltip-top-left-m`, `ux4g-tooltip-top-center-m`, `ux4g-tooltip-top-right-m`, `ux4g-tooltip-bottom-left-m`, `ux4g-tooltip-bottom-center-m`, `ux4g-tooltip-bottom-right-m`, `ux4g-tooltip-left-center-m`, `ux4g-tooltip-right-center-m` |
| Sizes | Replace `-m` with `-s` or `-xs` |

---

### Popover

#### HTML

```html
<button data-ux-toggle="popover" data-ux-content="Popover body" data-ux-title="Title" data-ux-placement="right">
  Show Popover
</button>
```

#### Angular

```html
<button data-ux-toggle="popover" data-ux-content="Popover body" data-ux-title="Title" data-ux-placement="right">
  Show Popover
</button>
```

#### React

```tsx
<button data-ux-toggle="popover" data-ux-content="Popover body" data-ux-title="Title" data-ux-placement="right">
  Show Popover
</button>
```

---

### Table

#### HTML

```html
<table class="ux4g-table ux4g-table-m ux4g-table-zebra-rows">
  <thead><tr><th>Name</th><th>Email</th></tr></thead>
  <tbody>
    <tr><td>Alice</td><td>alice@example.com</td></tr>
    <tr><td>Bob</td><td>bob@example.com</td></tr>
  </tbody>
</table>
```

#### Angular

```html
<table class="ux4g-table ux4g-table-m ux4g-table-zebra-rows">
  <thead><tr><th>Name</th><th>Email</th></tr></thead>
  <tbody>
    <tr><td>Alice</td><td>alice@example.com</td></tr>
    <tr><td>Bob</td><td>bob@example.com</td></tr>
  </tbody>
</table>
```

#### React

```tsx
<table className="ux4g-table ux4g-table-m ux4g-table-zebra-rows">
  <thead><tr><th>Name</th><th>Email</th></tr></thead>
  <tbody>
    <tr><td>Alice</td><td>alice@example.com</td></tr>
    <tr><td>Bob</td><td>bob@example.com</td></tr>
  </tbody>
</table>
```

#### Available Classes

| Category | Classes |
|---|---|
| Sizes | `ux4g-table-s`, `ux4g-table-m`, `ux4g-table-lg` |
| Dividers | `ux4g-table-column-dividers`, `ux4g-table-no-row-dividers` |
| Zebra | `ux4g-table-zebra-rows`, `ux4g-table-zebra-cols` |
| Modifiers | `ux4g-table-interactive`, `ux4g-table-sortable`, `ux4g-table-header-brand` |

---

### Pagination

#### HTML

```html
<nav class="ux4g-pagination">
  <button class="ux4g-pagination-prev">&laquo;</button>
  <button class="active">1</button>
  <button>2</button>
  <button>3</button>
  <button class="ux4g-pagination-next">&raquo;</button>
</nav>
```

#### Angular

```html
<nav class="ux4g-pagination">
  <button class="ux4g-pagination-prev">&laquo;</button>
  <button class="active">1</button>
  <button>2</button>
  <button>3</button>
  <button class="ux4g-pagination-next">&raquo;</button>
</nav>
```

#### React

```tsx
<nav className="ux4g-pagination">
  <button className="ux4g-pagination-prev">&laquo;</button>
  <button className="active">1</button>
  <button>2</button>
  <button>3</button>
  <button className="ux4g-pagination-next">&raquo;</button>
</nav>
```

---

### Search

#### HTML

```html
<div class="ux4g-search-container ux4g-search-m">
  <input type="search" class="ux4g-search-input" placeholder="Search..." />
  <button class="ux4g-search-clear" aria-label="Clear">&times;</button>
</div>
```

#### Angular

```html
<div class="ux4g-search-container ux4g-search-m">
  <input type="search" class="ux4g-search-input" placeholder="Search..." />
  <button class="ux4g-search-clear" aria-label="Clear">&times;</button>
</div>
```

#### React

```tsx
<div className="ux4g-search-container ux4g-search-m">
  <input type="search" className="ux4g-search-input" placeholder="Search..." />
  <button className="ux4g-search-clear" aria-label="Clear">&times;</button>
</div>
```

---

### Mega Menu

#### HTML

```html
<div class="ux4g-mega-menu">
  <div class="ux4g-mega-menu-container">
    <div class="ux4g-mega-menu-sidebar">
      <ul class="ux4g-mega-menu-category-list">
        <li class="ux4g-mega-menu-category-item ux4g-mega-menu-category-item--active">
          <a href="#" class="ux4g-mega-menu-category-link ux4g-body-s-default">Category 1</a>
        </li>
        <li class="ux4g-mega-menu-category-item">
          <a href="#" class="ux4g-mega-menu-category-link ux4g-body-s-default">Category 2</a>
        </li>
      </ul>
    </div>
    <div class="ux4g-mega-menu-content ux4g-mega-menu-content--active" id="category-1">
      <div class="ux4g-mega-menu-column">
        <h3 class="ux4g-mega-menu-title ux4g-heading-xs-strong">Title</h3>
        <ul class="ux4g-mega-menu-item-list">
          <li class="ux4g-mega-menu-item"><a href="#">Item 1</a></li>
          <li class="ux4g-mega-menu-item"><a href="#">Item 2</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

#### Angular

```html
<div class="ux4g-mega-menu">
  <div class="ux4g-mega-menu-container">
    <div class="ux4g-mega-menu-sidebar">
      <ul class="ux4g-mega-menu-category-list">
        <li class="ux4g-mega-menu-category-item ux4g-mega-menu-category-item--active">
          <a href="#" class="ux4g-mega-menu-category-link ux4g-body-s-default">Category 1</a>
        </li>
        <li class="ux4g-mega-menu-category-item">
          <a href="#" class="ux4g-mega-menu-category-link ux4g-body-s-default">Category 2</a>
        </li>
      </ul>
    </div>
    <div class="ux4g-mega-menu-content ux4g-mega-menu-content--active" id="category-1">
      <div class="ux4g-mega-menu-column">
        <h3 class="ux4g-mega-menu-title ux4g-heading-xs-strong">Title</h3>
        <ul class="ux4g-mega-menu-item-list">
          <li class="ux4g-mega-menu-item"><a href="#">Item 1</a></li>
          <li class="ux4g-mega-menu-item"><a href="#">Item 2</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

#### React

```tsx
<div className="ux4g-mega-menu">
  <div className="ux4g-mega-menu-container">
    <div className="ux4g-mega-menu-sidebar">
      <ul className="ux4g-mega-menu-category-list">
        <li className="ux4g-mega-menu-category-item ux4g-mega-menu-category-item--active">
          <a href="#" className="ux4g-mega-menu-category-link ux4g-body-s-default">Category 1</a>
        </li>
        <li className="ux4g-mega-menu-category-item">
          <a href="#" className="ux4g-mega-menu-category-link ux4g-body-s-default">Category 2</a>
        </li>
      </ul>
    </div>
    <div className="ux4g-mega-menu-content ux4g-mega-menu-content--active" id="category-1">
      <div className="ux4g-mega-menu-column">
        <h3 className="ux4g-mega-menu-title ux4g-heading-xs-strong">Title</h3>
        <ul className="ux4g-mega-menu-item-list">
          <li className="ux4g-mega-menu-item"><a href="#">Item 1</a></li>
          <li className="ux4g-mega-menu-item"><a href="#">Item 2</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Structure | `ux4g-mega-menu`, `ux4g-mega-menu-container`, `ux4g-mega-menu-sidebar`, `ux4g-mega-menu-category-list`, `ux4g-mega-menu-category-item`, `ux4g-mega-menu-category-link`, `ux4g-mega-menu-content`, `ux4g-mega-menu-column`, `ux4g-mega-menu-title`, `ux4g-mega-menu-item-list`, `ux4g-mega-menu-item` |
| Modifiers | `ux4g-mega-menu--dropdown`, `ux4g-mega-menu--dropdown-right`, `ux4g-mega-menu-category-item--active`, `ux4g-mega-menu-content--active` |

---

### Stepper

#### HTML

```html
<div class="ux4g-stepper ux4g-stepper-horizontal ux4g-stepper-center">
  <div class="ux4g-stepper-step completed">Step 1</div>
  <div class="ux4g-stepper-step active">Step 2</div>
  <div class="ux4g-stepper-step">Step 3</div>
</div>
```

#### Angular

```html
<div class="ux4g-stepper ux4g-stepper-horizontal ux4g-stepper-center">
  <div class="ux4g-stepper-step completed">Step 1</div>
  <div class="ux4g-stepper-step active">Step 2</div>
  <div class="ux4g-stepper-step">Step 3</div>
</div>
```

#### React

```tsx
<div className="ux4g-stepper ux4g-stepper-horizontal ux4g-stepper-center">
  <div className="ux4g-stepper-step completed">Step 1</div>
  <div className="ux4g-stepper-step active">Step 2</div>
  <div className="ux4g-stepper-step">Step 3</div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Orientation | `ux4g-stepper-vertical`, `ux4g-stepper-horizontal` |
| Alignment | `ux4g-stepper-center`, `ux4g-stepper-left` |
| Variants | `ux4g-stepper-bottom-line`, `ux4g-stepper-progress`, `ux4g-stepper-mobile` |

---

### Slider

#### HTML

```html
<div class="ux4g-slider-field ux4g-slider-md">
  <input type="range" min="0" max="100" value="50" />
</div>
```

#### Angular

```html
<div class="ux4g-slider-field ux4g-slider-md">
  <input type="range" min="0" max="100" value="50" />
</div>
```

#### React

```tsx
<div className="ux4g-slider-field ux4g-slider-md">
  <input type="range" min="0" max="100" defaultValue="50" />
</div>
```

---

### Carousel

#### HTML

```html
<div class="ux4g-carousel" data-ux4g-carousel>
  <div class="ux4g-carousel-inner">
    <div class="ux4g-carousel-item active">Slide 1</div>
    <div class="ux4g-carousel-item">Slide 2</div>
  </div>
  <button data-ux4g-carousel-prev>Prev</button>
  <button data-ux4g-carousel-next>Next</button>
</div>
```

#### Angular

```html
<div class="ux4g-carousel" data-ux4g-carousel>
  <div class="ux4g-carousel-inner">
    <div class="ux4g-carousel-item active">Slide 1</div>
    <div class="ux4g-carousel-item">Slide 2</div>
  </div>
  <button data-ux4g-carousel-prev>Prev</button>
  <button data-ux4g-carousel-next>Next</button>
</div>
```

#### React

```tsx
<div className="ux4g-carousel" data-ux4g-carousel>
  <div className="ux4g-carousel-inner">
    <div className="ux4g-carousel-item active">Slide 1</div>
    <div className="ux4g-carousel-item">Slide 2</div>
  </div>
  <button data-ux4g-carousel-prev>Prev</button>
  <button data-ux4g-carousel-next>Next</button>
</div>
```

---

### Navbar

#### HTML

```html
<nav class="ux4g-navbar">
  <div class="ux4g-navbar-wrap">
    <img src="logo.svg" alt="Logo" class="ux4g-navbar-logo" />
    <ul class="ux4g-navbar-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
    <div class="ux4g-navbar-right">...</div>
  </div>
</nav>
```

#### Angular

```html
<nav class="ux4g-navbar">
  <div class="ux4g-navbar-wrap">
    <img src="logo.svg" alt="Logo" class="ux4g-navbar-logo" />
    <ul class="ux4g-navbar-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
    <div class="ux4g-navbar-right">...</div>
  </div>
</nav>
```

#### React

```tsx
<nav className="ux4g-navbar">
  <div className="ux4g-navbar-wrap">
    <img src="logo.svg" alt="Logo" className="ux4g-navbar-logo" />
    <ul className="ux4g-navbar-links">
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
    <div className="ux4g-navbar-right">...</div>
  </div>
</nav>
```

#### Available Classes

| Category | Classes |
|---|---|
| Layout | `ux4g-navbar`, `ux4g-navbar-wrap`, `ux4g-navbar-right` |
| Content | `ux4g-navbar-logo`, `ux4g-navbar-links` |
| Responsive | `ux4g-navbar-desktop`, `ux4g-navbar-mobile` |

---

### Footer

#### HTML

```html
<footer class="ux4g-footer-wrapper ux4g-footer-primary">
  <div class="ux4g-footer-row">
    <p>&copy; 2024 Company Name</p>
  </div>
</footer>
```

#### Angular

```html
<footer class="ux4g-footer-wrapper ux4g-footer-primary">
  <div class="ux4g-footer-row">
    <p>&copy; 2024 Company Name</p>
  </div>
</footer>
```

#### React

```tsx
<footer className="ux4g-footer-wrapper ux4g-footer-primary">
  <div className="ux4g-footer-row">
    <p>&copy; 2024 Company Name</p>
  </div>
</footer>
```

#### Available Classes

| Category | Classes |
|---|---|
| Wrapper | `ux4g-footer-wrapper` |
| Themes | `ux4g-footer-primary`, `ux4g-footer-dark` |
| Layout | `ux4g-footer-row` |

---

### Accessibility Bar

#### HTML

```html
<div class="ux4g-topbar">
  <a href="#main-content" class="ux4g-topbar__skip">Skip to main content</a>
  <div class="ux4g-topbar__wrap">
    <div class="ux4g-topbar__group">
      <button class="ux4g-topbar__iconbtn" aria-label="Decrease font size">A-</button>
      <button class="ux4g-topbar__iconbtn" aria-label="Default font size">A</button>
      <button class="ux4g-topbar__iconbtn" aria-label="Increase font size">A+</button>
    </div>
  </div>
</div>
```

#### Angular

```html
<div class="ux4g-topbar">
  <a href="#main-content" class="ux4g-topbar__skip">Skip to main content</a>
  <div class="ux4g-topbar__wrap">
    <div class="ux4g-topbar__group">
      <button class="ux4g-topbar__iconbtn" aria-label="Decrease font size">A-</button>
      <button class="ux4g-topbar__iconbtn" aria-label="Default font size">A</button>
      <button class="ux4g-topbar__iconbtn" aria-label="Increase font size">A+</button>
    </div>
  </div>
</div>
```

#### React

```tsx
<div className="ux4g-topbar">
  <a href="#main-content" className="ux4g-topbar__skip">Skip to main content</a>
  <div className="ux4g-topbar__wrap">
    <div className="ux4g-topbar__group">
      <button className="ux4g-topbar__iconbtn" aria-label="Decrease font size">A-</button>
      <button className="ux4g-topbar__iconbtn" aria-label="Default font size">A</button>
      <button className="ux4g-topbar__iconbtn" aria-label="Increase font size">A+</button>
    </div>
  </div>
</div>
```

---

### Chips Group

#### HTML

```html
<div class="ux4g-filter-chip-group">
  <button class="ux4g-filter-chip-md active">All</button>
  <button class="ux4g-filter-chip-md">Category A</button>
  <button class="ux4g-filter-chip-md">Category B</button>
</div>
<div class="ux4g-choice-chip-group">
  <button class="ux4g-choice-chip-md active">Option 1</button>
  <button class="ux4g-choice-chip-md">Option 2</button>
</div>
```

#### Angular

```html
<div class="ux4g-filter-chip-group">
  <button class="ux4g-filter-chip-md active">All</button>
  <button class="ux4g-filter-chip-md">Category A</button>
  <button class="ux4g-filter-chip-md">Category B</button>
</div>
<div class="ux4g-choice-chip-group">
  <button class="ux4g-choice-chip-md active">Option 1</button>
  <button class="ux4g-choice-chip-md">Option 2</button>
</div>
```

#### React

```tsx
<div className="ux4g-filter-chip-group">
  <button className="ux4g-filter-chip-md active">All</button>
  <button className="ux4g-filter-chip-md">Category A</button>
  <button className="ux4g-filter-chip-md">Category B</button>
</div>
<div className="ux4g-choice-chip-group">
  <button className="ux4g-choice-chip-md active">Option 1</button>
  <button className="ux4g-choice-chip-md">Option 2</button>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Group Types | `ux4g-filter-chip-group`, `ux4g-choice-chip-group` |

---

### Combobox

#### HTML

```html
<div class="ux4g-combobox ux4g-combobox-single ux4g-combobox-md ux4g-combobox-default">
  <input type="text" role="combobox" aria-expanded="false" placeholder="Search..." />
  <ul class="ux4g-combobox-menu" role="listbox">
    <li class="ux4g-combobox-option" role="option">Result 1</li>
    <li class="ux4g-combobox-option" role="option">Result 2</li>
  </ul>
</div>
```

#### Angular

```html
<div class="ux4g-combobox ux4g-combobox-single ux4g-combobox-md ux4g-combobox-default">
  <input type="text" role="combobox" aria-expanded="false" placeholder="Search..." />
  <ul class="ux4g-combobox-menu" role="listbox">
    <li class="ux4g-combobox-option" role="option">Result 1</li>
    <li class="ux4g-combobox-option" role="option">Result 2</li>
  </ul>
</div>
```

#### React

```tsx
<div className="ux4g-combobox ux4g-combobox-single ux4g-combobox-md ux4g-combobox-default">
  <input type="text" role="combobox" aria-expanded="false" placeholder="Search..." />
  <ul className="ux4g-combobox-menu" role="listbox">
    <li className="ux4g-combobox-option" role="option">Result 1</li>
    <li className="ux4g-combobox-option" role="option">Result 2</li>
  </ul>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Types | `ux4g-combobox-single`, `ux4g-combobox-multi` |
| Sizes | `ux4g-combobox-sm`, `ux4g-combobox-md`, `ux4g-combobox-lg` |
| States | `ux4g-combobox-default`, `ux4g-combobox-error`, `ux4g-combobox-success`, `ux4g-combobox-warning` |

---

### Date Picker

#### HTML

```html
<div class="ux4g-date-picker-container">
  <input type="text" class="ux4g-date-picker-input" placeholder="Select date" readonly />
</div>
<div class="ux4g-time-picker-container">
  <input type="text" class="ux4g-time-picker-input" placeholder="Select time" readonly />
</div>
```

#### Angular

```html
<div class="ux4g-date-picker-container">
  <input type="text" class="ux4g-date-picker-input" placeholder="Select date" readonly />
</div>
```

#### React

```tsx
<div className="ux4g-date-picker-container">
  <input type="text" className="ux4g-date-picker-input" placeholder="Select date" readOnly />
</div>
```

---

### Draft Status

#### HTML

```html
<div class="ux4g-daft-staus-bar">Draft saved</div>
<div class="ux4g-auto-daft-staus-bar">Auto-saving...</div>
<div class="ux4g-success-daft-staus-bar">Published successfully</div>
```

#### Angular

```html
<div class="ux4g-daft-staus-bar">Draft saved</div>
<div class="ux4g-auto-daft-staus-bar">Auto-saving...</div>
<div class="ux4g-success-daft-staus-bar">Published successfully</div>
```

#### React

```tsx
<div className="ux4g-daft-staus-bar">Draft saved</div>
<div className="ux4g-auto-daft-staus-bar">Auto-saving...</div>
<div className="ux4g-success-daft-staus-bar">Published successfully</div>
```

---

### Empty State

#### HTML

```html
<div class="ux4g-empty-state">
  <img src="empty-illustration.svg" alt="" />
  <h3>No results found</h3>
  <p>Try adjusting your search or filters.</p>
  <button class="ux4g-btn-primary ux4g-btn-m ">Reset Filters</button>
</div>
```

#### Angular

```html
<div class="ux4g-empty-state">
  <img src="empty-illustration.svg" alt="" />
  <h3>No results found</h3>
  <p>Try adjusting your search or filters.</p>
  <button class="ux4g-btn-primary ux4g-btn-m ">Reset Filters</button>
</div>
```

#### React

```tsx
<div className="ux4g-empty-state">
  <img src="empty-illustration.svg" alt="" />
  <h3>No results found</h3>
  <p>Try adjusting your search or filters.</p>
  <button className="ux4g-btn-primary ux4g-btn-m ">Reset Filters</button>
</div>
```

---

### Feedback

#### HTML

```html
<div class="ux4g-feedback">
  <p>Was this helpful?</p>
  <div class="ux4g-feedback-chip-wrapper">
    <button class="ux4g-filter-chip-md">Yes</button>
    <button class="ux4g-filter-chip-md">No</button>
  </div>
</div>
```

#### Angular

```html
<div class="ux4g-feedback">
  <p>Was this helpful?</p>
  <div class="ux4g-feedback-chip-wrapper">
    <button class="ux4g-filter-chip-md">Yes</button>
    <button class="ux4g-filter-chip-md">No</button>
  </div>
</div>
```

#### React

```tsx
<div className="ux4g-feedback">
  <p>Was this helpful?</p>
  <div className="ux4g-feedback-chip-wrapper">
    <button className="ux4g-filter-chip-md">Yes</button>
    <button className="ux4g-filter-chip-md">No</button>
  </div>
</div>
```

---

### File Upload

#### HTML

```html
<div class="ux4g-upload ux4g-upload-state-default">
  <input type="file" />
  <span>Drag & drop or click to upload</span>
</div>
<div class="ux4g-upload ux4g-upload-state-uploaded">
  <span>document.pdf</span>
  <button class="ux4g-upload-remove">&times;</button>
</div>
```

#### Angular

```html
<div class="ux4g-upload ux4g-upload-state-default">
  <input type="file" />
  <span>Drag & drop or click to upload</span>
</div>
```

#### React

```tsx
<div className="ux4g-upload ux4g-upload-state-default">
  <input type="file" />
  <span>Drag & drop or click to upload</span>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| States | `ux4g-upload-state-default`, `ux4g-upload-state-selecting`, `ux4g-upload-state-scanning`, `ux4g-upload-state-uploaded`, `ux4g-upload-state-error` |

---

### Form Field

#### HTML

```html
<div class="ux4g-form-group">
  <label>Full Name</label>
  <input type="text" class="ux4g-input-md" placeholder="Enter name" />
  <span class="ux4g-form-helper">Enter your full legal name</span>
</div>
```

#### Angular

```html
<div class="ux4g-form-group">
  <label>Full Name</label>
  <input type="text" class="ux4g-input-md" placeholder="Enter name" />
  <span class="ux4g-form-helper">Enter your full legal name</span>
</div>
```

#### React

```tsx
<div className="ux4g-form-group">
  <label>Full Name</label>
  <input type="text" className="ux4g-input-md" placeholder="Enter name" />
  <span className="ux4g-form-helper">Enter your full legal name</span>
</div>
```

---

### Input Aadhaar

#### HTML

```html
<div class="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>Aadhaar Number</label>
  <input type="text" maxlength="14" placeholder="XXXX XXXX XXXX" />
</div>
```

#### Angular

```html
<div class="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>Aadhaar Number</label>
  <input type="text" maxlength="14" placeholder="XXXX XXXX XXXX" />
</div>
```

#### React

```tsx
<div className="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>Aadhaar Number</label>
  <input type="text" maxLength={14} placeholder="XXXX XXXX XXXX" />
</div>
```

---

### Input PAN Card

#### HTML

```html
<div class="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>PAN Number</label>
  <input type="text" maxlength="10" placeholder="ABCDE1234F" />
</div>
```

#### Angular

```html
<div class="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>PAN Number</label>
  <input type="text" maxlength="10" placeholder="ABCDE1234F" />
</div>
```

#### React

```tsx
<div className="ux4g-input-container ux4g-input-md ux4g-input-default">
  <label>PAN Number</label>
  <input type="text" maxLength={10} placeholder="ABCDE1234F" />
</div>
```

---

### Journey Timeline

#### HTML

```html
<div class="ux4g-journey-timeline ux4g-journey-timeline--vertical">
  <div class="ux4g-journey-timeline-item">
    <div class="ux4g-journey-timeline-marker"></div>
    <div class="ux4g-journey-timeline-content">Event 1</div>
  </div>
  <div class="ux4g-journey-timeline-item">
    <div class="ux4g-journey-timeline-marker"></div>
    <div class="ux4g-journey-timeline-content">Event 2</div>
  </div>
</div>
```

#### Angular

```html
<div class="ux4g-journey-timeline ux4g-journey-timeline--vertical">
  <div class="ux4g-journey-timeline-item">
    <div class="ux4g-journey-timeline-marker"></div>
    <div class="ux4g-journey-timeline-content">Event 1</div>
  </div>
  <div class="ux4g-journey-timeline-item">
    <div class="ux4g-journey-timeline-marker"></div>
    <div class="ux4g-journey-timeline-content">Event 2</div>
  </div>
</div>
```

#### React

```tsx
<div className="ux4g-journey-timeline ux4g-journey-timeline--vertical">
  <div className="ux4g-journey-timeline-item">
    <div className="ux4g-journey-timeline-marker"></div>
    <div className="ux4g-journey-timeline-content">Event 1</div>
  </div>
  <div className="ux4g-journey-timeline-item">
    <div className="ux4g-journey-timeline-marker"></div>
    <div className="ux4g-journey-timeline-content">Event 2</div>
  </div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Orientation | `ux4g-journey-timeline--vertical`, `ux4g-journey-timeline--horizontal` |

---

### List

#### HTML

```html
<ul class="ux4g-list ux4g-list-default ux4g-list-m">
  <li class="ux4g-list-item">
    <div class="ux4g-list-item-row">
      <span class="ux4g-list-item-start">Item one</span>
    </div>
  </li>
  <li class="ux4g-list-item">
    <div class="ux4g-list-item-row">
      <span class="ux4g-list-item-start">Item two</span>
    </div>
  </li>
</ul>
```

#### Angular

```html
<ul class="ux4g-list ux4g-list-default ux4g-list-m">
  <li class="ux4g-list-item">
    <div class="ux4g-list-item-row">
      <span class="ux4g-list-item-start">Item one</span>
    </div>
  </li>
  <li class="ux4g-list-item">
    <div class="ux4g-list-item-row">
      <span class="ux4g-list-item-start">Item two</span>
    </div>
  </li>
</ul>
```

#### React

```tsx
<ul className="ux4g-list ux4g-list-default ux4g-list-m">
  <li className="ux4g-list-item">
    <div className="ux4g-list-item-row">
      <span className="ux4g-list-item-start">Item one</span>
    </div>
  </li>
  <li className="ux4g-list-item">
    <div className="ux4g-list-item-row">
      <span className="ux4g-list-item-start">Item two</span>
    </div>
  </li>
</ul>
```

#### Available Classes

| Category | Classes |
|---|---|
| Variants | `ux4g-list-default`, `ux4g-list-error`, `ux4g-list-success`, `ux4g-list-warning` |
| Sizes | `ux4g-list-s`, `ux4g-list-m`, `ux4g-list-l`, `ux4g-list-xl` |

---

### OTP

#### HTML

```html
<div class="ux4g-otp">
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
</div>
<div class="ux4g-otp ux4g-otp-error">
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
</div>
```

#### Angular

```html
<div class="ux4g-otp">
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
  <input type="text" maxlength="1" />
</div>
```

#### React

```tsx
<div className="ux4g-otp">
  <input type="text" maxLength={1} />
  <input type="text" maxLength={1} />
  <input type="text" maxLength={1} />
  <input type="text" maxLength={1} />
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| States | default, `ux4g-otp-success`, `ux4g-otp-error`, `ux4g-otp-locked` |

---

### Progress Indicator

#### HTML

```html
<div class="ux4g-progress-bar">
  <div class="ux4g-progress-bar-fill" style="width: 60%"></div>
</div>
<div class="ux4g-progress-circle">
  <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" /></svg>
</div>
```

#### Angular

```html
<div class="ux4g-progress-bar">
  <div class="ux4g-progress-bar-fill" style="width: 60%"></div>
</div>
```

#### React

```tsx
<div className="ux4g-progress-bar">
  <div className="ux4g-progress-bar-fill" style={{ width: '60%' }}></div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Types | `ux4g-progress-bar`, `ux4g-progress-circle` |

---

### Result List

#### HTML

```html
<div class="ux4g-result-list">
  <div class="ux4g-result-list-item">
    <h4>Result Title</h4>
    <p>Description text</p>
  </div>
</div>
<div class="ux4g-result-list ux4g-result-list-v2">
  <div class="ux4g-result-list-item">
    <h4>Result Title</h4>
    <p>Description text</p>
  </div>
</div>
```

#### Angular

```html
<div class="ux4g-result-list">
  <div class="ux4g-result-list-item">
    <h4>Result Title</h4>
    <p>Description text</p>
  </div>
</div>
```

#### React

```tsx
<div className="ux4g-result-list">
  <div className="ux4g-result-list-item">
    <h4>Result Title</h4>
    <p>Description text</p>
  </div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Variations | default, `ux4g-result-list-v1`, `ux4g-result-list-v2`, `ux4g-result-list-v3`, `ux4g-result-list-v4`, `ux4g-result-list-v5` |

---

### SLA Progress Indicator

#### HTML

```html
<div class="ux4g-sla-circle"><span>75%</span></div>
<div class="ux4g-sla-linear"><div class="ux4g-sla-fill" style="width: 75%"></div></div>
<span class="ux4g-sla-badge">On Track</span>
```

#### Angular

```html
<div class="ux4g-sla-circle"><span>75%</span></div>
<div class="ux4g-sla-linear"><div class="ux4g-sla-fill" style="width: 75%"></div></div>
<span class="ux4g-sla-badge">On Track</span>
```

#### React

```tsx
<div className="ux4g-sla-circle"><span>75%</span></div>
<div className="ux4g-sla-linear"><div className="ux4g-sla-fill" style={{ width: '75%' }}></div></div>
<span className="ux4g-sla-badge">On Track</span>
```

#### Available Classes

| Category | Classes |
|---|---|
| Types | `ux4g-sla-circle`, `ux4g-sla-linear`, `ux4g-sla-badge` |

---

### Social Link

#### HTML

```html
<div class="ux4g-d-flex ux4g-gap-s">
  <a href="#" aria-label="Twitter"><i class="ux4g-icon-outlined">share</i></a>
  <a href="#" aria-label="LinkedIn"><i class="ux4g-icon-outlined">link</i></a>
</div>
```

#### Angular

```html
<div class="ux4g-d-flex ux4g-gap-s">
  <a href="#" aria-label="Twitter"><i class="ux4g-icon-outlined">share</i></a>
  <a href="#" aria-label="LinkedIn"><i class="ux4g-icon-outlined">link</i></a>
</div>
```

#### React

```tsx
<div className="ux4g-d-flex ux4g-gap-s">
  <a href="#" aria-label="Twitter"><i className="ux4g-icon-outlined">share</i></a>
  <a href="#" aria-label="LinkedIn"><i className="ux4g-icon-outlined">link</i></a>
</div>
```

---

### Status Pipeline

#### HTML

```html
<div class="ux4g-status-pipeline-stepper">
  <div class="ux4g-status-pipeline-step completed">Submitted</div>
  <div class="ux4g-status-pipeline-step active">In Review</div>
  <div class="ux4g-status-pipeline-step">Approved</div>
</div>
```

#### Angular

```html
<div class="ux4g-status-pipeline-stepper">
  <div class="ux4g-status-pipeline-step completed">Submitted</div>
  <div class="ux4g-status-pipeline-step active">In Review</div>
  <div class="ux4g-status-pipeline-step">Approved</div>
</div>
```

#### React

```tsx
<div className="ux4g-status-pipeline-stepper">
  <div className="ux4g-status-pipeline-step completed">Submitted</div>
  <div className="ux4g-status-pipeline-step active">In Review</div>
  <div className="ux4g-status-pipeline-step">Approved</div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Orientation | `ux4g-status-pipeline-vertical`, `ux4g-status-pipeline-horizontal` |

---

### Textarea

#### HTML

```html
<div class="ux4g-textarea">
  <label class="ux4g-textarea-label">Description</label>
  <textarea class="ux4g-textarea-input" maxlength="200" placeholder="Enter description"></textarea>
  <span class="ux4g-textarea-counter">0 / 200</span>
</div>
```

#### Angular

```html
<div class="ux4g-textarea">
  <label class="ux4g-textarea-label">Description</label>
  <textarea class="ux4g-textarea-input" maxlength="200" placeholder="Enter description"></textarea>
  <span class="ux4g-textarea-counter">0 / 200</span>
</div>
```

#### React

```tsx
<div className="ux4g-textarea">
  <label className="ux4g-textarea-label">Description</label>
  <textarea className="ux4g-textarea-input" maxLength={200} placeholder="Enter description"></textarea>
  <span className="ux4g-textarea-counter">0 / 200</span>
</div>
```

---

### Time Slot

#### HTML

```html
<div class="ux4g-time-slot-weekly-container">
  <div class="ux4g-time-slot">9:00 AM</div>
  <div class="ux4g-time-slot">10:00 AM</div>
  <div class="ux4g-time-slot selected">11:00 AM</div>
</div>
<div class="ux4g-time-slot-compact-container">
  <div class="ux4g-time-slot">9:00</div>
  <div class="ux4g-time-slot">9:30</div>
</div>
```

#### Angular

```html
<div class="ux4g-time-slot-weekly-container">
  <div class="ux4g-time-slot">9:00 AM</div>
  <div class="ux4g-time-slot">10:00 AM</div>
  <div class="ux4g-time-slot selected">11:00 AM</div>
</div>
```

#### React

```tsx
<div className="ux4g-time-slot-weekly-container">
  <div className="ux4g-time-slot">9:00 AM</div>
  <div className="ux4g-time-slot">10:00 AM</div>
  <div className="ux4g-time-slot selected">11:00 AM</div>
</div>
```

#### Available Classes

| Category | Classes |
|---|---|
| Containers | `ux4g-time-slot-weekly-container`, `ux4g-time-slot-compact-container` |
| State | `selected` |

---

## Runtime Module

The runtime provides interactive behaviors via event delegation. No per-element binding needed.

### Auto-Bootstrap (Recommended)

```ts
import 'ux4g-web-components/design-system';
```

### Explicit Control

```ts
import { initRuntime, destroyRuntime } from 'ux4g-web-components/runtime';
initRuntime();
destroyRuntime(); // cleanup
```

### Behaviors Provided

| Behavior | Trigger |
|---|---|
| Dropdown | `.ux4g-dropdown-control` |
| Modal | `data-modal-target`, `data-close-modal` |
| Tooltip | `.ux4g-tooltip-wrapper` hover |
| Popover | `data-ux-toggle="popover"` |
| Accordion | `data-ux4g-accordion-toggle` |
| Tab | `.ux4g-tab-item` click |
| Carousel | `data-ux4g-carousel-prev`, `data-ux4g-carousel-next` |
| Drawer | `data-drawer`, `data-drawer-close` |
| Mega Menu | `.ux4g-mega-menu-category-item` click |
| Alert | `.ux4g-alert-close`, `data-auto-dismiss` |

---

## Utility Classes

36 modules of single-purpose helper classes (3,188 unique classes):

```html
<div class="ux4g-d-flex ux4g-gap-m ux4g-p-l ux4g-bg-primary-soft ux4g-radius-m">
  <span class="ux4g-body-m-default ux4g-text-neutral-primary">Content</span>
</div>
```

| Category | Modules |
|---|---|
| Typography & Text | `text`, `typescale`, `typography`, `colors`, `line-clamp`, `vertical-align` |
| Layout & Spacing | `display`, `padding`, `margin`, `gap`, `child-spacing`, `sizing`, `object-fit`, `overflow`, `position`, `position-responsive`, `float`, `z-index`, `visibility` |
| Flexbox & Alignment | `flex`, `align`, `justify`, `order` |
| Visual Effects & Borders | `background`, `border`, `radius`, `ring`, `outline`, `divide`, `shadow`, `opacity`, `blur`, `effects` |
| Transitions & Transforms | `transition`, `transform` |
| Interaction & Scroll | `interaction`, `scroll` |

---

## Dark Theme

```html
<html data-theme="dark">
  <!-- All components automatically use dark tokens -->
</html>

<!-- Or scope to a section -->
<div data-theme="dark">
  <button class="ux4g-btn-primary ux4g-btn-m ">Dark button</button>
</div>
```

---

## License

MIT
