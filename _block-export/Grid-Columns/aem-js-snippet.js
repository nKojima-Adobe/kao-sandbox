/**
 * ============================================================================
 * {BLOCK_FUNC} — Global JavaScript Snippet
 * ============================================================================
 *
 * SOURCE: scripts/aem.js (lines ~590-836)
 *
 * INTEGRATION INSTRUCTIONS:
 * -------------------------
 * These functions must be added to your project's main EDS script file
 * (typically scripts/aem.js or equivalent). They are NOT standalone files.
 *
 * 1. Add normalizeBottomMarginClass() as a helper function
 * 2. Modify your existing decorateSections() function to include {BLOCK_NAME} awareness
 * 3. Add decorateSectionColumn() as a new function
 * 4. Add decorateSectionsColumn() as a new exported function
 * 5. Call decorateSectionsColumn(main) during page initialization (after decorateSections)
 * 6. Export decorateSectionsColumn so editor-support.js can import it
 *
 * DEPENDENCIES: These functions use readBlockConfig(), toClassName(), and toCamelCase()
 * which are standard EDS aem.js utilities.
 * ============================================================================
 */

// --- HELPER: Normalize bottom margin class values ---
// Add this as a standalone function in your aem.js

function normalizeBottomMarginClass(marginValue) {
  if (!marginValue) return '';
  const normalizedValue = marginValue.toLowerCase();

  // Legacy pixel values → new spacing tokens
  if (normalizedValue === '40px') return 'spacing07';
  if (normalizedValue === '80px') return 'spacing12';
  if (normalizedValue === '120px') return 'spacing14';

  // Supported new tokens stay as-is
  if (
    normalizedValue === 'spacing07'
    || normalizedValue === 'spacing12'
    || normalizedValue === 'spacing14'
  ) {
    return normalizedValue;
  }

  // Treat "none" as explicit zero margin and reuse the existing 0px class mapping
  if (normalizedValue === 'none' || normalizedValue === '0px') {
    return '0px';
  }

  return marginValue;
}

// --- MODIFICATION: Update your existing decorateSections() function ---
// Add {BLOCK_NAME} awareness to your existing decorateSections function.
// The key changes are:
//   1. Check if a section is a {BLOCK_NAME} container (line with isGridColumns)
//   2. If it IS a {BLOCK_NAME} container, skip wrapping children but still mark as initialized
//   3. Process columns/tablet-columns metadata in addition to style metadata
//
// Below is the full function for reference:

function decorateSections(main) {
  // Process both regular sections and {BLOCK_NAME} containers
  main.querySelectorAll(':scope > div:not([data-section-status])').forEach((section) => {
    // Check if this is a {BLOCK_NAME} container
    const isGridColumns = section.classList.contains('{BLOCK_NAME}');

    if (!isGridColumns) {
      const wrappers = [];
      let defaultContent = false;
      [...section.children].forEach((e) => {
        if ((e.tagName === 'DIV' && e.className) || !defaultContent) {
          const wrapper = document.createElement('div');
          wrappers.push(wrapper);
          defaultContent = e.tagName !== 'DIV' || !e.className;
          if (defaultContent) wrapper.classList.add('default-content-wrapper');
        }
        wrappers[wrappers.length - 1].append(e);
      });
      wrappers.forEach((wrapper) => section.append(wrapper));
      section.classList.add('section');
      section.dataset.sectionStatus = 'initialized';
      section.style.display = 'none';
    } else {
      // For {BLOCK_NAME} containers, just mark as initialized
      section.dataset.sectionStatus = 'initialized';
    }

    // Process section metadata
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/-/g, '');
        if (normalizedKey === 'bottommargin') {
          if (meta[key]) {
            const rawValue = meta[key].trim();
            const marginValue = normalizeBottomMarginClass(toClassName(rawValue));
            if (marginValue) {
              section.classList.add(`bottom-margin-${marginValue}`);
            }
          }
        } else if (key === 'style' || key === 'columns' || key === 'tablet-columns') {
          if (meta.style) {
            const styles = meta.style
              .split(',')
              .filter((style) => style)
              .map((style) => toClassName(style.trim()));
            styles.forEach((style) => section.classList.add(style));
          }
          if (meta.columns) {
            const columns = meta.columns
              .split(',')
              .filter((column) => column)
              .map((column) => toClassName(column.trim()));
            columns.forEach((column) => section.classList.add(column));
          }
          if (meta['tablet-columns']) {
            const columns = meta['tablet-columns']
              .split(',')
              .filter((column) => column)
              .map((column) => toClassName(column.trim()));
            columns.forEach((column) => section.classList.add(column));
          }
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }

    // Check data attributes for bottomMargin
    const bottomMarginData = section.dataset.bottommargin
                            || section.dataset.bottomMargin
                            || section.getAttribute('data-bottommargin')
                            || section.getAttribute('data-bottom-margin');
    if (bottomMarginData) {
      const rawValue = bottomMarginData.trim();
      const marginValue = normalizeBottomMarginClass(toClassName(rawValue));
      const className = marginValue && `bottom-margin-${marginValue}`;
      if (className && !section.classList.contains(className)) {
        section.classList.add(className);
      }
    }
  });
}

// --- NEW FUNCTION: decorateSectionColumn ---
// Wraps a single section's children (used for sections inside {BLOCK_NAME} containers)

function decorateSectionColumn(section) {
  const wrappers = [];
  let defaultContent = false;
  [...section.children].forEach((e) => {
    if ((e.tagName === 'DIV' && e.className) || !defaultContent) {
      const wrapper = document.createElement('div');
      wrappers.push(wrapper);
      defaultContent = e.tagName !== 'DIV' || !e.className;
      if (defaultContent) wrapper.classList.add('default-content-wrapper');
    }
    wrappers[wrappers.length - 1].append(e);
  });
  wrappers.forEach((wrapper) => section.append(wrapper));
  section.classList.add('section');
  section.dataset.sectionStatus = 'initialized';
  section.style.display = 'none';

  // Process section metadata
  const sectionMeta = section.querySelector('div.section-metadata');
  if (sectionMeta) {
    const meta = readBlockConfig(sectionMeta);
    Object.keys(meta).forEach((key) => {
      const normalizedKey = key.toLowerCase().replace(/-/g, '');
      if (normalizedKey === 'bottommargin') {
        if (meta[key]) {
          const rawValue = meta[key].trim();
          const marginValue = normalizeBottomMarginClass(toClassName(rawValue));
          if (marginValue) {
            section.classList.add(`bottom-margin-${marginValue}`);
          }
        }
      } else if (key === 'style') {
        if (meta.style) {
          const styles = meta.style
            .split(',')
            .filter((style) => style)
            .map((style) => toClassName(style.trim()));
          styles.forEach((style) => section.classList.add(style));
        }
      } else {
        section.dataset[toCamelCase(key)] = meta[key];
      }
    });
    sectionMeta.parentNode.remove();
  }
}

// --- NEW FUNCTION: decorateSectionsColumn (EXPORT THIS) ---
// Main {BLOCK_NAME} grouping logic. Call this after decorateSections(main).
// Must be exported so editor-support.js can import it.

export function decorateSectionsColumn(main) {
  if (!main) return;

  const decorateUnprocessed = (selector) => {
    main.querySelectorAll(selector).forEach(decorateSectionColumn);
  };

  // Decorate standalone and nested sections
  decorateUnprocessed(':scope > div:not([data-section-status]):not(.{BLOCK_NAME})');
  decorateUnprocessed(':scope > div.{BLOCK_NAME} > div:not([data-section-status])');

  // Process bottomMargin for existing {BLOCK_NAME} containers
  main.querySelectorAll(':scope > div.{BLOCK_NAME}').forEach((gridContainer) => {
    const sectionMeta = gridContainer.querySelector('div.section-metadata');

    // Check data attributes for bottomMargin
    const bottomMarginData = gridContainer.dataset.bottommargin
                            || gridContainer.dataset.bottomMargin
                            || gridContainer.getAttribute('data-bottommargin')
                            || gridContainer.getAttribute('data-bottom-margin');
    if (bottomMarginData) {
      const rawValue = bottomMarginData.trim();
      const marginValue = normalizeBottomMarginClass(toClassName(rawValue));
      if (marginValue) {
        gridContainer.classList.add(`bottom-margin-${marginValue}`);
      }
    }

    // Process bottomMargin from metadata
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        const normalizedKey = key.toLowerCase().replace(/-/g, '');
        if (normalizedKey === 'bottommargin') {
          if (meta[key]) {
            const rawValue = meta[key].trim();
            const marginValue = normalizeBottomMarginClass(toClassName(rawValue));
            if (marginValue) {
              gridContainer.classList.add(`bottom-margin-${marginValue}`);
            }
          }
        }
      });
    }
  });

  // Skip regrouping if current element itself is a {BLOCK_NAME} block
  if (main.classList.contains('{BLOCK_NAME}')) return;

  const colSectionGroups = {};
  let currentGroupIndex = main.querySelectorAll('.{BLOCK_NAME}').length;

  main.querySelectorAll(':scope > div.section').forEach((section) => {
    const isSpanCol = Array.from(section.classList).some((cls) => cls.startsWith('span-col-'));

    if (isSpanCol) {
      const prev = section.previousElementSibling;
      if (prev?.classList.contains('{BLOCK_NAME}')) {
        prev.appendChild(section);
        return;
      }

      (colSectionGroups[currentGroupIndex] ||= []).push(section);
    } else if (colSectionGroups[currentGroupIndex]?.length) {
      currentGroupIndex += 1;
    }
  });

  Object.entries(colSectionGroups).forEach(([index, group]) => {
    if (!group.length) return;
    const wrapper = document.createElement('div');
    wrapper.className = '{BLOCK_NAME}';
    wrapper.id = `{BLOCK_NAME}-${index}`;

    main.replaceChild(wrapper, group[0]);
    wrapper.append(...group);
  });
}
