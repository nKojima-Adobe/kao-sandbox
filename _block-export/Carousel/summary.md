# Extraction Summary — Carousel Block

## Block Names
- Source block name: carousel
- Library folder name: Carousel

## Block Type
Standard self-contained block (all code in blocks/carousel/)

## Naming Normalization
| Placeholder | Value | Case |
|-------------|-------|------|
| {BLOCK_NAME} | carousel | kebab |
| {BLOCK_CLASS} | carousel | kebab |
| {BLOCK_FUNC} | Carousel | PascalCase |
| {BLOCK_VAR} | carousel | camelCase |
| {BLOCK_UPPER} | CAROUSEL | SCREAMING_SNAKE |

## Files Extracted

### Block Source Files (with placeholders)
| File | Original Source | Type |
|------|-----------------|------|
| {BLOCK_NAME}.js | blocks/carousel/carousel.js | Main decorator (~2978 lines) |
| {BLOCK_NAME}-constants.js | blocks/carousel/carousel-constants.js | Constants (112 lines) |
| {BLOCK_NAME}-utils.js | blocks/carousel/carousel-utils.js | Utilities (389 lines) |
| {BLOCK_NAME}.css | blocks/carousel/carousel.css | Styles (1509 lines) |
| {BLOCK_NAME}.stories.js | blocks/carousel/carousel.stories.js | Storybook stories (533 lines) |
| _{BLOCK_NAME}.json | blocks/carousel/_carousel.json | AEM content model |

### Snippets
| File | Purpose |
|------|---------|
| model-snippet.json | Section filter registration |
| placeholders-constants-snippet.js | 12 i18n placeholder constants |

### Documentation
| File | Purpose |
|------|---------|
| naming-map.json | Placeholder mapping |
| extraction-information.md | Source paths, dependencies |
| description.md | Block behavior/UX |
| summary.md | This file |
| README.md | Human-friendly docs |
| implementation.md | Step-by-step integration guide |

## External Dependencies
1. **scripts/aem.js** — `decorateIcons`, `readBlockConfig` (core EDS utilities)
2. **blocks/video/video-loader.js** — `loadBrightcoveEmbed` (Brightcove video loading)
3. **blocks/video/video-brightcove-utils.js** — `generateScriptUrl`, `configureVideoElement`
4. **blocks/video/video-utils.js** — `extractVideoJsElement`, `normalizeText`
5. **blocks/cards/card-utils.js** — `fetchPageMetadata` (page metadata fetching for linked slides)
6. **scripts/placeholders.js** — `fetchPlaceholdersForLocale` (i18n support)
7. **scripts/analytics/data-layer.js** — `trackElementInteraction`, `sanitizeUrlForAnalytics` (analytics)
8. **constants/placeholders-constants.js** — 12 `CAROUSEL_*` placeholder constants (i18n labels)
9. **utils/generic-utils.js** — `decodeCmsText`, `processContentWithIconsAndLink`, `sanitizeText`, `normalizeAltText`

## Next Steps
1. Copy Carousel folder to target project
2. Open implementation.md and follow instructions
3. Ensure video block dependencies exist (or stub them)
4. Add placeholder constants to target project
5. Register in section filter
6. Test all 4 layout variations
