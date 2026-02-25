# Extraction Summary — Accordion Block

## Block Names
- Source: accordion
- Library folder: Accordion
- Type: Standard self-contained block

## Naming Normalization table
| Placeholder | Value | Case |
|-------------|-------|------|
| {BLOCK_NAME} | accordion | kebab-case |
| {BLOCK_CLASS} | accordion | kebab-case |
| {BLOCK_FUNC} | Accordion | PascalCase |
| {BLOCK_VAR} | accordion | camelCase |
| {BLOCK_UPPER} | ACCORDION | SCREAMING_SNAKE |

## Files Extracted
### Block Source Files (with placeholders)
| File | Original | Type |
| {BLOCK_NAME}.js | blocks/accordion/accordion.js | Main decorator (731 lines) |
| {BLOCK_NAME}.css | blocks/accordion/accordion.css | Styles (456 lines) |
| {BLOCK_NAME}.stories.js | blocks/accordion/accordion.stories.js | Storybook (134 lines) |
| _{BLOCK_NAME}.json | blocks/accordion/_accordion.json | AEM content model (128 lines) |

### Snippets
| model-snippet.json | Section filter registration |

### Documentation
| naming-map.json, extraction-information.md, description.md, summary.md, README.md, implementation.md |

## External Dependencies
1. scripts/scripts.js — moveInstrumentation (UE support)
2. scripts/aem.js — decorateIcons (core EDS)
3. scripts/analytics/data-layer.js — trackElementInteraction (optional analytics)
4. utils/generic-utils.js — processContentWithIconsAndLink, sanitizeText, normalizeAltText

## Next Steps
1. Copy Accordion folder to target project
2. Open implementation.md
3. Resolve external dependencies
4. Register in section filter
5. Test both style variations
