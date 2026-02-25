# Extraction Information

## Block Identity

- **Source block name:** `hero`
- **Library folder name:** `Hero`
- **Block type:** Single block (not parent/child)

## Source Paths

All paths are relative to the repository root.

### Block Files (Primary)

| File | Source Path | Purpose |
|------|------------|---------|
| `hero.js` | `blocks/hero/hero.js` | Main block decorator |
| `hero.css` | `blocks/hero/hero.css` | Block styles |
| `hero-utils.js` | `blocks/hero/hero-utils.js` | Shared utility functions |
| `hero-constants.js` | `blocks/hero/hero-constants.js` | Constants and CSS class names |
| `hero.stories.js` | `blocks/hero/hero.stories.js` | Storybook stories |
| `_hero.json` | `blocks/hero/_hero.json` | AEM content model definition |

### Constants (Snippet Extracted)

| File | Source Path | Extracted Item |
|------|------------|----------------|
| `placeholders-constants-snippet.js` | `constants/placeholders-constants.js` | `HERO_SCROLL_TEXT` constant (line 73) |

### Models (Snippet Extracted)

| File | Source Path | Extracted Item |
|------|------------|----------------|
| `model-snippet.json` | `models/_section.json` | `"hero"` entry in section components array (line 102) |

## Path Discovery Method

All paths were **automatically discovered** using the following search patterns:

1. Block files: `/blocks/hero/` (found 6 files)
2. Constants: Searched `/constants/` for files referencing "hero" (found 1 match)
3. Models: Searched `/models/` for files referencing "hero" (found 1 match)
4. Scripts: Searched `/scripts/` for hero references (found `block-config.js` - informational only, not hero-specific code)
5. Styles: Searched `/styles/` for hero references (no matches)
6. Utils: Searched `/utils/` for hero references (no matches)

## External Dependencies

These are imports used by the hero block that come from **outside** the block folder. They must exist in the target project:

| Import | Source | Notes |
|--------|--------|-------|
| `decorateIcons` | `scripts/aem.js` | AEM EDS core utility |
| `sanitizeText`, `sanitizeUrl`, `decodeCmsText`, `processContentWithIconsAndLink`, `processRichHtmlWithIconsAndDecode` | `utils/generic-utils.js` | Shared text/URL utilities |
| `fetchPlaceholdersForLocale` | `scripts/placeholders.js` | i18n placeholder loader |
| `trackElementInteraction`, `sanitizeUrlForAnalytics` | `scripts/analytics/data-layer.js` | Analytics tracking |
| `normalizeText` | `blocks/video/video-utils.js` | Video text normalization (shared with video block) |
| `HERO_SCROLL_TEXT` | `constants/placeholders-constants.js` | Placeholder key constant |

## Naming Normalization

All block-specific names have been replaced with placeholders. See `naming-map.json` for the complete mapping.

### Placeholder Scheme

| Placeholder | Original | Case | Usage |
|-------------|----------|------|-------|
| `{BLOCK_NAME}` | `hero` | kebab-case | File names, model IDs, string literals |
| `{BLOCK_CLASS}` | `hero` | kebab-case | CSS class prefix |
| `{BLOCK_FUNC}` | `Hero` | PascalCase | Function name infix |
| `{BLOCK_VAR}` | `hero` | camelCase | Variable/function prefix |
| `{BLOCK_UPPER}` | `HERO` | SCREAMING_SNAKE | Constant prefix |

## Notes

- The block uses **Brightcove** for video playback integration
- Japanese language (`html[lang="ja"]`) specific typography overrides are included in the CSS
- The AEM content model (`_hero.json`) includes Japanese labels alongside English
- The block has two layout modes: `text-only` and `contains-media`
- Video accessibility features include VTT caption generation and keyboard controls
- The `hero.stories.js` file provides Storybook stories for visual testing
