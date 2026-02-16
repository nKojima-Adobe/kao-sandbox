const FADE_DETECTION_THRESHOLD = 5;

/**
 * Scrolls a tab button into view smoothly (only if not already visible)
 * @param {HTMLElement} tab - The tab button element
 * @param {Function} callback - Optional callback after scroll
 */
export function scrollTabIntoView(tab, callback) {
  const container = tab.closest('.tab-list');
  if (!container) return;

  const hasOverflow = container.scrollWidth > container.clientWidth;
  if (!hasOverflow) {
    if (callback) callback();
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();

  if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
    tab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });

    if (callback) {
      if ('onscrollend' in window) {
        container.addEventListener('scrollend', () => callback(), { once: true, passive: true });
      } else {
        callback();
      }
    }
  } else if (callback) {
    callback();
  }
}

/**
 * Updates fade overlay visibility based on scroll overflow
 * @param {HTMLElement} container - The tab-list container element
 * @param {HTMLElement} fadeLeft - The left fade overlay
 * @param {HTMLElement} fadeRight - The right fade overlay
 */
export function updateFadeEffects(container, fadeLeft, fadeRight) {
  const hasOverflow = container.scrollWidth > container.clientWidth;

  if (!hasOverflow) {
    fadeLeft.classList.remove('visible');
    fadeRight.classList.remove('visible');
    return;
  }

  const tabList = container.querySelector('ul[role="tablist"]');
  if (!tabList) return;

  const tabs = tabList.querySelectorAll('button[role="tab"]');
  if (tabs.length === 0) return;

  const containerRect = container.getBoundingClientRect();
  const firstTabRect = tabs[0].getBoundingClientRect();
  const lastTabRect = tabs[tabs.length - 1].getBoundingClientRect();

  const hasOverflowLeft = firstTabRect.left < containerRect.left - FADE_DETECTION_THRESHOLD;
  const hasOverflowRight = lastTabRect.right > containerRect.right + FADE_DETECTION_THRESHOLD;

  if (hasOverflowLeft) {
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
