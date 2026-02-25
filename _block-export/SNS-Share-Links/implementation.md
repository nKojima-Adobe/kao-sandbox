# BLOCK IMPLEMENTATION INSTRUCTIONS (for Cursor AI)

> **Source block**: `sns-share-links` (extracted from `mwp-nec-eds`)
> **Block type**: Standard self-contained block
> **External dependencies**: 5 modules (18 imports including 16 i18n constants)
> **Naming pattern**: Root prefix — `sns-share-links` (block), `sns-share-link` (item), `sns-share` (root)

---

# 1. READ THE NAMING MAP

Open and parse `naming-map.json` in this folder. It contains:
- Original block names and their placeholder mappings
- Root prefix naming pattern explanation
- Notes on preserved constant names (SNS_*)

**5 placeholders are used:**

| Placeholder | Original | Usage |
|-------------|----------|-------|
| `{BLOCK_NAME}` | `sns-share-links` | Block wrapper class, file names, JSON IDs, filter IDs |
| `{BLOCK_CHILD}` | `sns-share-link` | Individual share button class, child JSON definition/model IDs |
| `{BLOCK_ROOT}` | `sns-share` | Toast class, analytics event name, keyframe animation name |
| `{BLOCK_FUNC}` | `SNS Share Links` | Storybook title, JSON template display name |
| `{BLOCK_CHILD_FUNC}` | `SNS Share Link` | JSON child definition display title |

---

# 2. ASK THE USER FOR THE TARGET BLOCK NAME

Ask the user:

> What should the block be named in the target project?
>
> Current source name: `sns-share-links`
>
> If keeping the same name, I'll use:
> - Block name: `sns-share-links`
> - Item name: `sns-share-link`
> - Root prefix: `sns-share`
> - Display name: `SNS Share Links`
>
> If renaming, please provide the block name and I'll derive the rest:
> - Example: `social-share-links` → item: `social-share-link`, root: `social-share`, display: `Social Share Links`

---

# 3. DERIVE ALL TARGET NAMES

From the user-provided TARGET_BLOCK_NAME, derive:

```
TARGET_BLOCK_NAME    = user input (e.g., "social-share-links")
TARGET_CHILD_NAME    = remove trailing "s" or derive singular (e.g., "social-share-link")
TARGET_ROOT          = remove "-links" suffix (e.g., "social-share")
TARGET_DISPLAY       = title-case of TARGET_BLOCK_NAME (e.g., "Social Share Links")
TARGET_CHILD_DISPLAY = title-case of TARGET_CHILD_NAME (e.g., "Social Share Link")
```

**Special derivation rules:**
- `{BLOCK_ROOT}` is derived by removing the `-links` suffix from `{BLOCK_NAME}`
- `{BLOCK_CHILD}` is `{BLOCK_ROOT}` + `-link` (singular)
- If the block name doesn't end in `-links`, ask the user for the root prefix explicitly

---

# 4. REPLACE ALL PLACEHOLDERS IN EXTRACTED FILES (CRITICAL)

Replace in ALL extracted files (`.js`, `.css`, `.json`, `.stories.js`):

| Step | Find | Replace With |
|------|------|-------------|
| 1 | `{BLOCK_NAME}` | TARGET_BLOCK_NAME |
| 2 | `{BLOCK_CHILD}` | TARGET_CHILD_NAME |
| 3 | `{BLOCK_ROOT}` | TARGET_ROOT |
| 4 | `{BLOCK_FUNC}` | TARGET_DISPLAY |
| 5 | `{BLOCK_CHILD_FUNC}` | TARGET_CHILD_DISPLAY |

**Order matters**: Replace `{BLOCK_NAME}` before `{BLOCK_CHILD}` before `{BLOCK_ROOT}` to avoid partial matches.

## 4.1 Function name renames (OPTIONAL)

The JS file contains internal function names with "SNS" abbreviation:
- `getSNSConfig` → rename to `get<TargetPrefix>Config` if desired
- `trackSNSShareClick` → rename to `track<TargetPrefix>ShareClick` if desired
- `extractSNSType` → rename to `extract<TargetPrefix>Type` if desired

These are **internal** functions (not exported) and renaming is optional.

## 4.2 Preserved items (DO NOT change)

- `.icon` / `.icon-*` classes — EDS icon system
- `SNS_*` constant names in imports — shared i18n constants (see §7 for renaming guidance)
- Platform-specific strings: `'linkedin'`, `'facebook'`, `'x'`, `'line'`, `'copy'` — functional values, not block names

---

# 5. COPY FILES INTO THE TARGET PROJECT

## 5.1 Block files → `blocks/`

| Source (in this folder) | Target |
|------------------------|--------|
| `{BLOCK_NAME}.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.js` |
| `{BLOCK_NAME}.css` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.css` |
| `_{BLOCK_NAME}.json` | `blocks/TARGET_BLOCK_NAME/_TARGET_BLOCK_NAME.json` |
| `{BLOCK_NAME}.stories.js` | `blocks/TARGET_BLOCK_NAME/TARGET_BLOCK_NAME.stories.js` |

## 5.2 Fix import paths

After copying, verify these import paths in the JS file match the target project structure:

```javascript
import { decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { isClipboardSupported } from '../../utils/generic-utils.js';
import fetchPlaceholdersForLocale from '../../scripts/placeholders.js';
import { trackElementInteraction } from '../../scripts/analytics/data-layer.js';
import { /* 16 SNS_* constants */ } from '../../constants/placeholders-constants.js';
```

Adjust relative paths (`../../`) if the target project has a different directory structure.

---

# 6. RESOLVE EXTERNAL DEPENDENCIES

This block has **5 external dependency modules** plus **16 i18n constants**.

## 6.1 `decorateIcons` from `scripts/aem.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Replaces `<span class="icon icon-*">` elements with actual SVG icons.

**Resolution**: This is a core EDS function. It should already exist in any EDS project. If not:

```javascript
// Minimal stub — loads SVG icons from /icons/ folder
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

## 6.2 `moveInstrumentation` from `scripts/scripts.js` (REQUIRED for Universal Editor)

Used in: `{BLOCK_NAME}.js` — Moves AEM Universal Editor `data-aue-*` attributes from source to target elements.

**Resolution**: If not using Universal Editor, provide a no-op:

```javascript
export function moveInstrumentation(source, target) {
  // No-op if not using Universal Editor
}
```

If using Universal Editor, copy or implement the attribute-transfer function.

## 6.3 `isClipboardSupported` from `utils/generic-utils.js` (REQUIRED)

Used in: `{BLOCK_NAME}.js` — Checks if the Clipboard API is available (requires HTTPS context).

**Resolution**: Simple utility function:

```javascript
export function isClipboardSupported() {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}
```

## 6.4 `fetchPlaceholdersForLocale` from `scripts/placeholders.js` (REQUIRED for localization)

Used in: `{BLOCK_NAME}.js` — Fetches i18n placeholder values for the current locale from the AEM placeholders spreadsheet.

**Resolution**: If not using i18n, provide a stub that returns an empty object:

```javascript
export default async function fetchPlaceholdersForLocale() {
  return {};
}
```

If using i18n, implement the function to fetch from your project's `/placeholders.json` or equivalent:

```javascript
let cachedPlaceholders = null;

export default async function fetchPlaceholdersForLocale() {
  if (cachedPlaceholders) return cachedPlaceholders;
  try {
    const resp = await fetch('/placeholders.json');
    if (resp.ok) {
      const json = await resp.json();
      cachedPlaceholders = {};
      json.data.forEach(({ key, value }) => {
        cachedPlaceholders[key] = value;
      });
    }
  } catch (e) { /* placeholder fetch failed */ }
  return cachedPlaceholders || {};
}
```

## 6.5 `trackElementInteraction` from `scripts/analytics/data-layer.js` (OPTIONAL)

Used in: `{BLOCK_NAME}.js` — Tracks share button click events for analytics.

**Resolution**: If not using analytics, provide a no-op:

```javascript
export function trackElementInteraction(eventName, data) {
  // No-op if analytics not configured
}
```

If using analytics, connect to your project's analytics layer (Adobe Analytics, GA4, etc.).

---

# 7. ADD PLACEHOLDER CONSTANTS (REQUIRED for localization)

Copy the 16 constants from `placeholders-constants-snippet.js` into your project's constants file (typically `constants/placeholders-constants.js`).

```javascript
// LinkedIn
export const SNS_LINKEDIN_NAME = 'snsLinkedinName';
export const SNS_LINKEDIN_ARIA_LABEL = 'snsLinkedinAriaLabel';
export const SNS_LINKEDIN_SHARE_URL = 'snsLinkedinShareUrl';

// Facebook
export const SNS_FACEBOOK_NAME = 'snsFacebookName';
export const SNS_FACEBOOK_ARIA_LABEL = 'snsFacebookAriaLabel';
export const SNS_FACEBOOK_SHARE_URL = 'snsFacebookShareUrl';

// X (Twitter)
export const SNS_X_NAME = 'snsXName';
export const SNS_X_ARIA_LABEL = 'snsXAriaLabel';
export const SNS_X_SHARE_URL = 'snsXShareUrl';

// LINE
export const SNS_LINE_NAME = 'snsLineName';
export const SNS_LINE_ARIA_LABEL = 'snsLineAriaLabel';
export const SNS_LINE_SHARE_URL = 'snsLineShareUrl';

// Copy URL
export const SNS_COPY_NAME = 'snsCopyName';
export const SNS_COPY_ARIA_LABEL = 'snsCopyAriaLabel';
export const SNS_COPY_SUCCESS_MESSAGE = 'snsCopySuccessMessage';
export const SNS_COPY_ERROR_MESSAGE = 'snsCopyErrorMessage';
```

### If NOT using i18n (simplified)

You can remove all the placeholder constant imports and hardcode the values directly in the platform configurations. The `PLATFORMS` object already has English defaults as fallbacks.

### If renaming constants (OPTIONAL)

If you rename the block and want matching constant names:
1. Rename the constant NAMES (left side): e.g., `SNS_LINKEDIN_NAME` → `SOCIAL_LINKEDIN_NAME`
2. Keep the string VALUES (right side) unchanged — they must match your placeholders spreadsheet keys
3. Update all import statements in the block JS file to match

---

# 8. REGISTER THE BLOCK IN SECTION FILTERS

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

Also ensure the block's own `_{BLOCK_NAME}.json` file is properly placed — it defines both the parent container and child item component models.

---

# 9. PROVIDE SOCIAL MEDIA ICONS

This block uses EDS icons for each platform. Ensure these SVG files exist in your `/icons/` directory:

| Icon Name | File Path | Platform |
|-----------|----------|----------|
| `linkedin` | `/icons/linkedin.svg` | LinkedIn |
| `facebook` | `/icons/facebook.svg` | Facebook |
| `x` | `/icons/x.svg` | X (Twitter) |
| `line` | `/icons/line.svg` | LINE |
| `link` | `/icons/link.svg` | Copy URL |

If you don't have these icons, download them from your design system or use generic social media icon SVGs.

---

# 10. SANITY CHECKS

After implementation, verify:

| # | Check | How |
|---|-------|-----|
| 1 | No `{BLOCK_NAME}`, `{BLOCK_CHILD}`, `{BLOCK_ROOT}`, `{BLOCK_FUNC}`, `{BLOCK_CHILD_FUNC}` literals remain | `grep -rn 'BLOCK_NAME\|BLOCK_CHILD\|BLOCK_ROOT\|BLOCK_FUNC' blocks/TARGET_NAME/` |
| 2 | No `sns-share-links` or `sns-share-link` literals remain (unless keeping original name) | `grep -rn 'sns-share' blocks/TARGET_NAME/` |
| 3 | JSON is valid | Parse `_TARGET_NAME.json` |
| 4 | Import paths resolve correctly | Check all `import` statements |
| 5 | All 16 placeholder constants are defined | Check `constants/placeholders-constants.js` |
| 6 | Social media icons exist in `/icons/` | `ls icons/linkedin.svg icons/facebook.svg icons/x.svg icons/line.svg icons/link.svg` |
| 7 | Block registered in section filter | Check `models/_section.json` |
| 8 | CSS custom properties exist | Check for `--nec-gray-0`, `--nec-blue-50`, `--transition-medium`, etc. in global styles |

---

# 11. CSS CUSTOM PROPERTIES REFERENCE

The CSS file uses these custom properties. Ensure they exist in your global styles or replace with equivalent values:

| Property | Usage | Typical Value |
|----------|-------|---------------|
| `--nec-gray-0` | Button background, text color | `#ffffff` |
| `--nec-gray-90` | Default text color | `#1a1a1a` |
| `--nec-blue-50` | Border, hover color | `#1414c8` |
| `--nec-sky-05` | Active background | `#e6f0ff` |
| `--nec-sky-60` | Focus outline | `#0078d4` |
| `--border-radius-1` | Button corner radius | `4px` |
| `--transition-medium` | Hover/focus transition | `0.2s` |
| `--toast-overlay-black-80` | Toast background | `rgba(0, 0, 0, 0.8)` |
| `--z-index-toast` | Toast z-index | `1000` |
| `--font-scale-02` | Toast font size | `0.875rem` |

---

# 12. OPTIONAL CLEANUP

> **Ready to clean up?**
>
> I can now delete the temporary extraction folder:
> - `_block-export/SNS-Share-Links/`
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

## 12.1 If User Confirms Cleanup

Delete the entire `_block-export/SNS-Share-Links/` directory:

```bash
rm -rf _block-export/SNS-Share-Links
```

## 12.2 If User Declines Cleanup

> No problem! The temporary folder will remain at:
> - `_block-export/SNS-Share-Links/`
>
> You can delete it manually later when ready, or keep it for reference.

---

# 13. FINAL SUMMARY TO USER

After all steps (including tests and cleanup), respond with something like:

> Implementation completed.
>
> **Block Names:**
> - Original source name: `sns-share-links`
> - Implemented as: [TARGET_BLOCK_NAME]
>
> **Naming Replacements:**
> - Total placeholders replaced: [count]
> - File names updated: [list]
> - CSS classes renamed: [examples]
>
> **Files Created:**
> - JS/CSS/JSON in: `blocks/[target-name]/`
> - Constants added to: `constants/placeholders-constants.js`
>
> **Files Modified:**
> - Section filter: `models/_section.json`
>
> **External Dependencies Resolved:**
> - decorateIcons: [status]
> - moveInstrumentation: [status]
> - isClipboardSupported: [status]
> - fetchPlaceholdersForLocale: [status]
> - trackElementInteraction: [status]
>
> **Potential TODOs:**
> - Add social media SVG icons to `/icons/` directory
> - Add placeholder values to placeholders spreadsheet for i18n
> - Verify CSS custom properties exist in global styles
> - Test clipboard functionality (requires HTTPS)
> - Verify share URLs open correctly for each platform
