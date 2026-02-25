# Carousel Block - Extraction Information

## Block Identity

- **Source block name:** carousel
- **Library folder name:** Carousel
- **Block type:** single (standard self-contained block)
- **No global code modifications needed**

## Source Paths

All source files are in `blocks/carousel/`:

| File | Description | Lines |
|------|-------------|-------|
| carousel.js | Main decorator | ~2978 |
| carousel-constants.js | Constants | 112 |
| carousel-utils.js | Utilities | 389 |
| carousel.css | Styles | 1509 |
| carousel.stories.js | Storybook stories | 533 |
| _carousel.json | AEM content model | — |

## Model Registration

- `models/_section.json` line 118 registers `"carousel"` in the section filter

## Naming Normalization

| Placeholder | Original | Case |
|-------------|----------|------|
| {BLOCK_NAME} | carousel | kebab-case |
| {BLOCK_CLASS} | carousel | kebab-case |
| {BLOCK_FUNC} | Carousel | PascalCase |
| {BLOCK_VAR} | carousel | camelCase |
| {BLOCK_UPPER} | CAROUSEL | SCREAMING_SNAKE |

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
