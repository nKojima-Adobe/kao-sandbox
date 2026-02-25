# Extraction Information — Quote Block

## Source Repository
- **Repo**: `mwp-nec-eds` (AEM Edge Delivery Services)
- **Branch**: `develop`
- **Extraction Date**: 2026-02-13

## Source File Locations

| # | Original Path | Extracted As | Lines |
|---|---|---|---|
| 1 | `blocks/quote/quote.js` | `{BLOCK_NAME}.js` | 212 |
| 2 | `blocks/quote/quote.css` | `{BLOCK_NAME}.css` | 249 |
| 3 | `blocks/quote/quote.stories.js` | `{BLOCK_NAME}.stories.js` | 631 |
| 4 | `blocks/quote/_quote.json` | `_{BLOCK_NAME}.json` | 107 |

**Total**: ~1,199 lines across 4 files

## Block Classification
- **Type**: Standard self-contained block
- **Architecture**: Single-file module (one JS file, no sub-modules or constants file)

## Placeholder Strategy

| Placeholder | Original | Context |
|---|---|---|
| `{BLOCK_NAME}` | `quote` | Block name, file names, CSS class prefix, JSON IDs |
| `{BLOCK_FUNC}` | `Quote` | PascalCase (display titles, Storybook) |

## External Dependencies (2)

| # | Import | From | Used In |
|---|---|---|---|
| 1 | `sanitizeUrl` | `utils/generic-utils.js` | `{BLOCK_NAME}.js` |
| 2 | `normalizeAltText` | `utils/generic-utils.js` | `{BLOCK_NAME}.js` |

## Global Style References

The block has typography variant overrides in `styles/typography.css`:
- `.quote.small` — Smaller font size variant
- `.quote.medium` — Medium font size variant
- Japanese typography overrides for both variants

These are extracted as `global-typography-snippet.css`.

## AEM Model Registration
- Registered in `models/_section.json` filter list as `"quote"`
- Should be added to `models/_component-filters.json` → `main` → `components` array
