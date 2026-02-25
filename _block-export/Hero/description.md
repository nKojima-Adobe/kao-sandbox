# Hero Block Description

## What It Does

The Hero block is a primary content area designed to appear at the top of a webpage. It presents key messaging with a title, optional pretitle, description text, and a call-to-action button. It supports two layout modes: a text-only layout for focused messaging and a contains-media layout that displays an image or video alongside the content.

## Key UI/UX Characteristics

- **Two Layout Modes:**
  - **Text-only:** Displays pretitle + title on the same line, description below, and CTA button. On desktop, description and CTA are offset for visual hierarchy.
  - **Contains-media:** Splits into a two-column grid on tablet/desktop — content on the left, media (image or video) on the right. Includes a scroll hint indicator.

- **Responsive Design:**
  - Mobile-first approach with CSS custom properties for spacing
  - Tablet breakpoint at 800px: side-by-side grid layout activates
  - Desktop breakpoint at 1080px: enhanced spacing and larger controls

- **Media Support:**
  - Static images via `<picture>` elements with alt text and optional captions
  - Brightcove video integration with autoplay, muted, and looping behavior
  - Custom play/pause overlay control for videos

- **Accessibility:**
  - Semantic `<section>` element with `role="region"` and `aria-labelledby`
  - VTT caption tracks auto-generated for video accessibility
  - Keyboard navigation (Space/Enter for video controls)
  - Focus indicators meeting WCAG 2.1 AA standards
  - Reduced motion and high contrast mode support
  - Print stylesheet considerations
  - Japanese typography overrides for `lang="ja"`

- **Analytics:**
  - CTA click tracking via analytics data layer integration
  - Sanitized URLs for privacy-safe analytics

- **Memory Management:**
  - MutationObserver-based cleanup when block is removed from DOM
  - Proper teardown of event listeners, intervals, timeouts, and blob URLs
