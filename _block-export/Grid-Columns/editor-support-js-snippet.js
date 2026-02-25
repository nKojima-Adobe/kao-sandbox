/**
 * ============================================================================
 * {BLOCK_FUNC} — Editor Support JavaScript Snippet
 * ============================================================================
 *
 * SOURCE: scripts/editor-support.js (lines ~34-115)
 *
 * INTEGRATION INSTRUCTIONS:
 * -------------------------
 * These functions must be added to your project's editor-support.js file
 * (or equivalent Universal Editor support script).
 *
 * 1. Import decorateSectionsColumn from your aem.js:
 *    import { decorateSectionsColumn } from './aem.js';
 *
 * 2. Add unwrap{BLOCK_FUNC}() function
 * 3. Add update{BLOCK_FUNC}() function
 * 4. Call update{BLOCK_FUNC}(main) in your editor update handler
 *
 * NOTE: These are only needed for Universal Editor support.
 * If your project does not use Universal Editor, you can skip these.
 * ============================================================================
 */

import { decorateSectionsColumn } from './aem.js';

/**
 * Unwraps {BLOCK_NAME} back to individual sections for regrouping
 * This ensures proper {BLOCK_NAME} structure after Universal Editor updates
 * @param {Element} container The container element (usually main)
 */
function unwrap{BLOCK_FUNC}(container) {
  if (!container) return;

  // Find all {BLOCK_NAME} containers at the top level
  const gridContainers = container.querySelectorAll(':scope > .{BLOCK_NAME}');

  gridContainers.forEach((gridContainer) => {
    // Get all section children
    const sections = Array.from(gridContainer.querySelectorAll(':scope > .section'));

    if (sections.length > 0) {
      // Insert all sections before the {BLOCK_NAME} container
      sections.forEach((section) => {
        gridContainer.parentElement.insertBefore(section, gridContainer);
      });

      // Remove the now-empty {BLOCK_NAME} container
      gridContainer.remove();
    }
  });

  // Handle AEM's nested section structure:
  // <div class="section"><div><div class="section span-col-*">
  // Unwrap span-col sections that are nested inside wrapper sections
  const wrapperSections = container.querySelectorAll(':scope > .section');
  wrapperSections.forEach((wrapperSection) => {
    // Look for nested sections with span-col classes
    const nestedSections = wrapperSection.querySelectorAll(
      ':scope > div > .section[class*="span-col-"]',
    );
    if (nestedSections.length > 0) {
      // Move nested sections to the container level
      nestedSections.forEach((nestedSection) => {
        container.insertBefore(nestedSection, wrapperSection);
      });
      // Remove the now-empty wrapper
      const isEmpty = wrapperSection.children.length === 0
        || (wrapperSection.children.length === 1
          && wrapperSection.children[0].children.length === 0);
      if (isEmpty) {
        wrapperSection.remove();
      }
    }
  });
}

/**
 * Updates {BLOCK_NAME} structure after Universal Editor changes
 * Call this in your editor content update handler
 * @param {Element} main The main content element
 */
function update{BLOCK_FUNC}(main) {
  if (!main) return;

  // Ensure {BLOCK_NAME} are properly structured after updates
  setTimeout(() => {
    unwrap{BLOCK_FUNC}(main);
    decorateSectionsColumn(main);
  }, 100);
}

// Export or call update{BLOCK_FUNC}(main) from your editor update handler
