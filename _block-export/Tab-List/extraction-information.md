# Extraction Information

## Source
- **Repository**: `mwp-nec-eds`
- **Block name**: `tab-list`
- **Library folder name**: `Tab-List`

## Source Files (5)
| # | Source Path | Export File | Lines |
|---|-----------|------------|-------|
| 1 | `blocks/tab-list/tab-list.js` | `{BLOCK_NAME}.js` | 441 |
| 2 | `blocks/tab-list/tab-list-utils.js` | `{BLOCK_NAME}-utils.js` | 119 |
| 3 | `blocks/tab-list/tab-list.css` | `{BLOCK_NAME}.css` | 217 |
| 4 | `blocks/tab-list/_tab-list.json` | `_{BLOCK_NAME}.json` | 92 |
| 5 | `blocks/tab-list/tab-list.stories.js` | `{BLOCK_NAME}.stories.js` | 328 |

## Generated Files (10)
| # | File | Purpose |
|---|------|---------|
| 1 | `naming-map.json` | Placeholder definitions and replacement rules |
| 2 | `model-snippet.json` | Component filter registration |
| 3 | `scripts-js-snippet.js` | Auto-insertion logic for scripts.js |
| 4 | `editor-support-js-snippet.js` | Universal Editor integration snippet |
| 5 | `extraction-information.md` | This file |
| 6 | `description.md` | Block description |
| 7 | `summary.md` | Extraction summary |
| 8 | `README.md` | Quick start guide |
| 9 | `implementation.md` | Full implementation instructions |

## Placeholder Strategy
This block uses a **paired component** pattern:
- `{BLOCK_NAME}` = `tab-list` — block name, CSS class prefix, all derived classes
- `{BLOCK_PANEL}` = `tab-panel` — paired section component
- `{BLOCK_FUNC}` = `Tab List` — display/title case
- `{BLOCK_PANEL_FUNC}` = `Tab Panel` — paired display/title case

**Preserved patterns**: ARIA roles (`role="tab"`, `role="tablist"`, `role="tabpanel"`), camelCase variables (`tabList`, `tabPanel`, `tabLabel`), `data-tab-label` attribute.

## External Dependencies (3 modules, 7 imports)
1. `toClassName`, `decorateIcons` from `scripts/aem.js`
2. `enableHorizontalScroll`, `setupEventListenerCleanup`, `setSafeInlineTextWithIcons`, `decodeCmsText` from `utils/generic-utils.js`
3. `trackElementInteraction` from `scripts/analytics/data-layer.js`

## Global Script Integration (2 files)
1. `scripts/scripts.js` → `buildTabs()` — auto-creates tab-list blocks for orphan tab-panel sections
2. `scripts/editor-support.js` → imports `normalizeTabLabel` from this block for Universal Editor
