# Extraction Information — Cards Block

## Source Repository
- **Repo**: `mwp-nec-eds` (AEM Edge Delivery Services)
- **Branch**: `develop`
- **Extraction Date**: 2026-02-13

## Source File Locations

| # | Original Path | Extracted As | Lines |
|---|---|---|---|
| 1 | `blocks/cards/cards.js` | `{BLOCK_NAME}.js` | 897 |
| 2 | `blocks/cards/card-utils.js` | `{BLOCK_CHILD}-utils.js` | 369 |
| 3 | `blocks/cards/card-topic.js` | `{BLOCK_CHILD}-topic.js` | 452 |
| 4 | `blocks/cards/card-post.js` | `{BLOCK_CHILD}-post.js` | 327 |
| 5 | `blocks/cards/cards.css` | `{BLOCK_NAME}.css` | 1,663 |
| 6 | `blocks/cards/cards.stories.js` | `{BLOCK_NAME}.stories.js` | 424 |
| 7 | `blocks/cards/_cards.json` | `_{BLOCK_NAME}.json` | 339 |
| 8 | `constants/cards-constants.js` | `{BLOCK_NAME}-constants.js` | 288 |

**Total**: ~4,759 lines across 8 files

## Block Classification
- **Type**: Standard self-contained block
- **Architecture**: Multi-file module (main decorator + 3 sub-modules + constants)
- **Naming Pattern**: Plural/singular — `cards` (block) / `card` (item)

## Placeholder Strategy

| Placeholder | Original | Context |
|---|---|---|
| `{BLOCK_NAME}` | `cards` | Block name, file names, CSS block class, JSON IDs |
| `{BLOCK_CHILD}` | `card` | Singular item name, CSS item class prefix, JS variable |
| `{BLOCK_FUNC}` | `Cards` | PascalCase plural (display titles) |
| `{BLOCK_CHILD_FUNC}` | `Card` | PascalCase singular (display titles) |
| `{BLOCK_VAR}` | `cards` | camelCase (same as BLOCK_NAME for single-word) |

### Important Notes
1. **SCREAMING_SNAKE key names preserved**: Constant object keys like `CARD`, `CARDS_GRID`, `CARD_CONTENT` inside the constants file are NOT placeholderized. Only their string values are replaced.
2. **Design system classes preserved**: `.button`, `.button-primary`, `.button-secondary`, `.primary`, `.secondary`, `.link` are NOT replaced — they are global design tokens.
3. **camelCase compound names preserved**: `cardType`, `cardIndex`, `cardTitle`, `cardContent`, `cardConfig`, `createLegacyCard`, `trackCardClick`, etc. are preserved as-is (internal variable/function names).

## External Dependencies (17 total)

| # | Import | From | Used In |
|---|---|---|---|
| 1 | `moveInstrumentation` | `scripts/scripts.js` | `{BLOCK_NAME}.js` |
| 2 | `decorateIcons` | `scripts/aem.js` | `{BLOCK_NAME}.js`, `{BLOCK_CHILD}-utils.js`, `{BLOCK_CHILD}-topic.js`, `{BLOCK_CHILD}-post.js` |
| 3 | `getLanguagePath` | `scripts/aem.js` | `{BLOCK_NAME}.js` |
| 4 | `getMetadata` | `scripts/aem.js` | `{BLOCK_CHILD}-utils.js` |
| 5 | `fetchTaxonomyData` | `utils/taxonomy-utils.js` | `{BLOCK_NAME}.js` |
| 6 | `getLocalizedTagTitle` | `utils/taxonomy-utils.js` | `{BLOCK_CHILD}-post.js` |
| 7 | `fetchPlaceholdersForLocale` | `scripts/placeholders.js` | `{BLOCK_NAME}.js`, `{BLOCK_CHILD}-utils.js` |
| 8 | `BREAKPOINTS` | `constants/constants.js` | `{BLOCK_NAME}.js` |
| 9 | `trackElementInteraction` | `scripts/analytics/data-layer.js` | `{BLOCK_NAME}.js` |
| 10 | `OG_FALLBACK_IMAGE` | `constants/placeholders-constants.js` | `{BLOCK_CHILD}-utils.js` |
| 11 | `CARDS_ARTICLE_TAGS_ARIA_LABEL` | `constants/placeholders-constants.js` | `{BLOCK_CHILD}-post.js` |
| 12 | `CARDS_TAG_ARIA_LABEL` | `constants/placeholders-constants.js` | `{BLOCK_CHILD}-post.js` |
| 13 | `processRichHtmlWithIconsAndDecode` | `utils/generic-utils.js` | `{BLOCK_CHILD}-topic.js`, `{BLOCK_CHILD}-post.js` |
| 14 | `stripLinksFromHtml` | `utils/generic-utils.js` | `{BLOCK_CHILD}-topic.js` |
| 15 | `parseTags` | `utils/generic-utils.js` | `{BLOCK_CHILD}-post.js` |
| 16 | `attachImageErrorHandler` | `utils/generic-utils.js` | `{BLOCK_CHILD}-post.js` |
| 17 | `createTagUrl` | `utils/tag-utils.js` | `{BLOCK_CHILD}-post.js` |

## AEM Model Registration
- Registered in `models/_component-filters.json` → `main` → `components` array as `"cards"`
- Referenced in `models/_section.json` filter list
