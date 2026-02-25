# Extraction Summary — Grid-Columns Block

## Block Names

- **Source block name:** `grid-columns`
- **Library folder name:** `Grid-Columns`

## IMPORTANT: Section-Level Component

This is a **section-level layout component**, not a regular block. It requires modifications to global EDS files rather than just dropping files into a `blocks/` folder.

## Naming Normalization

| Placeholder | Original | Case Convention |
|-------------|----------|-----------------|
| `{BLOCK_NAME}` | `grid-columns` | kebab-case |
| `{BLOCK_CLASS}` | `grid-columns` | kebab-case |
| `{BLOCK_FUNC}` | `GridColumns` | PascalCase |
| `{BLOCK_VAR}` | `gridColumns` | camelCase |
| `{BLOCK_UPPER}` | `GRID_COLUMNS` | SCREAMING_SNAKE |

## Files Extracted

### Block Source Files (with placeholders)

| Extracted File | Original Source | Type |
|----------------|-----------------|------|
| `{BLOCK_NAME}.css` | `blocks/grid-columns/grid-columns.css` | Columns child block styles |
| `_{BLOCK_NAME}.json` | `blocks/grid-columns/_grid-columns.json` | AEM content model + filter |

### Global Code Snippets (with placeholders)

| Extracted File | Original Source | Description |
|----------------|-----------------|-------------|
| `aem-js-snippet.js` | `scripts/aem.js` | Section decoration, column grouping, bottom margin logic |
| `editor-support-js-snippet.js` | `scripts/editor-support.js` | Universal Editor unwrap/regroup support |
| `global-styles-snippet.css` | `styles/styles.css` | Complete responsive grid layout CSS |
| `model-snippet.json` | `models/_component-filters.json` | Page-level component registration |

### Generated Documentation Files

| File | Purpose |
|------|---------|
| `naming-map.json` | Placeholder mapping and global code locations |
| `extraction-information.md` | Source paths, dependencies, integration details |
| `description.md` | Block behavior and UX characteristics |
| `summary.md` | This file |
| `README.md` | Human-friendly block documentation |
| `implementation.md` | Complete implementation instructions for target project |

## Integration Overview (for a New EDS Project)

### Step 1: Block Folder
Create `blocks/{BLOCK_NAME}/` and place the CSS and JSON files.

### Step 2: Global Styles (`styles/styles.css`)
Add ALL content from `global-styles-snippet.css` to your global stylesheet. This provides the grid layout, responsive breakpoints, column spans, and visibility toggles.

### Step 3: Global Script (`scripts/aem.js`)
This is the most complex step. You need to:
1. Add `normalizeBottomMarginClass()` helper function
2. **Modify** your existing `decorateSections()` to detect `.{BLOCK_NAME}` containers
3. Add `decorateSectionColumn()` function
4. Add and **export** `decorateSectionsColumn()` function
5. Call `decorateSectionsColumn(main)` during page initialization

### Step 4: Editor Support (Optional)
If using Universal Editor, add `unwrapGridColumns()` and `updateGridColumns()` to your `editor-support.js`.

### Step 5: Model Registration
Add `"{BLOCK_NAME}"` to your `models/_component-filters.json` in the `main` filter's `components` array.

## External Dependencies

| Dependency | Source | Required By |
|------------|--------|-------------|
| `readBlockConfig()` | `scripts/aem.js` | Section metadata processing |
| `toClassName()` | `scripts/aem.js` | CSS class normalization |
| `toCamelCase()` | `scripts/aem.js` | Data attribute conversion |
| `--grid-gutter` | CSS custom property | Grid gap |
| `--spacing-07/12/14` | CSS custom properties | Bottom margin values |

## Next Steps

1. Copy the entire `Grid-Columns` folder into the target project's `_block-export/` directory
2. Open `implementation.md` and follow the interactive instructions
3. Pay special attention to the **global code integration** sections — this block cannot work by just copying files to `blocks/`
4. Ensure all CSS custom properties (`--grid-gutter`, `--spacing-*`) are defined in the target project
5. Test with multiple sections using `span-col-*` classes to verify the grid grouping works
