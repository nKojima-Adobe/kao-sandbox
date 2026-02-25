# Back-To-Top

A sticky "back to top" button for AEM Edge Delivery Services, implemented as a Web Component (`<back-to-top>` custom HTML element). The button appears when the user scrolls past a threshold and smoothly scrolls the page to the top when activated.

## Key Features

- **Web Component** — `BackToTop extends HTMLElement` with lifecycle callbacks
- Custom element tag: `<back-to-top>`, registered via `customElements.define()`
- Fixed position at bottom-right of viewport
- Scroll-based visibility with configurable threshold (300px default)
- Smooth fade-in/out animation with `translateY`
- Throttled scroll handler using `requestAnimationFrame`
- Smooth scroll to top via `window.scrollTo({ behavior: 'smooth' })`
- Keyboard accessible: Enter/Space, `role="button"`, `tabindex="0"`
- Hover effects: subtle upward shift + background highlight
- Focus outline for accessibility
- `prefers-reduced-motion` support
- Japanese language typography support (`html[lang="ja"]`)
- Optional button label text (from AEM content model)
- SVG arrow icon
- Analytics tracking for click events
- Proper cleanup on disconnect

## File List

| File | Description |
|------|-------------|
| `{BLOCK_NAME}.js` | Web Component class (128 lines) |
| `{BLOCK_NAME}.css` | Custom element styles (82 lines) |
| `{BLOCK_NAME}-noop.js` | No-op block decorator for `blocks/` folder (5 lines) |
| `{BLOCK_NAME}-noop.css` | Empty block CSS for `blocks/` folder (3 lines) |
| `_{BLOCK_NAME}.json` | AEM content model (35 lines) |
| `model-snippet.json` | Header filter registration |
| `header-integration-snippet.js` | Header block integration code |

## Architecture

This block uses a **dual-structure** pattern:

1. **`blocks/{BLOCK_NAME}/`** — Contains no-op decorator files. The block's entry point does nothing; behavior is delegated to the Web Component.
2. **`components/{BLOCK_NAME}/`** — Contains the actual `HTMLElement` subclass and its CSS. This is where all logic and styling live.
3. **Parent block (header)** — Imports the Web Component, finds the authored `.back-to-top` block in the page fragment, and instantiates `new BackToTop(element)` then appends it to `document.body`.

## How It Works

1. Author adds a "Back to Top" block in the AEM editor (can include a label)
2. The block decorator in `blocks/` is a no-op — it does nothing
3. The header block imports the Web Component from `components/`
4. Header finds the `.back-to-top` authored element and passes it to the constructor
5. `BackToTop` renders an icon + optional label, then listens for scroll events
6. When scroll position exceeds 300px, the button fades in
7. Clicking/pressing Enter scrolls smoothly to top and tracks the event

## External Dependencies

| Import | Source | Required | Purpose |
|--------|--------|----------|---------|
| `trackNavigationScrollTop` | `scripts/analytics/data-layer.js` | No | Analytics tracking (stub if missing) |

## CSS Custom Properties Used (global)

- `--spacing-01` through `--spacing-07`
- `--transition-medium`
- `--nec-gray-60`, `--nec-sky-05`, `--nec-blue-30`
- `--font-size-sm`, `--font-weight-regular`
- `--line-height-lg`, `--line-height-ja-xxxl`, `--letter-spacing-ja`

## Integration Notes

- This is **not** a standalone block — it must be imported by a parent block (typically header)
- Place Web Component files in `components/{BLOCK_NAME}/`
- Place no-op block files in `blocks/{BLOCK_NAME}/`
- CSS selectors target the custom element tag name directly (e.g., `back-to-top { ... }`)
- The component requires `window.hlx.codeBasePath` to resolve the icon SVG path
- Register in header block filter and component model files
