/*
 * {BLOCK_FUNC} Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/aem.js';
import { trackElementInteraction } from '../../scripts/analytics/data-layer.js';
import {
  processContentWithIconsAndLink,
  sanitizeText,
  normalizeAltText,
} from '../../utils/generic-utils.js';

/**
 * @typedef {Object} {BLOCK_FUNC}Config
 * @property {string} [{BLOCK_VAR}Header] Optional header text displayed above the list
 * @property {string} [styleVariation] Layout variant
 * @property {boolean} [singleExpand] If true, only one item can be open at a time
 * @property {number} [defaultExpandedIndex] Zero-based index of initially expanded item
 */

/**
 * Decorates a {BLOCK_NAME} block with interactive behavior and accessibility.
 * Parses authored content into items and wires animations, ARIA, and keyboard support.
 *
 * @param {HTMLElement} block {BLOCK_NAME} block element
 * @returns {void}
 */
export default function decorate(block) {
  // Capture existing rows BEFORE inserting any new nodes
  const rows = [...block.children];

  // Apply block-level authored options (from xwalk data attributes if present)
  const {BLOCK_VAR}Header = block.dataset['{BLOCK_VAR}Header'] || block.getAttribute('data-{BLOCK_NAME}-header');
  const styleVariation = (block.dataset.styleVariation || block.getAttribute('data-style-variation') || '').trim();
  const singleExpand = (block.dataset.singleExpand || block.getAttribute('data-single-expand')) ?? 'false';
  const defaultExpandedIndexAttr = block.dataset.defaultExpandedIndex || block.getAttribute('data-default-expanded-index');

  // Default to -1 (no items expanded) when no attribute is set
  let defaultExpandedIndex = -1;
  if (defaultExpandedIndexAttr !== undefined && defaultExpandedIndexAttr !== null && defaultExpandedIndexAttr !== '') {
    const parsedIndex = Number(defaultExpandedIndexAttr);
    if (Number.isFinite(parsedIndex)) {
      defaultExpandedIndex = parsedIndex;
    }
  }

  // Try to derive missing block-level fields from authored rows (compat with table authoring)
  let derivedHeader = '';
  let derivedVariation = '';
  const remainingRows = [];
  rows.forEach((row) => {
    const rowText = row.textContent ? row.textContent.trim() : '';
    const lc = rowText.toLowerCase();
    const isVariation = ['expanded', 'full bleed', 'full-bleed', 'expanded/full bleed', 'stacked right', 'stacked-right']
      .includes(lc);
    const isPotentialHeader = !derivedHeader
      && row.children.length === 1
      && row.children[0].children.length <= 1
      && rowText.length > 0
      && !isVariation;

    if (isVariation) {
      // normalize
      if (lc.includes('stacked') && lc.includes('right')) derivedVariation = 'stacked-right';
      else derivedVariation = 'expanded';
      row.remove();
    } else if (isPotentialHeader) {
      const firstCell = row.children[0];
      derivedHeader = (firstCell && firstCell.innerHTML)
        ? firstCell.innerHTML.trim()
        : rowText;
      row.remove();
    } else {
      remainingRows.push(row);
    }
  });

  // Render optional block header (insert before the first captured row)
  if ({BLOCK_VAR}Header || derivedHeader) {
    const headerEl = document.createElement('h3');
    headerEl.className = '{BLOCK_CLASS}-block-header';
    const rawContent = {BLOCK_VAR}Header || derivedHeader;
    headerEl.innerHTML = processContentWithIconsAndLink(rawContent).content;

    // Ensure newly added icons are decorated consistently
    decorateIcons(headerEl);

    if (remainingRows.length > 0) {
      block.insertBefore(headerEl, remainingRows[0]);
    } else {
      block.appendChild(headerEl);
    }
  }

  // Apply style variation class on the block
  const finalVariation = (styleVariation || derivedVariation || 'expanded');
  let normalized = finalVariation
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Map specific variations to their expected class names
  if (normalized === 'full-bleed' || normalized === 'fullbleed' || normalized === 'expandedfull-bleed') {
    normalized = 'expanded';
  }

  // Supported: expanded (Expanded/Full Bleed), stacked-right
  block.classList.add(`{BLOCK_NAME}-${normalized}`);

  // Create items container next to the block header
  const list = document.createElement('div');
  list.className = '{BLOCK_CLASS}-list';
  // Insert after the header if it exists, otherwise at start
  const headerSibling = block.querySelector('.{BLOCK_CLASS}-block-header');
  if (headerSibling && headerSibling.nextSibling) {
    block.insertBefore(list, headerSibling.nextSibling);
  } else if (headerSibling) {
    block.appendChild(list);
  } else if (remainingRows.length > 0) {
    block.insertBefore(list, remainingRows[0]);
  } else {
    block.appendChild(list);
  }

  remainingRows.forEach((row) => {
    if (!row || !row.children || row.children.length === 0) return;

    // First cell should contain the item header and possibly some content
    const firstCell = row.children[0];
    if (!firstCell) return;

    // Determine header node: prefer a heading, else first element/text
    const headerNode = firstCell.querySelector('h1, h2, h3, h4, h5, h6')
      || firstCell.firstElementChild
      || null;

    // If no header text at all, skip creating an empty item
    const headerText = (headerNode ? headerNode.textContent : firstCell.textContent) || '';
    if (!headerText.trim()) return;

    // Build summary using h5 tag (always create h5, process content for icons)
    const summary = document.createElement('summary');
    summary.className = '{BLOCK_CLASS}-item-label';
    // Note: summary element has native button semantics, so we don't add role="button"
    // Note: Plus/minus icons are CSS pseudo-elements (::before/::after) which are automatically
    // hidden from screen readers, so no aria-hidden is needed
    summary.setAttribute('aria-expanded', 'false');

    const headerClone = document.createElement('h5');
    headerClone.className = '{BLOCK_CLASS}-item-title';

    // Use innerHTML to preserve HTML structure; tokenize icons only in text, never in href
    const rawHeaderContent = (headerNode ? headerNode.innerHTML : firstCell.innerHTML) || '';
    const headerContentResult = processContentWithIconsAndLink(rawHeaderContent);
    headerClone.innerHTML = sanitizeText(headerContentResult.content, { richHTML: true });
    summary.appendChild(headerClone);
    // Ensure newly added icons are decorated consistently
    decorateIcons(summary);

    const body = document.createElement('div');
    body.className = '{BLOCK_CLASS}-item-body';
    body.setAttribute('role', 'region');

    // Generate unique IDs for accessibility
    const itemId = `{BLOCK_NAME}-item-${Math.random().toString(36).substr(2, 9)}`;
    const headerId = `${itemId}-header`;
    const contentId = `${itemId}-content`;

    // Set up ARIA relationships
    summary.setAttribute('id', headerId);
    summary.setAttribute('aria-controls', contentId);
    body.setAttribute('id', contentId);
    body.setAttribute('aria-labelledby', headerId);

    if (row.children.length > 1) {
      for (let i = 1; i < row.children.length; i += 1) {
        const cloned = row.children[i].cloneNode(true);
        // Skip empty wrappers with no meaningful content
        const hasMedia = cloned.querySelector('picture, img');
        const hasText = cloned.textContent && cloned.textContent.trim().length > 0;
        if (!hasMedia && !hasText) continue; // eslint-disable-line no-continue
        body.appendChild(cloned);
      }
    } else {
      // Append other children from firstCell except the header node
      [...firstCell.childNodes].forEach((node) => {
        if (headerNode && node === headerNode) return;
        // Skip empty text nodes and empty elements
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Skip elements with no meaningful content (no text, no children, or only whitespace)
          const hasContent = node.textContent.trim() || node.children.length > 0;
          if (!hasContent) return;
        }
        body.appendChild(node.cloneNode ? node.cloneNode(true) : document.createTextNode(node.textContent || ''));
      });
    }

    // Post-process: remove any residual empty wrappers and add semantic wrapper classes
    const directChildren = [...body.children];
    directChildren.forEach((child) => {
      const hasMedia = child.querySelector('picture, img');
      const hasText = child.textContent && child.textContent.trim().length > 0;
      if (!hasMedia && !hasText) child.remove();
    });

    let mediaTagged = false;
    [...body.children].forEach((child) => {
      if (!mediaTagged && child.querySelector('picture, img')) {
        child.classList.add('{BLOCK_CLASS}-item-media');
        mediaTagged = true;
      } else {
        child.classList.add('{BLOCK_CLASS}-item-content');
      }
    });

    if (mediaTagged) {
      body.classList.add('has-media');
    }

    // Normalize any authored image alt text inside the {BLOCK_NAME} content.
    // Alt text should be plain text; strip icon tokens and leading "/" artifacts.
    body.querySelectorAll('img').forEach((img) => {
      const currentAlt = img.getAttribute('alt') || '';
      const cleanedAlt = normalizeAltText(currentAlt);
      img.setAttribute('alt', cleanedAlt);
    });

    // Create details item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = '{BLOCK_CLASS}-item';
    // The body div below has role="region" with aria-labelledby for the expandable content area
    details.append(summary, body);
    list.appendChild(details);
    row.remove();
  });

  // Behavior: single-expand and default expanded + animations
  const items = [...list.querySelectorAll('.{BLOCK_CLASS}-item')];

  // Helpers for smooth height animations
  const getBody = (detailsEl) => detailsEl.querySelector('.{BLOCK_CLASS}-item-body');

  // Track animation states to prevent conflicts
  const animationStates = new WeakMap();
  // Track per-item after-close callbacks for delegated transition handling
  const afterCloseCallbacks = new WeakMap();

  const animateOpen = (detailsEl) => {
    const body = getBody(detailsEl);
    if (!body) return;

    // Prevent multiple animations on the same element
    if (animationStates.get(detailsEl) === 'opening') return;
    animationStates.set(detailsEl, 'opening');

    detailsEl.classList.add('is-opening');
    detailsEl.classList.remove('is-closing');

    // Ensure we start from 0 height
    body.style.height = '0px';
    body.style.opacity = '0';

    // Force reflow to ensure the 0 height is applied
    // eslint-disable-next-line no-unused-expressions
    body.offsetHeight;

    // Trigger the animation by setting the target height
    const targetHeight = body.scrollHeight;
    body.style.height = `${targetHeight}px`;
    body.style.opacity = '1';

    // Fallback: clear state using requestAnimationFrame for better performance
    const fallbackCleanup = () => {
      if (animationStates.get(detailsEl) === 'opening') {
        body.style.height = 'auto';
        detailsEl.classList.remove('is-opening');
        animationStates.delete(detailsEl);
      }
    };

    // Use requestAnimationFrame for more reliable timing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (animationStates.get(detailsEl) === 'opening') {
          fallbackCleanup();
        }
      });
    });
  };

  const animateClose = (detailsEl, afterClose) => {
    const body = getBody(detailsEl);
    if (!body) return;

    // Prevent multiple animations on the same element
    if (animationStates.get(detailsEl) === 'closing') return;
    animationStates.set(detailsEl, 'closing');

    detailsEl.classList.add('is-closing');
    detailsEl.classList.remove('is-opening');

    // Get current height before starting animation
    const currentHeight = body.offsetHeight || body.scrollHeight;
    body.style.height = `${currentHeight}px`;

    // Force reflow to ensure the current height is applied
    // eslint-disable-next-line no-unused-expressions
    body.offsetHeight;

    // Trigger the close animation
    body.style.height = '0px';
    body.style.opacity = '0';

    // Store callback for delegated transitionend handling
    if (typeof afterClose === 'function') {
      afterCloseCallbacks.set(detailsEl, afterClose);
    }

    // Fallback: clear state using requestAnimationFrame for better performance
    const fallbackCleanup = () => {
      if (animationStates.get(detailsEl) === 'closing') {
        detailsEl.classList.remove('is-closing');
        animationStates.delete(detailsEl);
        const cb = afterCloseCallbacks.get(detailsEl);
        if (cb) {
          afterCloseCallbacks.delete(detailsEl);
          cb();
        }
      }
    };

    // Use requestAnimationFrame for more reliable timing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (animationStates.get(detailsEl) === 'closing') {
          fallbackCleanup();
        }
      });
    });
  };

  // Keep body height accurate when content changes while open
  const resizeObservers = [];
  const observeBody = (detailsEl) => {
    const body = getBody(detailsEl);
    if (!body) return;

    let resizeTimeout;
    const ro = new ResizeObserver(() => {
      // Only handle resize if item is open and not currently animating
      if (detailsEl.open && body.style.height === 'auto' && !animationStates.has(detailsEl)) {
        // Debounce resize events to prevent flickering
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Only update if still open and not animating
          if (detailsEl.open && body.style.height === 'auto' && !animationStates.has(detailsEl)) {
            const newHeight = body.scrollHeight;
            // Only update if height actually changed significantly
            if (Math.abs(parseFloat(body.style.height) - newHeight) > 1) {
              body.style.height = `${newHeight}px`;
            }
          }
        }, 16); // ~60fps
      }
    });
    ro.observe(body);
    resizeObservers.push(ro);
  };
  items.forEach(observeBody);
  const isSingle = String(singleExpand).toLowerCase() !== 'false';

  // Single delegated transitionend handler on the {BLOCK_NAME} block
  const onTransitionEnd = ({ target, propertyName }) => {
    if (!target || !target.classList || propertyName !== 'height') return;
    if (!target.classList.contains('{BLOCK_CLASS}-item-body')) return;

    const detailsEl = target.closest('.{BLOCK_CLASS}-item');
    if (!detailsEl) return;

    // Handle end of opening animation
    if (animationStates.get(detailsEl) === 'opening') {
      target.style.height = 'auto';
      detailsEl.classList.remove('is-opening');
      animationStates.delete(detailsEl);
      return;
    }

    // Handle end of closing animation
    if (animationStates.get(detailsEl) === 'closing') {
      detailsEl.classList.remove('is-closing');
      animationStates.delete(detailsEl);
      const cb = afterCloseCallbacks.get(detailsEl);
      if (cb) {
        afterCloseCallbacks.delete(detailsEl);
        cb();
      }
    }
  };
  block.addEventListener('transitionend', onTransitionEnd);

  // Helper function to update first-item-open class for stacked-right
  function updateFirstItemOpenClass() {
    if (block.classList.contains('{BLOCK_CLASS}-stacked-right')) {
      const firstItem = items[0];
      if (firstItem && firstItem.open) {
        block.classList.add('first-item-open');
      } else {
        block.classList.remove('first-item-open');
      }
    }
  }

  // Helper to manage tabindex on interactive elements within {BLOCK_NAME} content
  const updateContentTabindex = (detailsEl, isExpanded) => {
    const body = getBody(detailsEl);
    if (!body) return;

    // Find all interactive elements within the {BLOCK_NAME} content
    const interactiveElements = body.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]',
    );

    interactiveElements.forEach((element) => {
      if (isExpanded) {
        // When expanded, restore original tabindex
        const { originalTabindex } = element.dataset;
        if (originalTabindex !== undefined) {
          // Restore the original tabindex value
          if (originalTabindex === 'null') {
            // Original had no tabindex, remove it
            element.removeAttribute('tabindex');
          } else {
            // Restore the original value
            element.setAttribute('tabindex', originalTabindex);
          }
          // Clean up the data attribute
          delete element.dataset.originalTabindex;
        } else if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '-1') {
          // Element was set to -1 but has no stored original value
          // This means it was set to -1 by our collapse logic, but we don't have the original
          // Only restore natural focus for links/buttons; leave other elements as -1
          // to respect any intentional accessibility behavior
          if (element.tagName === 'A' || element.tagName === 'BUTTON') {
            // Links and buttons should use natural focus when expanded
            element.removeAttribute('tabindex');
          }
          // For other elements with tabindex="-1" and no stored value, leave it as -1
          // This respects intentional accessibility behavior (e.g., intentionally non-focusable)
        }
      } else {
        // When collapsed, prevent focus on content elements
        // Store original tabindex value before changing it
        const currentTabindex = element.getAttribute('tabindex');
        if (currentTabindex !== '-1') {
          // Store the original value (use 'null' string to represent no attribute)
          element.dataset.originalTabindex = currentTabindex === null ? 'null' : currentTabindex;
          // Set to -1 to prevent focus
          element.setAttribute('tabindex', '-1');
        }
      }
    });
  };

  const openItem = (detailsEl) => {
    if (detailsEl.open) return;
    detailsEl.open = true;
    const body = getBody(detailsEl);
    if (body) body.style.opacity = '1';

    // Update ARIA attributes for screen readers
    const summary = detailsEl.querySelector('summary');
    if (summary) {
      summary.setAttribute('aria-expanded', 'true');
    }

    // Make content elements focusable when expanded
    updateContentTabindex(detailsEl, true);

    animateOpen(detailsEl);
  };

  const closeItem = (detailsEl) => {
    if (!detailsEl.open) return;

    // Prevent focus on content elements when collapsing
    updateContentTabindex(detailsEl, false);

    animateClose(detailsEl, () => {
      detailsEl.open = false;

      // Update ARIA attributes for screen readers
      const summary = detailsEl.querySelector('summary');
      if (summary) {
        summary.setAttribute('aria-expanded', 'false');
      }

      // Update first-item-open class after closing animation completes
      updateFirstItemOpenClass();
    });
  };

  const toggleItem = (detailsEl) => {
    // Prevent toggling during animations
    if (animationStates.has(detailsEl)) {
      return;
    }

    // Get {BLOCK_NAME} item details for tracking
    const {BLOCK_VAR}Index = items.indexOf(detailsEl);
    const summary = detailsEl.querySelector('summary');
    const {BLOCK_VAR}Title = (summary?.textContent || '').trim();
    const action = detailsEl.open ? 'close' : 'open';

    // Track {BLOCK_NAME} toggle event with error handling
    try {
      trackElementInteraction('{BLOCK_NAME}-toggle', {
        elementType: '{BLOCK_NAME}',
        elementId: summary?.id || '',
        elementText: {BLOCK_VAR}Title,
        additionalData: {
          action,
          ['{BLOCK_VAR}Index']: {BLOCK_VAR}Index,
          ['{BLOCK_VAR}Title']: {BLOCK_VAR}Title,
          totalItems: items.length,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to track {BLOCK_NAME} toggle event:', error);
    }

    if (detailsEl.open) {
      closeItem(detailsEl);
    } else if (isSingle) {
      let anyClosed = false;
      items.forEach((other) => {
        if (other !== detailsEl && other.open) {
          closeItem(other);
          anyClosed = true;
        }
      });

      if (anyClosed) {
        // Wait for close animation to complete before opening
        const openAfterClose = () => {
          // Double-check that we're not in an animation state
          if (!animationStates.has(detailsEl)) {
            const body = getBody(detailsEl);
            if (body) {
              body.style.height = '0px';
              body.style.opacity = '0';
            }
            openItem(detailsEl);
            updateFirstItemOpenClass();
          }
        };

        // Use requestAnimationFrame for better timing synchronization
        requestAnimationFrame(() => {
          requestAnimationFrame(openAfterClose);
        });
      } else {
        openItem(detailsEl);
        updateFirstItemOpenClass();
      }
    } else {
      openItem(detailsEl);
      updateFirstItemOpenClass();
    }
  };

  // Keyboard navigation support
  const handleKeyDown = (event, detailsEl) => {
    const { key } = event;
    const currentIndex = items.indexOf(detailsEl);

    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleItem(detailsEl);
        break;

      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, items.length - 1);
        if (nextIndex !== currentIndex) {
          const nextSummary = items[nextIndex].querySelector('summary');
          if (nextSummary) nextSummary.focus();
        }
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        if (prevIndex !== currentIndex) {
          const prevSummary = items[prevIndex].querySelector('summary');
          if (prevSummary) prevSummary.focus();
        }
        break;
      }

      case 'Home': {
        event.preventDefault();
        const firstSummary = items[0].querySelector('summary');
        if (firstSummary) firstSummary.focus();
        break;
      }

      case 'End': {
        event.preventDefault();
        const lastSummary = items[items.length - 1].querySelector('summary');
        if (lastSummary) lastSummary.focus();
        break;
      }

      default:
        // Allow other keys to bubble up
        break;
    }
  };

  // Add cleanup function to the block for potential future use
  block.{BLOCK_VAR}Cleanup = () => {
    resizeObservers.forEach((ro) => ro.disconnect());
    resizeObservers.length = 0;
    // WeakMap doesn't have clear(), so we'll just clear the array
    // animationStates.clear();
    block.removeEventListener('transitionend', onTransitionEnd);
  };

  // Add debug function to check animation states
  block.{BLOCK_VAR}Debug = () => {
    const animationStatesArray = [];
    // WeakMap is not iterable, so we need to check each item individually
    items.forEach((item) => {
      if (animationStates.has(item)) {
        animationStatesArray.push([item, animationStates.get(item)]);
      }
    });
    return {
      animationStates: animationStatesArray,
      itemsOpenState: items.map((item, idx) => ({
        index: idx,
        open: item.open,
        hasAnimation: animationStates.has(item),
      })),
    };
  };

  // Initialize state and bind custom toggle to summaries
  const setupItemEventListeners = (it, idx, openIndex) => {
    const body = getBody(it);
    if (idx === openIndex) {
      it.open = true;
      if (body) {
        body.style.height = 'auto';
        body.style.opacity = '1';
      }
      // Set initial ARIA state for open items
      const summary = it.querySelector('summary');
      if (summary) {
        summary.setAttribute('aria-expanded', 'true');
      }
      // Make content elements focusable when initially open
      updateContentTabindex(it, true);
    } else {
      it.open = false;
      if (body) {
        body.style.height = '0px';
        body.style.opacity = '0';
      }
      // Set initial ARIA state for closed items
      const summary = it.querySelector('summary');
      if (summary) {
        summary.setAttribute('aria-expanded', 'false');
      }
      // Prevent focus on content elements when initially closed
      updateContentTabindex(it, false);
    }

    const summary = it.querySelector('summary');
    if (summary) {
      // Note: summary is already focusable by default, no need for tabindex="0"

      // Click handler
      summary.addEventListener('click', (ev) => {
        ev.preventDefault();
        toggleItem(it);
      });

      // Keyboard navigation
      summary.addEventListener('keydown', (ev) => {
        handleKeyDown(ev, it);
      });
    }
  };

  // Determine which item (if any) should be initially expanded
  // -1 means no items expanded, otherwise validate index is within bounds
  const openIndex = defaultExpandedIndex < 0
    ? -1
    : Math.min(Math.max(0, defaultExpandedIndex), Math.max(0, items.length - 1));

  items.forEach((it, idx) => {
    setupItemEventListeners(it, idx, openIndex);
  });

  // Set initial first-item-open class
  updateFirstItemOpenClass();

  // Track {BLOCK_NAME} initialization with error handling
  try {
    trackElementInteraction('{BLOCK_NAME}-init', {
      elementType: '{BLOCK_NAME}',
      additionalData: {
        totalItems: items.length,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to track {BLOCK_NAME} initialization event:', error);
  }
}
