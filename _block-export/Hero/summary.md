# Extraction Summary — Hero Block

## Block Names

- **Source block name:** `hero`
- **Library folder name:** `Hero`

## Naming Normalization

All block-specific names have been replaced with placeholders:

| Placeholder | Original | Case Convention | Usage |
|-------------|----------|-----------------|-------|
| `{BLOCK_NAME}` | `hero` | kebab-case | File names, IDs, string literals |
| `{BLOCK_CLASS}` | `hero` | kebab-case | CSS class prefix |
| `{BLOCK_FUNC}` | `Hero` | PascalCase | Function name infix |
| `{BLOCK_VAR}` | `hero` | camelCase | Variable/function prefix |
| `{BLOCK_UPPER}` | `HERO` | SCREAMING_SNAKE | Constant prefix |

### Replacement Statistics

- **File names renamed:** 6 (all block source files)
- **CSS class replacements:** ~180+ occurrences across CSS file
- **JS constant replacements:** ~60+ occurrences across JS files
- **JS function/variable replacements:** ~40+ occurrences across JS files
- **JSON model ID replacements:** 4 occurrences in model file
- **Names that could NOT be automatically replaced:** None — all patterns were systematic

## Path Discovery

All paths were **automatically discovered** by searching standard EDS project locations.

### Paths Scanned

| Location | Result |
|----------|--------|
| `blocks/hero/` | 6 files found (JS, CSS, JSON, Stories) |
| `constants/` | 1 file with hero reference (`placeholders-constants.js`) |
| `models/` | 1 file with hero reference (`_section.json`) |
| `scripts/` | 1 file with hero reference (`block-config.js` — informational only) |
| `styles/` | No hero references found |
| `utils/` | No hero references found |

## Files Extracted

### Block Source Files (with placeholders)

| Extracted File Name | Original Source | Type |
|---------------------|-----------------|------|
| `{BLOCK_NAME}.js` | `blocks/hero/hero.js` | Main block decorator |
| `{BLOCK_NAME}.css` | `blocks/hero/hero.css` | Block styles |
| `{BLOCK_NAME}-utils.js` | `blocks/hero/hero-utils.js` | Shared utilities |
| `{BLOCK_NAME}-constants.js` | `blocks/hero/hero-constants.js` | Constants |
| `{BLOCK_NAME}.stories.js` | `blocks/hero/hero.stories.js` | Storybook stories |
| `_{BLOCK_NAME}.json` | `blocks/hero/_hero.json` | AEM content model |

### Snippet Files

| Extracted File Name | Original Source | Purpose |
|---------------------|-----------------|---------|
| `placeholders-constants-snippet.js` | `constants/placeholders-constants.js` | i18n placeholder constant to add |
| `model-snippet.json` | `models/_section.json` | Section component registration |

### Generated Documentation Files

| File | Purpose |
|------|---------|
| `naming-map.json` | Complete placeholder mapping and replacement log |
| `extraction-information.md` | Source paths, dependencies, and discovery method |
| `description.md` | Block behavior and UX characteristics |
| `summary.md` | This file — extraction overview |
| `README.md` | Human-friendly block documentation |
| `implementation.md` | Complete implementation instructions for target project |

## External Dependencies

These imports must exist in the target project for the block to function:

| Dependency | Source Path | Required By |
|------------|------------|-------------|
| `decorateIcons` | `scripts/aem.js` | `{BLOCK_NAME}.js`, `{BLOCK_NAME}-utils.js` |
| `sanitizeText`, `sanitizeUrl` | `utils/generic-utils.js` | `{BLOCK_NAME}.js` |
| `decodeCmsText`, `processContentWithIconsAndLink`, `processRichHtmlWithIconsAndDecode` | `utils/generic-utils.js` | `{BLOCK_NAME}-utils.js` |
| `fetchPlaceholdersForLocale` | `scripts/placeholders.js` | `{BLOCK_NAME}.js` |
| `trackElementInteraction`, `sanitizeUrlForAnalytics` | `scripts/analytics/data-layer.js` | `{BLOCK_NAME}.js` |
| `normalizeText` | `blocks/video/video-utils.js` | `{BLOCK_NAME}-utils.js` |
| `{BLOCK_UPPER}_SCROLL_TEXT` | `constants/placeholders-constants.js` | `{BLOCK_NAME}-utils.js` |

## Block Behavior Summary

- **Layout modes:** `text-only` (default) and `contains-media`
- **Media support:** Images via `<picture>` elements, videos via Brightcove player
- **Video features:** Autoplay, muted, looped, custom play/pause control overlay
- **Accessibility:** WCAG 2.1 AA compliant — VTT captions, keyboard nav, ARIA labels, focus indicators
- **Responsive:** Mobile-first with breakpoints at 800px (tablet) and 1080px (desktop)
- **Analytics:** CTA click tracking via data layer
- **i18n:** Supports localized scroll hint text via placeholders system
- **Memory safe:** Automatic cleanup via MutationObserver when block is removed

## Next Steps

1. Copy the entire `Hero` folder into the target project's `_block-export/` directory
2. Open `implementation.md` and follow the interactive instructions
3. The AI will prompt you for the block name and handle all placeholder replacements
4. Ensure all external dependencies listed above exist in the target project
5. Add the `{BLOCK_UPPER}_SCROLL_TEXT` constant to the target project's placeholders constants
6. Register the block in the target project's section model (`models/_section.json`)

**Important:** All extracted files contain placeholders (`{BLOCK_NAME}`, `{BLOCK_CLASS}`, etc.) that must be replaced with actual block names during implementation.
