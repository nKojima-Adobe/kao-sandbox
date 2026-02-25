# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)

You are Cursor AI.
You are implementing a **standard block** called **Carousel** into a target AEMaaCS/EDS project.

This file is fully interactive. If you do not have enough information, ask the user first.

---

# 0. ENVIRONMENT VALIDATION (MANDATORY)

## 0.1 Validate folder location

Verify this file is inside `/_block-export/Carousel/` within an EDS project.

- Expected path pattern: `.../mwp-nec-eds/_block-export/Carousel/implementation.md` (or equivalent)
- The parent `_block-export` folder must exist at the project root or within the EDS project structure.

**If validation fails → STOP and ask the user where the EDS project root is.**

---

## 0.2 Validate required extracted contents

Check these files exist in `_block-export/Carousel/`:

| Required File | Purpose |
|---------------|---------|
| `{BLOCK_NAME}.js` | Main block decorator |
| `{BLOCK_NAME}-constants.js` | Block constants |
| `{BLOCK_NAME}-utils.js` | Block utilities |
| `{BLOCK_NAME}.css` | Block styles |
| `{BLOCK_NAME}.stories.js` | Storybook stories (optional) |
| `_{BLOCK_NAME}.json` | AEM content model |
| `naming-map.json` | Placeholder → original name mapping |
| `model-snippet.json` | Section model registration snippet |
| `placeholders-constants-snippet.js` | Placeholder constants to add |

For Carousel, these resolve to:
- `carousel.js`, `carousel-constants.js`, `carousel-utils.js`
- `carousel.css`, `carousel.stories.js`
- `_carousel.json`
- `naming-map.json`, `model-snippet.json`, `placeholders-constants-snippet.js`

**If any required file is missing → STOP and ask the user to provide the complete block export.**

---

## 0.3 Validate target repository is EDS

From the project root, verify the target repository has an EDS structure:

- `blocks/` — folder for block implementations
- `models/` — AEM content models (e.g. `_section.json`)
- `scripts/aem.js` — core EDS utilities
- `scripts/placeholders.js` — placeholders/i18n (or equivalent)

**If any of these are missing → STOP and ask the user to confirm this is an EDS project.**

---

# 1. GATHER USER INPUT (MANDATORY)

Ask the user the following questions and store the answers:

| # | Question | Purpose | Store As |
|---|----------|---------|----------|
| 1 | What should this block be named? (e.g. `carousel`, `hero-carousel`) | Target block identifier in blocks/, models/, section filter | `TARGET_BLOCK_NAME` |
| 2 | Does your project have a video/Brightcove block? | Needed for video slides; if no, video support must be stubbed or removed | `HAS_VIDEO_BLOCK` |
| 3 | Does your project have an analytics/tracking system? | For `trackElementInteraction`; if no, stub it | `HAS_ANALYTICS` |
| 4 | Does your project have a cards block with `fetchPageMetadata`? | For linked slide metadata; if no, stub it | `HAS_CARDS_UTILS` |
| 5 | Does your project have a placeholders/i18n system? | For `fetchPlaceholdersForLocale`; if no, create stub | `HAS_PLACEHOLDERS` |
| 6 | Where is your section filter? | Typically `models/_section.json` | `SECTION_FILTER_PATH` |

**Do not proceed until all answers are collected.**

---

# 2. READ EXTRACTION METADATA

1. Read `extraction-information.md` — contains source paths, model registration, naming, and external dependencies.
2. Read `naming-map.json` — contains placeholder mappings:
   - `{BLOCK_NAME}` → kebab-case (e.g. `carousel`)
   - `{BLOCK_CLASS}` → CSS class prefix (e.g. `carousel`)
   - `{BLOCK_FUNC}` → PascalCase (e.g. `Carousel`)
   - `{BLOCK_VAR}` → camelCase (e.g. `carousel`)
   - `{BLOCK_UPPER}` → SCREAMING_SNAKE (e.g. `CAROUSEL`)

---

# 3. DERIVE TARGET NAMES

From `TARGET_BLOCK_NAME` (user input), generate:

| Placeholder | Format | Example (carousel) |
|-------------|--------|--------------------|
| `{BLOCK_NAME}` | kebab-case | `carousel` |
| `{BLOCK_CLASS}` | kebab-case (same as block name) | `carousel` |
| `{BLOCK_FUNC}` | PascalCase | `Carousel` |
| `{BLOCK_VAR}` | camelCase | `carousel` |
| `{BLOCK_UPPER}` | SCREAMING_SNAKE | `CAROUSEL` |

**Confirm with the user** that these derived names are correct before proceeding.

---

# 4. REPLACE ALL PLACEHOLDERS

Apply replacements in **file names** and **file contents**:

| Placeholder | Replace With |
|-------------|--------------|
| `{BLOCK_NAME}` | `TARGET_BLOCK_NAME` (kebab-case) |
| `{BLOCK_CLASS}` | Same as `{BLOCK_NAME}` for CSS classes |
| `{BLOCK_FUNC}` | PascalCase of `TARGET_BLOCK_NAME` |
| `{BLOCK_VAR}` | camelCase of `TARGET_BLOCK_NAME` |
| `{BLOCK_UPPER}` | SCREAMING_SNAKE of `TARGET_BLOCK_NAME` |

Use `naming-map.json` → `replacements` for the full list of what to replace.

**Validation:** Run a search for `{BLOCK_` across all copied/modified files. **No placeholders must remain.**

---

# 5. COPY BLOCK FILES TO TARGET PROJECT

## 5.1 Create block folder

```bash
mkdir -p blocks/TARGET_BLOCK_NAME/
```

Example: `mkdir -p blocks/carousel/`

## 5.2 Copy main files

Copy from `_block-export/Carousel/` to `blocks/TARGET_BLOCK_NAME/`:

| Source | Destination |
|--------|--------------|
| `{BLOCK_NAME}.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js` |
| `{BLOCK_NAME}-constants.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME-constants.js` |
| `{BLOCK_NAME}-utils.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME-utils.js` |
| `{BLOCK_NAME}.css` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css` |
| `{BLOCK_NAME}.stories.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js` (optional) |
| `_{BLOCK_NAME}.json` | `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json` |

Example for `carousel`:
- `carousel.js` → `blocks/carousel/carousel.js`
- `carousel-constants.js` → `blocks/carousel/carousel-constants.js`
- `carousel-utils.js` → `blocks/carousel/carousel-utils.js`
- `carousel.css` → `blocks/carousel/carousel.css`
- `carousel.stories.js` → `blocks/carousel/carousel.stories.js`
- `_carousel.json` → `blocks/carousel/_carousel.json`

**Important:** Replace all placeholders in the **contents** of these files before or after copying (see §4).

---

# 6. ADD PLACEHOLDER CONSTANTS

## 6.1 Open constants file

Open `constants/placeholders-constants.js` (or the equivalent in the target project).

## 6.2 Add carousel placeholder constants

Copy the 12 constants from `placeholders-constants-snippet.js` with placeholders replaced:

```javascript
export const CAROUSEL_LINKED_PAGE_ARIA_LABEL = 'carouselLinkedPageAriaLabel';
export const CAROUSEL_GO_TO_ARIA_LABEL = 'carouselGoToAriaLabel';
export const CAROUSEL_SLIDE_ARIA_LABEL = 'carouselSlideAriaLabel';
export const CAROUSEL_SLIDE_ROLE = 'carouselSlideRole';
export const CAROUSEL_PREVIOUS_SLIDE_ARIA_LABEL = 'carouselPreviousSlideAriaLabel';
export const CAROUSEL_NEXT_SLIDE_ARIA_LABEL = 'carouselNextSlideAriaLabel';
export const CAROUSEL_GO_TO_SLIDE_ARIA_LABEL = 'carouselGoToSlideAriaLabel';
export const CAROUSEL_ARIA_LABEL = 'carouselAriaLabel';
export const CAROUSEL_ROLE = 'carouselRole';
export const CAROUSEL_PAUSE_VIDEO_ARIA_LABEL = 'carouselPauseVideoAriaLabel';
export const CAROUSEL_PLAY_VIDEO_ARIA_LABEL = 'carouselPlayVideoAriaLabel';
export const CAROUSEL_SLIDE_ANNOUNCEMENT = 'carouselSlideAnnouncement';
```

If `TARGET_BLOCK_NAME` differs from `carousel`, use the derived `{BLOCK_UPPER}` and `{BLOCK_VAR}` values instead.

---

# 7. RESOLVE EXTERNAL DEPENDENCIES

This is the most important step. The carousel has several external dependencies.

## 7.1 Core EDS utilities (REQUIRED)

- `decorateIcons`, `readBlockConfig` from `scripts/aem.js`
- These are standard EDS utilities and should already exist.

**If missing → STOP and ask the user. These are core EDS and must exist.**

---

## 7.2 Placeholders/i18n (REQUIRED)

- `fetchPlaceholdersForLocale` from `scripts/placeholders.js`
- Must exist in the target project for i18n labels.

**If not present, create a stub:**

```javascript
// scripts/placeholders.js (or equivalent)
export default async function fetchPlaceholdersForLocale() {
  return {};
}
```

---

## 7.3 Video block dependencies (OPTIONAL — needed for video slides)

If the target project has **no** video/Brightcove block, you need:

- `loadBrightcoveEmbed` from `blocks/video/video-loader.js`
- `generateScriptUrl`, `configureVideoElement` from `blocks/video/video-brightcove-utils.js`
- `extractVideoJsElement`, `normalizeText` from `blocks/video/video-utils.js`

**Options:**

| Option | Action | Result |
|--------|--------|--------|
| **a) Copy video block** | Copy the video block from the source project | Full video support (recommended) |
| **b) Create stubs** | Create no-op stubs for the above functions | Images work; videos do not |
| **c) Remove video support** | Refactor carousel to remove video logic | Significant refactoring required |

**Ask the user which option they prefer** if `HAS_VIDEO_BLOCK` is false.

---

## 7.4 Cards utility (OPTIONAL — needed for linked slide metadata)

- `fetchPageMetadata` from `blocks/cards/card-utils.js`

**If not available, stub it:**

```javascript
// blocks/cards/card-utils.js (or create if needed)
export async function fetchPageMetadata() {
  return null;
}
```

---

## 7.5 Analytics (OPTIONAL)

- `trackElementInteraction`, `sanitizeUrlForAnalytics` from `scripts/analytics/data-layer.js`

**If not available, stub:**

```javascript
// scripts/analytics/data-layer.js (or equivalent)
export function trackElementInteraction() {}
export function sanitizeUrlForAnalytics(url) {
  return url;
}
```

---

## 7.6 Generic utilities (REQUIRED)

- `decodeCmsText`, `processContentWithIconsAndLink`, `sanitizeText`, `normalizeAltText` from `utils/generic-utils.js`

**These must exist.** If they do not, copy them from the source project or create equivalent implementations.

---

# 8. REGISTER IN SECTION FILTER

## 8.1 Open section filter

Open `models/_section.json` (or the path from `SECTION_FILTER_PATH`).

## 8.2 Add block to filter

Add `"TARGET_BLOCK_NAME"` to the section filter's `components` array.

Example:

```json
{
  "components": [
    "hero",
    "carousel",
    "cards",
    ...
  ]
}
```

Use `model-snippet.json` as reference for the exact structure.

---

# 9. UPDATE IMPORT PATHS (if needed)

Check all import paths in the copied block files match the target project structure.

Common paths used by the carousel:

| Import | Typical Path | Verify |
|--------|--------------|--------|
| Core EDS | `../../scripts/aem.js` | Adjust if scripts live elsewhere |
| Placeholders | `../../scripts/placeholders.js` | Adjust if different |
| Analytics | `../../scripts/analytics/data-layer.js` | Adjust or remove if stubbed |
| Placeholder constants | `../../constants/placeholders-constants.js` | Adjust if different |
| Generic utils | `../../utils/generic-utils.js` | Adjust if different |
| Video loader | `../video/video-loader.js` | Only if video block exists |
| Video Brightcove utils | `../video/video-brightcove-utils.js` | Only if video block exists |
| Video utils | `../video/video-utils.js` | Only if video block exists |
| Card utils | `../cards/card-utils.js` | Only if cards block exists |

**Update imports** to match the target project's directory structure.

---

# 10. SANITY CHECKS

Before proceeding, verify:

| # | Check | How |
|---|-------|-----|
| 1 | No remaining placeholders | Search for `{BLOCK_` in all block files |
| 2 | All imports resolve | Run build/lint; fix any module-not-found errors |
| 3 | Block folder has all files | List `blocks/TARGET_BLOCK_NAME/` |
| 4 | Section filter updated | Confirm `TARGET_BLOCK_NAME` in `models/_section.json` |
| 5 | Placeholder constants added | Confirm 12 `CAROUSEL_*` (or equivalent) in constants file |
| 6 | External dependencies resolved or stubbed | No runtime errors from missing modules |

**If any check fails → fix before running tests.**

---

# 11. RUN TESTS

Execute the target project's validation commands:

```bash
npm run build
npm run lint
```

If the project uses AEM local development:

```bash
aem up
```

Fix any errors reported. Report results to the user.

---

# 12. CLEANUP

**Ask the user before deleting** `_block-export/Carousel/`.

Example prompt:

> The Carousel block has been implemented. Do you want me to delete the `_block-export/Carousel/` folder? (You can keep it for reference or future re-implementation.)

Only delete if the user confirms.

---

# 13. FINAL SUMMARY

Provide a summary to the user:

1. **Block name:** `TARGET_BLOCK_NAME`
2. **Files created:**
   - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js`
   - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME-constants.js`
   - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME-utils.js`
   - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css`
   - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js` (if copied)
   - `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json`
3. **Dependencies:**
   - Resolved: list each
   - Stubbed: list each (e.g. analytics, video, cards)
4. **Test results:** build, lint, `aem up` (if applicable)
5. **Remaining TODOs:** any manual steps, content authoring, or follow-up work

---

*End of implementation instructions*
