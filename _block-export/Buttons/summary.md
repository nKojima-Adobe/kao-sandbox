# Extraction Summary — Buttons Block

## Block Names
- **Source:** `buttons`
- **Library folder:** `Buttons`
- **Type:** Standard self-contained block

## Naming Normalization

| Placeholder | Original | Case |
|-------------|----------|------|
| `{BLOCK_NAME}` | `buttons` | kebab-case |
| `{BLOCK_CLASS}` | `buttons` | kebab-case |
| `{BLOCK_FUNC}` | `Buttons` | PascalCase |
| `{BLOCK_VAR}` | `buttons` | camelCase |
| `{BLOCK_UPPER}` | `BUTTONS` | SCREAMING_SNAKE (unused) |

## Replacement Strategy

**Replaced with placeholders:**
- Block name `buttons` → `{BLOCK_NAME}` in file names, JSON IDs, block class, stories
- Display name `Buttons` → `{BLOCK_FUNC}` in titles and comments

**Intentionally preserved (design system classes):**
- `.button` — global base button class
- `.button-outlined`, `.button-text`, `.button-anchor`, `.button-nav` — variant classes
- `.button-caption` — text wrapper sub-element
- These classes are used by many other blocks and should NOT be renamed

## Files Extracted

### Block Source Files (with placeholders)

| File | Original Source | Description |
|------|----------------|-------------|
| `{BLOCK_NAME}.js` | `blocks/buttons/buttons.js` | Main decorator (123 lines) |
| `{BLOCK_NAME}.css` | `blocks/buttons/buttons.css` | Button variant styles (265 lines) |
| `{BLOCK_NAME}.stories.js` | `blocks/buttons/buttons.stories.js` | Storybook stories (262 lines) |
| `_{BLOCK_NAME}.json` | `blocks/buttons/_buttons.json` | AEM content model (98 lines) |

### Snippets

| File | Purpose |
|------|---------|
| `model-snippet.json` | Section filter registration |

### Documentation

| File | Purpose |
|------|---------|
| `naming-map.json` | Placeholder mapping + preserved classes documentation |
| `extraction-information.md` | Source paths, dependencies, design notes |
| `description.md` | Block functionality description |
| `summary.md` | This file |
| `README.md` | Human-friendly documentation |
| `implementation.md` | Step-by-step Cursor AI integration guide |

## External Dependencies

| Import | Source | Required | Purpose |
|--------|--------|----------|---------|
| `normalizeAltText` | `utils/generic-utils.js` | Yes | Title attribute sanitization |

## Next Steps

1. Copy `Buttons` folder to target project's `_block-export/`
2. Open `implementation.md` and follow the interactive guide
3. Resolve `normalizeAltText` dependency
4. Register in section filter
5. Ensure global `.button` base styles exist in target project (typically in `styles/styles.css`)

**Important:** All extracted files contain placeholders (`{BLOCK_NAME}`, `{BLOCK_FUNC}`) that must be replaced during implementation. The `.button` design system classes are already concrete and will work as-is.
