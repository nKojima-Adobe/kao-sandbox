const FADE_DETECTION_THRESHOLD = 5;
const MINIMUM_PADDING = 20;

export function scrollTabIntoView(tab, callback) {
  const container = tab.closest('.tab-list');
  if (!container) return;

  const tabList = tab.closest('ul[role="tablist"]');
  const isPositionCenter = tabList && tabList.classList.contains('position-center');

  if (isPositionCenter) {
    const containerRect = container.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
      tab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  } else {
    tab.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }

  if (callback) {
    if ('onscrollend' in window) {
      const handleScrollEnd = () => {
        callback();
        container.removeEventListener('scrollend', handleScrollEnd);
      };
      container.addEventListener('scrollend', handleScrollEnd, { once: true, passive: true });
    } else {
      callback();
    }
  }
}

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

  const isPositionCenter = tabList.classList.contains('position-center');

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

  const hasOverflowLeft = firstTabRect.left < containerRect.left - FADE_DETECTION_THRESHOLD;
  const hasOverflowRight = lastTabRect.right > containerRect.right + FADE_DETECTION_THRESHOLD;

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
