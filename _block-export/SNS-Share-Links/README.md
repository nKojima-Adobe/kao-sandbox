# SNS Share Links — Extracted Block

Social media sharing block with LinkedIn, Facebook, X, LINE, and Copy URL support.

## Quick Start

1. Read `implementation.md` for full step-by-step instructions
2. Replace placeholders in all extracted files:
   - `{BLOCK_NAME}` → target block name (e.g., `sns-share-links`)
   - `{BLOCK_CHILD}` → singular item name (e.g., `sns-share-link`)
   - `{BLOCK_ROOT}` → common root prefix (e.g., `sns-share`)
   - `{BLOCK_FUNC}` → display name (e.g., `SNS Share Links`)
   - `{BLOCK_CHILD_FUNC}` → singular display name (e.g., `SNS Share Link`)
3. Copy files to target project:
   - `{BLOCK_NAME}.js` → `blocks/TARGET_NAME/TARGET_NAME.js`
   - `{BLOCK_NAME}.css` → `blocks/TARGET_NAME/TARGET_NAME.css`
   - `_{BLOCK_NAME}.json` → `blocks/TARGET_NAME/_TARGET_NAME.json`
4. Resolve 5 external dependencies (see `implementation.md` §6)
5. Add 16 placeholder constants from `placeholders-constants-snippet.js`
6. Register block in section filter (`model-snippet.json`)

## Files

| File | Purpose |
|------|---------|
| `{BLOCK_NAME}.js` | Main block decorator with share button creation |
| `{BLOCK_NAME}.css` | All styles including toast notifications |
| `_{BLOCK_NAME}.json` | AEM content model (parent + child definitions) |
| `{BLOCK_NAME}.stories.js` | Storybook stories (6 variants) |
| `placeholders-constants-snippet.js` | 16 i18n constant definitions |
| `model-snippet.json` | Section filter registration |
| `naming-map.json` | Placeholder mapping reference |
| `implementation.md` | Full implementation guide |
