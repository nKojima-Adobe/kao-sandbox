/**
 * Hero Block
 * Displays primary content area at the top of a webpage with title, description,
 * optional media (image/video), and CTA buttons
 */

import { decorateIcons } from '../../scripts/aem.js';
import {
  heroParseContent,
  heroBuildMediaWrapper,
  heroBuildVideoWrapper,
  heroCreateScrollTextElement,
  heroInitScrollHint,
} from './hero-utils.js';
import {
  HERO_CSS_CLASSES,
  HERO_DEFAULT_VIDEO_CAPTION,
  generateHeroUID,
} from './hero-constants.js';
import { sanitizeText, sanitizeUrl } from '../../utils/generic-utils.js';
// eslint-disable-next-line no-unused-vars
import fetchPlaceholdersForLocale from '../../scripts/placeholders.js';
import { trackElementInteraction, sanitizeUrlForAnalytics } from '../../scripts/analytics/data-layer.js';

/**
 * Clean up HTML content by removing unnecessary paragraph tags,
 * AEM authoring attributes, and normalizing whitespace
 * @param {string} html - The HTML content to clean
 * @returns {string} - Cleaned HTML content
 */
function cleanHtmlContent(html) {
  if (!html || typeof html !== 'string') return '';

  // Remove AEM authoring attributes (data-aue-*) from all elements
  // This prevents AEM authoring attributes from appearing in the rendered content
  let cleaned = html.replace(/\s*data-aue-[^=]*="[^"]*"/g, '');

  // Convert div tags to p tags for better compatibility with sanitizer
  // This handles cases where AEM outputs div tags that need to be converted
  cleaned = cleaned.replace(/<div\b([^>]*)>/gi, '<p$1>').replace(/<\/div>/gi, '</p>');

  // Remove unnecessary <p> tags that just wrap plain text
  // This handles cases where AEM adds <p> tags around simple text content
  cleaned = cleaned
    .replace(/<p>\s*([^<]+?)\s*<\/p>/g, '$1') // Remove <p> tags around plain text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return cleaned;
}

/**
 * Setup MutationObserver to automatically cleanup when block is removed from DOM
 * Prevents memory leaks in SPAs and dynamic content scenarios
 * @param {HTMLElement} block - The block element to observe
 */
function setupHeroCleanupObserver(block) {
  if (!block || !block.parentNode) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === block && block.heroCleanup) {
          // Block was removed, run cleanup
          block.heroCleanup();
          observer.disconnect();
        }
      });
    });
  });

  // Observe parent for child list changes
  observer.observe(block.parentNode, { childList: true });
}

/**
 * Create custom play/pause button overlay for native video
 * @returns {HTMLButtonElement} - The custom control button
 */
function createVideoControlButton() {
  const controlBtn = document.createElement('button');
  controlBtn.className = HERO_CSS_CLASSES.VIDEO_CONTROL;
  controlBtn.setAttribute('aria-label', 'Pause video');
  controlBtn.setAttribute('type', 'button');
  controlBtn.setAttribute('aria-pressed', 'false');

  const iconSpan = document.createElement('span');
  iconSpan.className = `${HERO_CSS_CLASSES.VIDEO_CONTROL_ICON} ${HERO_CSS_CLASSES.VIDEO_CONTROL_PAUSE}`;
  iconSpan.setAttribute('aria-hidden', 'true');
  controlBtn.appendChild(iconSpan);

  return controlBtn;
}

/**
 * Initialize play/pause controls for native HTML5 video
 * @param {HTMLElement} videoWrapper - The video wrapper element
 * @returns {Function|null} - Cleanup function
 */
function initNativeVideoControls(videoWrapper) {
  const video = videoWrapper.querySelector('video');
  if (!video) return null;

  const controlBtn = createVideoControlButton();
  videoWrapper.appendChild(controlBtn);

  const iconSpan = controlBtn.querySelector('span');
  let isPlaying = !video.paused;

  const updateIcon = (playing) => {
    isPlaying = playing;
    if (playing) {
      iconSpan.className = `${HERO_CSS_CLASSES.VIDEO_CONTROL_ICON} ${HERO_CSS_CLASSES.VIDEO_CONTROL_PAUSE}`;
      controlBtn.setAttribute('aria-label', 'Pause video');
      controlBtn.setAttribute('aria-pressed', 'true');
    } else {
      iconSpan.className = `${HERO_CSS_CLASSES.VIDEO_CONTROL_ICON} ${HERO_CSS_CLASSES.VIDEO_CONTROL_PLAY}`;
      controlBtn.setAttribute('aria-label', 'Play video');
      controlBtn.setAttribute('aria-pressed', 'false');
    }
  };

  const handleClick = () => {
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handlePause = () => updateIcon(false);
  const handlePlay = () => updateIcon(true);

  controlBtn.addEventListener('click', handleClick);
  video.addEventListener('pause', handlePause);
  video.addEventListener('play', handlePlay);

  // Add accessibility
  const caption = HERO_DEFAULT_VIDEO_CAPTION;
  video.setAttribute('aria-label', caption);
  video.setAttribute('title', caption);

  return () => {
    controlBtn.removeEventListener('click', handleClick);
    video.removeEventListener('pause', handlePause);
    video.removeEventListener('play', handlePlay);
  };
}

/**
 * Track CTA button click event
 * @param {number} ctaIndex - Index of the CTA button (0-based)
 * @param {string} ctaText - Text of the CTA button
 * @param {string} ctaType - Type of the CTA button
 * @param {string} ctaHref - URL of the CTA button
 */
function trackCtaClick(ctaIndex, ctaText, ctaType, ctaHref) {
  try {
    // Sanitize URL to convert relative URLs to full URLs and remove sensitive query parameters
    const sanitizedHref = sanitizeUrlForAnalytics(ctaHref);

    trackElementInteraction('hero-cta-click', {
      elementType: 'hero',
      elementText: ctaText,
      elementHref: sanitizedHref,
      additionalData: {
        ctaIndex,
        ctaText,
        ctaType,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error tracking hero CTA click:', error);
  }
}

/**
 * Create CTA button element with cleanup support
 * @param {string} text - Button text
 * @param {string} link - Button link
 * @param {number} index - Index of the CTA button (0-based)
 * @param {string} type - Type of the CTA button
 * @returns {Object} - Object with button element and cleanup function
 */
function createCtaButton(text, link, index = 0, type = 'filled') {
  const button = document.createElement('a');
  button.href = sanitizeUrl(link) || '#';
  button.className = `${HERO_CSS_CLASSES.BUTTON} ${HERO_CSS_CLASSES.CTA_BUTTON}`;
  button.innerHTML = sanitizeText(text || '', { richHTML: true });
  decorateIcons(button);

  // Track CTA button click
  const handleClick = () => {
    trackCtaClick(index, text, type, link || '');
  };

  // Accessibility: allow Space to activate anchor like a button
  const handleKeydown = (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      button.click();
    }
  };

  button.addEventListener('click', handleClick);
  button.addEventListener('keydown', handleKeydown);

  // Return button and cleanup function
  return {
    button,
    cleanup: () => {
      button.removeEventListener('click', handleClick);
      button.removeEventListener('keydown', handleKeydown);
    },
  };
}

/**
 * Decorates the hero block with content
 * @param {HTMLElement} block - The hero block element
 */
export default async function decorate(block) {
  // Track cleanup functions for memory leak prevention
  const cleanupFunctions = [];

  // Extract content from authored structure
  const rows = [...block.children];

  // Clear the block to rebuild with proper structure
  block.innerHTML = '';

  // Parse the authored content using field mapping
  const content = heroParseContent(rows);

  // Destructure content for easier access
  const {
    layout,
    mediaType,
    mediaImage,
    mediaVideo,
    altText,
    caption,
    pretitle,
    title,
    description,
    ctaButtonLink,
    ctaButtonText,
  } = content;

  // Generate unique ID for this hero instance
  const uid = generateHeroUID();
  let titleId = '';

  // Add layout class
  block.classList.add(layout === 'text-only' ? HERO_CSS_CLASSES.LAYOUT_TEXT_ONLY : HERO_CSS_CLASSES.LAYOUT_CONTAINS_MEDIA);

  // Create main container
  const container = document.createElement('div');
  container.className = HERO_CSS_CLASSES.INNER;

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = HERO_CSS_CLASSES.CONTENT;

  // Create inner content wrapper for main hero content
  const contentInner = document.createElement('div');
  contentInner.className = HERO_CSS_CLASSES.CONTENT_INNER;

  // For text-only layout, combine pretitle and title on same line
  if (layout === 'text-only' && pretitle && (pretitle.text || pretitle.processed?.content) && title) {
    const titleEl = document.createElement('h1');
    titleEl.className = `${HERO_CSS_CLASSES.TITLE} ${HERO_CSS_CLASSES.TITLE_WITH_PRETITLE}`;

    const pretitleContent = pretitle.processed?.content ?? pretitle.text;
    const titleContent = title.processed?.content ?? title.text;

    // Create span for pretitle with dash
    // (content from processContentWithIconsAndLink: slash -> text only, no link; icons)
    const pretitleSpan = document.createElement('span');
    pretitleSpan.className = 'hero-pretitle-inline';
    if (pretitleContent) {
      const pretitleText = `${pretitleContent} – `;
      pretitleSpan.innerHTML = sanitizeText(pretitleText, { richHTML: true });
      decorateIcons(pretitleSpan);
    }

    // Create span for title (content already from processContentWithIconsAndLink: slash + icons)
    const titleSpan = document.createElement('span');
    titleSpan.className = 'hero-title-text';
    titleSpan.innerHTML = sanitizeText(titleContent || '', { richHTML: true });
    decorateIcons(titleSpan);

    // Append both spans
    titleEl.appendChild(pretitleSpan);
    titleEl.appendChild(titleSpan);

    titleId = `hero-title-${uid}`;
    titleEl.id = titleId;
    contentInner.appendChild(titleEl);
  } else {
    // For contains-media layout, keep pretitle and title separate
    const pretitleContent = pretitle?.processed?.content ?? pretitle?.text;
    if (pretitleContent && pretitleContent.trim()) {
      const pretitleEl = document.createElement('p');
      pretitleEl.className = HERO_CSS_CLASSES.PRETITLE;
      pretitleEl.innerHTML = sanitizeText(pretitleContent, { richHTML: true });
      decorateIcons(pretitleEl);
      contentInner.appendChild(pretitleEl);
    }

    // Add title content from processContentWithIconsAndLink: slash -> text only, no link; icons
    const titleContent = title?.processed?.content ?? title?.text;
    if (titleContent) {
      const titleEl = document.createElement('h1');
      titleEl.className = HERO_CSS_CLASSES.TITLE;
      titleEl.innerHTML = sanitizeText(titleContent, { richHTML: true });
      decorateIcons(titleEl);

      titleId = `hero-title-${uid}`;
      titleEl.id = titleId;
      contentInner.appendChild(titleEl);
    }
  }

  // Add description if exists
  if (description) {
    const descEl = document.createElement('div');
    descEl.className = HERO_CSS_CLASSES.DESCRIPTION;
    // Clean HTML content and sanitize to prevent XSS attacks, allow rich content
    const cleanedDescription = cleanHtmlContent(description);
    descEl.innerHTML = sanitizeText(cleanedDescription, { richHTML: true });
    contentInner.appendChild(descEl);
  }

  // Add CTA button if both text and link exist
  if (ctaButtonText && ctaButtonLink) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = HERO_CSS_CLASSES.CTA;

    // Determine button type from classes or default to 'filled'
    // For now, we'll use 'filled' as default type
    // This can be extended if button variants are added in the future
    const buttonType = 'filled';
    const buttonIndex = 0; // Currently only one CTA button, index starts at 0

    const { button: ctaButton, cleanup: ctaCleanup } = createCtaButton(
      ctaButtonText,
      ctaButtonLink,
      buttonIndex,
      buttonType,
    );
    ctaWrapper.appendChild(ctaButton);
    contentInner.appendChild(ctaWrapper);

    // Store cleanup function
    cleanupFunctions.push(ctaCleanup);
  }

  // Add content inner to content wrapper
  contentWrapper.appendChild(contentInner);

  // For contains-media layout, create a grid wrapper
  if (layout === 'contains-media') {
    const gridContainer = document.createElement('div');
    gridContainer.className = HERO_CSS_CLASSES.GRID;

    // Add content to grid
    gridContainer.appendChild(contentWrapper);

    // Add media if exists
    let mediaWrapper = null;
    if (mediaType === 'image' && mediaImage) {
      mediaWrapper = heroBuildMediaWrapper(mediaImage, altText, caption);
    } else if (mediaType === 'video' && mediaVideo) {
      mediaWrapper = heroBuildVideoWrapper(mediaVideo, caption);
    }

    if (mediaWrapper) {
      gridContainer.appendChild(mediaWrapper);
    }

    container.appendChild(gridContainer);
  } else {
    // Text-only layout
    container.appendChild(contentWrapper);
  }

  // Wrap everything in a section tag for accessibility
  const section = document.createElement('section');
  section.className = HERO_CSS_CLASSES.SECTION;

  // ARIA: Mark as banner region (hero is typically the main banner)
  section.setAttribute('role', 'region');

  // ARIA: Provide accessible label
  if (titleId) {
    section.setAttribute('aria-labelledby', titleId);
  } else {
    // Fallback label if no title is present
    section.setAttribute('aria-label', 'Hero section');
  }

  section.appendChild(container);

  block.appendChild(section);

  // Initialize native video controls after DOM insertion
  const videoWrapper = block.querySelector(`.${HERO_CSS_CLASSES.MEDIA_VIDEO}`);
  if (videoWrapper) {
    const videoControlsCleanup = initNativeVideoControls(videoWrapper);
    if (videoControlsCleanup) {
      cleanupFunctions.push(videoControlsCleanup);
    }
  }

  // Add scroll hint for contains-media layout
  let scrollText = null;
  if (layout === 'contains-media') {
    // Load placeholders for i18n support
    const placeholders = await fetchPlaceholdersForLocale();
    scrollText = heroCreateScrollTextElement(placeholders);
    // Add scroll text to content wrapper (outside of content inner)
    contentWrapper.appendChild(scrollText);
  }

  // Initialize scroll hint behavior
  if (scrollText) {
    const scrollHintCleanup = heroInitScrollHint(scrollText);
    if (scrollHintCleanup) {
      // Store cleanup function
      cleanupFunctions.push(scrollHintCleanup);
    }
  }

  // Store consolidated cleanup function on block for memory leak prevention
  block.heroCleanup = () => {
    cleanupFunctions.forEach((fn) => fn());
    cleanupFunctions.length = 0;
  };

  // Setup cleanup observer for automatic cleanup when block is removed
  setupHeroCleanupObserver(block);

  // Decorate any icons in the content
  decorateIcons(block);
}
