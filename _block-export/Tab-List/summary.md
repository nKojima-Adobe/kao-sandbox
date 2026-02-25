# Tab List — Extraction Summary

## Overview
| Property | Value |
|----------|-------|
| Block name | `tab-list` |
| Block type | Standard self-contained (with paired section component) |
| Source files | 5 (JS, Utils JS, CSS, JSON, Stories) |
| Total lines | ~1,197 |
| External dependencies | 3 modules (7 imports) |
| Global script integrations | 2 (scripts.js, editor-support.js) |
| Placeholder types | 4 (`{BLOCK_NAME}`, `{BLOCK_PANEL}`, `{BLOCK_FUNC}`, `{BLOCK_PANEL_FUNC}`) |

## Naming Pattern
Uses a **paired component** pattern:
- Block: `.tab-list` → `.{BLOCK_NAME}` (+ derived: `-wrapper`, `-fade-left`, `-fade-right`, `-container`)
- Panel: `tab-panel` → `{BLOCK_PANEL}` (section-level, JSON definitions only)
- Display: `Tab List` → `{BLOCK_FUNC}`, `Tab Panel` → `{BLOCK_PANEL_FUNC}`

**Carefully preserved**:
- ARIA roles: `role="tab"`, `role="tablist"`, `role="tabpanel"` (WAI-ARIA standard)
- 56 camelCase variable occurrences: `tabList`, `tabPanel`, `tabLabel`, `tabFocus`, etc.
- Data attribute: `data-tab-label` (section-metadata field)

## Key Considerations for Implementation
1. **Paired component**: Both `tab-list` block AND `tab-panel` section definitions must be registered
2. **Auto-insertion logic**: `buildTabs()` in scripts.js auto-creates tab-list blocks — include if needed
3. **Universal Editor**: `normalizeTabLabel` is exported and imported by editor-support.js
4. **4 utility imports** from `generic-utils.js` — most critical are `enableHorizontalScroll` and `setSafeInlineTextWithIcons`
5. **No global CSS dependencies** — fully self-contained styles (uses CSS custom properties)
6. **Icons in tab labels** — requires `decorateIcons` and `:icon:` syntax support
