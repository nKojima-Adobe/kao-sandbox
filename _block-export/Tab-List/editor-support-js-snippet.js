// ============================================================================
// Tab-List editor support — from scripts/editor-support.js
// ============================================================================
// The Universal Editor imports `normalizeTabLabel` from the {BLOCK_NAME} block
// to normalize tab labels during authoring (handles URL encoding, origin
// prefixes, icon paths, and CMS-escaped text).
//
// If using Universal Editor, add this import to your editor-support.js:
// ============================================================================

import { normalizeTabLabel } from '../blocks/{BLOCK_NAME}/{BLOCK_NAME}.js';

// Usage in editor-support.js → updateLabels():
//
// function updateLabels(main) {
//   setTimeout(() => {
//     const tabPanels = main.querySelectorAll('[role="tabpanel"]');
//     tabPanels.forEach((tabPanel) => {
//       const label = tabPanel.dataset.tabLabel;
//       if (!label) return;
//
//       const tabId = tabPanel.getAttribute('aria-labelledby');
//       const tab = main.querySelector(`#${tabId}`);
//       if (tab) {
//         const normalizedLabel = normalizeTabLabel(label);
//         setSafeInlineTextWithIcons(tab, { text: normalizedLabel });
//         decorateIcons(tab);
//       }
//     });
//   }, 0);
// }
