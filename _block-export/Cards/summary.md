# Cards Block — Extraction Summary

## Block Identity
- **Original name**: `cards`
- **Type**: Standard self-contained block (multi-file module)
- **Naming pattern**: Plural/singular — `cards` (block) / `card` (item)

## Extracted Files (8)

### Source Code
| File | Description | Lines |
|---|---|---|
| `{BLOCK_NAME}.js` | Main block decorator — card creation, layout, navigation, analytics | 897 |
| `{BLOCK_CHILD}-utils.js` | Shared utilities — button creation, metadata fetching/caching, lazy loading | 369 |
| `{BLOCK_CHILD}-topic.js` | Topic card content builder — images, subtitles, links, icons | 452 |
| `{BLOCK_CHILD}-post.js` | Post card content builder — metadata, tags, dates, buttons | 327 |
| `{BLOCK_NAME}.css` | Complete styles — grid/carousel layouts, card types, responsive, a11y | 1,663 |
| `{BLOCK_NAME}.stories.js` | Storybook stories — 9 variants covering grid, carousel, post, mixed | 424 |
| `_{BLOCK_NAME}.json` | AEM content model — block + item definitions, fields, filters | 339 |
| `{BLOCK_NAME}-constants.js` | All constants — CSS classes, indices, configs, ARIA, text strings | 288 |

### Documentation
| File | Description |
|---|---|
| `naming-map.json` | Placeholder mapping with child naming, design system notes |
| `model-snippet.json` | Component filter registration entry |
| `placeholders-constants-snippet.js` | i18n placeholder constants for tag ARIA labels |
| `extraction-information.md` | Source locations, dependencies, classification |
| `description.md` | Block capabilities and architecture overview |
| `summary.md` | This file |
| `README.md` | Quick-start guide |
| `implementation.md` | Detailed step-by-step integration instructions |

## Placeholders Used
- `{BLOCK_NAME}` = `cards` (plural — block wrapper, file names)
- `{BLOCK_CHILD}` = `card` (singular — item class, variable names)
- `{BLOCK_FUNC}` = `Cards` (PascalCase plural)
- `{BLOCK_CHILD_FUNC}` = `Card` (PascalCase singular)

## External Dependencies (17)
Grouped by source module:
- **`scripts/aem.js`**: `decorateIcons`, `getLanguagePath`, `getMetadata`
- **`scripts/scripts.js`**: `moveInstrumentation`
- **`scripts/placeholders.js`**: `fetchPlaceholdersForLocale`
- **`scripts/analytics/data-layer.js`**: `trackElementInteraction`
- **`utils/generic-utils.js`**: `processRichHtmlWithIconsAndDecode`, `stripLinksFromHtml`, `parseTags`, `attachImageErrorHandler`
- **`utils/taxonomy-utils.js`**: `fetchTaxonomyData`, `getLocalizedTagTitle`
- **`utils/tag-utils.js`**: `createTagUrl`
- **`constants/constants.js`**: `BREAKPOINTS`
- **`constants/placeholders-constants.js`**: `OG_FALLBACK_IMAGE`, `CARDS_ARTICLE_TAGS_ARIA_LABEL`, `CARDS_TAG_ARIA_LABEL`

## Special Notes
1. **Plural/singular naming** — Use `{BLOCK_NAME}` for the block wrapper and `{BLOCK_CHILD}` for individual items
2. **Constant key names preserved** — SCREAMING_SNAKE keys in the constants file are NOT placeholderized
3. **Design system classes preserved** — `.button`, `.button-primary`, etc. are global tokens, not replaced
4. **Metadata fetching** — Post cards fetch remote page metadata; ensure CORS/network access in target environment
