/**
 * {BLOCK_FUNC} Block
 * Displays primary content area at the top of a webpage with title, description,
 * optional media (image/video), and CTA buttons
 */

import { decorateIcons } from '../../scripts/aem.js';
import {
  {BLOCK_VAR}ParseContent,
  {BLOCK_VAR}BuildMediaWrapper,
  {BLOCK_VAR}BuildVideoWrapper,
  {BLOCK_VAR}CreateScrollTextElement,
  {BLOCK_VAR}InitScrollHint,
} from './{BLOCK_NAME}-utils.js';
import {
  {BLOCK_UPPER}_CSS_CLASSES,
  {BLOCK_UPPER}_CONSOLE_PATTERNS,
  {BLOCK_UPPER}_VIDEO_ATTRIBUTES,
  {BLOCK_UPPER}_DEFAULT_VIDEO_CAPTION,
  generate{BLOCK_FUNC}UID,
} from './{BLOCK_NAME}-constants.js';
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
 * Setup global console suppression for known noisy third-party warnings
 * Applies once per page; keeps other warnings intact
 */
(() => {
  try {
    if (typeof window !== 'undefined' && !window.{BLOCK_VAR}WarnPatchedFlag) {
      // eslint-disable-next-line no-console
      const originalWarn = console.warn;
      const patterns = {BLOCK_UPPER}_CONSOLE_PATTERNS;
      // eslint-disable-next-line no-console
      console.warn = (...args) => {
        const parts = (args || []).map((a) => {
          try { return String(a); } catch (e) { return ''; }
        });
        const combined = parts.join(' ');
        if (patterns.some((re) => re.test(combined))) { return undefined; }
        // eslint-disable-next-line no-console
        return originalWarn.apply(console, args);
      };
      window.{BLOCK_VAR}WarnPatchedFlag = true;
    }
  } catch (e) { /* noop */ }
})();

/**
 * Setup MutationObserver to automatically cleanup when block is removed from DOM
 * Prevents memory leaks in SPAs and dynamic content scenarios
 * @param {HTMLElement} block - The block element to observe
 */
function setup{BLOCK_FUNC}CleanupObserver(block) {
  if (!block || !block.parentNode) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === block && block.{BLOCK_VAR}Cleanup) {
          // Block was removed, run cleanup
          block.{BLOCK_VAR}Cleanup();
          observer.disconnect();
        }
      });
    });
  });

  // Observe parent for child list changes
  observer.observe(block.parentNode, { childList: true });
}

/**
 * Create custom play/pause button overlay
 * Uses safe DOM creation to avoid XSS vulnerabilities
 * @returns {HTMLButtonElement} - The custom control button
 */
function createVideoControlButton() {
  const controlBtn = document.createElement('button');
  controlBtn.className = {BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL;
  controlBtn.setAttribute('aria-label', 'Pause video');
  controlBtn.setAttribute('type', 'button');
  controlBtn.setAttribute('aria-pressed', 'false');

  // Create icon span (safe DOM creation)
  const iconSpan = document.createElement('span');
  iconSpan.className = `${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_ICON} ${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_PAUSE}`;
  iconSpan.setAttribute('aria-hidden', 'true');
  controlBtn.appendChild(iconSpan);

  return controlBtn;
}

/**
 * Add video tracks for accessibility to the actual video element
 * @param {HTMLElement} videoElement - The actual video element
 * @param {string} caption - Caption text
 */
function addVideoTracks(videoElement, caption) {
  // Create a track element for captions
  const track = document.createElement('track');
  track.setAttribute('kind', 'captions');
  track.setAttribute('label', 'English');
  track.setAttribute('srclang', 'en');
  track.setAttribute('default', '');

  // Create a simple VTT content for the caption
  const vttContent = `WEBVTT

00:00:00.000 --> 00:00:10.000
${caption}`;

  // Create a blob URL for the VTT content
  const blob = new Blob([vttContent], { type: 'text/vtt' });
  const vttUrl = URL.createObjectURL(blob);
  track.setAttribute('src', vttUrl);

  // Add track to the actual video element (not video-js wrapper)
  videoElement.appendChild(track);

  // Store cleanup function to revoke blob URL
  // eslint-disable-next-line no-underscore-dangle
  videoElement._vttCleanup = () => {
    URL.revokeObjectURL(vttUrl);
  };
}

/**
 * Initialize video controls and autoplay
 * @param {HTMLElement} videoWrapper - The video wrapper element
 * @param {HTMLElement} videoJsEl - The video-js element
 * @returns {Function|null} - Cleanup function to clear intervals and timeouts
 */
function initVideoControls(videoWrapper, videoJsEl) {
  const videoId = videoJsEl.getAttribute('id');
  if (!videoId) return null;

  // Create custom control button
  const controlBtn = createVideoControlButton();
  videoWrapper.appendChild(controlBtn);

  let checkPlayer = null;
  let timeoutId = null;
  let isCleanedUp = false;
  let player = null;
  let handleClick = null;
  let handlePause = null;
  let handlePlay = null;

  // Cleanup function to prevent memory leaks
  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    if (checkPlayer) {
      clearInterval(checkPlayer);
      checkPlayer = null;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Remove button event listener
    if (handleClick) {
      controlBtn.removeEventListener('click', handleClick);
      handleClick = null;
    }

    // Remove player event listeners
    if (player) {
      if (handlePause) {
        player.off('pause', handlePause);
        handlePause = null;
      }
      if (handlePlay) {
        player.off('play', handlePlay);
        handlePlay = null;
      }
      player = null;
    }
  };

  // Wait for Brightcove player to be ready
  checkPlayer = setInterval(() => {
    if (window.bc && window.videojs) {
      try {
        // Reduce console noise from video.js warnings
        if (typeof window.videojs.log?.level === 'function') {
          window.videojs.log.level('error');
        }
      } catch (e) { /* noop */ }
      player = window.videojs.getPlayer(videoId);
      if (player) {
        // Clear interval and timeout (but keep other cleanup for later)
        if (checkPlayer) {
          clearInterval(checkPlayer);
          checkPlayer = null;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Add video tracks to the actual video element for accessibility
        // Only add VTT tracks if there's no visual caption (to avoid duplication)
        // eslint-disable-next-line no-underscore-dangle
        const captionForTracks = videoJsEl._captionForTracks;
        const hasVisualCaption = videoWrapper.querySelector(`.${BLOCK_UPPER}_CSS_CLASSES.CAPTION}`);

        if (captionForTracks && !hasVisualCaption) {
          // Get the actual video element from the player
          const actualVideoElement = player.el().querySelector('video');
          if (actualVideoElement) {
            addVideoTracks(actualVideoElement, captionForTracks);
          }
        }

        let isPlaying = true;

        // Get the icon span for updating state
        const iconSpan = controlBtn.querySelector('span');

        // Named function for button click handler
        handleClick = () => {
          if (isPlaying) {
            player.pause();
            // Update to play icon (safe - only changing className)
            iconSpan.className = `${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_ICON} ${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_PLAY}`;
            controlBtn.setAttribute('aria-label', 'Play video');
            controlBtn.setAttribute('aria-pressed', 'false');
            isPlaying = false;
          } else {
            player.play();
            // Update to pause icon (safe - only changing className)
            iconSpan.className = `${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_ICON} ${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_PAUSE}`;
            controlBtn.setAttribute('aria-label', 'Pause video');
            controlBtn.setAttribute('aria-pressed', 'true');
            isPlaying = true;
          }
        };

        // Named function for player pause event
        handlePause = () => {
          if (isPlaying) {
            // Update to play icon (safe - only changing className)
            iconSpan.className = `${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_ICON} ${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_PLAY}`;
            controlBtn.setAttribute('aria-label', 'Play video');
            controlBtn.setAttribute('aria-pressed', 'false');
            isPlaying = false;
          }
        };

        // Named function for player play event
        handlePlay = () => {
          if (!isPlaying) {
            // Update to pause icon (safe - only changing className)
            iconSpan.className = `${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_ICON} ${{BLOCK_UPPER}_CSS_CLASSES.VIDEO_CONTROL_PAUSE}`;
            controlBtn.setAttribute('aria-label', 'Pause video');
            controlBtn.setAttribute('aria-pressed', 'true');
            isPlaying = true;
          }
        };

        // Add event listeners
        controlBtn.addEventListener('click', handleClick);
        player.on('pause', handlePause);
        player.on('play', handlePlay);

        try {
          if (typeof window.videojs.log?.level === 'function') {
            window.videojs.log.level('error');
          }
        } catch (e) { /* noop */ }
      }
    }
  }, 100);

  // Clear interval after 10 seconds if player not found
  timeoutId = setTimeout(() => {
    cleanup(); // Clean up interval
  }, 10000);

  // Return cleanup function
  return cleanup;
}

/**
 * Add accessibility features to video element
 * @param {HTMLElement} videoJsEl - The video-js element
 * @param {string} visualCaption - Visual caption text (from AEM field, optional)
 * @returns {Function} - Cleanup function to remove event listeners
 */
function addVideoAccessibility(videoJsEl, visualCaption) {
  // For accessibility, we always need a meaningful description
  // Use visual caption if available, otherwise use default for screen readers
  const accessibilityCaption = visualCaption || {BLOCK_UPPER}_DEFAULT_VIDEO_CAPTION;

  // Add ARIA attributes for screen readers
  videoJsEl.setAttribute('role', 'application');
  videoJsEl.setAttribute('aria-label', accessibilityCaption);

  // Add title for tooltip
  videoJsEl.setAttribute('title', accessibilityCaption);

  // Add tabindex to make video focusable
  videoJsEl.setAttribute('tabindex', '0');

  // Named function for cleanup
  const handleKeydown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      // Toggle play/pause on space/enter
      const player = window.videojs?.getPlayer(videoJsEl.id);
      if (player) {
        if (player.paused()) {
          player.play();
        } else {
          player.pause();
        }
      }
    }
  };

  // Add keyboard navigation support
  videoJsEl.addEventListener('keydown', handleKeydown);

  // Store caption for VTT tracks (always use accessibility caption)
  // eslint-disable-next-line no-underscore-dangle
  videoJsEl._captionForTracks = accessibilityCaption;

  // Return cleanup function
  return () => {
    videoJsEl.removeEventListener('keydown', handleKeydown);
  };
}

/**
 * Load Brightcove video player script
 * (Based on video block implementation)
 * @param {HTMLElement} videoWrapper - The video wrapper element
 * @param {HTMLElement} videoJsEl - The video-js element
 */
function loadBrightcoveVideo(videoWrapper, videoJsEl) {
  try {
    // Validate inputs
    if (!videoWrapper || !(videoWrapper instanceof HTMLElement)) {
      throw new TypeError('Invalid video wrapper element');
    }

    if (!videoJsEl || !(videoJsEl instanceof HTMLElement)) {
      return;
    }

    // Extract video configuration
    const account = videoJsEl.getAttribute('data-account') || '';
    const player = videoJsEl.getAttribute('data-player') || '';
    const embed = videoJsEl.getAttribute('data-embed') || 'default';

    if (!account || !player) {
      return;
    }

    // Configure autoplay, muted, and loop for {BLOCK_VAR} video
    videoJsEl.setAttribute({BLOCK_UPPER}_VIDEO_ATTRIBUTES.AUTOPLAY, '');
    videoJsEl.setAttribute({BLOCK_UPPER}_VIDEO_ATTRIBUTES.MUTED, '');
    videoJsEl.setAttribute({BLOCK_UPPER}_VIDEO_ATTRIBUTES.PLAYSINLINE, '');
    videoJsEl.setAttribute({BLOCK_UPPER}_VIDEO_ATTRIBUTES.LOOP, '');

    // Ensure video has an ID for player access
    if (!videoJsEl.getAttribute('id')) {
      // Use secure ID generation (timestamp-based, not Math.random)
      const uniqueId = `{BLOCK_NAME}-video-${generate{BLOCK_FUNC}UID()}`;
      videoJsEl.setAttribute('id', uniqueId);
    }

    // Add accessibility features
    // Note: AEM caption field is for visual display, not accessibility
    // We need separate accessibility captions for screen readers
    const visualCaption = videoWrapper.dataset.caption || '';
    const videoAccessibilityCleanup = addVideoAccessibility(videoJsEl, visualCaption);

    // Store cleanup function on videoWrapper for later cleanup
    // eslint-disable-next-line no-param-reassign
    videoWrapper.videoAccessibilityCleanup = videoAccessibilityCleanup;

    // Generate script URL
    const scriptSrc = `https://players.brightcove.net/${account}/${player}_${embed}/index.min.js`;

    // Validate script URL for security
    try {
      const parsedUrl = new URL(scriptSrc);
      if (parsedUrl.hostname !== 'players.brightcove.net' || parsedUrl.protocol !== 'https:') {
        return;
      }
    } catch (e) {
      return;
    }

    const escapeCSSSelector = (str) => str.replace(/["\\]/g, '\\$&');
    const existing = document.querySelector(`script[src="${escapeCSSSelector(scriptSrc)}"]`);

    // Append video element to wrapper immediately (required for Brightcove initialization)
    videoWrapper.append(videoJsEl);

    // Add visual caption (only if provided by AEM author) – innerHTML supports icons
    if (videoWrapper.dataset.caption) {
      const captionEl = document.createElement('p');
      captionEl.className = {BLOCK_UPPER}_CSS_CLASSES.CAPTION;
      captionEl.innerHTML = sanitizeText(videoWrapper.dataset.caption, { richHTML: true });
      decorateIcons(captionEl);
      videoWrapper.appendChild(captionEl);
    }
    delete videoWrapper.dataset.caption; // Clean up data attribute

    // Mark loaded function
    const markLoaded = () => {
      videoWrapper.dataset.embedLoaded = true;
      // Initialize custom controls after player loads and store cleanup function
      const videoControlsCleanup = initVideoControls(videoWrapper, videoJsEl);
      if (videoControlsCleanup) {
        // Store cleanup function on videoWrapper for later cleanup
        // eslint-disable-next-line no-param-reassign
        videoWrapper.videoControlsCleanup = videoControlsCleanup;
      }
    };

    // Handle existing script
    if (existing) {
      if (existing.dataset.bcLoaded === 'true') {
        markLoaded();
      } else {
        existing.addEventListener('load', markLoaded, { once: true });
      }
      return;
    }

    // Create and load new script
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;

    script.addEventListener('load', () => {
      script.dataset.bcLoaded = 'true';
      try {
        if (window.videojs && typeof window.videojs.log?.level === 'function') {
          window.videojs.log.level('error');
        }
      } catch (e) { /* noop */ }
      markLoaded();
    }, { once: true });

    script.addEventListener('error', () => {
      // Error loading script
    }, { once: true });

    document.head.appendChild(script);
  } catch (error) {
    // Silent fail - don't break the page
  }
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

    trackElementInteraction('{BLOCK_NAME}-cta-click', {
      elementType: '{BLOCK_NAME}',
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
    console.error('Error tracking {BLOCK_NAME} CTA click:', error);
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
  button.className = `${{BLOCK_UPPER}_CSS_CLASSES.BUTTON} ${{BLOCK_UPPER}_CSS_CLASSES.CTA_BUTTON}`;
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
 * Decorates the {BLOCK_VAR} block with content
 * @param {HTMLElement} block - The {BLOCK_VAR} block element
 */
export default async function decorate(block) {
  // Track cleanup functions for memory leak prevention
  const cleanupFunctions = [];

  // Extract content from authored structure
  const rows = [...block.children];

  // Clear the block to rebuild with proper structure
  block.innerHTML = '';

  // Parse the authored content using field mapping
  const content = {BLOCK_VAR}ParseContent(rows);

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

  // Generate unique ID for this {BLOCK_VAR} instance
  const uid = generate{BLOCK_FUNC}UID();
  let titleId = '';

  // Add layout class
  block.classList.add(layout === 'text-only' ? {BLOCK_UPPER}_CSS_CLASSES.LAYOUT_TEXT_ONLY : {BLOCK_UPPER}_CSS_CLASSES.LAYOUT_CONTAINS_MEDIA);

  // Create main container
  const container = document.createElement('div');
  container.className = {BLOCK_UPPER}_CSS_CLASSES.INNER;

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = {BLOCK_UPPER}_CSS_CLASSES.CONTENT;

  // Create inner content wrapper for main {BLOCK_VAR} content
  const contentInner = document.createElement('div');
  contentInner.className = {BLOCK_UPPER}_CSS_CLASSES.CONTENT_INNER;

  // For text-only layout, combine pretitle and title on same line
  if (layout === 'text-only' && pretitle && (pretitle.text || pretitle.processed?.content) && title) {
    const titleEl = document.createElement('h1');
    titleEl.className = `${{BLOCK_UPPER}_CSS_CLASSES.TITLE} ${{BLOCK_UPPER}_CSS_CLASSES.TITLE_WITH_PRETITLE}`;

    const pretitleContent = pretitle.processed?.content ?? pretitle.text;
    const titleContent = title.processed?.content ?? title.text;

    // Create span for pretitle with dash
    // (content from processContentWithIconsAndLink: slash -> text only, no link; icons)
    const pretitleSpan = document.createElement('span');
    pretitleSpan.className = '{BLOCK_CLASS}-pretitle-inline';
    if (pretitleContent) {
      const pretitleText = `${pretitleContent} – `;
      pretitleSpan.innerHTML = sanitizeText(pretitleText, { richHTML: true });
      decorateIcons(pretitleSpan);
    }

    // Create span for title (content already from processContentWithIconsAndLink: slash + icons)
    const titleSpan = document.createElement('span');
    titleSpan.className = '{BLOCK_CLASS}-title-text';
    titleSpan.innerHTML = sanitizeText(titleContent || '', { richHTML: true });
    decorateIcons(titleSpan);

    // Append both spans
    titleEl.appendChild(pretitleSpan);
    titleEl.appendChild(titleSpan);

    titleId = `{BLOCK_NAME}-title-${uid}`;
    titleEl.id = titleId;
    contentInner.appendChild(titleEl);
  } else {
    // For contains-media layout, keep pretitle and title separate
    const pretitleContent = pretitle?.processed?.content ?? pretitle?.text;
    if (pretitleContent && pretitleContent.trim()) {
      const pretitleEl = document.createElement('p');
      pretitleEl.className = {BLOCK_UPPER}_CSS_CLASSES.PRETITLE;
      pretitleEl.innerHTML = sanitizeText(pretitleContent, { richHTML: true });
      decorateIcons(pretitleEl);
      contentInner.appendChild(pretitleEl);
    }

    // Add title content from processContentWithIconsAndLink: slash -> text only, no link; icons
    const titleContent = title?.processed?.content ?? title?.text;
    if (titleContent) {
      const titleEl = document.createElement('h1');
      titleEl.className = {BLOCK_UPPER}_CSS_CLASSES.TITLE;
      titleEl.innerHTML = sanitizeText(titleContent, { richHTML: true });
      decorateIcons(titleEl);

      titleId = `{BLOCK_NAME}-title-${uid}`;
      titleEl.id = titleId;
      contentInner.appendChild(titleEl);
    }
  }

  // Add description if exists
  if (description) {
    const descEl = document.createElement('div');
    descEl.className = {BLOCK_UPPER}_CSS_CLASSES.DESCRIPTION;
    // Clean HTML content and sanitize to prevent XSS attacks, allow rich content
    const cleanedDescription = cleanHtmlContent(description);
    descEl.innerHTML = sanitizeText(cleanedDescription, { richHTML: true });
    contentInner.appendChild(descEl);
  }

  // Add CTA button if both text and link exist
  if (ctaButtonText && ctaButtonLink) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.className = {BLOCK_UPPER}_CSS_CLASSES.CTA;

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
  let videoElementToLoad = null; // Store reference to video element for loading after DOM insertion
  if (layout === 'contains-media') {
    const gridContainer = document.createElement('div');
    gridContainer.className = {BLOCK_UPPER}_CSS_CLASSES.GRID;

    // Add content to grid
    gridContainer.appendChild(contentWrapper);

    // Add media if exists
    let mediaWrapper = null;
    if (mediaType === 'image' && mediaImage) {
      mediaWrapper = {BLOCK_VAR}BuildMediaWrapper(mediaImage, altText, caption);
    } else if (mediaType === 'video' && mediaVideo) {
      mediaWrapper = {BLOCK_VAR}BuildVideoWrapper(caption);
      // Store video element to load AFTER it's in the DOM
      videoElementToLoad = mediaVideo;
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
  section.className = {BLOCK_UPPER}_CSS_CLASSES.SECTION;

  // ARIA: Mark as banner region ({BLOCK_VAR} is typically the main banner)
  section.setAttribute('role', 'region');

  // ARIA: Provide accessible label
  if (titleId) {
    section.setAttribute('aria-labelledby', titleId);
  } else {
    // Fallback label if no title is present
    section.setAttribute('aria-label', '{BLOCK_FUNC} section');
  }

  section.appendChild(container);

  block.appendChild(section);

  // Load Brightcove video AFTER element is in the DOM
  if (videoElementToLoad) {
    // Find the video wrapper in the DOM to pass to loadBrightcoveVideo
    const videoWrapper = block.querySelector(`.${BLOCK_UPPER}_CSS_CLASSES.MEDIA_VIDEO}`);
    if (videoWrapper) {
      loadBrightcoveVideo(videoWrapper, videoElementToLoad);
    }
  }

  // Add scroll hint for contains-media layout
  let scrollText = null;
  if (layout === 'contains-media') {
    // Load placeholders for i18n support
    const placeholders = await fetchPlaceholdersForLocale();
    scrollText = {BLOCK_VAR}CreateScrollTextElement(placeholders);
    // Add scroll text to content wrapper (outside of content inner)
    contentWrapper.appendChild(scrollText);
  }

  // Initialize scroll hint behavior
  if (scrollText) {
    const scrollHintCleanup = {BLOCK_VAR}InitScrollHint(scrollText);
    if (scrollHintCleanup) {
      // Store cleanup function
      cleanupFunctions.push(scrollHintCleanup);
    }
  }

  // Store consolidated cleanup function on block for memory leak prevention
  block.{BLOCK_VAR}Cleanup = () => {
    cleanupFunctions.forEach((fn) => fn());
    cleanupFunctions.length = 0; // Clear array

    // Cleanup video controls (intervals and timeouts) and accessibility listeners
    const videoWrappers = block.querySelectorAll(`.${BLOCK_UPPER}_CSS_CLASSES.MEDIA_VIDEO}`);
    videoWrappers.forEach((videoWrapper) => {
      if (videoWrapper.videoControlsCleanup) {
        videoWrapper.videoControlsCleanup();
        delete videoWrapper.videoControlsCleanup;
      }
      if (videoWrapper.videoAccessibilityCleanup) {
        videoWrapper.videoAccessibilityCleanup();
        delete videoWrapper.videoAccessibilityCleanup;
      }
    });

    // Cleanup VTT blob URLs from both video-js and actual video elements
    const videoJsElements = block.querySelectorAll('video-js');
    videoJsElements.forEach((videoJsEl) => {
      // eslint-disable-next-line no-underscore-dangle
      if (videoJsEl._vttCleanup) {
        // eslint-disable-next-line no-underscore-dangle
        videoJsEl._vttCleanup();
        // eslint-disable-next-line no-underscore-dangle
        delete videoJsEl._vttCleanup;
      }
    });

    // Also cleanup from actual video elements
    const videoElements = block.querySelectorAll('video');
    videoElements.forEach((videoEl) => {
      // eslint-disable-next-line no-underscore-dangle
      if (videoEl._vttCleanup) {
        // eslint-disable-next-line no-underscore-dangle
        videoEl._vttCleanup();
        // eslint-disable-next-line no-underscore-dangle
        delete videoEl._vttCleanup;
      }
    });
  };

  // Setup cleanup observer for automatic cleanup when block is removed
  setup{BLOCK_FUNC}CleanupObserver(block);

  // Decorate any icons in the content
  decorateIcons(block);
}
