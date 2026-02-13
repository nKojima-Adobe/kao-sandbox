// Constants for {BLOCK_FUNC} block

// CSS class names used throughout the {BLOCK_VAR} block
export const {BLOCK_UPPER}_CSS_CLASSES = {
  // Block and container classes
  BLOCK: '{BLOCK_CLASS}',
  SECTION: '{BLOCK_CLASS}-section',
  INNER: '{BLOCK_CLASS}-inner',
  WRAPPER: '{BLOCK_CLASS}-wrapper',
  CONTAINER: 'section {BLOCK_CLASS}-container',

  // Layout classes
  LAYOUT_TEXT_ONLY: '{BLOCK_CLASS}-text-only',
  LAYOUT_CONTAINS_MEDIA: '{BLOCK_CLASS}-contains-media',

  // Content area classes
  CONTENT: '{BLOCK_CLASS}-content',
  CONTENT_INNER: '{BLOCK_CLASS}-content-inner',

  // Text content classes
  PRETITLE: '{BLOCK_CLASS}-pretitle',
  TITLE: '{BLOCK_CLASS}-title',
  TITLE_WITH_PRETITLE: '{BLOCK_CLASS}-title-with-pretitle',
  DESCRIPTION: '{BLOCK_CLASS}-description',

  // Media classes
  MEDIA: '{BLOCK_CLASS}-media',
  MEDIA_IMAGE: '{BLOCK_CLASS}-media-image',
  MEDIA_VIDEO: '{BLOCK_CLASS}-media-video',
  CAPTION: '{BLOCK_CLASS}-caption',

  // CTA classes
  CTA: '{BLOCK_CLASS}-cta',
  CTA_BUTTON: 'button {BLOCK_CLASS}-cta-button',

  // Video control classes
  VIDEO_CONTROL: '{BLOCK_CLASS}-video-control',
  VIDEO_CONTROL_ICON: '{BLOCK_CLASS}-video-control-icon',
  VIDEO_CONTROL_PLAY: '{BLOCK_CLASS}-video-control-play',
  VIDEO_CONTROL_PAUSE: '{BLOCK_CLASS}-video-control-pause',

  // Scroll indicator classes
  SCROLL_TEXT: '{BLOCK_CLASS}-scroll-text',
  HIDDEN: 'hidden',
  FADE_OUT: 'fade-out',

  // Grid classes
  GRID: '{BLOCK_CLASS}-grid',

  // Accessibility classes
  SR_ONLY: 'sr-only visually-hidden',

  // Generic classes
  BUTTON: 'button',
};

/**
 * Field mapping configuration for AEM content model
 * Maps row index to field name for robust parsing
 */
export const {BLOCK_UPPER}_FIELD_MAP = {
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
export const {BLOCK_UPPER}_FADE_START_PX = 300;

/**
 * IntersectionObserver thresholds used for simple visible/not-visible checks
 * [0, 1] means trigger when any part enters/exits (0) and when fully visible (1)
 */
export const {BLOCK_UPPER}_IO_THRESHOLDS = [0, 1];

/**
 * Brightcove attributes to extract from video elements
 */
export const {BLOCK_UPPER}_BRIGHTCOVE_ATTRIBUTES = [
  'data-account',
  'data-player',
  'data-embed',
  'data-video-id',
];

/**
 * Video attributes for {BLOCK_VAR} videos
 */
export const {BLOCK_UPPER}_VIDEO_ATTRIBUTES = {
  CONTROLS: 'controls',
  AUTOPLAY: 'autoplay',
  MUTED: 'muted',
  PLAYSINLINE: 'playsinline',
  LOOP: 'loop',
};

/**
 * Console warning patterns to suppress
 */
export const {BLOCK_UPPER}_CONSOLE_PATTERNS = [
  /robustness level/i,
  /videojs\.plugin\(\) is deprecated/i,
];

// Default caption for accessibility when no caption is provided
export const {BLOCK_UPPER}_DEFAULT_VIDEO_CAPTION = '{BLOCK_FUNC} video content';

/**
 * Counter for generating unique IDs across multiple instances
 * @type {number}
 */
let instanceCounter = 0;

/**
 * Generate a unique ID for {BLOCK_VAR} instances
 * Uses timestamp + counter for guaranteed uniqueness without collisions
 * @returns {string} Unique ID string
 */
export function generate{BLOCK_FUNC}UID() {
  instanceCounter += 1;
  // Combine timestamp with counter for guaranteed uniqueness
  // Format: {BLOCK_NAME}-timestamp-counter (e.g., "{BLOCK_NAME}-1634567890123-1")
  return `{BLOCK_NAME}-${Date.now()}-${instanceCounter}`;
}

export default {
  {BLOCK_UPPER}_CSS_CLASSES,
  {BLOCK_UPPER}_FIELD_MAP,
  {BLOCK_UPPER}_FADE_START_PX,
  {BLOCK_UPPER}_IO_THRESHOLDS,
  {BLOCK_UPPER}_BRIGHTCOVE_ATTRIBUTES,
  {BLOCK_UPPER}_VIDEO_ATTRIBUTES,
  {BLOCK_UPPER}_CONSOLE_PATTERNS,
  generate{BLOCK_FUNC}UID,
};
