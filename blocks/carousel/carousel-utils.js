/**
 * Carousel Block Utilities
 * Utility functions for carousel block functionality
 */

import { sanitizeText, sanitizeUrl, decodeHtmlEntities } from '../../utils/generic-utils.js';
import {
  CAROUSEL_PAUSE_VIDEO_ARIA_LABEL,
  CAROUSEL_PLAY_VIDEO_ARIA_LABEL,
  CAROUSEL_SLIDE_ANNOUNCEMENT,
} from '../../constants/placeholders-constants.js';

// Re-export for convenience
export { sanitizeText, sanitizeUrl, decodeHtmlEntities };

/**
 * Create an HTML element with optional properties
 * Reduces boilerplate for common element creation patterns
 * @param {string} tag - HTML tag name
 * @param {Object} options - Element configuration options
 * @param {string} [options.className] - CSS class name(s)
 * @param {string} [options.textContent] - Text content
 * @param {string} [options.innerHTML] - HTML content
 * @param {Object} [options.attributes] - Key-value pairs of attributes
 * @param {HTMLElement} [options.parent] - Parent element to append to
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, options = {}) {
  const el = document.createElement(tag);

  if (options.className) el.className = options.className;
  if (options.textContent) el.textContent = options.textContent;
  if (options.innerHTML) el.innerHTML = options.innerHTML;
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  if (options.parent) options.parent.appendChild(el);

  return el;
}

/**
 * Validate URL specifically for carousel (wrapper around sanitizeUrl)
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid and safe
 */
export function isValidCarouselUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const sanitized = sanitizeUrl(url);
  return sanitized !== '';
}

/**
 * Configure videojs log level to suppress verbose logging
 * Safe wrapper that handles missing videojs gracefully
 */
function configureVideoJsLogging() {
  try {
    if (typeof window.videojs?.log?.level === 'function') {
      window.videojs.log.level('error');
    }
  } catch (e) {
    // Silent fail - logging configuration is not critical
  }
}

/**
 * Manages video control state in a centralized way
 * Prevents state sync issues by maintaining single source of truth
 */
class VideoControlState {
  /**
   * @param {HTMLButtonElement} carouselVideoControlBtn - Control button element
   * @param {Object} videoPlayer - Brightcove player instance
   * @param {Object} placeholders - Placeholders object for i18n
   */
  constructor(carouselVideoControlBtn, videoPlayer, placeholders = {}) {
    this.carouselVideoControlBtn = carouselVideoControlBtn;
    this.videoPlayer = videoPlayer;
    this.videoControlIconSpan = carouselVideoControlBtn.querySelector('span');
    // eslint-disable-next-line no-underscore-dangle
    this._isPlaying = true;
    this.placeholders = placeholders;
  }

  /**
   * Get current playing state
   * @returns {boolean} - True if video is playing
   */
  get isPlaying() {
    // eslint-disable-next-line no-underscore-dangle
    return this._isPlaying;
  }

  /**
   * Update state and sync UI elements
   * Single source of truth for state changes
   * @param {boolean} playing - New playing state
   */
  updateState(playing) {
    // eslint-disable-next-line no-underscore-dangle
    this._isPlaying = playing;

    if (playing) {
      this.videoControlIconSpan.className = 'carousel-video-control-icon carousel-video-control-pause';
      this.carouselVideoControlBtn.setAttribute('aria-label', this.placeholders[CAROUSEL_PAUSE_VIDEO_ARIA_LABEL] || 'Pause video');
      this.carouselVideoControlBtn.setAttribute('aria-pressed', 'true');
    } else {
      this.videoControlIconSpan.className = 'carousel-video-control-icon carousel-video-control-play';
      this.carouselVideoControlBtn.setAttribute('aria-label', this.placeholders[CAROUSEL_PLAY_VIDEO_ARIA_LABEL] || 'Play video');
      this.carouselVideoControlBtn.setAttribute('aria-pressed', 'false');
    }
  }

  /**
   * Toggle play/pause
   * State will be updated by video player 'play'/'pause' events
   * This ensures UI always matches actual video player state
   */
  async toggle() {
    try {
      // eslint-disable-next-line no-underscore-dangle
      if (this._isPlaying) {
        await this.videoPlayer.pause();
      } else {
        await this.videoPlayer.play();
      }
    } catch (error) {
      // Log error but don't break the UI
      // eslint-disable-next-line no-console
      console.error('Video playback control failed:', error);
      // Optionally could show user notification here
    }
  }
}

/**
 * Wait for Brightcove video player to be ready using exponential backoff
 * More efficient than polling - checks frequently early, backs off if needed
 * @param {string} videoId - The video element ID
 * @param {number} maxWait - Maximum wait time in milliseconds (default 10000)
 * @returns {Promise<Object|null>} - Returns video player instance or null if timeout
 */
async function waitForVideoPlayer(videoId, maxWait = 10000) {
  const startTime = Date.now();
  let delay = 50; // Start with 50ms

  while (Date.now() - startTime < maxWait) {
    if (window.bc && window.videojs) {
      try {
        const videoPlayer = window.videojs.getPlayer(videoId);
        if (videoPlayer) return videoPlayer;
      } catch (e) {
        // Video player not ready yet, continue waiting
      }
    }

    // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, 1000ms (max)
    // Reduces CPU usage while maintaining responsiveness
    // eslint-disable-next-line no-await-in-loop, no-loop-func
    await new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
    delay = Math.min(delay * 2, 1000);
  }

  // Timeout - return null instead of throwing to maintain backward compatibility
  return null;
}

/**
 * Create custom play/pause button overlay for carousel video
 * @param {Object} placeholders - Placeholders object for i18n
 * @returns {HTMLButtonElement} - The custom control button
 */
export function createCarouselVideoControlButton(placeholders = {}) {
  const carouselVideoControlBtn = document.createElement('button');
  carouselVideoControlBtn.className = 'carousel-video-control';
  carouselVideoControlBtn.setAttribute('aria-label', placeholders[CAROUSEL_PAUSE_VIDEO_ARIA_LABEL] || 'Pause video');
  carouselVideoControlBtn.setAttribute('type', 'button');
  carouselVideoControlBtn.setAttribute('aria-pressed', 'false');

  // Create icon span
  const videoControlIconSpan = document.createElement('span');
  videoControlIconSpan.className = 'carousel-video-control-icon carousel-video-control-pause';
  videoControlIconSpan.setAttribute('aria-hidden', 'true');
  carouselVideoControlBtn.appendChild(videoControlIconSpan);

  return carouselVideoControlBtn;
}

/**
 * Create event handlers for video controls
 * @param {VideoControlState} videoControlState - State manager instance
 * @returns {Object} - Object containing event handler functions
 */
function createVideoHandlers(videoControlState) {
  const handleVideoClick = () => {
    // Handle async toggle - errors are caught inside toggle()
    videoControlState.toggle().catch((error) => {
      // Additional error handling if needed
      // eslint-disable-next-line no-console
      console.warn('Toggle operation failed:', error);
    });
  };

  const handleVideoPause = () => {
    try {
      videoControlState.updateState(false);
    } catch (error) {
      // Log but don't break - state update should rarely fail
      // eslint-disable-next-line no-console
      console.warn('Pause state update failed:', error);
    }
  };

  const handleVideoPlay = () => {
    try {
      videoControlState.updateState(true);
    } catch (error) {
      // Log but don't break - state update should rarely fail
      // eslint-disable-next-line no-console
      console.warn('Play state update failed:', error);
    }
  };

  return { handleVideoClick, handleVideoPause, handleVideoPlay };
}

/**
 * Setup video control button with video player integration
 * @param {HTMLButtonElement} carouselVideoControlBtn - Control button element
 * @param {Object} videoPlayer - Brightcove video player instance
 * @param {Object} placeholders - Placeholders object for i18n
 * @returns {Object} - Object with state manager and handlers
 */
function setupVideoControlButton(carouselVideoControlBtn, videoPlayer, placeholders = {}) {
  // Suppress verbose videojs logging
  configureVideoJsLogging();

  // Create centralized state manager (single source of truth)
  const videoControlState = new VideoControlState(
    carouselVideoControlBtn,
    videoPlayer,
    placeholders,
  );

  // Sync initial state with actual video player state
  // This ensures UI matches video player state from the start
  try {
    const isActuallyPlaying = !videoPlayer.paused();
    videoControlState.updateState(isActuallyPlaying);
  } catch (error) {
    // If we can't determine state, fall back to playing (autoplay videos)
    // eslint-disable-next-line no-console
    console.warn('Could not determine initial video player state:', error);
    videoControlState.updateState(true);
  }

  // Create event handlers that delegate to state manager
  const handlers = createVideoHandlers(videoControlState);

  // Wire up event listeners
  carouselVideoControlBtn.addEventListener('click', handlers.handleVideoClick);
  videoPlayer.on('pause', handlers.handleVideoPause);
  videoPlayer.on('play', handlers.handleVideoPlay);

  return { videoControlState, handlers };
}

/**
 * Cleanup function for video controls
 * @param {HTMLButtonElement} carouselVideoControlBtn - Control button element
 * @param {Object} videoPlayer - Brightcove video player instance
 * @param {Object} handlers - Event handlers object
 */
function cleanupVideoControls(carouselVideoControlBtn, videoPlayer, handlers) {
  if (handlers.handleVideoClick) {
    carouselVideoControlBtn.removeEventListener('click', handlers.handleVideoClick);
  }

  if (videoPlayer && handlers) {
    if (handlers.handleVideoPause) {
      videoPlayer.off('pause', handlers.handleVideoPause);
    }
    if (handlers.handleVideoPlay) {
      videoPlayer.off('play', handlers.handleVideoPlay);
    }
  }
}

/**
 * Initialize video controls for carousel video using async exponential backoff
 * Simplified main function with extracted helper functions
 * @param {HTMLElement} mediaWrapper - The media wrapper element
 * @param {HTMLElement} videoJsEl - The video-js element
 * @param {Object} placeholders - Placeholders object for i18n
 * @returns {Promise<Function|null>} - Promise resolving to cleanup function or null
 */
export async function initCarouselVideoControls(mediaWrapper, videoJsEl, placeholders = {}) {
  const videoId = videoJsEl.getAttribute('id');
  if (!videoId) return null;

  // Create custom control button
  const carouselVideoControlBtn = createCarouselVideoControlButton(placeholders);
  mediaWrapper.appendChild(carouselVideoControlBtn);

  try {
    // Wait for Brightcove video player with exponential backoff
    const videoPlayer = await waitForVideoPlayer(videoId);

    if (!videoPlayer) {
      // Video player initialization timeout - remove button
      carouselVideoControlBtn.remove();
      return null;
    }

    // Setup control button with video player integration
    const { handlers } = setupVideoControlButton(
      carouselVideoControlBtn,
      videoPlayer,
      placeholders,
    );

    // Return cleanup function with descriptive name for debugging
    const handleCleanup = () => cleanupVideoControls(
      carouselVideoControlBtn,
      videoPlayer,
      handlers,
    );
    return handleCleanup;
  } catch (error) {
    // Failed to initialize - cleanup and return null
    carouselVideoControlBtn.remove();
    return null;
  }
}

/**
 * Create live region for screen reader announcements
 * Styles defined in carousel.css for proper separation of concerns
 * @param {HTMLElement} container - Container to append live region to
 * @returns {HTMLElement} - The live region element
 */
export function createLiveRegion(container) {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'carousel-live-region';

  if (container) {
    container.appendChild(liveRegion);
  }

  return liveRegion;
}

/**
 * Announce slide changes to screen readers
 * @param {HTMLElement} liveRegion - The live region element
 * @param {number} index - Current slide index
 * @param {number} totalSlides - Total number of slides
 * @param {Object} placeholders - Placeholders object for i18n
 * @param {string} [extraLabel] - Optional extra description (e.g., video aria-label)
 */
export function announceSlideChange(
  liveRegion,
  index,
  totalSlides,
  placeholders = {},
  extraLabel = '',
) {
  // Validate parameters
  if (typeof index !== 'number' || !liveRegion || typeof totalSlides !== 'number') return;

  const slideNum = index + 1;
  const template = placeholders[CAROUSEL_SLIDE_ANNOUNCEMENT] || 'Slide {0} of {1}';
  let message = template.replace('{0}', slideNum).replace('{1}', totalSlides);

  const extra = (extraLabel || '').trim();
  if (extra) {
    message = `${message}, ${extra}`;
  }

  liveRegion.textContent = message;
}
