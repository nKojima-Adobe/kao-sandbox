# Horizontal Line — Extracted Block

Minimal horizontal divider block — renders a semantic `<hr>` element.

## Quick Start

1. Replace placeholders:
   - `{BLOCK_NAME}` → target block name (e.g., `horizontal-line`)
   - `{BLOCK_FUNC}` → display name (e.g., `Horizontal Line`)
2. Copy files to target project:
   - `{BLOCK_NAME}.js` → `blocks/TARGET_NAME/TARGET_NAME.js`
   - `{BLOCK_NAME}.css` → `blocks/TARGET_NAME/TARGET_NAME.css`
   - `_{BLOCK_NAME}.json` → `blocks/TARGET_NAME/_TARGET_NAME.json`
3. Register block in section filter (`model-snippet.json`)
4. Ensure CSS custom properties `--spacer-04` and `--nec-gray-30` exist

## Files

| File | Purpose |
|------|---------|
| `{BLOCK_NAME}.js` | Block decorator (17 lines) |
| `{BLOCK_NAME}.css` | Styles (13 lines) |
| `_{BLOCK_NAME}.json` | AEM content model |
| `model-snippet.json` | Section filter registration |
| `naming-map.json` | Placeholder mapping |
| `implementation.md` | Full implementation guide |
