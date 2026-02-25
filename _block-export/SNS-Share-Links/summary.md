# SNS Share Links — Extraction Summary

## Overview
| Property | Value |
|----------|-------|
| Block name | `sns-share-links` |
| Block type | Standard self-contained |
| Source files | 4 (JS, CSS, JSON, Stories) |
| Total lines | ~982 |
| External dependencies | 5 modules (18 imports incl. 16 i18n constants) |
| Placeholder types | 5 (`{BLOCK_NAME}`, `{BLOCK_CHILD}`, `{BLOCK_ROOT}`, `{BLOCK_FUNC}`, `{BLOCK_CHILD_FUNC}`) |

## Naming Pattern
Uses a **root prefix** pattern where all CSS classes and analytics events share the common prefix `sns-share`:
- Block wrapper: `.sns-share-links` → `.{BLOCK_NAME}`
- Item: `.sns-share-link` → `.{BLOCK_CHILD}`
- Toast: `.sns-share-toast` → `.{BLOCK_ROOT}-toast`
- Analytics: `sns-share-click` → `{BLOCK_ROOT}-click`
- Keyframes: `sns-share-toast-fade` → `{BLOCK_ROOT}-toast-fade`

## Key Considerations for Implementation
1. **16 i18n placeholder constants** — must be added to the target project's placeholder constants file and spreadsheet
2. **Platform configurations** are exported (`PLATFORMS` constant) — other blocks could import them
3. **Clipboard API** — requires HTTPS context; falls back gracefully with error toast
4. **No global style dependencies** — fully self-contained CSS
5. **Function names** (`getSNSConfig`, `trackSNSShareClick`, `extractSNSType`) use "SNS" abbreviation — rename manually if desired
