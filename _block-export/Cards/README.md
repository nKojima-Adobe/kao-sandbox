# Cards Block

A flexible AEM EDS block supporting **Topic Cards** (link-based with images, subtitles, and up to 6 links) and **Post Cards** (article content with metadata fetching, tags, dates, and CTA buttons). Supports grid and carousel layouts with responsive design and comprehensive accessibility.

## Quick Start

1. **Read** `naming-map.json` to understand the placeholder scheme (plural/singular pattern)
2. **Read** `implementation.md` for detailed step-by-step integration instructions
3. **Copy** all `{BLOCK_NAME}.*` and `{BLOCK_CHILD}-*.js` files to your project
4. **Replace** all placeholders with your target block/child names
5. **Resolve** the 17 external dependencies listed in `extraction-information.md`
6. **Register** the block in `component-filters.json` using `model-snippet.json`
7. **Add** placeholder constants using `placeholders-constants-snippet.js`

## File Structure

```
Cards/
├── {BLOCK_NAME}.js                  # Main decorator (897 lines)
├── {BLOCK_CHILD}-utils.js           # Utilities: buttons, metadata, lazy loading (369 lines)
├── {BLOCK_CHILD}-topic.js           # Topic card builder (452 lines)
├── {BLOCK_CHILD}-post.js            # Post card builder (327 lines)
├── {BLOCK_NAME}.css                 # Full styles: grid, carousel, responsive (1,663 lines)
├── {BLOCK_NAME}.stories.js          # Storybook: 9 story variants (424 lines)
├── _{BLOCK_NAME}.json               # AEM content model (339 lines)
├── {BLOCK_NAME}-constants.js        # All constants (288 lines)
├── naming-map.json                  # Placeholder mapping
├── model-snippet.json               # Component filter registration
├── placeholders-constants-snippet.js # i18n constants for tag labels
├── extraction-information.md        # Source locations & dependencies
├── description.md                   # Capabilities overview
├── summary.md                       # Extraction summary
├── README.md                        # This file
└── implementation.md                # Step-by-step integration guide
```

## Naming Pattern

This block uses a **plural/singular** naming convention:
- **Block wrapper**: `cards` → `{BLOCK_NAME}` (plural)
- **Individual item**: `card` → `{BLOCK_CHILD}` (singular)

When renaming (e.g., to "content-tiles"), derive the singular automatically:
- `{BLOCK_NAME}` → `content-tiles`
- `{BLOCK_CHILD}` → `content-tile`

## Key Features

- Dual card types: Topic (static) + Post (dynamic metadata)
- Grid and carousel layouts with responsive peek effects
- Batch metadata fetching with caching
- Taxonomy-based localized tags
- Carousel navigation with scroll-snap and peek
- WCAG 2.1 AA accessible (ARIA, keyboard nav, live regions)
- Analytics: card clicks + carousel navigation tracking
- i18n: Japanese typography overrides, placeholder-based labels
- Reduced motion support

## Dependencies

17 external dependencies across 9 modules. See `extraction-information.md` for the full list.
