# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)

You are Cursor AI.
You are implementing a **standard block** called **Accordion** into a target AEMaaCS/EDS project.

This file is fully interactive. If you do not have enough information, ask the user first.

---

# 0. ENVIRONMENT VALIDATION (MANDATORY)

## 0.1 Validate folder location

Verify this file is inside `/_block-export/Accordion/` within an EDS project.

- Expected path pattern: `.../mwp-nec-eds/_block-export/Accordion/implementation.md` (or equivalent)
- The parent `_block-export` folder must exist at the project root or within the EDS project structure.

**If validation fails → STOP and ask the user where the EDS project root is.**

---

## 0.2 Validate required extracted contents

Check these files exist in `_block-export/Accordion/`:

| Required File | Purpose |
|---------------|---------|
| `{BLOCK_NAME}.js` | Main block decorator |
| `{BLOCK_NAME}.css` | Block styles |
| `{BLOCK_NAME}.stories.js` | Storybook stories (optional) |
| `_{BLOCK_NAME}.json` | AEM content model |
| `naming-map.json` | Placeholder → original name mapping |
| `model-snippet.json` | Section model registration snippet |

For Accordion, these resolve to:
- `accordion.js`, `accordion.css`, `accordion.stories.js`
- `_accordion.json`
- `naming-map.json`, `model-snippet.json`

**If any required file is missing → STOP and ask the user to provide the complete block export.**

---

## 0.3 Validate target repository is EDS

From the project root, verify the target repository has an EDS structure:

- `blocks/` — folder for block implementations
- `models/` — AEM content models (e.g. `_section.json`)
- `scripts/aem.js` — core EDS utilities

**If any of these are missing → STOP and ask the user to confirm this is an EDS project.**

---

# 1. GATHER USER INPUT (MANDATORY)

Ask the user the following questions and store the answers:

| # | Question | Purpose | Store As |
|---|----------|---------|----------|
| 1 | What should this block be named? (e.g. `accordion`, `faq-accordion`) | Target block identifier in blocks/, models/, section filter | `TARGET_BLOCK_NAME` |
| 2 | Does your project have an analytics/tracking system? | For `trackElementInteraction`; if no, stub it | `HAS_ANALYTICS` |
| 3 | Does your project have `utils/generic-utils.js` with processContentWithIconsAndLink, sanitizeText, normalizeAltText? | Required for content processing; if no, must copy from source | `HAS_GENERIC_UTILS` |
| 4 | Where is your section filter? | Typically `models/_section.json` | `SECTION_FILTER_PATH` |

**Do not proceed until all answers are collected.**

---

# 2. READ EXTRACTION METADATA

1. Read `extraction-information.md` — contains source paths, model registration, naming, and external dependencies.
2. Read `naming-map.json` — contains placeholder mappings:
   - `{BLOCK_NAME}` → kebab-case (e.g. `accordion`)
   - `{BLOCK_CLASS}` → CSS class prefix (e.g. `accordion`)
   - `{BLOCK_FUNC}` → PascalCase (e.g. `Accordion`)
   - `{BLOCK_VAR}` → camelCase (e.g. `accordion`)
   - `{BLOCK_UPPER}` → SCREAMING_SNAKE (e.g. `ACCORDION`)

---

# 3. DERIVE TARGET NAMES

From `TARGET_BLOCK_NAME` (user input), generate:

| Placeholder | Format | Example (accordion) |
|-------------|--------|---------------------|
| `{BLOCK_NAME}` | kebab-case | `accordion` |
| `{BLOCK_CLASS}` | kebab-case (same as block name) | `accordion` |
| `{BLOCK_FUNC}` | PascalCase | `Accordion` |
| `{BLOCK_VAR}` | camelCase | `accordion` |
| `{BLOCK_UPPER}` | SCREAMING_SNAKE | `ACCORDION` |

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

Example: `mkdir -p blocks/accordion/`

## 5.2 Copy main files

Copy from `_block-export/Accordion/` to `blocks/TARGET_BLOCK_NAME/`:

| Source | Destination |
|--------|--------------|
| `{BLOCK_NAME}.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js` |
| `{BLOCK_NAME}.css` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css` |
| `{BLOCK_NAME}.stories.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js` (optional) |
| `_{BLOCK_NAME}.json` | `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json` |

Example for `accordion`:
- `accordion.js` → `blocks/accordion/accordion.js`
- `accordion.css` → `blocks/accordion/accordion.css`
- `accordion.stories.js` → `blocks/accordion/accordion.stories.js`
- `_accordion.json` → `blocks/accordion/_accordion.json`

**Important:** Replace all placeholders in the **contents** of these files before or after copying (see §4).

---

# 6. RESOLVE EXTERNAL DEPENDENCIES

## 6.1 Core EDS utilities (REQUIRED)

- `decorateIcons` from `scripts/aem.js`
- These are standard EDS utilities and should already exist.

**If missing → STOP and ask the user. These are core EDS and must exist.**

---

## 6.2 Universal Editor instrumentation (REQUIRED — stub if missing)

- `moveInstrumentation` from `scripts/scripts.js`

**If not present, create a stub:**

```javascript
// scripts/scripts.js (add export if needed)
export function moveInstrumentation() {}
```

---

## 6.3 Analytics (OPTIONAL)

- `trackElementInteraction` from `scripts/analytics/data-layer.js`

**If not available, stub:**

```javascript
// scripts/analytics/data-layer.js (or equivalent)
export function trackElementInteraction() {}
```

---

## 6.4 Generic utilities (REQUIRED)

- `processContentWithIconsAndLink`, `sanitizeText`, `normalizeAltText` from `utils/generic-utils.js`

**These must exist.** If they do not, copy them from the source project or create equivalent implementations.

---

# 7. REGISTER IN SECTION FILTER

## 7.1 Open section filter

Open `models/_section.json` (or the path from `SECTION_FILTER_PATH`).

## 7.2 Add block to filter

Add `"TARGET_BLOCK_NAME"` to the section filter's `components` array.

Example:

```json
{
  "components": [
    "hero",
    "accordion",
    "cards",
    ...
  ]
}
```

Use `model-snippet.json` as reference for the exact structure.

---

# 8. UPDATE IMPORT PATHS (if needed)

Check all import paths in the copied block files match the target project structure.

Common paths used by the accordion:

| Import | Typical Path | Verify |
|--------|--------------|--------|
| Core EDS | `../../scripts/aem.js` | Adjust if scripts live elsewhere |
| Scripts (UE) | `../../scripts/scripts.js` | Adjust if different |
| Analytics | `../../scripts/analytics/data-layer.js` | Adjust or remove if stubbed |
| Generic utils | `../../utils/generic-utils.js` | Adjust if different |

**Update imports** to match the target project's directory structure.

---

# 9. SANITY CHECKS

Before proceeding, verify:

| # | Check | How |
|---|-------|-----|
| 1 | No remaining placeholders | Search for `{BLOCK_` in all block files |
| 2 | All imports resolve | Run build/lint; fix any module-not-found errors |
| 3 | Block folder has all files | List `blocks/TARGET_BLOCK_NAME/` |
| 4 | Section filter updated | Confirm `TARGET_BLOCK_NAME` in `models/_section.json` |
| 5 | External dependencies resolved or stubbed | No runtime errors from missing modules |

**If any check fails → fix before running tests.**

---

# 10. RUN TESTS

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

# 11. CLEANUP

**Ask the user before deleting** `_block-export/Accordion/`.

Example prompt:

> The Accordion block has been implemented. Do you want me to delete the `_block-export/Accordion/` folder? (You can keep it for reference or future re-implementation.)

Only delete if the user confirms.

---

# 12. FINAL SUMMARY

Provide a summary to the user:

1. **Block name:** `TARGET_BLOCK_NAME`
2. **Files created:**
   - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js`
   - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css`
   - `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js` (if copied)
   - `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json`
3. **Dependencies:**
   - Resolved: list each
   - Stubbed: list each (e.g. analytics, moveInstrumentation)
4. **Test results:** build, lint, `aem up` (if applicable)
5. **Remaining TODOs:** any manual steps, content authoring, or follow-up work

---

# 13. POST-IMPLEMENTATION VERIFICATION (OPTIONAL)

If the target project supports Universal Editor or local AEM development:

1. Add a test page with the accordion block
2. Verify both style variations (expanded, stacked-right) render correctly
3. Test keyboard navigation and ARIA behavior
4. Confirm analytics events fire (if analytics is enabled)

Report any issues to the user.

---

*End of implementation instructions*
