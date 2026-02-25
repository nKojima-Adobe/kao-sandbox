# Tab List — Extracted Block

Accessible tab navigation with responsive scrolling, fade indicators, and paired panel sections.

## Quick Start

1. Read `implementation.md` for full step-by-step instructions
2. Replace placeholders in all extracted files:
   - `{BLOCK_NAME}` → target block name (e.g., `tab-list`)
   - `{BLOCK_PANEL}` → paired panel name (e.g., `tab-panel`)
   - `{BLOCK_FUNC}` → display name (e.g., `Tab List`)
   - `{BLOCK_PANEL_FUNC}` → panel display name (e.g., `Tab Panel`)
3. Copy files to target project:
   - `{BLOCK_NAME}.js` → `blocks/TARGET_NAME/TARGET_NAME.js`
   - `{BLOCK_NAME}-utils.js` → `blocks/TARGET_NAME/TARGET_NAME-utils.js`
   - `{BLOCK_NAME}.css` → `blocks/TARGET_NAME/TARGET_NAME.css`
   - `_{BLOCK_NAME}.json` → `blocks/TARGET_NAME/_TARGET_NAME.json`
4. Resolve 3 external dependency modules (see `implementation.md` §6)
5. Optionally add `buildTabs()` to scripts.js (`scripts-js-snippet.js`)
6. Optionally add Universal Editor import (`editor-support-js-snippet.js`)
7. Register filters in component-filters.json (`model-snippet.json`)

## Files

| File | Purpose |
|------|---------|
| `{BLOCK_NAME}.js` | Main block decorator (441 lines) |
| `{BLOCK_NAME}-utils.js` | Scroll and fade utility functions (119 lines) |
| `{BLOCK_NAME}.css` | All styles: tabs, fades, panels, animation (217 lines) |
| `_{BLOCK_NAME}.json` | AEM content model — block + panel definitions |
| `{BLOCK_NAME}.stories.js` | Storybook stories (7 variants) |
| `scripts-js-snippet.js` | Auto-insertion logic for scripts.js |
| `editor-support-js-snippet.js` | Universal Editor integration |
| `model-snippet.json` | Filter registration reference |
| `naming-map.json` | Placeholder mapping reference |
| `implementation.md` | Full implementation guide |
