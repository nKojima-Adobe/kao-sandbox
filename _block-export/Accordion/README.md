# Accordion

An accessible, animated accordion component for AEM Edge Delivery Services. Uses native HTML `<details>` elements with smooth CSS height animations and full ARIA compliance.

## Key Features
- 2 style variations: Expanded/Full Bleed, Stacked Right
- Native <details> elements for semantic HTML
- Smooth open/close height animations
- Single-expand or multi-expand modes
- Optional block header
- Icon support in titles (:icon-name: syntax)
- Image support with 16:9 aspect ratio
- Responsive: mobile stacked, tablet 2-col, desktop grid
- Full keyboard nav (Enter/Space, Up/Down, Home/End)
- ARIA compliant
- Analytics tracking
- Universal Editor support

## File List
| {BLOCK_NAME}.js | Main decorator (731 lines) |
| {BLOCK_NAME}.css | Styles (456 lines) |
| {BLOCK_NAME}.stories.js | Storybook (134 lines) |
| _{BLOCK_NAME}.json | Content model (128 lines) |
| model-snippet.json | Section filter registration |

## Style Variations
| expanded | Default, full-width accordion; on tablet+ media+text shows in 2 columns |
| stacked-right | Desktop: header on left, accordion list on right in a CSS grid |

## How It Works
1. Authoring: Authors add rows with header in first cell, content in subsequent cells
2. Decoration: decorate() parses rows, creates <details> elements with summary and body
3. Animation: Custom JS animations with height transitions, ResizeObserver for dynamic content
4. Accessibility: ARIA attributes, keyboard navigation, tabindex management

## External Dependencies
| moveInstrumentation | scripts/scripts.js | Yes | UE instrumentation |
| decorateIcons | scripts/aem.js | Yes | Core EDS |
| trackElementInteraction | scripts/analytics/data-layer.js | No | Analytics (stub if missing) |
| processContentWithIconsAndLink, sanitizeText, normalizeAltText | utils/generic-utils.js | Yes | Content processing |

## Integration Notes
- Standard block: copy to blocks/{BLOCK_NAME}/
- Register in section filter
- CSS uses global variables: --spacer-*, --nec-gray-*, --transition-medium, --border-radius-2, --horizontal-gap, --grid-column-width-*, --spacing-04, --line-height-ja-xl
- No block-specific CSS custom properties
