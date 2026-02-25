# Extraction Information — Grid-Columns

## Block Identity

- **Source block name:** `grid-columns`
- **Library folder name:** `Grid-Columns`
- **Block type:** Section-level component (NOT a regular block)
- **Resource type:** `core/franklin/components/section/v1/section`

## CRITICAL: This Is Not a Regular Block

Unlike standard EDS blocks (which have a JS file in `blocks/<name>/`), Grid-Columns is a **section-level layout component**. It:

1. **Has NO dedicated JavaScript file** — its logic lives in global scripts
2. **Wraps other blocks** — it groups sections with `span-col-*` classes into a CSS grid container
3. **Is registered as a page-level component** (in `_component-filters.json`, not `_section.json`)
4. **Requires modifications to global EDS files** (`aem.js`, `styles.css`, optionally `editor-support.js`)

## Source Paths

All paths are relative to the repository root.

### Block Files (in `blocks/grid-columns/`)

| File | Source Path | Purpose |
|------|------------|---------|
| `grid-columns.css` | `blocks/grid-columns/grid-columns.css` | Styles for `.columns` child block inside grid |
| `_grid-columns.json` | `blocks/grid-columns/_grid-columns.json` | AEM content model, filter definition |

### Global Code (extracted as snippets)

| Extracted File | Source File | Content |
|----------------|------------|---------|
| `aem-js-snippet.js` | `scripts/aem.js` (lines ~590-836) | `normalizeBottomMarginClass()`, modified `decorateSections()`, `decorateSectionColumn()`, `decorateSectionsColumn()` |
| `editor-support-js-snippet.js` | `scripts/editor-support.js` (lines ~34-115) | `unwrapGridColumns()`, `updateGridColumns()` — Universal Editor support |
| `global-styles-snippet.css` | `styles/styles.css` (various) | All `.grid-columns` grid layout, responsive breakpoints, span-col classes, visibility toggles, bottom margin utilities |

### Model Registration

| Extracted File | Source File | Content |
|----------------|------------|---------|
| `model-snippet.json` | `models/_component-filters.json` (line 9) | Registers `grid-columns` in the `main` filter's components array |

## Path Discovery Method

All paths were **automatically discovered**:

1. Block files: `/blocks/grid-columns/` — found 2 files (CSS + JSON, no JS)
2. Scripts: Searched `/scripts/` — found `aem.js` and `editor-support.js` with grid-columns logic
3. Styles: Searched `/styles/` — found `styles.css` with extensive grid-columns CSS
4. Models: Searched `/models/` — found `_component-filters.json` registration
5. Constants: Searched `/constants/` — no grid-columns references
6. Utils: Searched `/utils/` — no grid-columns references

## Naming Normalization

### Placeholder Scheme

| Placeholder | Original | Case | Usage |
|-------------|----------|------|-------|
| `{BLOCK_NAME}` | `grid-columns` | kebab-case | CSS class, model IDs, string literals |
| `{BLOCK_CLASS}` | `grid-columns` | kebab-case | CSS class prefix |
| `{BLOCK_FUNC}` | `GridColumns` | PascalCase | Function name infix |
| `{BLOCK_VAR}` | `gridColumns` | camelCase | Variable prefix (not used in current code) |
| `{BLOCK_UPPER}` | `GRID_COLUMNS` | SCREAMING_SNAKE | Constant prefix (not used in current code) |

## External Dependencies

### Required EDS Core Utilities (must exist in target project)

| Utility | Typically In | Used By |
|---------|-------------|---------|
| `readBlockConfig()` | `scripts/aem.js` | Section metadata processing |
| `toClassName()` | `scripts/aem.js` | CSS class name normalization |
| `toCamelCase()` | `scripts/aem.js` | Data attribute key conversion |
| `decorateSections()` | `scripts/aem.js` | Must be modified for grid-columns awareness |
| `loadSections()` | `scripts/aem.js` | Must call `decorateSectionsColumn()` after standard decoration |

### Required CSS Custom Properties

| Property | Purpose |
|----------|---------|
| `--grid-gutter` | Gap between grid columns |
| `--spacing-07` | Bottom margin spacing (Mobile 24px, Tablet 32px, Desktop 40px) |
| `--spacing-12` | Bottom margin spacing (Mobile 64px, Tablet 72px, Desktop 80px) |
| `--spacing-14` | Bottom margin spacing (Mobile 80px, Tablet 96px, Desktop 120px) |

## Notes

- The `grid-columns.css` in the block folder styles the `.columns` child block (not the grid container itself)
- The `.grid-columns` grid container is styled entirely in global `styles/styles.css`
- The grid uses a 12-column system on desktop (1080px+), 8-column on tablet (800-1079px), and single column on mobile (<800px)
- Column spans exceeding the available columns on tablet (>8) are clamped to span 8
- The `tablet-span-col-*` classes override `span-col-*` classes on tablet breakpoint
- Bottom margin supports three spacing tokens plus explicit 0px/none
- Visibility toggle classes (`desktop-hide`, `tablet-hide`, `mobile-hide`) allow responsive visibility control
- The JSON model uses Japanese labels alongside English in the source; the extracted version uses English only
