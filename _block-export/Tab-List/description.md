# Tab List Block

An accessible tab navigation component that converts consecutive sections into a tabbed interface with responsive scrolling and fade indicators.

## Features
- **ARIA Tabs pattern**: Full WAI-ARIA implementation with `role="tab"`, `role="tablist"`, `role="tabpanel"`, keyboard navigation (arrow keys, Enter/Space)
- **Responsive scrolling**: Horizontal scroll with automatic fade overlays indicating overflow
- **Position options**: Left-aligned or center-aligned tab lists (author-configurable)
- **Show All mode**: Optional "All" tab that displays all panel content simultaneously
- **Icon support**: Tab labels can contain `:icon:` syntax with automatic SVG rendering
- **CMS text normalization**: Handles URL-encoded text, origin prefixes, icon paths from CMS
- **Smart observers**: ResizeObserver + scrollend events for layout updates (no setTimeout)
- **Touch optimized**: Mouse wheel horizontal scrolling on desktop, touch scroll on mobile
- **Analytics**: Tab switch and initialization events tracked
- **Panel animation**: Fade-up transition for panel content changes

## Architecture
- **Paired component pattern**: `tab-list` (block) + `tab-panel` (section-level component)
- Main decorator in `{BLOCK_NAME}.js`, utility functions in `{BLOCK_NAME}-utils.js`
- Tab panels are sibling sections with `data-tab-label` attribute
- Global `buildTabs()` in `scripts.js` auto-creates tab-list blocks when missing
- Universal Editor imports `normalizeTabLabel` for live label editing

## Content Model
- **Block**: `tab-list` — navigation container with list position setting
- **Section**: `tab-panel` — content panel with tab label text field and component filter
