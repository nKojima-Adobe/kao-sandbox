# Buttons Block — Extraction Information

## Block Identity
- **Source block name:** `buttons`
- **Library folder name:** `Buttons`
- **Block type:** single (standard self-contained block)
- **No global code modifications needed**

## Important Design Note

This block defines the **global `.button` class** (singular) and its variants (`.button-outlined`, `.button-text`, `.button-anchor`, `.button-nav`). These classes are a design system token referenced by many other blocks across the EDS project. Only the block wrapper class `.buttons` (plural) is replaced with the `{BLOCK_CLASS}` placeholder. The `.button` design system classes are preserved as-is.

## Source Paths

| File | Path | Lines | Description |
|------|------|-------|-------------|
| `buttons.js` | `blocks/buttons/buttons.js` | 123 | Main decorator |
| `buttons.css` | `blocks/buttons/buttons.css` | 265 | Button variant styles |
| `_buttons.json` | `blocks/buttons/_buttons.json` | 98 | AEM content model |
| `buttons.stories.js` | `blocks/buttons/buttons.stories.js` | 262 | Storybook documentation |

## Discovery Method
- Automatic: `blocks/buttons/` found via glob
- Global styles check: `styles/styles.css` has `.buttons-wrapper` alignment rules (section-level, not extracted)

## Model Registration
- `models/_section.json` line 104 registers `"buttons"`

## Naming Normalization

| Placeholder | Original | Case |
|-------------|----------|------|
| `{BLOCK_NAME}` | `buttons` | kebab-case |
| `{BLOCK_CLASS}` | `buttons` | kebab-case |
| `{BLOCK_FUNC}` | `Buttons` | PascalCase |
| `{BLOCK_VAR}` | `buttons` | camelCase |
| `{BLOCK_UPPER}` | `BUTTONS` | SCREAMING_SNAKE (unused) |

## Preserved Classes (NOT replaced)

These are global design system classes defined by this block's CSS but used across the entire EDS project:

- `.button` — Base button class applied to `<a>` elements
- `.button-outlined` — Outlined variant
- `.button-text` — Text-only variant
- `.button-anchor` — Anchor variant
- `.button-nav` — Navigation variant
- `.button-caption` — Text wrapper inside button

## External Dependencies

| Import | Source | Required | Purpose |
|--------|--------|----------|---------|
| `normalizeAltText` | `utils/generic-utils.js` | Yes | Strips icon tokens from title attribute text |
