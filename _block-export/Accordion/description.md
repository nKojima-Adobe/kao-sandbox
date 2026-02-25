# Accordion Block Description

An accessible, animated accordion component for AEM EDS using native HTML `<details>` elements.

Features:
- 2 style variations: Expanded/Full Bleed (default) and Stacked Right (header left, list right on desktop)
- Smooth height animations with CSS transitions
- Single-expand mode (only one item open at a time) or multi-expand
- Optional block header above the accordion list
- Icon support in item titles via :icon-name: syntax
- Image support in accordion body with 16:9 aspect ratio
- Responsive layouts: mobile stacked, tablet 2-col (expanded), desktop grid (stacked-right)
- Full keyboard navigation (Enter/Space to toggle, ArrowUp/Down, Home/End)
- ARIA attributes: aria-expanded, aria-controls, aria-labelledby, role="region"
- Tabindex management for content elements when collapsed/expanded
- ResizeObserver for dynamic height updates
- Analytics tracking for toggle events and initialization
- Universal Editor support (moveInstrumentation)
- Clean up function for memory management
