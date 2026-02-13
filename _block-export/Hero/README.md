# Hero Block

A flexible hero component for AEM Edge Delivery Services (EDS) that displays primary content at the top of a webpage. It supports rich text titles, descriptions, call-to-action buttons, and optional media (images or Brightcove videos) in a responsive, accessible layout.

## Key Features

- **Two layout modes:** Text-only for focused messaging, or contains-media for a side-by-side content + media layout
- **Brightcove video integration:** Autoplay, muted, looped background video with custom play/pause controls
- **Full accessibility:** WCAG 2.1 AA compliant with semantic HTML, ARIA attributes, VTT caption tracks, keyboard navigation, and focus management
- **Responsive design:** Mobile-first with tablet (800px) and desktop (1080px) breakpoints
- **CTA button support:** Optional call-to-action with click tracking via analytics data layer
- **Scroll hint indicator:** Animated scroll indicator for contains-media layout with i18n support
- **Memory safe:** Automatic cleanup of event listeners, intervals, and blob URLs via MutationObserver
- **Japanese typography:** Dedicated line-height and letter-spacing overrides for `lang="ja"`
- **High contrast and reduced motion:** Respects user accessibility preferences

## File List

### Block Source Files

| File | Description |
|------|-------------|
| `{BLOCK_NAME}.js` | Main block decorator — parses AEM content, builds DOM, handles video loading |
| `{BLOCK_NAME}.css` | Complete responsive styles including layouts, media, controls, and accessibility |
| `{BLOCK_NAME}-utils.js` | Shared utilities for content parsing, media wrapper creation, and scroll hint |
| `{BLOCK_NAME}-constants.js` | CSS class names, field mapping, video attributes, and ID generation |
| `{BLOCK_NAME}.stories.js` | Storybook stories for visual testing across all variants |
| `_{BLOCK_NAME}.json` | AEM Universal Editor content model with conditional fields and validation |

### Integration Files

| File | Description |
|------|-------------|
| `placeholders-constants-snippet.js` | i18n placeholder constant to add to the target project |
| `model-snippet.json` | Section model registration entry |
| `naming-map.json` | Placeholder-to-original name mapping for implementation |
| `implementation.md` | Step-by-step integration guide for Cursor AI |

## Use Cases

1. **Homepage hero banner:** Text-only layout with company tagline, description, and primary CTA
2. **Product launch page:** Contains-media layout with product image alongside feature description
3. **Video showcase:** Background video with autoplay for immersive landing pages
4. **Campaign landing page:** Bold title with pretitle category label and targeted CTA
5. **Minimal announcement:** Title-only hero for simple page headers without media or CTA
6. **Localized content:** Japanese and English content with proper typography handling

## Integration Notes

### Dependencies

This block requires the following utilities to be present in the target project:

- `scripts/aem.js` — `decorateIcons` for icon decoration
- `utils/generic-utils.js` — Text and URL sanitization functions
- `scripts/placeholders.js` — i18n placeholder loading
- `scripts/analytics/data-layer.js` — Analytics tracking (optional, gracefully fails)
- `blocks/video/video-utils.js` — `normalizeText` for video embed parsing
- `constants/placeholders-constants.js` — Placeholder key constant for scroll text

### AEM Content Model

The block uses a comprehensive content model (`_{BLOCK_NAME}.json`) with:
- Conditional field visibility (media fields only shown when layout is "contains-media")
- URL validation for CTA links
- Required field validation with custom error messages

### CSS Custom Properties

The block defines its own CSS custom properties (prefixed with `--{BLOCK_CLASS}-`) for easy theming. It also depends on project-level variables like `--viewport-xl`, `--grid-gutter`, `--spacer-*`, `--font-scale-*`, and `--nec-*` color tokens.

Note: Some features could not be inferred due to limited context in the extracted files. The analytics tracking and placeholder loading depend on project-specific implementations.
