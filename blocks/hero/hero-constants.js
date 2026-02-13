// Constants for Hero block

// CSS class names used throughout the hero block
export const HERO_CSS_CLASSES = {
  // Block and container classes
  BLOCK: 'hero',
  SECTION: 'hero-section',
  INNER: 'hero-inner',
  WRAPPER: 'hero-wrapper',
  CONTAINER: 'section hero-container',

  // Layout classes
  LAYOUT_TEXT_ONLY: 'hero-text-only',
  LAYOUT_CONTAINS_MEDIA: 'hero-contains-media',

  // Content area classes
  CONTENT: 'hero-content',
  CONTENT_INNER: 'hero-content-inner',

  // Text content classes
  PRETITLE: 'hero-pretitle',
  TITLE: 'hero-title',
  TITLE_WITH_PRETITLE: 'hero-title-with-pretitle',
  DESCRIPTION: 'hero-description',

  // Media classes
  MEDIA: 'hero-media',
  MEDIA_IMAGE: 'hero-media-image',
  MEDIA_VIDEO: 'hero-media-video',
  CAPTION: 'hero-caption',

  // CTA classes
  CTA: 'hero-cta',
  CTA_BUTTON: 'button hero-cta-button',

  // Video control classes
  VIDEO_CONTROL: 'hero-video-control',
  VIDEO_CONTROL_ICON: 'hero-video-control-icon',
  VIDEO_CONTROL_PLAY: 'hero-video-control-play',
  VIDEO_CONTROL_PAUSE: 'hero-video-control-pause',

  // Scroll indicator classes
  SCROLL_TEXT: 'hero-scroll-text',
  HIDDEN: 'hidden',
  FADE_OUT: 'fade-out',

  // Grid classes
  GRID: 'hero-grid',

  // Accessibility classes
  SR_ONLY: 'sr-only visually-hidden',

  // Generic classes
  BUTTON: 'button',
};

/**
 * Field mapping configuration for AEM content model
 * Maps row index to field name for robust parsing
 */
export const HERO_FIELD_MAP = {
  0: 'layout',
  1: 'mediaType',
  2: 'mediaImage',
  3: 'mediaVideo',
  4: 'altText',
  5: 'caption',
  6: 'pretitle',
  7: 'title',
  8: 'description',
  9: 'ctaButtonLink',
  10: 'ctaButtonText',
};

/**
 * Scroll hint fade start position (pixels from top of viewport)
 * When scroll hint element's top edge reaches this position, it starts fading out
 */
export const HERO_FADE_START_PX = 300;

/**
 * IntersectionObserver thresholds used for simple visible/not-visible checks
 * [0, 1] means trigger when any part enters/exits (0) and when fully visible (1)
 */
export const HERO_IO_THRESHOLDS = [0, 1];

/**
 * Brightcove attributes to extract from video elements
 */
export const HERO_BRIGHTCOVE_ATTRIBUTES = [
  'data-account',
  'data-player',
  'data-embed',
  'data-video-id',
];

/**
 * Video attributes for hero videos
 */
export const HERO_VIDEO_ATTRIBUTES = {
  CONTROLS: 'controls',
  AUTOPLAY: 'autoplay',
  MUTED: 'muted',
  PLAYSINLINE: 'playsinline',
  LOOP: 'loop',
};

/**
 * Console warning patterns to suppress
 */
export const HERO_CONSOLE_PATTERNS = [
  /robustness level/i,
  /videojs\.plugin\(\) is deprecated/i,
];

// Default caption for accessibility when no caption is provided
export const HERO_DEFAULT_VIDEO_CAPTION = 'Hero video content';

/**
 * Counter for generating unique IDs across multiple instances
 * @type {number}
 */
let instanceCounter = 0;

/**
 * Generate a unique ID for hero instances
 * Uses timestamp + counter for guaranteed uniqueness without collisions
 * @returns {string} Unique ID string
 */
export function generateHeroUID() {
  instanceCounter += 1;
  // Combine timestamp with counter for guaranteed uniqueness
  // Format: hero-timestamp-counter (e.g., "hero-1634567890123-1")
  return `hero-${Date.now()}-${instanceCounter}`;
}

export default {
  HERO_CSS_CLASSES,
  HERO_FIELD_MAP,
  HERO_FADE_START_PX,
  HERO_IO_THRESHOLDS,
  HERO_BRIGHTCOVE_ATTRIBUTES,
  HERO_VIDEO_ATTRIBUTES,
  HERO_CONSOLE_PATTERNS,
  generateHeroUID,
};
