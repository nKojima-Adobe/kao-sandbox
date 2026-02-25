/**
 * Utility functions for {BLOCK_NAME} component
 */

// Constants for fade effects and padding calculations
const FADE_DETECTION_THRESHOLD = 5; // pixels of tolerance for overflow detection
const MINIMUM_PADDING = 20; // 20px left padding for position-center

/**
 * Scrolls a tab button into view smoothly
 * @param {HTMLElement} tab - The tab button element to scroll into view
 * @param {Function} callback - Optional callback to run after scroll
 */
export function scrollTabIntoView(tab, callback) {
  const container = tab.closest('.{BLOCK_NAME}');
  if (!container) return;

  const tabList = tab.closest('ul[role="tablist"]');
  const isPositionCenter = tabList && tabList.classList.contains('position-center');

  // For position-center, only scroll if tab is not visible
  // Don't use 'center' alignment to avoid shifting the entire list
  if (isPositionCenter) {
    const containerRect = container.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    // Only scroll if tab is outside visible area
    if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
      tab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest', // Changed from 'center' to 'nearest'
      });
    }
  } else {
    // For other positions, use standard scroll
    tab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }

  // Use scrollend event if available, otherwise call immediately
  if (callback) {
    if ('onscrollend' in window) {
      // Modern browsers: wait for scroll to complete
      const handleScrollEnd = () => {
        callback();
        container.removeEventListener('scrollend', handleScrollEnd);
      };
      container.addEventListener('scrollend', handleScrollEnd, { once: true, passive: true });
    } else {
      // Fallback: call immediately for instant feedback
      callback();
    }
  }
}

/**
 * Updates fade effects based on scroll position and overflow state
 * Also manages dynamic padding for position-center when content overflows
 * @param {HTMLElement} container - The {BLOCK_NAME} container element
 * @param {HTMLElement} fadeLeft - The left fade overlay element
 * @param {HTMLElement} fadeRight - The right fade overlay element
 */
export function updateFadeEffects(container, fadeLeft, fadeRight) {
  const tabList = container.querySelector('ul[role="tablist"]');
  if (!tabList) return;

  const tabs = tabList.querySelectorAll('button[role="tab"]');
  if (tabs.length === 0) return;

  const containerRect = container.getBoundingClientRect();
  const firstTab = tabs[0];
  const lastTab = tabs[tabs.length - 1];

  const firstTabRect = firstTab.getBoundingClientRect();
  const lastTabRect = lastTab.getBoundingClientRect();

  // Check if position-center - no left fade for centered lists
  const isPositionCenter = tabList.classList.contains('position-center');

  // For position-center: dynamically add/remove padding class based on content width
  if (isPositionCenter) {
    const tabListWidth = tabList.scrollWidth;
    const containerWidth = container.clientWidth;
    const needsPadding = tabListWidth > (containerWidth - MINIMUM_PADDING);

    if (needsPadding) {
      container.classList.add('needs-padding');
    } else {
      container.classList.remove('needs-padding');
    }
  }

  // Check if there's overflow on the left
  // First tab's left edge is before container's left edge
  const hasOverflowLeft = firstTabRect.left < containerRect.left - FADE_DETECTION_THRESHOLD;

  // Check if there's overflow on the right
  // Last tab's right edge is after container's right edge
  const hasOverflowRight = lastTabRect.right > containerRect.right + FADE_DETECTION_THRESHOLD;

  // Update fade visibility based on actual element visibility
  // Never show left fade for position-center
  if (hasOverflowLeft && !isPositionCenter) {
    fadeLeft.classList.add('visible');
  } else {
    fadeLeft.classList.remove('visible');
  }

  if (hasOverflowRight) {
    fadeRight.classList.add('visible');
  } else {
    fadeRight.classList.remove('visible');
  }
}
