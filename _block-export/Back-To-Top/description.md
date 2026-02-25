# Back-To-Top Block Description

A sticky "back to top" button implemented as a **Web Component** (`<back-to-top>` custom HTML element) for AEM Edge Delivery Services.

## What It Does

The button appears as a fixed-position element at the bottom-right of the viewport. It becomes visible after the user scrolls past a configurable threshold (default: 300px) and smoothly scrolls the page to the top when clicked.

## Key Features

- **Web Component architecture** — extends `HTMLElement` with `connectedCallback`/`disconnectedCallback` lifecycle
- **Custom element tag** — `<back-to-top>`, registered via `customElements.define()`
- **Scroll-based visibility** — shows/hides with fade + translateY animation based on scroll position
- **Throttled scroll handler** — uses `requestAnimationFrame` for performance
- **Smooth scroll** — `window.scrollTo({ behavior: 'smooth' })`
- **Keyboard accessible** — Enter/Space key support, `role="button"`, `tabindex="0"`
- **Focus styles** — visible outline on focus
- **Hover effects** — subtle upward translation and background color
- **Reduced motion support** — respects `prefers-reduced-motion` media query
- **Japanese language support** — custom line-height and letter-spacing for `html[lang="ja"]`
- **Icon support** — renders an upward arrow SVG icon
- **Optional label text** — configurable via AEM content model field
- **Analytics integration** — tracks scroll-to-top clicks with position data
- **Proper cleanup** — removes event listeners on disconnect

## Architecture Note

This component uses a dual-structure pattern:
1. A **no-op block decorator** in `blocks/back-to-top/` (empty `decorate()`)
2. The **real Web Component** in `components/back-to-top/`
3. The **header block** imports and instantiates the Web Component, appending it to `document.body`
