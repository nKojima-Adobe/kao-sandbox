# Cards Block — Description

A flexible, multi-purpose cards component for AEM Edge Delivery Services that renders two distinct card types — **Topic Cards** (link-based navigation cards with images, subtitles, descriptions, and up to 6 configurable links) and **Post Cards** (article content cards that fetch metadata from AEM pages, displaying images, tags, publish dates, titles, and optional CTA buttons).

## Key Capabilities

- **Dual card types**: Topic (static links) and Post (dynamic metadata-driven content)
- **Grid and Carousel layouts**: Configurable via authoring model with responsive peek effects
- **Batch metadata fetching**: Optimized parallel fetch with caching for post card URLs
- **Taxonomy integration**: Localized tag display using taxonomy data
- **Carousel navigation**: Prev/next buttons with scroll-snap, responsive card counts, and peek effects at breakpoints
- **CTA button support**: Optional call-to-action button in navigation container
- **Comprehensive accessibility**: ARIA labels, live regions, loading/completion announcements, keyboard navigation, focus management
- **Analytics integration**: Card click tracking, carousel navigation tracking with scroll-aware event firing
- **i18n support**: Placeholder-based labels, Japanese typography overrides
- **Image handling**: Lazy loading with accessible states, error fallbacks, og:image validation
- **URL transformation**: Environment-aware URL handling (authoring vs live/EDS)
- **Reduced motion support**: Respects `prefers-reduced-motion` media query

## Architecture

The block is organized as a **multi-file module**:
1. **Main decorator** (`cards.js`) — Orchestrates card creation, layout, navigation, and analytics
2. **Utilities** (`card-utils.js`) — Shared helpers: button creation, metadata fetching/caching, lazy loading, URL transformation
3. **Topic card** (`card-topic.js`) — Topic card content builder with image links, subtitle icons, and link extraction
4. **Post card** (`card-post.js`) — Post card content builder with metadata display, tags, dates, and button handling
5. **Constants** (`cards-constants.js`) — All CSS classes, DOM indices, configuration defaults, ARIA values, text strings
