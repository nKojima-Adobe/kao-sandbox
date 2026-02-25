# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)

> **Source block**: `tab-list` (extracted from `mwp-nec-eds`)
> **Block type**: Standard self-contained block with paired section component
> **External dependencies**: 3 modules (7 imports)
> **Global script integrations**: 2 files (scripts.js, editor-support.js)
> **Naming pattern**: Paired component — `tab-list` (block) + `tab-panel` (section)

---

# 1. READ THE NAMING MAP

Open and parse `naming-map.json` in this folder. It contains:
- Original block names and their placeholder mappings
- Paired component pattern explanation
- List of preserved patterns (ARIA roles, camelCase variables, data attributes)

**4 placeholders are used:**

| Placeholder | Original | Usage |
|-------------|----------|-------|
| `{BLOCK_NAME}` | `tab-list` | Block wrapper class, file names, JSON block ID/model, all derived CSS classes (-wrapper, -fade-left, -fade-right, -container) |
| `{BLOCK_PANEL}` | `tab-panel` | Paired panel component — JSON definition ID, model, filter, components references |
| `{BLOCK_FUNC}` | `Tab List` | Display title in Storybook, JSON template name |
| `{BLOCK_PANEL_FUNC}` | `Tab Panel` | Display title for the paired panel component in JSON |

**CRITICAL — Preserved patterns (DO NOT replace):**
- ARIA roles: `role="tab"`, `role="tablist"`, `role="tabpanel"` — WAI-ARIA standard
- camelCase JS variables: `tabList`, `tabPanel`, `tabPanels`, `tabLabel`, `tabFocus`, `tabsPrefix`, `tabsIdx`, `tabIndex`
- Data attribute: `data-tab-label`, `tab-label` (section-metadata field name)
- Design system classes: `.button`, `.button-text`, `.buttons-wrapper`, `.horizontal-line`

---

# 2. ASK THE USER FOR THE TARGET BLOCK NAME

Ask the user:

> What should the block be named in the target project?
>
> Current source name: `tab-list`
>
> If keeping the same name, I'll use:
> - Block name: `tab-list`
> - Panel name: `tab-panel`
> - Display: `Tab List` / `Tab Panel`
>
> If renaming, please provide the block name and I'll derive the rest:
> - Example: `nav-tabs` → panel: `nav-panel`, display: `Nav Tabs` / `Nav Panel`

---

# 3. DERIVE ALL TARGET NAMES

From the user-provided TARGET_BLOCK_NAME, derive:

```
TARGET_BLOCK_NAME    = user input (e.g., "nav-tabs")
TARGET_PANEL_NAME    = replace "-list" suffix with "-panel", or ask user (e.g., "nav-panel")
TARGET_DISPLAY       = title-case of TARGET_BLOCK_NAME (e.g., "Nav Tabs")
TARGET_PANEL_DISPLAY = title-case of TARGET_PANEL_NAME (e.g., "Nav Panel")
```

**Special derivation rules:**
- `{BLOCK_PANEL}` is typically derived by replacing the `-list` suffix with `-panel`
- If the block name doesn't end in `-list`, ask the user for the panel name explicitly
- All derived CSS classes use `{BLOCK_NAME}` as prefix (e.g., `{BLOCK_NAME}-wrapper`, `{BLOCK_NAME}-fade-left`)

---

# 4. REPLACE ALL PLACEHOLDERS IN EXTRACTED FILES (CRITICAL)

Replace in ALL extracted files (`.js`, `.css`, `.json`, `.stories.js`):

| Step | Find | Replace With |
|------|------|-------------|
| 1 | `{BLOCK_NAME}` | TARGET_BLOCK_NAME |
| 2 | `{BLOCK_PANEL}` | TARGET_PANEL_NAME |
| 3 | `{BLOCK_FUNC}` | TARGET_DISPLAY |
| 4 | `{BLOCK_PANEL_FUNC}` | TARGET_PANEL_DISPLAY |

Also replace in snippet files:
- `scripts-js-snippet.js`
- `editor-support-js-snippet.js`

## 4.1 Preserved items (DO NOT change)

The following are intentionally NOT placeholderized:

| Pattern | Reason |
|---------|--------|
| `role="tab"` / `role="tablist"` / `role="tabpanel"` | WAI-ARIA standard tab pattern |
| `tabList`, `tabPanel`, `tabLabel`, etc. (camelCase) | JS variable names using generic tab concept |
| `data-tab-label` / `tab-label` | Section-metadata field name |
| `tabIndex` / `tabFocus` / `tabsIdx` | Generic JS identifiers |
| `.button` / `.button-text` / `.buttons-wrapper` | Global design system classes |
| `.horizontal-line` | Global component class |
| `.section` / `.section-metadata` / `.default-content-wrapper` | EDS framework classes |

---

# 5. COPY FILES INTO THE TARGET PROJECT

## 5.1 Block files → `blocks/`

| Source (in this folder) | Target |
|------------------------|--------|
| `{BLOCK_NAME}.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js` |
| `{BLOCK_NAME}-utils.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME-utils.js` |
| `{BLOCK_NAME}.css` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css` |
| `_{BLOCK_NAME}.json` | `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json` |
| `{BLOCK_NAME}.stories.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js` |

## 5.2 Fix import paths

After copying, verify these import paths in the main JS file match the target project structure:

```javascript
import { toClassName, decorateIcons } from '../../scripts/aem.js';
import {
  enableHorizontalScroll,
  setupEventListenerCleanup,
  setSafeInlineTextWithIcons,
  decodeCmsText,
} from '../../utils/generic-utils.js';
import { scrollTabIntoView, updateFadeEffects } from './TARGET_BLOCK_NAME-utils.js';
import { trackElementInteraction } from '../../scripts/analytics/data-layer.js';
```

Adjust relative paths (`../../`) if the target project has a different directory structure.

---

# 6. RESOLVE EXTERNAL DEPENDENCIES

This block has **3 external dependency modules** with **7 imports**.

## 6.1 `toClassName` from `scripts/aem.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Converts text labels to CSS-safe class names for generating unique tab/panel IDs.

**Resolution**: This is a core EDS function. If not available:

```javascript
export function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}
```

## 6.2 `decorateIcons` from `scripts/aem.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Replaces `<span class="icon icon-*">` with actual SVG icons in tab labels.

**Resolution**: Core EDS function. Should exist in any EDS project. If not:

```javascript
export async function decorateIcons(element) {
  const icons = element.querySelectorAll('span.icon');
  icons.forEach(async (icon) => {
    const iconName = [...icon.classList].find(c => c.startsWith('icon-'))?.replace('icon-', '');
    if (iconName) {
      try {
        const resp = await fetch(`/icons/${iconName}.svg`);
        if (resp.ok) {
          const svg = await resp.text();
          icon.innerHTML = svg;
        }
      } catch (e) { /* icon load failed */ }
    }
  });
}
```

## 6.3 `enableHorizontalScroll` from `utils/generic-utils.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Enables mouse wheel horizontal scrolling on the tab list container.

**Resolution**: Utility that converts vertical wheel events to horizontal scroll:

```javascript
export function enableHorizontalScroll(element, options = {}) {
  const { smooth = false } = options;
  element.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      element.scrollBy({
        left: e.deltaY,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, { passive: false });
}
```

## 6.4 `setupEventListenerCleanup` from `utils/generic-utils.js` (RECOMMENDED)

Used in: `{BLOCK_NAME}.js` — Auto-cleans event listeners when the block element is removed from the DOM.

**Resolution**: Uses MutationObserver to detect element removal:

```javascript
export function setupEventListenerCleanup(element, handlers) {
  element.cleanup = () => {
    handlers.forEach(({ element: el, event, handler }) => {
      el.removeEventListener(event, handler);
    });
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === element || node.contains?.(element)) {
          element.cleanup();
          observer.disconnect();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
```

## 6.5 `setSafeInlineTextWithIcons` from `utils/generic-utils.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Safely sets tab button innerHTML with icon support (`:icon:` syntax).

**Resolution**: Converts `:icon-name:` syntax to `<span class="icon icon-name"></span>`:

```javascript
export function setSafeInlineTextWithIcons(element, { text }) {
  if (!text) return;
  // Convert :icon-name: syntax to icon spans
  const html = text.replace(/:([a-zA-Z0-9-]+):/g, '<span class="icon icon-$1"></span>');
  element.innerHTML = html;
}
```

## 6.6 `decodeCmsText` from `utils/generic-utils.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Decodes URL-encoded text from CMS (e.g., `%2F` → `/`).

**Resolution**:

```javascript
export function decodeCmsText(text) {
  if (!text) return text;
  try {
    return decodeURIComponent(text);
  } catch (e) {
    return text;
  }
}
```

## 6.7 `trackElementInteraction` from `scripts/analytics/data-layer.js` (OPTIONAL)

Used in: `{BLOCK_NAME}.js` — Tracks tab initialization and tab switch events.

**Resolution**: If not using analytics, provide a no-op:

```javascript
export function trackElementInteraction(eventName, data) {
  // No-op if analytics not configured
}
```

---

# 7. ADD GLOBAL SCRIPT INTEGRATIONS (OPTIONAL)

## 7.1 Auto-insertion logic — `buildTabs()` in scripts.js

The source project includes a `buildTabs()` function in `scripts/scripts.js` that automatically creates tab-list blocks when consecutive tab-panel sections are found without a preceding tab-list.

**If you want this behavior:**
1. Copy the contents of `scripts-js-snippet.js` into your `scripts/scripts.js`
2. Replace `{BLOCK_NAME}` with TARGET_BLOCK_NAME in the snippet
3. Call `buildTabs(main)` inside your `decorateMain()` function

**If NOT needed:** Skip this step. Authors must manually add a tab-list block before tab-panel sections.

## 7.2 Universal Editor — `normalizeTabLabel` import in editor-support.js

The source project's `editor-support.js` imports `normalizeTabLabel` from the tab-list block to normalize tab labels during live editing.

**If using Universal Editor:**
1. Add the import from `editor-support-js-snippet.js` to your editor-support.js
2. Use `normalizeTabLabel` in your label-update logic

**If NOT using Universal Editor:** Skip this step.

---

# 8. REGISTER THE BLOCK

## 8.1 Component filters

Add the block's filter reference to `models/_component-filters.json`:

```json
{
  "...": "../blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json#/filters"
}
```

## 8.2 Section availability

The block's `_{BLOCK_NAME}.json` defines a `{BLOCK_PANEL}` filter listing which blocks are allowed inside tab panels. Review this list and adjust for your project's available blocks.

Current allowed blocks in tab panels:
- `text`, `heading`, `buttons`, `images`, `video`, `table`, `tab-list`, `horizontal-line`, `label`

Update the components array in the `{BLOCK_PANEL}` filter to match your project's block inventory.

## 8.3 Tab-list in other filters

If you have section-level components (like `grid-columns`) that should allow tab-list inside them, add TARGET_BLOCK_NAME to their component filter arrays as well.

---

# 9. SANITY CHECKS

After implementation, verify:

| # | Check | How |
|---|-------|-----|
| 1 | No `{BLOCK_NAME}`, `{BLOCK_PANEL}`, `{BLOCK_FUNC}`, `{BLOCK_PANEL_FUNC}` literals remain | `grep -rn 'BLOCK_NAME\|BLOCK_PANEL\|BLOCK_FUNC' blocks/TARGET_NAME/` |
| 2 | No `tab-list` or `tab-panel` literals remain (unless keeping original name) | `grep -rn 'tab-list\|tab-panel' blocks/TARGET_NAME/` |
| 3 | ARIA roles are intact | `grep -c 'role="tab"' blocks/TARGET_NAME/TARGET_NAME.js` → should be > 0 |
| 4 | camelCase variables are intact | `grep -c 'tabList\|tabPanel\|tabLabel' blocks/TARGET_NAME/TARGET_NAME.js` → should be > 0 |
| 5 | JSON is valid | Parse `_TARGET_NAME.json` |
| 6 | Import paths resolve correctly | Check all `import` statements |
| 7 | Utils import matches | `import { scrollTabIntoView, updateFadeEffects } from './TARGET_NAME-utils.js'` |
| 8 | Block registered in component filters | Check `models/_component-filters.json` |
| 9 | Panel filter has valid block references | Check `{BLOCK_PANEL}` filter components array |

---

# 10. CSS CUSTOM PROPERTIES REFERENCE

The CSS file uses these custom properties. Ensure they exist in your global styles or replace with equivalent values:

| Property | Usage | Typical Value |
|----------|-------|---------------|
| `--transition-medium` | Fade overlay transition | `0.2s` |
| `--spacer-01` to `--spacer-04` | Tab padding, container margins | `4px` to `24px` |
| `--btn-height` | Tab button and container height | `40px` |
| `--border-radius-0` | Tab and container border radius | `8px` |
| `--nec-sky-10` | Tab container border | `#cce0ff` |
| `--nec-sky-05` | Selected tab background | `#e6f0ff` |
| `--nec-gray-0` | Default tab background | `#ffffff` |
| `--nec-gray-90` | Default text color | `#1a1a1a` |
| `--nec-blue-50` | Hover/selected text color | `#1414c8` |
| `--font-scale-02` | Tab font size | `0.875rem` |
| `--line-height-xs-px` | Tab line height | `20px` |
| `--font-weight-medium` | Tab font weight | `500` |
| `--spacing-04` | Panel section padding | `32px` |
| `--grid-margin-sm` | Panel button wrapper padding | `16px` |
| `--width-6-col` | Panel paragraph max-width (tablet+) | `calc((100% - 5 * gap) / 12 * 6)` |
| `--horizontal-gap` | Panel paragraph width calc | `20px` |
| `--line-height-ja-xxxl` | Japanese tab line-height | project-specific |
| `--letter-spacing-ja` | Japanese tab letter-spacing | project-specific |

---

# 11. OPTIONAL CLEANUP

> **Ready to clean up?**
>
> I can now delete the temporary extraction folder:
> - `_block-export/Tab-List/`
>
> This will remove:
> - All extracted files (JS, CSS, JSON, docs)
> - `extraction-information.md`
> - `summary.md`
> - This `implementation.md` file itself
>
> The block will remain fully functional in `blocks/TARGET_BLOCK_NAME/`.
>
> **Should I proceed with cleanup?** (yes/no)

Wait for user confirmation.

## 11.1 If User Confirms Cleanup

```bash
rm -rf _block-export/Tab-List
```

## 11.2 If User Declines Cleanup

> No problem! The folder will remain at `_block-export/Tab-List/` for reference.

---

# 12. FINAL SUMMARY TO USER

After all steps, respond with:

> Implementation completed.
>
> **Block Names:**
> - Original source name: `tab-list` + `tab-panel`
> - Implemented as: [TARGET_BLOCK_NAME] + [TARGET_PANEL_NAME]
>
> **Naming Replacements:**
> - Total placeholders replaced: [count]
> - File names updated: [list]
> - CSS classes renamed: [examples]
>
> **Files Created:**
> - JS/CSS/JSON in: `blocks/[target-name]/`
>
> **Files Modified:**
> - Component filters: `models/_component-filters.json`
> - Scripts (if applicable): `scripts/scripts.js`, `scripts/editor-support.js`
>
> **External Dependencies Resolved:**
> - toClassName: [status]
> - decorateIcons: [status]
> - enableHorizontalScroll: [status]
> - setupEventListenerCleanup: [status]
> - setSafeInlineTextWithIcons: [status]
> - decodeCmsText: [status]
> - trackElementInteraction: [status]
>
> **Potential TODOs:**
> - Verify ARIA keyboard navigation works correctly
> - Test horizontal scrolling and fade overlays
> - Test "Show All" mode if enabled
> - Verify tab panel content switches properly
> - Check Japanese typography rendering if applicable
> - Test with icons in tab labels
