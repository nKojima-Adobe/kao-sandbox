# Grid-Columns

A section-level layout component for AEM Edge Delivery Services that provides a responsive 12-column CSS grid system. Authors assign column spans to individual sections, and the system automatically wraps them into a grid container — no custom block JavaScript required.

## Key Features

- **Responsive 12/8/1 grid:** Desktop uses 12 columns, tablet uses 8 columns, mobile collapses to single column
- **Flexible column spans:** Authors choose from 1-12 column spans for desktop and 1-8 for tablet via the Universal Editor
- **Automatic section grouping:** Consecutive sections with `span-col-*` classes are automatically wrapped in a grid container at runtime
- **Responsive visibility:** Per-breakpoint show/hide with `desktop-hide`, `tablet-hide`, `mobile-hide` classes
- **Bottom margin control:** Configurable spacing below the grid with preset spacing tokens
- **Style options:** Text alignment (left, center, right), article indent, and font weight variants
- **Universal Editor support:** Dedicated unwrap/regroup logic maintains grid structure during content editing
- **No dedicated JS file:** Purely structural — all logic is in global EDS scripts

## File List

### Block Files

| File | Description |
|------|-------------|
| `{BLOCK_NAME}.css` | Styles for the `.columns` child block that lives inside the grid |
| `_{BLOCK_NAME}.json` | AEM content model with column span, tablet span, style, and bottom margin fields |

### Global Code Snippets (must be integrated into global files)

| File | Target | Description |
|------|--------|-------------|
| `aem-js-snippet.js` | `scripts/aem.js` | Section decoration with grid-columns awareness, column grouping logic |
| `editor-support-js-snippet.js` | `scripts/editor-support.js` | Universal Editor unwrap/regroup support |
| `global-styles-snippet.css` | `styles/styles.css` | Complete responsive grid layout with all column span and visibility classes |
| `model-snippet.json` | `models/_component-filters.json` | Page-level component registration |

### Integration Files

| File | Description |
|------|-------------|
| `naming-map.json` | Placeholder-to-original name mapping |
| `implementation.md` | Step-by-step integration guide |

## How It Works

1. **Authoring:** In Universal Editor, authors create sections and assign `span-col-*` classes (e.g., `span-col-6` for a half-width column) via the content model
2. **Runtime:** The `decorateSectionsColumn()` function in `aem.js` detects consecutive sections with span classes and wraps them in a `.grid-columns` container div
3. **Layout:** CSS grid takes over — the container uses `grid-template-columns: repeat(12, 1fr)` on desktop, and child sections use `grid-column: span N` based on their classes
4. **Responsive:** On tablet, the grid switches to 8 columns with optional `tablet-span-col-*` overrides. On mobile, everything stacks to single column

## Use Cases

1. **Two-column content layout:** Text on the left (span-col-6), image on the right (span-col-6)
2. **Three-column cards:** Three equal cards using span-col-4 each
3. **Asymmetric layout:** Wide content area (span-col-8) with narrow sidebar (span-col-4)
4. **Full-width with gutter:** Single span-col-12 section that respects the grid's gutter
5. **Responsive column reflow:** Desktop 3-column layout (span-col-4) that becomes 2-column on tablet (tablet-span-col-4) and single column on mobile
6. **Conditional visibility:** A promotional sidebar visible on desktop (span-col-3) but hidden on mobile with `mobile-hide`

## Integration Notes

### This Is NOT a Drop-in Block

Unlike standard EDS blocks, Grid-Columns requires modifications to **global project files**:

1. **`scripts/aem.js`** — Must be modified to include grid-columns awareness in section decoration, plus new functions for column grouping
2. **`styles/styles.css`** — Must include all grid layout CSS (responsive breakpoints, span classes, visibility toggles)
3. **`scripts/editor-support.js`** — Must include unwrap/regroup functions for Universal Editor (optional if not using UE)
4. **`models/_component-filters.json`** — Must register grid-columns as a page-level component

### CSS Custom Properties Required

The grid CSS depends on these custom properties being defined in your project:
- `--grid-gutter` — Gap between grid columns
- `--spacing-07`, `--spacing-12`, `--spacing-14` — Bottom margin spacing values

### AEM Content Model

The block model (`_{BLOCK_NAME}.json`) provides:
- Column span selector (1-12 columns)
- Tablet column span selector (1-8 columns)
- Style multiselect (alignment, font weight, visibility)
- Bottom margin selector (None, Spacing07, Spacing12, Spacing14)

Note: Some features could not be inferred due to limited context in the extracted files. The column grouping logic depends on the EDS section decoration lifecycle.
