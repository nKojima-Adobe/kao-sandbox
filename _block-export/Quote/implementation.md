# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)

> **Source block**: `quote` (extracted from `mwp-nec-eds`)
> **Block type**: Standard self-contained block (single-file module)
> **Files**: 4 source files + 8 documentation files
> **External dependencies**: 2

These instructions guide an AI assistant through integrating the extracted **Quote** block into a new or existing AEM Edge Delivery Services project.

---

# 0. GATHER USER INPUTS

Before proceeding, collect the following from the user:

| Input | Description | Example |
|---|---|---|
| `TARGET_BLOCK_NAME` | The block name in the target project (kebab-case) | `testimonial` |
| `TARGET_FUNC` | PascalCase name | `Testimonial` |

**If the user wants to keep the original name "quote":**
- `TARGET_BLOCK_NAME` = `quote`
- `TARGET_FUNC` = `Quote`

---

# 0.2 Validate required extracted contents

Ensure the following files exist in the extraction folder (`_block-export/Quote/`):

**Source files (4):**
- `{BLOCK_NAME}.js` — Block decorator
- `{BLOCK_NAME}.css` — Complete styles
- `{BLOCK_NAME}.stories.js` — Storybook stories
- `_{BLOCK_NAME}.json` — AEM content model

**Documentation files:**
- `naming-map.json`, `model-snippet.json`, `global-typography-snippet.css`
- `extraction-information.md`

For Quote, these resolve to:
- `quote.js`, `quote.css`, `quote.stories.js`, `_quote.json`

---

# 1. IDENTIFY THE TARGET PROJECT STRUCTURE

Scan the target project for:

```
PROJECT_ROOT/
├── blocks/              # Block folders
├── models/              # AEM model definitions
│   ├── _component-filters.json
│   └── _section.json
├── utils/               # Shared utilities
│   └── generic-utils.js # sanitizeUrl, normalizeAltText
└── styles/
    └── typography.css   # Global typography (for optional size variants)
```

Confirm:
- [ ] `blocks/` directory exists
- [ ] `utils/generic-utils.js` exists (or will be created) with `sanitizeUrl` and `normalizeAltText`

---

# 2. DETERMINE THE NAMING SCHEME

Read `naming-map.json` to understand the placeholder scheme.

**This block uses 2 placeholders:**

| Placeholder | Original | Replace With |
|---|---|---|
| `{BLOCK_NAME}` | `quote` | `TARGET_BLOCK_NAME` |
| `{BLOCK_FUNC}` | `Quote` | `TARGET_FUNC` |

---

# 3. CREATE TARGET DIRECTORIES

```bash
mkdir -p blocks/TARGET_BLOCK_NAME
```

---

# 4. REPLACE ALL PLACEHOLDERS IN EXTRACTED FILES (CRITICAL)

## 4.1 Replacement order

1. `{BLOCK_FUNC}` → `TARGET_FUNC` (longer placeholder first)
2. `{BLOCK_NAME}` → `TARGET_BLOCK_NAME`

## 4.2 Files to process

Apply replacements to all 4 source files:
- `{BLOCK_NAME}.js`
- `{BLOCK_NAME}.css`
- `{BLOCK_NAME}.stories.js`
- `_{BLOCK_NAME}.json`

Also apply to `global-typography-snippet.css` if you plan to use it.

## 4.3 Rename files after replacement

| Extracted File | Target File |
|---|---|
| `{BLOCK_NAME}.js` | `TARGET_BLOCK_NAME.js` |
| `{BLOCK_NAME}.css` | `TARGET_BLOCK_NAME.css` |
| `{BLOCK_NAME}.stories.js` | `TARGET_BLOCK_NAME.stories.js` |
| `_{BLOCK_NAME}.json` | `_TARGET_BLOCK_NAME.json` |

---

# 5. COPY FILES INTO THE TARGET PROJECT

## 5.1 Block files → `blocks/TARGET_BLOCK_NAME/`

```
TARGET_BLOCK_NAME.js         → blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js
TARGET_BLOCK_NAME.css        → blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css
TARGET_BLOCK_NAME.stories.js → blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js
_TARGET_BLOCK_NAME.json      → blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json
```

---

# 6. RESOLVE EXTERNAL DEPENDENCIES

This block has only **2 external dependencies**, both from the same module.

## 6.1 `sanitizeUrl` from `utils/generic-utils.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Validates and sanitizes attribution link URLs to prevent XSS.

**Check**: Does your `utils/generic-utils.js` export `sanitizeUrl`?

If not, create it:
```javascript
/**
 * Sanitizes a URL string, returning empty string for unsafe protocols.
 * Allows: http, https, mailto, tel, relative paths (/, ./, ../, #)
 * Blocks: javascript:, data:, vbscript:, and other unsafe protocols
 * @param {string} url - The URL to sanitize
 * @returns {string} Sanitized URL or empty string if unsafe
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Allow relative URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // Validate protocol
  try {
    const urlObj = new URL(trimmed);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (allowedProtocols.includes(urlObj.protocol)) {
      return trimmed;
    }
    return '';
  } catch {
    return '';
  }
}
```

## 6.2 `normalizeAltText` from `utils/generic-utils.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Normalizes alt text for logo and avatar images.

**Check**: Does your `utils/generic-utils.js` export `normalizeAltText`?

If not, create it:
```javascript
/**
 * Normalizes alt text by extracting text content from an element or string.
 * @param {Element|string|null} source - Element, string, or null
 * @returns {string} Normalized alt text string
 */
export function normalizeAltText(source) {
  if (!source) return '';
  if (typeof source === 'string') return source.trim();
  if (source instanceof Element) return source.textContent?.trim() || '';
  return '';
}
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

## 7.2 Update section filters (if applicable)

If your project has section-level filters (like `models/_section.json`), add `"TARGET_BLOCK_NAME"` to the section's components array.

## 7.3 Verify content model auto-registration

The `_TARGET_BLOCK_NAME.json` in `blocks/TARGET_BLOCK_NAME/` is automatically picked up by AEM. Verify:
- The `"definitions"` array has the block definition
- The `"models"` array defines the 8-field content model (variant, logo, logoAltText, quoteText, attributionInfo1, attributionInfo2, attributionLink, attributionAvatar)
- The `"filters"` array maps `TARGET_BLOCK_NAME` to an empty components array (no child blocks)

---

# 8. ADD GLOBAL TYPOGRAPHY VARIANTS (OPTIONAL)

The source project defines typography size variants in `styles/typography.css`. If you want `.small` and `.medium` size modifiers:

Copy the contents of `global-typography-snippet.css` into your `styles/typography.css` (or equivalent global stylesheet), replacing `{BLOCK_NAME}` with `TARGET_BLOCK_NAME`:

```css
.TARGET_BLOCK_NAME.small {
    font-size: var(--font-scale-04);
    line-height: var(--line-height-sm);
}

.TARGET_BLOCK_NAME.medium {
    font-size: var(--font-scale-07);
    line-height: var(--line-height-lg);
}
```

These are optional — the block works without them.

---

# 9. SANITY CHECKS

After copying and wiring, verify:

| # | Check | How |
|---|---|---|
| 1 | No remaining placeholders | Search all copied files for `{BLOCK_NAME}`, `{BLOCK_FUNC}` |
| 2 | Import resolves | Verify `utils/generic-utils.js` exists with both exports |
| 3 | No syntax errors | Open the JS file and check for parse errors |
| 4 | JSON is valid | Validate `_TARGET_BLOCK_NAME.json` with a JSON parser |
| 5 | CSS selectors match | Verify `.TARGET_BLOCK_NAME` and `.TARGET_BLOCK_NAME-*` selectors are consistent |
| 6 | CSS variables exist | Check that `--font-scale-*`, `--nec-gray-*`, `--nec-blue-*`, `--spacer-*`, `--transition-medium`, `--border-radius-*`, `--grid-*`, `--width-*-col` custom properties exist in your global styles |

## 9.1 Resolve external dependencies

### sanitizeUrl (REQUIRED)
`sanitizeUrl` from `utils/generic-utils.js`
- Validates attribution URLs to prevent XSS
- See Section 6.1 for stub implementation

### normalizeAltText (REQUIRED)
`normalizeAltText` from `utils/generic-utils.js`
- Normalizes alt text from elements or strings
- See Section 6.2 for stub implementation

### CSS custom properties (CHECK)
The block CSS uses design token variables. Ensure your global `styles/styles.css` or `styles/variables.css` defines:
- Font scales: `--font-scale-02` through `--font-scale-08`
- Colors: `--nec-gray-60`, `--nec-gray-80`, `--nec-blue-50`
- Spacing: `--spacer-04`, `--spacer-05`, `--spacer-06`
- Transitions: `--transition-medium`
- Border radius: `--border-radius-0`
- Grid: `--grid-column-width-*`, `--grid-gutter`, `--grid-margin-sm`
- Column widths: `--width-3-col`, `--width-5-col`, `--width-6-col`, `--width-8-col`

---

# 10. RUN TESTS (IF NO ISSUES FOUND)

## 10.1 Build/Compile Test

```bash
npm run build
# or
npm run lint
```

## 10.2 Development Server Test (Optional)

```bash
npm run dev
# or
aem up
```

To test the block:
1. Navigate to a page that uses this block
2. Verify the default variant renders with quote marks and attribution
3. Test with logo (default variant) and avatar (article variants)
4. Test attribution links (internal and external)
5. Check responsive behavior at all breakpoints
6. Verify keyboard navigation on attribution links

## 10.3 Linting Test

```bash
npm run lint
```

---

# 11. CLEANUP — DELETE TEMPORARY EXTRACTION FOLDER

**ONLY proceed with cleanup if:**
- All tests passed successfully
- Block is confirmed working in the target repository
- User confirms they are ready to clean up

> Ready to clean up? I can delete `_block-export/Quote/`. Should I proceed? (yes/no)

---

# 12. FINAL SUMMARY TO USER

> Implementation completed.
>
> **Block Names:**
> - Original: `quote`
> - Implemented as: `TARGET_BLOCK_NAME`
>
> **Files Created:**
> - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js` (decorator)
> - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css` (styles)
> - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js` (storybook)
> - `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json` (content model)
>
> **Files Modified:**
> - `models/_component-filters.json` (block registration)
> - `styles/typography.css` (optional typography variants)
>
> **Potential TODOs:**
> - Verify design visually in the browser
> - Implement or verify `sanitizeUrl` and `normalizeAltText` utilities
> - Test all 3 variants: default, article-big, article-small
> - Test attribution links (internal/external)
> - Verify CSS custom properties are defined in global styles
> - Check accessibility compliance (screen reader, keyboard)

If any step cannot proceed → stop, explain, ask for clarification.
