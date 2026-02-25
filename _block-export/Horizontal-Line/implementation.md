# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)

> **Source block**: `horizontal-line` (extracted from `mwp-nec-eds`)
> **Block type**: Standard self-contained block
> **External dependencies**: 0
> **Complexity**: Minimal (~56 lines total)

---

# 1. READ THE NAMING MAP

Open and parse `naming-map.json` in this folder. It contains:
- Original block names and their placeholder mappings

**2 placeholders are used:**

| Placeholder | Original | Usage |
|-------------|----------|-------|
| `{BLOCK_NAME}` | `horizontal-line` | Block class, file names, JSON IDs, model references |
| `{BLOCK_FUNC}` | `Horizontal Line` | JSON definition display titles, template names |

---

# 2. ASK THE USER FOR THE TARGET BLOCK NAME

Ask the user:

> What should the block be named in the target project?
>
> Current source name: `horizontal-line`
>
> If keeping the same name, I'll use:
> - Block name: `horizontal-line`
> - Display name: `Horizontal Line`
>
> If renaming (e.g., `divider`):
> - Block name: `divider`
> - Display name: `Divider`

---

# 3. DERIVE ALL TARGET NAMES

```
TARGET_BLOCK_NAME = user input (e.g., "divider")
TARGET_DISPLAY    = title-case of TARGET_BLOCK_NAME (e.g., "Divider")
```

---

# 4. REPLACE ALL PLACEHOLDERS IN EXTRACTED FILES (CRITICAL)

Replace in ALL extracted files (`.js`, `.css`, `.json`):

| Step | Find | Replace With |
|------|------|-------------|
| 1 | `{BLOCK_NAME}` | TARGET_BLOCK_NAME |
| 2 | `{BLOCK_FUNC}` | TARGET_DISPLAY |

---

# 5. COPY FILES INTO THE TARGET PROJECT

| Source (in this folder) | Target |
|------------------------|--------|
| `{BLOCK_NAME}.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js` |
| `{BLOCK_NAME}.css` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css` |
| `_{BLOCK_NAME}.json` | `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json` |

No import path adjustments needed — this block has zero imports.

---

# 6. RESOLVE EXTERNAL DEPENDENCIES

**None.** This block has zero external dependencies. It is fully self-contained.

---

# 7. REGISTER THE BLOCK

Add the block to your section filter so it appears in the Universal Editor:

In `models/_section.json` (or equivalent), add to the `components` array:

```json
{
  "id": "section",
  "components": [
    "... existing components ...",
    "TARGET_BLOCK_NAME"
  ]
}
```

---

# 8. CSS CUSTOM PROPERTIES

The CSS file uses 2 custom properties. Ensure they exist in your global styles:

| Property | Usage | Typical Value |
|----------|-------|---------------|
| `--spacer-04` | Vertical margin | `32px` |
| `--nec-gray-30` | Line color | `#c4c4c4` |

If these don't exist, replace with literal values in the CSS.

---

# 9. SANITY CHECKS

| # | Check | How |
|---|-------|-----|
| 1 | No `{BLOCK_NAME}` or `{BLOCK_FUNC}` literals remain | `grep -rn 'BLOCK_NAME\|BLOCK_FUNC' blocks/TARGET_NAME/` |
| 2 | No `horizontal-line` literals remain (unless keeping name) | `grep -rn 'horizontal-line' blocks/TARGET_NAME/` |
| 3 | JSON is valid | Parse `_TARGET_NAME.json` |
| 4 | Block registered in section filter | Check `models/_section.json` |

---

# 10. OPTIONAL CLEANUP

> **Ready to clean up?**
>
> I can delete the extraction folder: `_block-export/Horizontal-Line/`
>
> **Should I proceed?** (yes/no)

## 10.1 If User Confirms

```bash
rm -rf _block-export/Horizontal-Line
```

## 10.2 If User Declines

> The folder will remain at `_block-export/Horizontal-Line/` for reference.

---

# 11. FINAL SUMMARY TO USER

> Implementation completed.
>
> **Block Names:**
> - Original: `horizontal-line`
> - Implemented as: [TARGET_BLOCK_NAME]
>
> **Files Created:**
> - `blocks/[target-name]/[target-name].js` (17 lines)
> - `blocks/[target-name]/[target-name].css` (13 lines)
> - `blocks/[target-name]/_[target-name].json` (26 lines)
>
> **Files Modified:**
> - `models/_section.json` (block registered)
>
> **External Dependencies:** None
>
> **Potential TODOs:**
> - Verify `--spacer-04` and `--nec-gray-30` CSS custom properties exist
> - Test the `<hr>` renders correctly in all viewports
