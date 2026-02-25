# Buttons

A simple, accessible block that renders a single NEC-styled button from an authored link. Supports 5 visual variants, icon integration, keyboard accessibility, and full state styling.

## Key Features

- **5 button variants:** Filled (default), Outlined, Text, Anchor, Nav
- URL validation with safe fallback
- Keyboard accessible (Space + Enter activation)
- Disabled state with `aria-disabled`, muted colors, and `pointer-events: none`
- Icon support via `:icon-name:` authoring syntax
- Title attribute normalization (strips icon tokens)
- Hover, active, focus, and disabled state styles for all variants
- Japanese language typography support
- SVG icon color changes per variant/state via CSS filter

## File List

| File | Description |
|------|-------------|
| `{BLOCK_NAME}.js` | Main decorator (123 lines) |
| `{BLOCK_NAME}.css` | Button variant styles (265 lines) |
| `{BLOCK_NAME}.stories.js` | Storybook stories with all variants (262 lines) |
| `_{BLOCK_NAME}.json` | AEM content model — link, text, title, variant select (98 lines) |
| `model-snippet.json` | Section filter registration |

## Button Variants

| Variant | CSS Class | Visual |
|---------|-----------|--------|
| Filled | (default) | Blue background, white text |
| Outlined | `.button-outlined` | White bg, blue border/text |
| Text | `.button-text` | Transparent, underlined text |
| Anchor | `.button-anchor` | Compact, no border |
| Nav | `.button-nav` | White background, nav context |

## How It Works

1. Author creates a "Buttons" block in AEM with a link, text, title, and variant select
2. `decorate()` finds the first `<a>` in the block
3. Adds `.button` class + any variant class from the block wrapper
4. Validates the URL (falls back to `#` if invalid)
5. Normalizes title attribute (strips icon tokens)
6. Adds Space key handler for accessibility
7. Wraps text nodes in `.button-caption`, preserves icon elements
8. Replaces block contents with the single styled link

## External Dependencies

| Import | Source | Required | Purpose |
|--------|--------|----------|---------|
| `normalizeAltText` | `utils/generic-utils.js` | Yes | Strips icon syntax from title text |

## Design System Note

This block defines the **global `.button` class** and its variants. These classes are used as a design system token by many other blocks (hero, cards, carousel, etc.). The CSS is loaded when any page includes the buttons block.

The `.button` and `.button-*` variant classes are **not replaced with placeholders** — they are concrete design system identifiers that should remain consistent across the project.

## CSS Custom Properties Used (global)

- `--nec-gray-0`, `--nec-gray-20`, `--nec-gray-40`, `--nec-gray-90`
- `--nec-sky-05`, `--nec-sky-50`
- `--nec-blue-50`
- `--line-height-xs`, `--line-height-ja-xxxl`
- `--letter-spacing-ja`

## Integration Notes

- Standard block: copy to `blocks/{BLOCK_NAME}/`
- Register in section filter
- The `.button` base class styles (font, padding, border-radius, display) are typically defined in `styles/styles.css` — ensure those exist in the target project
- Section-level `.buttons-wrapper` alignment rules (`.right-align-text`, `.left-align-text`, `.center-align-text`) are in global `styles/styles.css` — add if needed
