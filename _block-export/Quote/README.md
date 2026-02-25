# Quote Block

A versatile AEM EDS blockquote component with three layout variants (Default, Article Big, Article Small), attribution linking, logo/avatar support, and full accessibility compliance.

## Quick Start

1. **Read** `naming-map.json` to understand the placeholder scheme
2. **Read** `implementation.md` for detailed integration instructions
3. **Copy** all `{BLOCK_NAME}.*` files to your project
4. **Replace** all `{BLOCK_NAME}` and `{BLOCK_FUNC}` placeholders with your target names
5. **Resolve** the 2 external dependencies (`sanitizeUrl`, `normalizeAltText`)
6. **Register** the block in `component-filters.json` using `model-snippet.json`
7. **Optionally** add typography variants from `global-typography-snippet.css`

## File Structure

```
Quote/
├── {BLOCK_NAME}.js                    # Block decorator (212 lines)
├── {BLOCK_NAME}.css                   # Full styles (249 lines)
├── {BLOCK_NAME}.stories.js            # Storybook: 10 variants (631 lines)
├── _{BLOCK_NAME}.json                 # AEM content model (107 lines)
├── naming-map.json                    # Placeholder mapping
├── model-snippet.json                 # Component filter registration
├── global-typography-snippet.css      # Typography size variants
├── extraction-information.md          # Source locations & dependencies
├── description.md                     # Capabilities overview
├── summary.md                         # Extraction summary
├── README.md                          # This file
└── implementation.md                  # Step-by-step integration guide
```

## Key Features

- 3 layout variants: Default (with logo), Article Big, Article Small (with avatar)
- Attribution with internal/external link handling and security attributes
- Rich text support in quote text and attribution
- URL sanitization for XSS prevention
- WCAG 2.1 AA accessible (semantic HTML, ARIA, keyboard nav)
- Responsive grid layout (2-column desktop, single-column mobile)
- Japanese typography overrides
- 10 Storybook stories for comprehensive documentation

## Dependencies

Only 2 external dependencies:
- `sanitizeUrl` from `utils/generic-utils.js`
- `normalizeAltText` from `utils/generic-utils.js`
