# Extraction Information

## Source
- **Repository**: `mwp-nec-eds`
- **Block name**: `sns-share-links`
- **Library folder name**: `SNS-Share-Links`

## Source Files (4)
| # | Source Path | Export File | Lines |
|---|-----------|------------|-------|
| 1 | `blocks/sns-share-links/sns-share-links.js` | `{BLOCK_NAME}.js` | 349 |
| 2 | `blocks/sns-share-links/sns-share-links.css` | `{BLOCK_NAME}.css` | 122 |
| 3 | `blocks/sns-share-links/_sns-share-links.json` | `_{BLOCK_NAME}.json` | 79 |
| 4 | `blocks/sns-share-links/sns-share-links.stories.js` | `{BLOCK_NAME}.stories.js` | 432 |

## Generated Files (7)
| # | File | Purpose |
|---|------|---------|
| 1 | `naming-map.json` | Placeholder definitions and replacement rules |
| 2 | `placeholders-constants-snippet.js` | 16 i18n placeholder constants for localization |
| 3 | `model-snippet.json` | Section filter registration |
| 4 | `extraction-information.md` | This file |
| 5 | `description.md` | Block description |
| 6 | `summary.md` | Extraction summary |
| 7 | `README.md` | Quick start guide |
| 8 | `implementation.md` | Full implementation instructions |

## Placeholder Strategy
This block uses a **root prefix** naming pattern:
- `{BLOCK_NAME}` = `sns-share-links` — block wrapper (plural)
- `{BLOCK_CHILD}` = `sns-share-link` — individual item (singular)
- `{BLOCK_ROOT}` = `sns-share` — common root prefix for derived names (toast, click, keyframes)
- `{BLOCK_FUNC}` = `SNS Share Links` — display/title case
- `{BLOCK_CHILD_FUNC}` = `SNS Share Link` — singular display/title case

## External Dependencies (5 modules, 18 imports)
1. `decorateIcons` from `scripts/aem.js`
2. `moveInstrumentation` from `scripts/scripts.js`
3. `isClipboardSupported` from `utils/generic-utils.js`
4. `fetchPlaceholdersForLocale` from `scripts/placeholders.js`
5. `trackElementInteraction` from `scripts/analytics/data-layer.js`
6. 16 constants from `constants/placeholders-constants.js` (SNS_LINKEDIN_NAME, etc.)
