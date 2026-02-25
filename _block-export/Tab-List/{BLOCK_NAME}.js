import { toClassName, decorateIcons } from '../../scripts/aem.js';
import {
  enableHorizontalScroll,
  setupEventListenerCleanup,
  setSafeInlineTextWithIcons,
  decodeCmsText,
} from '../../utils/generic-utils.js';
import { scrollTabIntoView, updateFadeEffects } from './{BLOCK_NAME}-utils.js';
import { trackElementInteraction } from '../../scripts/analytics/data-layer.js';

let tabsIdx = 0;

/**
 * Convert CMS-generated icon paths to icon syntax.
 * If the CMS auto-linked :icon: syntax to /icons/icon.svg or an AEM resource path,
 * convert it back so the icon can still render (even though the original text may be lost).
 *
 * Handles patterns like:
 * - /icons/add.svg → :add:
 * - /content/nec.resource/icons/add.svg → :add:
 * - text /icons/add.svg → text :add:
 *
 * @param {string} text - Text that may contain icon paths
 * @returns {string} Text with icon paths converted to :icon: syntax
 */
function convertIconPathsToSyntax(text) {
  if (!text || typeof text !== 'string') return text;

  // Check if the ENTIRE text is just a path to an icon (AEM resource path or simple path)
  // Pattern: optional path prefix + /icons/icon-name.svg
  const fullPathMatch = text.match(/^[/\w.-]*\/icons\/([a-zA-Z0-9-]+)\.svg$/);
  if (fullPathMatch) {
    // The entire label is just an icon path - return only the icon syntax
    return `:${fullPathMatch[1]}:`;
  }

  // Otherwise, convert any embedded /icons/icon.svg patterns to :icon: syntax
  // This preserves surrounding text
  return text.replace(/[/\w.-]*\/icons\/([a-zA-Z0-9-]+)\.svg/g, ':$1:');
}

/**
 * Strip same-origin URL prefixes (e.g. http://localhost:3000) from authored text,
 * preserving the path (including leading slash) and any surrounding text.
 *
 * This is primarily to clean up cases where the CMS has auto-linked icons or paths
 * and injected the full origin, which would otherwise show up in the tab label.
 *
 * @param {string} text
 * @returns {string}
 */
function stripSameOriginPrefixes(text) {
  if (!text || typeof text !== 'string') return text;
  if (typeof window === 'undefined' || !window.location?.origin) return text;

  try {
    const { origin } = window.location;
    // Escape origin for use in RegExp
    const escapedOrigin = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const originRegex = new RegExp(escapedOrigin, 'g');
    return text.replace(originRegex, '');
  } catch (e) {
    return text;
  }
}

/**
 * Extract text content from HTML that may contain anchor tags.
 * The CMS may wrap :icon: syntax in anchor tags with href="/icons/icon.svg".
 * This extracts the visible text content while preserving the icon syntax.
 *
 * @param {string} html - HTML string that may contain anchor tags
 * @returns {string} Text content with icon syntax preserved
 */
function extractTextFromHtml(html) {
  if (!html || typeof html !== 'string') return html;

  // Check if it looks like HTML (contains < and >)
  if (!html.includes('<') || !html.includes('>')) return html;

  // Guard for non-browser contexts
  if (typeof document === 'undefined') return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.body?.firstElementChild;
    if (!container) return html;

    // Get the text content which strips all HTML tags but preserves text
    return container.textContent || html;
  } catch (e) {
    return html;
  }
}

/**
 * Normalize authored tab label text:
 * - Extract text from HTML if CMS wrapped content in anchor tags
 * - Decode CMS-escaped text (e.g. `%2F` → `/`, `%20` → space)
 * - Strip origin prefix if CMS added it (e.g. http://localhost:3000/)
 * - Preserve leading slash as authored
 * - Convert CMS-generated icon paths to :icon: syntax for rendering
 *
 * @param {string} rawLabel
 * @returns {string}
 */
export function normalizeTabLabel(rawLabel) {
  // First, try to extract text from HTML (in case CMS wrapped in anchor tags)
  const htmlExtracted = extractTextFromHtml(String(rawLabel || ''));
  const decoded = decodeCmsText(htmlExtracted);
  if (!decoded) return '';

  // Strip same-origin URL prefixes (e.g. http://localhost:3000) while preserving paths
  const withoutOrigin = stripSameOriginPrefixes(decoded);

  // Convert any icon paths to :icon: syntax for proper rendering
  return convertIconPathsToSyntax(withoutOrigin);
}

/**
 * Creates a tab button element with proper ARIA attributes
 * @param {string} tabId - The unique ID for the tab
 * @param {string} tabLabel - The visible text label (may contain :icon: and CMS escapes)
 * @param {string} tabPanelIds - Space-separated panel IDs this tab controls
 * @param {boolean} isSelected - Whether this tab is initially selected
 * @param {Function} clickHandler - Click event handler
 * @returns {HTMLButtonElement} The created tab button
 */
function createTabButton(tabId, tabLabel, tabPanelIds, isSelected, clickHandler) {
  const button = document.createElement('button');
  button.id = tabId;
  button.role = 'tab';
  button.ariaSelected = isSelected;
  button.tabIndex = isSelected ? 0 : -1;
  button.setAttribute('aria-controls', tabPanelIds);
  // Render tab label with icon support and decoded CMS text
  setSafeInlineTextWithIcons(button, { text: tabLabel });
  decorateIcons(button);

  // For tabs: remove icon spans completely on error instead of showing fallback text
  // This ensures that if an authored icon like :invalid-icon: doesn't exist,
  // the tab label shows cleanly without the icon syntax or fallback text
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
  // Use closest to handle clicks on child elements (like icons inside the button)
  const targetTab = e.target.closest('button[role="tab"]') || e.target;
  const ariaControls = targetTab.getAttribute('aria-controls');
  if (!ariaControls) return; // Guard against missing attribute
  const targetTabPanelIds = ariaControls.split(' ');
  const [tabGroupPrefix] = targetTabPanelIds[0].split('-panel-');
  const tabList = targetTab.closest('ul[role="tablist"]');

  // Get all tabs for tracking purposes
  const allTabs = [...tabList.querySelectorAll('button[role="tab"]')];
  const currentTabIndex = allTabs.indexOf(targetTab);
  const tabLabel = targetTab.textContent;
  const totalTabs = allTabs.length;

  // Get instance-specific previous tab index
  const previousTabIndex = parseInt(tabList.dataset.previousTabIndex || '-1', 10);

  // Track tab switch event if tabsData is provided (not for initial load)
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

  // Update previous tab index for next switch (store on tabList instance)
  tabList.dataset.previousTabIndex = currentTabIndex.toString();

  // Remove all current selected tabs - look for all tab buttons in the tab list
  tabList
    .querySelectorAll('button[role="tab"]')
    .forEach((t) => t.setAttribute('aria-selected', false));

  // Set this tab as selected
  targetTab.setAttribute('aria-selected', true);

  // Scroll the selected tab into view smoothly and update fades after
  scrollTabIntoView(targetTab, updateFadeCallback);

  // Hide all tab panels
  document
    .querySelectorAll(`[role="tabpanel"][id^="${tabGroupPrefix}-panel-"]`)
    .forEach((p) => p.setAttribute('hidden', ''));

  // Show the selected panel
  targetTabPanelIds.forEach((id) => {
    document.querySelector(`#${id}`).removeAttribute('hidden');
  });
}

/**
 * Decorate the {BLOCK_NAME} block.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tab_role#example
 *
 * @param {Element} block the {BLOCK_NAME} block
 */
export default async function decorate(block) {
  // Extract configuration from the {BLOCK_NAME} block - these come from the dialog
  let listPosition = 'left';

  // find the tab panels and their labels that belong to this {BLOCK_NAME}
  const tabPanels = [];
  const section = block.closest('.section');
  let nextSection = section.nextElementSibling;
  while (nextSection) {
    const { tabLabel } = nextSection.dataset;
    if (tabLabel) {
      // Normalize label for both visual text and IDs
      const normalizedLabel = normalizeTabLabel(tabLabel);
      tabPanels.push([normalizedLabel, nextSection]);
      nextSection = nextSection.nextElementSibling;
    } else {
      break;
    }
  }

  // Look for {BLOCK_NAME} configuration in the last tab panel
  if (tabPanels.length > 0) {
    const lastTabPanel = tabPanels[tabPanels.length - 1][1];
    const tabListBlock = lastTabPanel.querySelector('.{BLOCK_NAME}');

    if (tabListBlock && tabListBlock.children && tabListBlock.children.length > 0) {
      const rows = [...tabListBlock.children];
      listPosition = rows[0].textContent.trim();
    }
  }

  // Create fade overlay elements
  const fadeLeft = document.createElement('div');
  fadeLeft.className = '{BLOCK_NAME}-fade-left';

  const fadeRight = document.createElement('div');
  fadeRight.className = '{BLOCK_NAME}-fade-right';

  // Initialize fade effects update function early
  const updateFades = () => updateFadeEffects(block, fadeLeft, fadeRight);

  // create the {BLOCK_NAME} DOM itself
  const tabsPrefix = `tabs-${tabsIdx += 1}`;
  const tabList = document.createElement('ul');
  tabList.role = 'tablist';
  tabList.id = `${tabsPrefix}-tablist`;

  // Apply position class to the tab list
  tabList.classList.add(`position-${listPosition}`);

  tabPanels.forEach(([tabLabel, tabPanel], i) => {
    // Include index to ensure unique IDs even if labels are the same
    const tabId = `${tabsPrefix}-tab-${i}-${toClassName(tabLabel)}`;
    const tabPanelId = `${tabsPrefix}-panel-${i}-${toClassName(tabLabel)}`;

    // Create tab button using helper function
    const tabItem = createTabButton(
      tabId,
      tabLabel,
      tabPanelId,
      i === 0,
      (e) => changeTabs(e, updateFades, { enableTracking: true }),
    );

    // Append button directly to tabList (no li wrapper for proper ARIA structure)
    tabList.appendChild(tabItem);

    // update the tab panel to use the tab id
    tabPanel.id = tabPanelId;
    tabPanel.setAttribute('aria-labelledby', tabId);
    tabPanel.classList.add('hidden');

    // set tab panel attributes
    tabPanel.role = 'tabpanel';
    tabPanel.tabIndex = 0;
    if (i > 0) tabPanel.setAttribute('hidden', '');
  });

  const tabs = [...tabList.querySelectorAll('[role="tab"]')];

  // if the {BLOCK_NAME} has the showall class, add a tab for all the tabs
  if (block.classList.contains('showall')) {
    const tabId = `${tabsPrefix}-tab-all`;
    const tabPanelIds = [...tabs].map((t) => t.getAttribute('aria-controls')).join(' ');

    // Create "All" tab button using helper function
    const tabItem = createTabButton(
      tabId,
      'All',
      tabPanelIds,
      true,
      (e) => changeTabs(e, updateFades, { enableTracking: true }),
    );

    // Append button directly to tabList (no li wrapper for proper ARIA structure)
    tabList.prepend(tabItem);
    tabs.unshift(tabItem);

    // set tabIndex for the now second tab to -1
    tabs[1].tabIndex = -1;
    changeTabs({ target: tabItem }, updateFades);
  }

  // Track tabs initialization only if there are tabs
  const finalTabs = [...tabList.querySelectorAll('[role="tab"]')];
  if (finalTabs.length > 0) {
    trackElementInteraction('tabs-init', {
      elementType: 'tabs',
      additionalData: {
        totalTabs: finalTabs.length,
      },
    });
  }

  // Set initial previousTabIndex to the first selected tab (store on tabList instance)
  const initialSelectedTab = finalTabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
  if (initialSelectedTab) {
    tabList.dataset.previousTabIndex = finalTabs.indexOf(initialSelectedTab).toString();
  }

  // Enable arrow navigation between tabs in the tab list
  let tabFocus = 0;

  tabList.addEventListener('keydown', (e) => {
    // Handle arrow navigation (focus only, no selection change)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      tabs[tabFocus].setAttribute('tabindex', -1);
      if (e.key === 'ArrowRight') {
        tabFocus += 1;
        // If we're at the end, go to the start
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
        // Move left
      } else if (e.key === 'ArrowLeft') {
        tabFocus -= 1;
        // If we're at the start, move to the end
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute('tabindex', 0);
      tabs[tabFocus].focus();

      // Scroll the focused tab into view smoothly and update fades after
      scrollTabIntoView(tabs[tabFocus], updateFades);
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Handle Enter/Space to actually select the focused tab
      e.preventDefault();
      changeTabs({ target: tabs[tabFocus] }, updateFades, { enableTracking: true });
    }
  });

  block.replaceChildren(tabList);

  // Get or create wrapper element for fade overlays
  let wrapper = block.parentElement;
  if (!wrapper || !wrapper.classList.contains('{BLOCK_NAME}-wrapper')) {
    // If no wrapper exists, create one
    wrapper = document.createElement('div');
    wrapper.className = '{BLOCK_NAME}-wrapper';
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);
  }

  // Append fade overlay elements to wrapper (not to block)
  // This keeps them fixed to viewport while block content scrolls
  wrapper.appendChild(fadeLeft);
  wrapper.appendChild(fadeRight);

  // Enable horizontal scrolling with mouse wheel on desktop
  enableHorizontalScroll(block, { smooth: true });

  // Initial check now that everything is set up
  updateFades();

  // Update fade effects during scroll for immediate visual feedback
  block.addEventListener('scroll', updateFades, { passive: true });

  // Update when scroll ends for final position check
  if ('onscrollend' in window) {
    block.addEventListener('scrollend', updateFades, { passive: true });
  }

  // Update on window resize
  window.addEventListener('resize', updateFades);

  // Use ResizeObserver to detect when tab list size changes (e.g., content loaded, tabs added)
  // This handles all layout changes without the feedback loop issues of MutationObserver
  let resizeObserver;
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(updateFades);
    resizeObserver.observe(block);
    resizeObserver.observe(tabList);
  }

  // Setup automatic cleanup of event listeners when block is removed from DOM
  const eventHandlers = [
    { element: block, event: 'scroll', handler: updateFades },
    { element: window, event: 'resize', handler: updateFades },
  ];

  if ('onscrollend' in window) {
    eventHandlers.push({ element: block, event: 'scrollend', handler: updateFades });
  }

  // Use generic utility for event listener cleanup (auto-cleans when block removed from DOM)
  setupEventListenerCleanup(block, eventHandlers);

  // Extend cleanup to also disconnect ResizeObserver
  const originalCleanup = block.cleanup;
  block.cleanup = () => {
    originalCleanup();
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  };
}
