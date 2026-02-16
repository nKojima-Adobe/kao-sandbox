import { toClassName, decorateIcons } from '../../scripts/aem.js';
import {
  enableHorizontalScroll,
  setupEventListenerCleanup,
  setSafeInlineTextWithIcons,
  decodeCmsText,
} from '../../utils/generic-utils.js';
import { scrollTabIntoView, updateFadeEffects } from './tab-list-utils.js';
import { trackElementInteraction } from '../../scripts/analytics/data-layer.js';

let tabsIdx = 0;

function convertIconPathsToSyntax(text) {
  if (!text || typeof text !== 'string') return text;
  const fullPathMatch = text.match(/^[/\w.-]*\/icons\/([a-zA-Z0-9-]+)\.svg$/);
  if (fullPathMatch) {
    return `:${fullPathMatch[1]}:`;
  }
  return text.replace(/[/\w.-]*\/icons\/([a-zA-Z0-9-]+)\.svg/g, ':$1:');
}

function stripSameOriginPrefixes(text) {
  if (!text || typeof text !== 'string') return text;
  if (typeof window === 'undefined' || !window.location?.origin) return text;
  try {
    const { origin } = window.location;
    const escapedOrigin = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const originRegex = new RegExp(escapedOrigin, 'g');
    return text.replace(originRegex, '');
  } catch (e) {
    return text;
  }
}

function extractTextFromHtml(html) {
  if (!html || typeof html !== 'string') return html;
  if (!html.includes('<') || !html.includes('>')) return html;
  if (typeof document === 'undefined') return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.body?.firstElementChild;
    if (!container) return html;
    return container.textContent || html;
  } catch (e) {
    return html;
  }
}

export function normalizeTabLabel(rawLabel) {
  const htmlExtracted = extractTextFromHtml(String(rawLabel || ''));
  const decoded = decodeCmsText(htmlExtracted);
  if (!decoded) return '';
  const withoutOrigin = stripSameOriginPrefixes(decoded);
  return convertIconPathsToSyntax(withoutOrigin);
}

function createTabButton(tabId, tabLabel, tabPanelIds, isSelected, clickHandler) {
  const button = document.createElement('button');
  button.id = tabId;
  button.role = 'tab';
  button.ariaSelected = isSelected;
  button.tabIndex = isSelected ? 0 : -1;
  button.setAttribute('aria-controls', tabPanelIds);
  setSafeInlineTextWithIcons(button, { text: tabLabel });
  decorateIcons(button);
  button.querySelectorAll('span.icon img').forEach((img) => {
    img.onerror = () => {
      const iconSpan = img.closest('span.icon');
      if (iconSpan) {
        iconSpan.remove();
      }
    };
  });
  button.addEventListener('click', clickHandler);
  return button;
}

export function changeTabs(e, updateFadeCallback, tabsData = null) {
  const targetTab = e.target.closest('button[role="tab"]') || e.target;
  const ariaControls = targetTab.getAttribute('aria-controls');
  if (!ariaControls) return;
  const targetTabPanelIds = ariaControls.split(' ');
  const [tabGroupPrefix] = targetTabPanelIds[0].split('-panel-');
  const tabList = targetTab.closest('ul[role="tablist"]');

  const allTabs = [...tabList.querySelectorAll('button[role="tab"]')];
  const currentTabIndex = allTabs.indexOf(targetTab);
  const tabLabel = targetTab.textContent;
  const totalTabs = allTabs.length;

  const previousTabIndex = parseInt(tabList.dataset.previousTabIndex || '-1', 10);

  if (tabsData && previousTabIndex !== -1) {
    trackElementInteraction('tabs-switch', {
      elementType: 'tabs',
      elementId: targetTab.id,
      elementText: tabLabel,
      additionalData: {
        tabIndex: currentTabIndex,
        tabLabel,
        previousTab: previousTabIndex,
        totalTabs,
      },
    });
  }

  tabList.dataset.previousTabIndex = currentTabIndex.toString();

  tabList
    .querySelectorAll('button[role="tab"]')
    .forEach((t) => t.setAttribute('aria-selected', false));

  targetTab.setAttribute('aria-selected', true);

  scrollTabIntoView(targetTab, updateFadeCallback);

  document
    .querySelectorAll(`[role="tabpanel"][id^="${tabGroupPrefix}-panel-"]`)
    .forEach((p) => p.setAttribute('hidden', ''));

  targetTabPanelIds.forEach((id) => {
    document.querySelector(`#${id}`).removeAttribute('hidden');
  });
}

export default async function decorate(block) {
  let listPosition = 'left';

  const tabPanels = [];
  const section = block.closest('.section');
  let nextSection = section.nextElementSibling;
  while (nextSection) {
    const { tabLabel } = nextSection.dataset;
    if (tabLabel) {
      const normalizedLabel = normalizeTabLabel(tabLabel);
      tabPanels.push([normalizedLabel, nextSection]);
      nextSection = nextSection.nextElementSibling;
    } else {
      break;
    }
  }

  if (tabPanels.length > 0) {
    const lastTabPanel = tabPanels[tabPanels.length - 1][1];
    const tabListBlock = lastTabPanel.querySelector('.tab-list');

    if (tabListBlock && tabListBlock.children && tabListBlock.children.length > 0) {
      const rows = [...tabListBlock.children];
      listPosition = rows[0].textContent.trim();
    }
  }

  const fadeLeft = document.createElement('div');
  fadeLeft.className = 'tab-list-fade-left';

  const fadeRight = document.createElement('div');
  fadeRight.className = 'tab-list-fade-right';

  const updateFades = () => updateFadeEffects(block, fadeLeft, fadeRight);

  const tabsPrefix = `tabs-${tabsIdx += 1}`;
  const tabList = document.createElement('ul');
  tabList.role = 'tablist';
  tabList.id = `${tabsPrefix}-tablist`;

  tabList.classList.add(`position-${listPosition}`);

  tabPanels.forEach(([tabLabel, tabPanel], i) => {
    const tabId = `${tabsPrefix}-tab-${i}-${toClassName(tabLabel)}`;
    const tabPanelId = `${tabsPrefix}-panel-${i}-${toClassName(tabLabel)}`;

    const tabItem = createTabButton(
      tabId,
      tabLabel,
      tabPanelId,
      i === 0,
      (e) => changeTabs(e, updateFades, { enableTracking: true }),
    );

    tabList.appendChild(tabItem);

    tabPanel.id = tabPanelId;
    tabPanel.setAttribute('aria-labelledby', tabId);
    tabPanel.classList.add('hidden');

    tabPanel.role = 'tabpanel';
    tabPanel.tabIndex = 0;
    if (i > 0) tabPanel.setAttribute('hidden', '');
  });

  const tabs = [...tabList.querySelectorAll('[role="tab"]')];

  if (block.classList.contains('showall')) {
    const tabId = `${tabsPrefix}-tab-all`;
    const tabPanelIds = [...tabs].map((t) => t.getAttribute('aria-controls')).join(' ');

    const tabItem = createTabButton(
      tabId,
      'All',
      tabPanelIds,
      true,
      (e) => changeTabs(e, updateFades, { enableTracking: true }),
    );

    tabList.prepend(tabItem);
    tabs.unshift(tabItem);

    tabs[1].tabIndex = -1;
    changeTabs({ target: tabItem }, updateFades);
  }

  const finalTabs = [...tabList.querySelectorAll('[role="tab"]')];
  if (finalTabs.length > 0) {
    trackElementInteraction('tabs-init', {
      elementType: 'tabs',
      additionalData: {
        totalTabs: finalTabs.length,
      },
    });
  }

  const initialSelectedTab = finalTabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
  if (initialSelectedTab) {
    tabList.dataset.previousTabIndex = finalTabs.indexOf(initialSelectedTab).toString();
  }

  let tabFocus = 0;

  tabList.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      tabs[tabFocus].setAttribute('tabindex', -1);
      if (e.key === 'ArrowRight') {
        tabFocus += 1;
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
      } else if (e.key === 'ArrowLeft') {
        tabFocus -= 1;
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute('tabindex', 0);
      tabs[tabFocus].focus();

      scrollTabIntoView(tabs[tabFocus], updateFades);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      changeTabs({ target: tabs[tabFocus] }, updateFades, { enableTracking: true });
    }
  });

  block.replaceChildren(tabList);

  let wrapper = block.parentElement;
  if (!wrapper || !wrapper.classList.contains('tab-list-wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'tab-list-wrapper';
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);
  }

  wrapper.appendChild(fadeLeft);
  wrapper.appendChild(fadeRight);

  enableHorizontalScroll(block, { smooth: true });

  updateFades();

  block.addEventListener('scroll', updateFades, { passive: true });

  if ('onscrollend' in window) {
    block.addEventListener('scrollend', updateFades, { passive: true });
  }

  window.addEventListener('resize', updateFades);

  let resizeObserver;
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(updateFades);
    resizeObserver.observe(block);
    resizeObserver.observe(tabList);
  }

  const eventHandlers = [
    { element: block, event: 'scroll', handler: updateFades },
    { element: window, event: 'resize', handler: updateFades },
  ];

  if ('onscrollend' in window) {
    eventHandlers.push({ element: block, event: 'scrollend', handler: updateFades });
  }

  setupEventListenerCleanup(block, eventHandlers);

  const originalCleanup = block.cleanup;
  block.cleanup = () => {
    originalCleanup();
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  };
}
