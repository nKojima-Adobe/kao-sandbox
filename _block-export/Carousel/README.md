# Carousel

A feature-rich, accessible carousel/slideshow component for AEM Edge Delivery Services. Supports images, Brightcove videos, multiple layout variations, auto-play, touch navigation, keyboard accessibility, and analytics tracking.

## Key Features

- **4 layout variations:** full-grid (expandable), full-width (edge-to-edge), image-only-medium (horizontal scroll grid), image-only-large (horizontal scroll grid)
- **Media support:** Images and Brightcove video with custom play/pause controls
- **Auto-play:** 5-second intervals, pauses on user interaction
- **Touch swipe** on mobile for full-grid/full-width layouts
- **Keyboard navigation:** Arrow keys (left/right), Home, End
- **ARIA compliant:** Live regions for slide announcements, proper roles and labels
- **Responsive:** Mobile-first with breakpoints at 800px (tablet) and 1080px (desktop)
- **CTA buttons** with configurable links per slide
- **Scroll-triggered animations:** Full-grid layout expands to viewport width on scroll
- **Lazy loading:** Video players loaded only when slide is viewed
- **Analytics tracking:** Carousel init, slide changes (nav/swipe/auto), CTA clicks
- **Universal Editor support:** Content cloning for authoring, original rows preserved for UE
- **Fade transitions** for full-grid/full-width, horizontal scroll for image-only layouts

## File List

### Block Files

| File | Description |
|------|-------------|
| `{BLOCK_NAME}.js` | Main decorator (~2978 lines) — orchestrates all carousel functionality |
| `{BLOCK_NAME}-constants.js` | Constants — autoplay interval, breakpoints, thresholds |
| `{BLOCK_NAME}-utils.js` | Utilities — video controls, live regions, element creation |
| `{BLOCK_NAME}.css` | Styles (~1509 lines) — responsive layouts, animations, accessibility |
| `{BLOCK_NAME}.stories.js` | Storybook stories for all layout variations |
| `_{BLOCK_NAME}.json` | AEM content model with slide fields and layout options |

### Snippets

| File | Description |
|------|-------------|
| `model-snippet.json` | Section filter registration |
| `placeholders-constants-snippet.js` | 12 i18n placeholder constants for ARIA labels |

### Documentation

| File | Description |
|------|-------------|
| `naming-map.json` | Placeholder-to-original name mapping |
| `extraction-information.md` | Source paths, dependencies, naming details |
| `description.md` | Block behavior and UX characteristics |
| `summary.md` | Extraction overview |
| `README.md` | This file |
| `implementation.md` | Step-by-step integration guide for Cursor AI |

## Layout Variations

| Layout | Description | Navigation | Media |
|--------|-------------|------------|-------|
| **full-grid** | Standard carousel within grid container; expands to full viewport on scroll | Fade transition, arrows, dots, swipe | Images + video |
| **full-width** | Edge-to-edge media presentation (breaks out of container) | Fade transition, arrows, dots, swipe | Images + video |
| **image-only-medium** | Horizontal scrolling grid with medium-sized cards (2-3 visible) | Scroll-based, arrow buttons | Images only |
| **image-only-large** | Horizontal scrolling grid with larger cards | Scroll-based, arrow buttons | Images only |

## How It Works

1. **Authoring:** Authors add slides as rows in the carousel block. Each row contains: media type, image, video, alt text, link, title, description, CTA link, CTA text
2. **Configuration:** First row can specify layout variation (e.g., "full-grid", "image-only-medium")
3. **Decoration:** `decorate()` parses config, fetches page metadata for linked slides in parallel, builds slide DOM, creates UI (container > viewport > track > items)
4. **Navigation:** Full-grid/full-width use fade transitions with autoplay; image-only uses native horizontal scroll with snap points
5. **Video:** Brightcove players are lazily loaded — only the first slide's video initializes immediately, others load on navigation
6. **Accessibility:** Each slide has role="group", aria-roledescription="slide", aria-label with slide number and media description. Live region announces changes.

## External Dependencies

| Dependency | Source | Required | Purpose |
|------------|--------|----------|---------|
| `decorateIcons`, `readBlockConfig` | `scripts/aem.js` | Yes | Core EDS utilities |
| `fetchPlaceholdersForLocale` | `scripts/placeholders.js` | Yes | i18n support |
| `decodeCmsText`, `processContentWithIconsAndLink`, `sanitizeText`, `normalizeAltText` | `utils/generic-utils.js` | Yes | Content processing |
| `CAROUSEL_*` constants (12) | `constants/placeholders-constants.js` | Yes | ARIA label keys |
| `loadBrightcoveEmbed` | `blocks/video/video-loader.js` | No* | Video slide support |
| `generateScriptUrl`, `configureVideoElement` | `blocks/video/video-brightcove-utils.js` | No* | Video configuration |
| `extractVideoJsElement`, `normalizeText` | `blocks/video/video-utils.js` | No* | Video embed parsing |
| `fetchPageMetadata` | `blocks/cards/card-utils.js` | No | Linked slide metadata |
| `trackElementInteraction`, `sanitizeUrlForAnalytics` | `scripts/analytics/data-layer.js` | No | Analytics tracking |

\* Required only if video slides are needed. Can be stubbed for image-only usage.

## Integration Notes

- **Standard block** — copy files to `blocks/{BLOCK_NAME}/`
- **Add placeholder constants** from `placeholders-constants-snippet.js` to your `constants/placeholders-constants.js`
- **Register in section filter** — add `"{BLOCK_NAME}"` to `models/_section.json` components array
- **Video dependencies:** The video block files (`blocks/video/*`) must exist or be stubbed if video slides are needed
- **Cards dependency:** `fetchPageMetadata` is used to auto-populate title/description from linked pages — stub it if not needed
- **Analytics:** `trackElementInteraction` tracks carousel interactions — stub if no analytics system exists
- **CSS custom properties:** The carousel defines its own custom properties (scoped to `.carousel {}`) but references some global variables: `--spacer-*`, `--font-scale-*`, `--border-radius-*`, `--nec-*` colors, `--viewport-xl`, `--grid-column-*`, `--grid-gutter`
