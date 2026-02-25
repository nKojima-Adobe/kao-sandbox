# Extraction Summary — Back-To-Top Block

## Block Names
- **Source:** `back-to-top`
- **Library folder:** `Back-To-Top`
- **Type:** Standard single block, Web Component architecture

## Naming Normalization

| Placeholder | Original | Case |
|-------------|----------|------|
| `{BLOCK_NAME}` | `back-to-top` | kebab-case |
| `{BLOCK_CLASS}` | `back-to-top` | kebab-case |
| `{BLOCK_FUNC}` | `BackToTop` | PascalCase |
| `{BLOCK_VAR}` | `backToTop` | camelCase |
| `{BLOCK_UPPER}` | `BACK_TO_TOP` | SCREAMING_SNAKE (unused) |

## Files Extracted

### Block Source Files (with placeholders)

| File | Original Source | Description |
|------|----------------|-------------|
| `{BLOCK_NAME}.js` | `components/back-to-top/back-to-top.js` | Web Component implementation (128 lines) |
| `{BLOCK_NAME}.css` | `components/back-to-top/back-to-top.css` | Custom element styles (82 lines) |
| `{BLOCK_NAME}-noop.js` | `blocks/back-to-top/back-to-top.js` | No-op block decorator (5 lines) |
| `{BLOCK_NAME}-noop.css` | `blocks/back-to-top/back-to-top.css` | Empty block CSS (3 lines) |
| `_{BLOCK_NAME}.json` | `blocks/back-to-top/_back-to-top.json` | AEM content model (35 lines) |

### Snippets

| File | Purpose |
|------|---------|
| `model-snippet.json` | Header filter registration (NOT section filter) |
| `header-integration-snippet.js` | Shows how to import + instantiate in a parent header block |

### Documentation

| File | Purpose |
|------|---------|
| `naming-map.json` | Comprehensive placeholder mapping |
| `extraction-information.md` | Source paths, discovery, dependencies |
| `description.md` | Block functionality description |
| `summary.md` | This file |
| `README.md` | Human-friendly documentation |
| `implementation.md` | Step-by-step Cursor AI integration guide |

## External Dependencies

| Import | Source | Required | Purpose |
|--------|--------|----------|---------|
| `trackNavigationScrollTop` | `scripts/analytics/data-layer.js` | No | Analytics (stub if missing) |

## Architecture Notes

This block uses a **Web Component pattern** rather than a standard EDS block decorator:
- The `blocks/back-to-top/` folder contains no-op files (the block decorator does nothing)
- The actual implementation lives in `components/back-to-top/` as an `HTMLElement` subclass
- The **header block** is responsible for importing and mounting this component
- CSS uses the custom element tag name (`back-to-top`) as the selector, not a class

## Next Steps

1. Copy `Back-To-Top` folder to target project's `_block-export/`
2. Open `implementation.md` and follow the interactive guide
3. Place Web Component files in `components/{BLOCK_NAME}/`
4. Place no-op block files in `blocks/{BLOCK_NAME}/`
5. Integrate with header block (import, CSS import, instantiation)
6. Register in component model files
7. Resolve `trackNavigationScrollTop` dependency (or stub it)

**Important:** All extracted files contain placeholders (`{BLOCK_NAME}`, `{BLOCK_CLASS}`, `{BLOCK_FUNC}`, `{BLOCK_VAR}`) that must be replaced during implementation.
