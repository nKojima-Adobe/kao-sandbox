// Hero shared utilities and functions

import {
  HERO_CSS_CLASSES,
  HERO_FIELD_MAP,
  HERO_FADE_START_PX,
  HERO_IO_THRESHOLDS,
} from './hero-constants.js';
import { HERO_SCROLL_TEXT } from '../../constants/placeholders-constants.js';
import { decorateIcons } from '../../scripts/aem.js';
import {
  sanitizeUrl,
  decodeCmsText,
  processContentWithIconsAndLink,
  processRichHtmlWithIconsAndDecode,
} from '../../utils/generic-utils.js';

// Note: theme/text helpers live in utils/generic-utils.js.
// This file exports only Hero-specific utilities (not constants).

/**
 * Parse content from AEM rows into structured data
 * @param {Array<HTMLElement>} rows - Array of row elements from AEM
 * @returns {Object} Parsed content object with all field values
 */
export function heroParseContent(rows) {
  // Validate rows parameter
  if (!Array.isArray(rows)) {
    // eslint-disable-next-line no-console
    console.error('Hero: Invalid rows parameter, expected array');
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

    const fieldName = HERO_FIELD_MAP[index];
    if (!fieldName) {
      // eslint-disable-next-line no-console
      console.warn(`Hero: Unknown field at index ${index}`);
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
          const video = cell.querySelector('video');
          const source = cell.querySelector('source');
          const videoLink = cell.querySelector('a');
          if (video) {
            content.mediaVideo = video;
          } else if (source) {
            content.mediaVideo = source.closest('video') || source;
          } else if (videoLink) {
            // DAM reference delivered as a link
            const videoEl = document.createElement('video');
            videoEl.src = videoLink.href;
            content.mediaVideo = videoEl;
          } else if (text && /\.(mp4|webm|ogg)(\?|$)/i.test(text)) {
            // Plain text URL to video
            const videoEl = document.createElement('video');
            videoEl.src = text;
            content.mediaVideo = videoEl;
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
      console.error(`Hero: Error parsing field ${fieldName}:`, error);
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
export function heroBuildMediaWrapper(mediaElement, mediaAlt, mediaCaption) {
  // Validate mediaElement
  if (!mediaElement || !(mediaElement instanceof Element)) {
    // eslint-disable-next-line no-console
    console.error('Hero: Invalid mediaElement provided to buildMediaWrapper');
    return null;
  }

  // Validate mediaAlt (should be string if provided)
  let sanitizedMediaAlt = mediaAlt;
  if (mediaAlt !== undefined && typeof mediaAlt !== 'string') {
    // eslint-disable-next-line no-console
    console.warn('Hero: mediaAlt should be a string, converting to string');
    sanitizedMediaAlt = String(mediaAlt);
  }

  // Validate mediaCaption (should be string if provided)
  let sanitizedMediaCaption = mediaCaption;
  if (mediaCaption !== undefined && typeof mediaCaption !== 'string') {
    // eslint-disable-next-line no-console
    console.warn('Hero: mediaCaption should be a string, converting to string');
    sanitizedMediaCaption = String(mediaCaption);
  }

  try {
    const mediaWrapper = document.createElement('div');
    mediaWrapper.className = HERO_CSS_CLASSES.MEDIA;

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
      captionEl.className = HERO_CSS_CLASSES.CAPTION;
      captionEl.innerHTML = sanitizedMediaCaption;
      decorateIcons(captionEl);
      mediaWrapper.appendChild(captionEl);
    }

    return mediaWrapper;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Hero: Error building media wrapper:', error);
    return null;
  }
}

/**
 * Build video wrapper for native DAM video element
 * @param {HTMLVideoElement} videoElement - The video element from DAM
 * @param {string} mediaCaption - Caption text
 * @returns {HTMLDivElement} wrapper for video
 */
export function heroBuildVideoWrapper(videoElement, mediaCaption) {
  // Validate mediaCaption (should be string if provided)
  let sanitizedMediaCaption = mediaCaption;
  if (mediaCaption !== undefined && typeof mediaCaption !== 'string') {
    // eslint-disable-next-line no-console
    console.warn('Hero: mediaCaption should be a string, converting to string');
    sanitizedMediaCaption = String(mediaCaption);
  }

  const videoWrapper = document.createElement('div');
  videoWrapper.className = `${HERO_CSS_CLASSES.MEDIA} ${HERO_CSS_CLASSES.MEDIA_VIDEO}`;

  // Configure video for hero: autoplay, muted, loop, inline
  if (videoElement) {
    const video = videoElement.cloneNode(true);
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    videoWrapper.appendChild(video);
  }

  // Add caption if exists
  if (sanitizedMediaCaption) {
    const captionEl = document.createElement('p');
    captionEl.className = HERO_CSS_CLASSES.CAPTION;
    captionEl.innerHTML = sanitizedMediaCaption;
    decorateIcons(captionEl);
    videoWrapper.appendChild(captionEl);
  }

  return videoWrapper;
}

/**
 * Create the scroll-hint element used at the bottom of the hero.
 * Uses DOM creation to avoid XSS vulnerabilities and CSP violations.
 * @param {Object} placeholders - Placeholders object for i18n
 * @returns {HTMLDivElement}
 */
export function heroCreateScrollTextElement(placeholders = {}) {
  const scrollText = document.createElement('div');
  scrollText.className = HERO_CSS_CLASSES.SCROLL_TEXT;

  // Create icon span (safe DOM creation)
  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon icon-arrow-downward';
  // Accessibility: Hide decorative icon from screen readers
  iconSpan.setAttribute('aria-hidden', 'true');

  // Create label span (safe DOM creation)
  const labelSpan = document.createElement('span');
  labelSpan.className = 'label';
  // Use placeholder for i18n support, fallback to English
  labelSpan.textContent = placeholders[HERO_SCROLL_TEXT] || 'Scroll';

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
export function heroInitScrollHint(scrollText) {
  // Validate scrollText parameter
  if (!scrollText || !(scrollText instanceof Element)) {
    // eslint-disable-next-line no-console
    console.error('Hero: Invalid scrollText element provided to initScrollHint');
    return null;
  }

  const observer = new IntersectionObserver(([entry]) => {
    const isVisible = entry.intersectionRatio > 0;
    if (!isVisible) {
      scrollText.classList.add(HERO_CSS_CLASSES.HIDDEN);
      scrollText.classList.remove(HERO_CSS_CLASSES.FADE_OUT);
      return;
    }
    scrollText.classList.remove(HERO_CSS_CLASSES.HIDDEN);
  }, { root: null, threshold: HERO_IO_THRESHOLDS });

  observer.observe(scrollText);

  let fadeRaf = 0;
  const updateFade = () => {
    const { top } = scrollText.getBoundingClientRect();
    const shouldFade = top <= HERO_FADE_START_PX;
    scrollText.classList.toggle(HERO_CSS_CLASSES.FADE_OUT, shouldFade);
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
      scrollText.classList.add(HERO_CSS_CLASSES.HIDDEN);
    } else {
      scrollText.classList.remove(HERO_CSS_CLASSES.HIDDEN);
    }

    updateFade();
  };

  // Ensure scroll hint is visible by default on page load
  // The IntersectionObserver and applyInitialState will correct if needed
  scrollText.classList.remove(HERO_CSS_CLASSES.HIDDEN);

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
