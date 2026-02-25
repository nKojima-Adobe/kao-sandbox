# Quote Block — Extraction Summary

## Block Identity
- **Original name**: `quote`
- **Type**: Standard self-contained block (single-file module)

## Extracted Files (4)

### Source Code
| File | Description | Lines |
|---|---|---|
| `{BLOCK_NAME}.js` | Block decorator — parses rows, builds blockquote with attribution | 212 |
| `{BLOCK_NAME}.css` | Styles — 3 variants, responsive grid layout, a11y focus states | 249 |
| `{BLOCK_NAME}.stories.js` | Storybook — 10 variants (default, logo, links, article, a11y) | 631 |
| `_{BLOCK_NAME}.json` | AEM content model — 8 fields with conditionals and validation | 107 |

### Documentation
| File | Description |
|---|---|
| `naming-map.json` | Placeholder mapping |
| `model-snippet.json` | Component filter registration entry |
| `global-typography-snippet.css` | Typography size variants (.small, .medium) from global styles |
| `extraction-information.md` | Source locations, dependencies |
| `description.md` | Block capabilities overview |
| `summary.md` | This file |
| `README.md` | Quick-start guide |
| `implementation.md` | Step-by-step integration instructions |

## Placeholders Used
- `{BLOCK_NAME}` = `quote` (block name, CSS class prefix)
- `{BLOCK_FUNC}` = `Quote` (PascalCase display name)

## External Dependencies (2)
- `sanitizeUrl` from `utils/generic-utils.js` — URL validation/sanitization
- `normalizeAltText` from `utils/generic-utils.js` — Alt text normalization

## Special Notes
1. **Global typography snippet**: Typography size variants (`.quote.small`, `.quote.medium`) are defined in `styles/typography.css`, extracted as `global-typography-snippet.css`
2. **Minimal dependencies**: Only 2 external utilities needed
3. **No constants file**: All values are inline in the JS file
