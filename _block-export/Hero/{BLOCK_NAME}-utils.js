// {BLOCK_FUNC} shared utilities and functions

import {
  {BLOCK_UPPER}_CSS_CLASSES,
  {BLOCK_UPPER}_FIELD_MAP,
  {BLOCK_UPPER}_FADE_START_PX,
  {BLOCK_UPPER}_IO_THRESHOLDS,
  {BLOCK_UPPER}_BRIGHTCOVE_ATTRIBUTES,
  {BLOCK_UPPER}_VIDEO_ATTRIBUTES,
} from './{BLOCK_NAME}-constants.js';
import { {BLOCK_UPPER}_SCROLL_TEXT } from '../../constants/placeholders-constants.js';
import { decorateIcons } from '../../scripts/aem.js';
import {
  sanitizeUrl,
  decodeCmsText,
  processContentWithIconsAndLink,
  processRichHtmlWithIconsAndDecode,
} from '../../utils/generic-utils.js';
import { normalizeText } from '../video/video-utils.js';

// Note: theme/text helpers live in utils/generic-utils.js.
// This file exports only {BLOCK_FUNC}-specific utilities (not constants).

/**
 * Create video-js element from attribute extraction
 * (Based on video block implementation)
 * @param {string} normalized - Normalized HTML string
 * @returns {HTMLElement} video-js element
 */
function {BLOCK_VAR}CreateVideoJsFromAttributes(normalized) {
  const brightcoveAttributes = {BLOCK_UPPER}_BRIGHTCOVE_ATTRIBUTES;

  const getAttr = (name) => {
    const re = new RegExp(`${name}="([^"]+)"`, 'i');
    const m = normalized.match(re);
    return m ? m[1] : '';
  };

  const el = document.createElement('video-js');
  brightcoveAttributes.forEach((attr) => {
    const value = getAttr(attr);
    if (value) el.setAttribute(attr, value);
  });

  if (/\bcontrols\b/i.test(normalized)) {
    el.setAttribute({BLOCK_UPPER}_VIDEO_ATTRIBUTES.CONTROLS, '');
  }

  el.className = 'video-js';
  return el;
}

/**
 * Extract video-js element from authored content
 * (Based on video block implementation)
 * @param {HTMLElement} row - The row containing video embed code
 * @returns {HTMLElement|null} video-js element or null
 */
export function {BLOCK_VAR}ExtractVideoJsElement(row) {
  // First try to find existing video-js element
  let videoJsEl = row.querySelector('video-js');
  if (videoJsEl) return videoJsEl;

  // Fallback 1: richtext wrapper that outputs real HTML
  const rtWrapper = row.querySelector('[data-aue-type="richtext"], div');
  if (rtWrapper) {
    videoJsEl = rtWrapper.querySelector('video-js');
    if (videoJsEl) return videoJsEl;

    // If wrapper contains only text (escaped snippet), attempt to parse it
    const raw = rtWrapper.innerText || rtWrapper.textContent || '';
    const normalized = normalizeText(raw);

    if (/<\s*video-js[\s\S]*<\s*\/\s*video-js\s*>/i.test(normalized)) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(normalized, 'text/html');
      const candidate = doc.querySelector('video-js');
      if (candidate) {
        candidate.classList.add('video-js');
        return candidate;
      }
    }
  }

  // Fallback 2: reconstruct <video-js> from escaped richtext text nodes
  const combined = row.textContent || '';
  if (/video-js/i.test(combined)) {
    const normalized = normalizeText(combined);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(normalized, 'text/html');
      const candidate = doc.querySelector('video-js');
      if (candidate) {
        candidate.classList.add('video-js');
        return candidate;
      }
    } catch (e) {
      // Fallback to attribute extraction if DOMParser parsing fails
      return {BLOCK_VAR}CreateVideoJsFromAttributes(normalized);
    }
  }

  return null;
}

/**
 * Parse content from AEM rows into structured data
 * @param {Array<HTMLElement>} rows - Array of row elements from AEM
 * @returns {Object} Parsed content object with all field values
 */
export function {BLOCK_VAR}ParseContent(rows) {
  // Validate rows parameter
  if (!Array.isArray(rows)) {
    // eslint-disable-next-line no-console
    console.error('{BLOCK_FUNC}: Invalid rows parameter, expected array');
    return {
      layout: 'text-only',
      mediaType: 'image',
      mediaImage: null,
      mediaVideo: null,
      altText: '',
      caption: '',
      pretitle: { text: '', html: '' },
      title: { text: '', html: '' },
      description: '',
      ctaButtonLink: '',
      ctaButtonText: '',
    };
  }

  const content = {
    layout: 'text-only',
    mediaType: 'image',
    mediaImage: null,
    mediaVideo: null,
    altText: '',
    caption: '',
    pretitle: { text: '', html: '' },
    title: { text: '', html: '' },
    description: '',
    ctaButtonLink: '',
    ctaButtonText: '',
  };

  rows.forEach((row, index) => {
    const cell = row.querySelector(':scope > div');
    if (!cell) return;

    const fieldName = {BLOCK_UPPER}_FIELD_MAP[index];
    if (!fieldName) {
      // eslint-disable-next-line no-console
      console.warn(`{BLOCK_FUNC}: Unknown field at index ${index}`);
      return;
    }

    try {
      const text = cell.textContent.trim();
      const html = cell.innerHTML.trim();

      switch (fieldName) {
        case 'layout':
          content.layout = text === 'contains-media' ? 'contains-media' : 'text-only';
          break;
        case 'mediaType':
          content.mediaType = text === 'video' ? 'video' : 'image';
          break;
        case 'mediaImage': {
          const picture = cell.querySelector('picture');
          const img = cell.querySelector('img');
          content.mediaImage = picture || img;
          break;
        }
        case 'mediaVideo': {
          if (text || html) {
            content.mediaVideo = {BLOCK_VAR}ExtractVideoJsElement(row);
          }
          break;
        }
        case 'altText':
          content.altText = decodeCmsText(text);
          break;
        case 'caption': {
          const captionResult = processContentWithIconsAndLink(html);
          content.caption = captionResult.content;
          break;
        }
        case 'pretitle': {
          const pretitleResult = processContentWithIconsAndLink(html);
          content.pretitle = {
            text: decodeCmsText(text),
            html,
            processed: pretitleResult,
          };
          break;
        }
        case 'title': {
          const titleResult = processContentWithIconsAndLink(html);
          content.title = {
            text: decodeCmsText(text),
            html,
            processed: titleResult,
          };
          break;
        }
        case 'description':
          content.description = processRichHtmlWithIconsAndDecode(html);
          break;
        case 'ctaButtonLink': {
          const ctaLinkResult = processContentWithIconsAndLink(html);
          const rawUrl = ctaLinkResult.href || (() => {
            const anchor = cell.querySelector('a');
            return anchor && anchor.href ? anchor.href : text;
          })();
          content.ctaButtonLink = sanitizeUrl(rawUrl);
          break;
        }
        case 'ctaButtonText': {
          const ctaTextResult = processContentWithIconsAndLink(html);
          content.ctaButtonText = ctaTextResult.content || decodeCmsText(text);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`{BLOCK_FUNC}: Error parsing field ${fieldName}:`, error);
    }
  });

  return content;
}

/**
 * Clone an authored media element and wrap it with required markup.
 * @param {HTMLPictureElement|HTMLImageElement} mediaElement - Media image element
 * @param {string} mediaAlt - Alt text for the image
 * @param {string} mediaCaption - Caption text
 * @returns {HTMLDivElement|null} Wrapper with media, or null if invalid
 */
export function {BLOCK_VAR}BuildMediaWrapper(mediaElement, mediaAlt, mediaCaption) {
  // Validate mediaElement
  if (!mediaElement || !(mediaElement instanceof Element)) {
    // eslint-disable-next-line no-console
    console.error('{BLOCK_FUNC}: Invalid mediaElement provided to buildMediaWrapper');
    return null;
  }

  // Validate mediaAlt (should be string if provided)
  let sanitizedMediaAlt = mediaAlt;
  if (mediaAlt !== undefined && typeof mediaAlt !== 'string') {
    // eslint-disable-next-line no-console
    console.warn('{BLOCK_FUNC}: mediaAlt should be a string, converting to string');
    sanitizedMediaAlt = String(mediaAlt);
  }

  // Validate mediaCaption (should be string if provided)
  let sanitizedMediaCaption = mediaCaption;
  if (mediaCaption !== undefined && typeof mediaCaption !== 'string') {
    // eslint-disable-next-line no-console
    console.warn('{BLOCK_FUNC}: mediaCaption should be a string, converting to string');
    sanitizedMediaCaption = String(mediaCaption);
  }

  try {
    const mediaWrapper = document.createElement('div');
    mediaWrapper.className = {BLOCK_UPPER}_CSS_CLASSES.MEDIA;

    // Clone the media image element
    const clonedMedia = mediaElement.cloneNode(true);

    // Safely get img element
    const img = clonedMedia.tagName === 'IMG'
      ? clonedMedia
      : clonedMedia.querySelector('img');

    if (img && sanitizedMediaAlt) {
      // Use decoded alt as-is (set via DOM, not HTML – no sanitizeText to avoid &#x2F; etc.)
      img.alt = sanitizedMediaAlt;
    }

    mediaWrapper.appendChild(clonedMedia);

    // Add caption if exists – use innerHTML to support icons (e.g. :icon-name:)
    if (sanitizedMediaCaption) {
      const captionEl = document.createElement('p');
      captionEl.className = {BLOCK_UPPER}_CSS_CLASSES.CAPTION;
      captionEl.innerHTML = sanitizedMediaCaption;
      decorateIcons(captionEl);
      mediaWrapper.appendChild(captionEl);
    }

    return mediaWrapper;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('{BLOCK_FUNC}: Error building media wrapper:', error);
    return null;
  }
}

/**
 * Build video wrapper for video-js element
 * @param {string} mediaCaption - Caption text
 * @returns {HTMLDivElement} wrapper for video
 */
export function {BLOCK_VAR}BuildVideoWrapper(mediaCaption) {
  // Validate mediaCaption (should be string if provided)
  let sanitizedMediaCaption = mediaCaption;
  if (mediaCaption !== undefined && typeof mediaCaption !== 'string') {
    // eslint-disable-next-line no-console
    console.warn('{BLOCK_FUNC}: mediaCaption should be a string, converting to string');
    sanitizedMediaCaption = String(mediaCaption);
  }

  const videoWrapper = document.createElement('div');
  videoWrapper.className = `${{BLOCK_UPPER}_CSS_CLASSES.MEDIA} ${{BLOCK_UPPER}_CSS_CLASSES.MEDIA_VIDEO}`;

  // Add caption placeholder if exists (used as textContent in {BLOCK_NAME}.js – no sanitizeText
  // so / is not escaped to &#x2F;)
  if (sanitizedMediaCaption) {
    videoWrapper.dataset.caption = sanitizedMediaCaption;
  }

  return videoWrapper;
}

/**
 * Create the scroll-hint element used at the bottom of the {BLOCK_VAR}.
 * Uses DOM creation to avoid XSS vulnerabilities and CSP violations.
 * @param {Object} placeholders - Placeholders object for i18n
 * @returns {HTMLDivElement}
 */
export function {BLOCK_VAR}CreateScrollTextElement(placeholders = {}) {
  const scrollText = document.createElement('div');
  scrollText.className = {BLOCK_UPPER}_CSS_CLASSES.SCROLL_TEXT;

  // Create icon span (safe DOM creation)
  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon icon-arrow-downward';
  // Accessibility: Hide decorative icon from screen readers
  iconSpan.setAttribute('aria-hidden', 'true');

  // Create label span (safe DOM creation)
  const labelSpan = document.createElement('span');
  labelSpan.className = 'label';
  // Use placeholder for i18n support, fallback to English
  labelSpan.textContent = placeholders[{BLOCK_UPPER}_SCROLL_TEXT] || 'Scroll';

  // Append children
  scrollText.appendChild(iconSpan);
  scrollText.appendChild(labelSpan);

  // Accessibility: Hide scroll hint from screen readers
  // Rationale: This is a purely visual/decorative scroll indicator that:
  // 1. Provides no functional value (not interactive)
  // 2. Fades in/out dynamically (would cause repeated announcements)
  // 3. Is redundant for screen reader users (they use their own navigation)
  // 4. Would be noise/distraction if announced
  // Screen reader users can navigate content naturally without visual hints
  scrollText.setAttribute('aria-hidden', 'true');

  return scrollText;
}

/**
 * Initialize visibility and fade behaviors for the scroll-hint element.
 * Uses IntersectionObserver for show/hide and rAF-throttled scroll/resize for fade.
 * @param {HTMLElement} scrollText - The scroll hint element to initialize
 * @returns {Function|null} Cleanup function to remove all listeners and observers
 */
export function {BLOCK_VAR}InitScrollHint(scrollText) {
  // Validate scrollText parameter
  if (!scrollText || !(scrollText instanceof Element)) {
    // eslint-disable-next-line no-console
    console.error('{BLOCK_FUNC}: Invalid scrollText element provided to initScrollHint');
    return null;
  }

  const observer = new IntersectionObserver(([entry]) => {
    const isVisible = entry.intersectionRatio > 0;
    if (!isVisible) {
      scrollText.classList.add({BLOCK_UPPER}_CSS_CLASSES.HIDDEN);
      scrollText.classList.remove({BLOCK_UPPER}_CSS_CLASSES.FADE_OUT);
      return;
    }
    scrollText.classList.remove({BLOCK_UPPER}_CSS_CLASSES.HIDDEN);
  }, { root: null, threshold: {BLOCK_UPPER}_IO_THRESHOLDS });

  observer.observe(scrollText);

  let fadeRaf = 0;
  const updateFade = () => {
    const { top } = scrollText.getBoundingClientRect();
    const shouldFade = top <= {BLOCK_UPPER}_FADE_START_PX;
    scrollText.classList.toggle({BLOCK_UPPER}_CSS_CLASSES.FADE_OUT, shouldFade);
  };

  const scheduleFade = () => {
    if (fadeRaf) return;
    fadeRaf = window.requestAnimationFrame(() => {
      fadeRaf = 0;
      updateFade();
    });
  };

  // Add event listeners
  window.addEventListener('scroll', scheduleFade, { passive: true });
  window.addEventListener('resize', scheduleFade, { passive: true });

  const applyInitialState = () => {
    const rect = scrollText.getBoundingClientRect();
    const initiallyVisible = rect.bottom > 0 && rect.top < window.innerHeight;

    // Only apply hidden state if truly not visible
    // This prevents hiding when layout isn't ready yet
    if (!initiallyVisible && rect.top !== 0) {
      scrollText.classList.add({BLOCK_UPPER}_CSS_CLASSES.HIDDEN);
    } else {
      scrollText.classList.remove({BLOCK_UPPER}_CSS_CLASSES.HIDDEN);
    }

    updateFade();
  };

  // Ensure scroll hint is visible by default on page load
  // The IntersectionObserver and applyInitialState will correct if needed
  scrollText.classList.remove({BLOCK_UPPER}_CSS_CLASSES.HIDDEN);

  // Use multiple strategies to ensure proper initial state:
  let initialStateTimeout = null;

  // 1. Immediate rAF check
  requestAnimationFrame(applyInitialState);

  // 2. Double rAF for browsers that need paint to settle
  requestAnimationFrame(() => requestAnimationFrame(applyInitialState));

  // 3. Final check after a short delay to handle slow image loading
  initialStateTimeout = setTimeout(applyInitialState, 100);

  // Return cleanup function to remove all listeners and observers
  return () => {
    // Cancel any pending animation frame
    if (fadeRaf) {
      window.cancelAnimationFrame(fadeRaf);
    }

    // Clear initial state timeout
    if (initialStateTimeout) {
      clearTimeout(initialStateTimeout);
    }

    // Remove event listeners
    window.removeEventListener('scroll', scheduleFade);
    window.removeEventListener('resize', scheduleFade);

    // Disconnect observer
    observer.disconnect();
  };
}
