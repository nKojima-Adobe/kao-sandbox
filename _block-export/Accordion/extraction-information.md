# Accordion Block - Extraction Information

## Block Identity
- Source block name: accordion
- Library folder name: Accordion
- Block type: single (standard self-contained block)
- No global code modifications needed

## Source Paths
All in blocks/accordion/:
| File | Description | Lines |
| accordion.js | Main decorator | 731 |
| accordion.css | Styles | 456 |
| accordion.stories.js | Storybook | 134 |
| _accordion.json | AEM content model | 128 |

## Model Registration
- models/_section.json line 108 registers "accordion"

## Naming Normalization
| Placeholder | Original | Case |
| {BLOCK_NAME} | accordion | kebab-case |
| {BLOCK_CLASS} | accordion | kebab-case |
| {BLOCK_FUNC} | Accordion | PascalCase |
| {BLOCK_VAR} | accordion | camelCase |
| {BLOCK_UPPER} | ACCORDION | SCREAMING_SNAKE |

## External Dependencies
1. moveInstrumentation from scripts/scripts.js (UE instrumentation)
2. decorateIcons from scripts/aem.js (core EDS)
3. trackElementInteraction from scripts/analytics/data-layer.js (analytics - optional)
4. processContentWithIconsAndLink, sanitizeText, normalizeAltText from utils/generic-utils.js (content processing)
