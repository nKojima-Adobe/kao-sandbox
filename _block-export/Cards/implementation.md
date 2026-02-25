# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)

> **Source block**: `cards` (extracted from `mwp-nec-eds`)
> **Block type**: Standard self-contained block (multi-file module)
> **Files**: 8 source files + 8 documentation files
> **Naming pattern**: Plural/singular — `cards` (block) / `card` (item)

These instructions guide an AI assistant through integrating the extracted **Cards** block into a new or existing AEM Edge Delivery Services project.

---

# 0. GATHER USER INPUTS

Before proceeding, collect the following from the user:

| Input | Description | Example |
|---|---|---|
| `TARGET_BLOCK_NAME` | The plural block name in the target project | `content-cards` |
| `TARGET_CHILD_NAME` | The singular item name (derived from plural) | `content-card` |
| `TARGET_FUNC` | PascalCase plural | `ContentCards` |
| `TARGET_CHILD_FUNC` | PascalCase singular | `ContentCard` |
| `TARGET_VAR` | camelCase plural | `contentCards` |

**Derivation rule**: If the plural name ends in `s`, the singular form removes the trailing `s`. For names not ending in `s`, the user must specify both forms explicitly.

**If the user wants to keep the original name "cards":**
- `TARGET_BLOCK_NAME` = `cards`, `TARGET_CHILD_NAME` = `card`
- `TARGET_FUNC` = `Cards`, `TARGET_CHILD_FUNC` = `Card`
- `TARGET_VAR` = `cards`

---

# 0.2 Validate required extracted contents

Ensure the following files exist in the extraction folder (`_block-export/Cards/`):

**Source files (8):**
- `{BLOCK_NAME}.js` — Main decorator
- `{BLOCK_CHILD}-utils.js` — Utilities (buttons, metadata, lazy loading)
- `{BLOCK_CHILD}-topic.js` — Topic card content builder
- `{BLOCK_CHILD}-post.js` — Post card content builder
- `{BLOCK_NAME}.css` — Complete styles
- `{BLOCK_NAME}.stories.js` — Storybook stories
- `_{BLOCK_NAME}.json` — AEM content model
- `{BLOCK_NAME}-constants.js` — All constants

**Documentation files:**
- `naming-map.json` — Placeholder mapping
- `model-snippet.json` — Component filter registration
- `placeholders-constants-snippet.js` — i18n placeholder constants
- `extraction-information.md` — Source locations & dependencies

For Cards, these resolve to:
- `cards.js`, `card-utils.js`, `card-topic.js`, `card-post.js`
- `cards.css`, `cards.stories.js`, `_cards.json`, `cards-constants.js`
- `naming-map.json`, `model-snippet.json`, `placeholders-constants-snippet.js`

---

# 1. IDENTIFY THE TARGET PROJECT STRUCTURE

Scan the target project for:

```
PROJECT_ROOT/
├── blocks/              # Block folders
├── constants/           # Shared constants
├── models/              # AEM model definitions
│   ├── _component-definition.json
│   ├── _component-models.json
│   └── _component-filters.json
├── scripts/
│   ├── aem.js           # Core AEM utilities
│   ├── scripts.js       # Main scripts
│   ├── placeholders.js  # i18n placeholders
│   └── analytics/       # Analytics utilities
├── utils/               # Shared utilities
└── styles/              # Global styles
```

Confirm:
- [ ] `blocks/` directory exists
- [ ] `constants/` directory exists (or create it)
- [ ] `models/` directory with component JSON files exists
- [ ] `scripts/aem.js` exists with `decorateIcons`, `getMetadata`, `getLanguagePath`
- [ ] `scripts/scripts.js` exists with `moveInstrumentation`

---

# 2. DETERMINE THE NAMING SCHEME

Read `naming-map.json` to understand the placeholder scheme.

**This block uses 5 placeholders:**

| Placeholder | Original | Replace With |
|---|---|---|
| `{BLOCK_NAME}` | `cards` | `TARGET_BLOCK_NAME` (plural) |
| `{BLOCK_CHILD}` | `card` | `TARGET_CHILD_NAME` (singular) |
| `{BLOCK_FUNC}` | `Cards` | `TARGET_FUNC` (PascalCase plural) |
| `{BLOCK_CHILD_FUNC}` | `Card` | `TARGET_CHILD_FUNC` (PascalCase singular) |
| `{BLOCK_VAR}` | `cards` | `TARGET_VAR` (camelCase plural) |

**Important — Dual naming pattern:**
- `{BLOCK_NAME}` is used for: file names, block wrapper CSS class, JSON IDs, import paths
- `{BLOCK_CHILD}` is used for: individual item CSS class prefix, JS variable names, item JSON IDs

---

# 3. CREATE TARGET DIRECTORIES

```bash
mkdir -p blocks/TARGET_BLOCK_NAME
mkdir -p constants
```

---

# 4. REPLACE ALL PLACEHOLDERS IN EXTRACTED FILES (CRITICAL)

This is the most important step. Replace placeholders in **all 8 source files** before copying.

## 4.1 Replacement order (MUST follow this order)

1. `{BLOCK_CHILD_FUNC}` → `TARGET_CHILD_FUNC` (longest placeholder first)
2. `{BLOCK_FUNC}` → `TARGET_FUNC`
3. `{BLOCK_NAME}` → `TARGET_BLOCK_NAME`
4. `{BLOCK_CHILD}` → `TARGET_CHILD_NAME`
5. `{BLOCK_VAR}` → `TARGET_VAR`

## 4.2 Files to process

Apply replacements to all 8 source files:
- `{BLOCK_NAME}.js`
- `{BLOCK_CHILD}-utils.js`
- `{BLOCK_CHILD}-topic.js`
- `{BLOCK_CHILD}-post.js`
- `{BLOCK_NAME}.css`
- `{BLOCK_NAME}.stories.js`
- `_{BLOCK_NAME}.json`
- `{BLOCK_NAME}-constants.js`

## 4.3 Rename files after replacement

| Extracted File | Target File |
|---|---|
| `{BLOCK_NAME}.js` | `TARGET_BLOCK_NAME.js` |
| `{BLOCK_CHILD}-utils.js` | `TARGET_CHILD_NAME-utils.js` |
| `{BLOCK_CHILD}-topic.js` | `TARGET_CHILD_NAME-topic.js` |
| `{BLOCK_CHILD}-post.js` | `TARGET_CHILD_NAME-post.js` |
| `{BLOCK_NAME}.css` | `TARGET_BLOCK_NAME.css` |
| `{BLOCK_NAME}.stories.js` | `TARGET_BLOCK_NAME.stories.js` |
| `_{BLOCK_NAME}.json` | `_TARGET_BLOCK_NAME.json` |
| `{BLOCK_NAME}-constants.js` | `TARGET_BLOCK_NAME-constants.js` |

## 4.4 Special considerations

### camelCase variable names
Some internal JS variable names use standalone `card`/`cards` (e.g., `const card = ...`, `cards.push(...)`). These have been replaced with `{BLOCK_CHILD}` / `{BLOCK_NAME}` respectively. After replacement, if the target name is multi-word (e.g., `content-tile`), you MUST use camelCase for these JS variable contexts:
- `{BLOCK_CHILD}` in `const {BLOCK_CHILD} = document.createElement(...)` → `const contentTile = ...`
- `{BLOCK_NAME}` in `const {BLOCK_NAME} = []` → `const contentTiles = []`

For single-word names (like keeping `card`/`cards`), no adjustment is needed.

### Constant key names (optional rename)
SCREAMING_SNAKE property names inside the constants file (`CARD`, `CARDS_GRID`, `CARD_CONTENT`, etc.) were intentionally NOT replaced with placeholders. They work as-is. Optionally rename them for clarity if your block has a different name.

### Design system classes (DO NOT change)
The following CSS classes within `.card-buttons` context are global design system tokens and must NOT be renamed:
- `.button`, `.button-primary`, `.button-secondary`
- `.primary`, `.secondary`, `.link`
- `.button-outlined`, `.button-text`

---

# 5. COPY FILES INTO THE TARGET PROJECT

## 5.1 Block files → `blocks/TARGET_BLOCK_NAME/`

Copy the main block files:
```
TARGET_BLOCK_NAME.js         → blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js
TARGET_CHILD_NAME-utils.js   → blocks/TARGET_BLOCK_NAME/TARGET_CHILD_NAME-utils.js
TARGET_CHILD_NAME-topic.js   → blocks/TARGET_BLOCK_NAME/TARGET_CHILD_NAME-topic.js
TARGET_CHILD_NAME-post.js    → blocks/TARGET_BLOCK_NAME/TARGET_CHILD_NAME-post.js
TARGET_BLOCK_NAME.css        → blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css
TARGET_BLOCK_NAME.stories.js → blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js
```

## 5.2 Content model → `blocks/TARGET_BLOCK_NAME/`

```
_TARGET_BLOCK_NAME.json → blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json
```

## 5.3 Constants file → `constants/`

```
TARGET_BLOCK_NAME-constants.js → constants/TARGET_BLOCK_NAME-constants.js
```

---

# 6. RESOLVE EXTERNAL DEPENDENCIES

This block has **17 external dependencies** across 9 modules. Check each one in the target project.

## 6.1 Core AEM utilities (REQUIRED)

### `decorateIcons` from `scripts/aem.js`
Used in: `{BLOCK_NAME}.js`, `{BLOCK_CHILD}-utils.js`, `{BLOCK_CHILD}-topic.js`, `{BLOCK_CHILD}-post.js`
- Converts `:icon-name:` syntax to `<span class="icon icon-{name}">` elements
- **Check**: Does your `scripts/aem.js` export `decorateIcons`?
- If not: Implement or import from AEM boilerplate

### `getLanguagePath` from `scripts/aem.js`
Used in: `{BLOCK_NAME}.js`
- Returns the current language path segment (e.g., `/jp/ja/`)
- **Check**: Does your `scripts/aem.js` export `getLanguagePath`?
- If not: Create a stub that returns your project's default language path

### `getMetadata` from `scripts/aem.js`
Used in: `{BLOCK_CHILD}-utils.js`
- Extracts meta tag values from HTML documents (e.g., `og:image`, `og:title`)
- **Check**: Does your `scripts/aem.js` export `getMetadata`?
- Standard AEM EDS utility — should exist in boilerplate

### `moveInstrumentation` from `scripts/scripts.js`
Used in: `{BLOCK_NAME}.js`
- Moves Universal Editor `data-aue-*` instrumentation attributes between elements
- **Check**: Does your `scripts/scripts.js` export `moveInstrumentation`?
- If not: Create a no-op stub: `export function moveInstrumentation() {}`

## 6.2 i18n / Placeholders (REQUIRED for post cards)

### `fetchPlaceholdersForLocale` from `scripts/placeholders.js`
Used in: `{BLOCK_NAME}.js`, `{BLOCK_CHILD}-utils.js`
- Fetches localized placeholder strings for i18n labels
- **Check**: Does `scripts/placeholders.js` exist with a default export?
- If not: Create a stub that returns an empty object: `export default async function() { return {}; }`

### `OG_FALLBACK_IMAGE` from `constants/placeholders-constants.js`
Used in: `{BLOCK_CHILD}-utils.js`
- Placeholder key for fallback OG image URL
- **Check**: Add to your `constants/placeholders-constants.js`:
```javascript
export const OG_FALLBACK_IMAGE = 'ogFallbackImage';
```

### `CARDS_ARTICLE_TAGS_ARIA_LABEL` and `CARDS_TAG_ARIA_LABEL` from `constants/placeholders-constants.js`
Used in: `{BLOCK_CHILD}-post.js`
- Placeholder keys for tag ARIA label i18n
- **Check**: Add to your `constants/placeholders-constants.js` using `placeholders-constants-snippet.js`:
```javascript
export const CARDS_ARTICLE_TAGS_ARIA_LABEL = 'cardsArticleTagsAriaLabel';
export const CARDS_TAG_ARIA_LABEL = 'cardsTagAriaLabel';
```
**Note**: If you rename the block, also rename these constants and their string values accordingly.

## 6.3 Analytics (OPTIONAL — can be stubbed)

### `trackElementInteraction` from `scripts/analytics/data-layer.js`
Used in: `{BLOCK_NAME}.js`
- Tracks card click and carousel navigation events
- **Check**: Does `scripts/analytics/data-layer.js` exist?
- If not: Create a no-op stub:
```javascript
export function trackElementInteraction(eventName, data) {
  // No-op: analytics not configured
}
```

## 6.4 Taxonomy utilities (REQUIRED for post card tags)

### `fetchTaxonomyData` from `utils/taxonomy-utils.js`
Used in: `{BLOCK_NAME}.js`
- Fetches taxonomy data for tag localization
- **Check**: Does `utils/taxonomy-utils.js` exist?
- If not: Create a stub:
```javascript
export async function fetchTaxonomyData() { return []; }
```

### `getLocalizedTagTitle` from `utils/taxonomy-utils.js`
Used in: `{BLOCK_CHILD}-post.js`
- Returns localized tag title for a given tag ID
- **Check**: Add to your taxonomy utils:
```javascript
export function getLocalizedTagTitle(tag, language, taxonomyData) {
  // Find localized title in taxonomy data, fallback to tag ID
  return tag;
}
```

## 6.5 Generic utilities (REQUIRED)

### `processRichHtmlWithIconsAndDecode` from `utils/generic-utils.js`
Used in: `{BLOCK_CHILD}-topic.js`, `{BLOCK_CHILD}-post.js`
- Processes HTML content: converts `:icon-name:` syntax, decodes CMS-escaped characters
- **Check**: Does `utils/generic-utils.js` export this function?
- If not: Create a passthrough stub:
```javascript
export function processRichHtmlWithIconsAndDecode(html) { return html; }
```

### `stripLinksFromHtml` from `utils/generic-utils.js`
Used in: `{BLOCK_CHILD}-topic.js`
- Removes `<a>` tags from HTML while preserving inner content
- **Check**: Add to your generic utils:
```javascript
export function stripLinksFromHtml(html) {
  return html.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
}
```

### `parseTags` from `utils/generic-utils.js`
Used in: `{BLOCK_CHILD}-post.js`
- Parses comma-separated tag strings into arrays (handles helix-query formats)
- **Check**: Add to your generic utils:
```javascript
export function parseTags(tagsString) {
  if (!tagsString) return [];
  return tagsString.split(',').map(t => t.trim()).filter(Boolean);
}
```

### `attachImageErrorHandler` from `utils/generic-utils.js`
Used in: `{BLOCK_CHILD}-post.js`
- Attaches error event handler for broken images with fallback behavior
- **Check**: Add to your generic utils:
```javascript
export function attachImageErrorHandler(imgElement, container, placeholders, errorClass) {
  imgElement.addEventListener('error', () => {
    imgElement.style.display = 'none';
    container.classList.add(errorClass);
  });
}
```

## 6.6 Tag URL utility (REQUIRED for post card tags)

### `createTagUrl` from `utils/tag-utils.js`
Used in: `{BLOCK_CHILD}-post.js`
- Creates URL for tag pages (e.g., `/article-list?tag=some-tag`)
- **Check**: Does `utils/tag-utils.js` exist?
- If not: Create it:
```javascript
export default function createTagUrl(tag, placeholders) {
  const basePath = '/article-list';
  return `${basePath}?tag=${encodeURIComponent(tag)}`;
}
```

## 6.7 Shared constants (REQUIRED)

### `BREAKPOINTS` from `constants/constants.js`
Used in: `{BLOCK_NAME}.js`
- Contains responsive breakpoint values (e.g., `DESKTOP_MIN: 1080`, `TABLET_MIN: 800`)
- **Check**: Does `constants/constants.js` export `BREAKPOINTS`?
- If not: Add to your constants:
```javascript
export const BREAKPOINTS = {
  DESKTOP_MIN: 1080,
  TABLET_MIN: 800,
};
```

---

# 7. REGISTER BLOCK IN AEM MODELS

## 7.1 Update component-filters.json

Open `models/_component-filters.json` and add the block name to the `"main"` filter's `"components"` array:

```json
{
  "id": "main",
  "components": [
    "... existing components ...",
    "TARGET_BLOCK_NAME"
  ]
}
```

## 7.2 Verify content model auto-registration

The `_TARGET_BLOCK_NAME.json` file in `blocks/TARGET_BLOCK_NAME/` should be automatically picked up by AEM. Verify:
- The `"definitions"` array contains both block and item definitions
- The `"models"` array defines both `TARGET_BLOCK_NAME` (container) and `TARGET_CHILD_NAME` (item) field sets
- The `"filters"` array maps `TARGET_BLOCK_NAME` to allow `TARGET_CHILD_NAME` children

## 7.3 Update section filters (if applicable)

If your project has section-level filters (like `models/_section.json`), add `"TARGET_BLOCK_NAME"` to the section's components array to allow the block inside sections.

---

# 8. UPDATE BLOCK INDEX / ROUTER (OPTIONAL)

If your project uses a block index or router file:
- Add import for the new block's decorator
- Follow existing patterns in the project

If no block index exists, this step is not needed — AEM EDS auto-loads blocks.

---

# 9. SANITY CHECKS

After copying and wiring, verify:

| # | Check | How |
|---|---|---|
| 1 | No remaining placeholders | Search all copied files for `{BLOCK_NAME}`, `{BLOCK_CHILD}`, `{BLOCK_FUNC}`, `{BLOCK_CHILD_FUNC}`, `{BLOCK_VAR}` |
| 2 | All imports resolve | Check each `import` statement path exists in the target project |
| 3 | No syntax errors | Open each JS file and check for red squiggles / parse errors |
| 4 | JSON is valid | Validate `_TARGET_BLOCK_NAME.json` with a JSON parser |
| 5 | CSS selectors match | Verify `.TARGET_BLOCK_NAME` and `.TARGET_CHILD_NAME` selectors are consistent |
| 6 | Constants file accessible | Verify `constants/TARGET_BLOCK_NAME-constants.js` is importable from `blocks/TARGET_BLOCK_NAME/` |
| 7 | Design system classes intact | Confirm `.button`, `.button-primary`, etc. are NOT renamed |
| 8 | camelCase variable names | If multi-word target name, verify JS variables use camelCase (not kebab-case) |

## 9.1 Resolve external dependencies

### decorateIcons (REQUIRED)
`decorateIcons` from `scripts/aem.js`
- Used in 4 files for icon rendering
- Standard AEM EDS utility

### moveInstrumentation (REQUIRED for Universal Editor)
`moveInstrumentation` from `scripts/scripts.js`
- Transfers authoring instrumentation attributes
- Can be stubbed as no-op if UE is not needed

### fetchPlaceholdersForLocale (REQUIRED)
`fetchPlaceholdersForLocale` from `scripts/placeholders.js`
- i18n placeholder fetching
- Can be stubbed to return empty object

### trackElementInteraction (OPTIONAL)
`trackElementInteraction` from `scripts/analytics/data-layer.js`
- Analytics tracking — stub as no-op if analytics not needed

### fetchTaxonomyData + getLocalizedTagTitle (REQUIRED for tags)
From `utils/taxonomy-utils.js`
- Tag localization — stub if taxonomy not available

### processRichHtmlWithIconsAndDecode + stripLinksFromHtml + parseTags + attachImageErrorHandler (REQUIRED)
From `utils/generic-utils.js`
- HTML processing utilities — create stubs as shown in Section 6.5

### createTagUrl (REQUIRED for tag links)
From `utils/tag-utils.js`
- Tag URL generation — create stub as shown in Section 6.6

### BREAKPOINTS (REQUIRED)
From `constants/constants.js`
- Responsive breakpoint values — create as shown in Section 6.7

### Global button base styles (CHECK)
The cards CSS includes button styles within `.card-buttons` context but may depend on base `.button` styles from `styles/styles.css`. Check if your global styles define base button declarations:
```css
a.button {
  display: inline-flex;
  align-items: center;
  /* ... base button styles ... */
}
```

---

# 10. RUN TESTS (IF NO ISSUES FOUND)

## 10.1 Build/Compile Test

```bash
npm run build
# or
npm run lint
```

If build fails:
- Report the exact error
- Identify which file is causing the issue
- Suggest fixes but do not modify without user confirmation

## 10.2 Development Server Test (Optional)

```bash
npm run dev
# or
aem up
```

To test the block:
1. Navigate to a page that uses this block
2. Verify grid layout renders correctly with topic/post cards
3. Test carousel layout with navigation buttons
4. Check responsive behavior at mobile/tablet/desktop breakpoints
5. Verify post card metadata fetching works (requires network access)
6. Check browser console for any errors

## 10.3 Linting Test

```bash
npm run lint
# or
npm run lint:fix
```

Report any linting errors or warnings found.

---

# 11. CLEANUP — DELETE TEMPORARY EXTRACTION FOLDER

**ONLY proceed with cleanup if:**
- All tests passed successfully
- Block is confirmed working in the target repository
- User confirms they are ready to clean up

Before deleting, ask the user for confirmation:

> All implementation steps completed successfully!
>
> The block has been integrated into your project at:
> - `blocks/TARGET_BLOCK_NAME/` (with all JS, CSS, JSON files)
> - `constants/TARGET_BLOCK_NAME-constants.js`
> - Models registered in component-filters.json
>
> **Ready to clean up?**
>
> I can now delete the temporary extraction folder:
> - `_block-export/Cards/`
>
> **Should I proceed with cleanup?** (yes/no)

---

# 12. FINAL SUMMARY TO USER

After all steps:

> Implementation completed.
>
> **Block Names:**
> - Original: `cards` / `card`
> - Implemented as: `TARGET_BLOCK_NAME` / `TARGET_CHILD_NAME`
>
> **Files Created:**
> - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js` (main decorator)
> - `blocks/TARGET_BLOCK_NAME/TARGET_CHILD_NAME-utils.js` (utilities)
> - `blocks/TARGET_BLOCK_NAME/TARGET_CHILD_NAME-topic.js` (topic card builder)
> - `blocks/TARGET_BLOCK_NAME/TARGET_CHILD_NAME-post.js` (post card builder)
> - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css` (styles)
> - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js` (storybook)
> - `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json` (content model)
> - `constants/TARGET_BLOCK_NAME-constants.js` (constants)
>
> **Files Modified:**
> - `models/_component-filters.json` (block registration)
> - `constants/placeholders-constants.js` (i18n constants)
>
> **Potential TODOs:**
> - Verify design visually in the browser
> - Implement or stub missing utility functions
> - Test post card metadata fetching with real URLs
> - Verify taxonomy data integration for tag localization
> - Test carousel navigation at all breakpoints
> - Check accessibility compliance (screen reader, keyboard)

If any step cannot proceed → stop, explain, ask for clarification.
