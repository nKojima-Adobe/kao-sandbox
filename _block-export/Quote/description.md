# Quote Block — Description

A versatile blockquote component for AEM Edge Delivery Services that renders testimonials, expert opinions, and attributed statements with three layout variants and comprehensive accessibility.

## Key Capabilities

- **Three layout variants**: Default (side-by-side with optional logo), Article Big (prominent full-width), Article Small (compact with avatar)
- **Logo support**: Company/organization logos for testimonials (default variant)
- **Avatar support**: Personal avatars for article variants
- **Attribution linking**: Internal and external attribution links with proper security (`rel="noopener noreferrer"` for external)
- **Rich text support**: HTML content in quote text and attribution fields
- **URL sanitization**: XSS-safe URL handling via `sanitizeUrl`
- **Accessibility**: Semantic `<blockquote>` and `<cite>` elements, `aria-labelledby`/`aria-describedby` relationships, keyboard navigation, focus indicators
- **Responsive design**: Grid-based layout with desktop two-column, tablet/mobile single-column
- **Japanese typography**: Language-specific line-height and letter-spacing overrides
- **Decorative quote marks**: CSS-generated open quote mark with precise positioning

## Architecture

Single-file decorator pattern:
1. **Decorator** (`quote.js`) — Parses AEM row/cell structure, builds semantic blockquote with attribution
2. **Styles** (`quote.css`) — Full responsive styles for all 3 variants
3. **Content Model** (`_quote.json`) — 8-field AEM model with conditional visibility and validation
4. **Stories** (`quote.stories.js`) — 10 Storybook variants covering all features
