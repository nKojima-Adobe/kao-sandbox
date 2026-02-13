/**
 * Carousel Block Constants
 * Centralized constants for carousel configuration and behavior
 */

/**
 * Autoplay interval in milliseconds
 * Time each slide is displayed before advancing to next
 * @type {number}
 */
export const AUTOPLAY_INTERVAL = 5000; // 5 seconds

/**
 * Regular expression to detect media file extensions
 * Used to skip metadata fetching for direct media URLs
 * @type {RegExp}
 */
export const MEDIA_EXTENSIONS_REGEX = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|pdf)(\?|$)/i;

/**
 * Layout variation options for carousel
 * @type {Array<string>}
 */
export const LAYOUT_VARIATIONS = [
  'full-grid',
  'full-width',
  'image-only-medium',
  'image-only-large',
  'kao-home',
];

/**
 * Configuration keys recognized by carousel
 * @type {Array<string>}
 */
export const CONFIG_KEYS = [
  'full-grid',
  'full-width',
  'image-only-medium',
  'image-only-large',
  'layout',
];

/**
 * Generic authoring labels to filter out from slide content
 * @type {Array<string>}
 */
export const GENERIC_LABELS = ['image', 'video', 'picture', 'media'];

/**
 * Media element priority order for slide media selection
 * @type {Array<string>}
 */
export const MEDIA_PRIORITY_SELECTORS = ['video-js', 'video', 'iframe', 'picture', 'img'];

/**
 * Maximum length for metadata key candidates
 * Keys longer than this are not considered valid metadata keys
 * @type {number}
 */
export const META_KEY_MAX_LENGTH = 40;

/**
 * Minimum swipe distance in pixels to trigger slide navigation
 * @type {number}
 */
export const SWIPE_THRESHOLD = 50;

/**
 * Mobile breakpoint in pixels
 * @type {number}
 */
export const MOBILE_BREAKPOINT = 800;

/**
 * Animation duration for CTA (in milliseconds)
 * Used when CTA transition is not available
 * @type {number}
 */
export const CTA_ANIMATION_DURATION = 3150;

/**
 * Scroll position threshold for "near top" detection (in pixels)
 * Used for collapsing carousel animation
 * @type {number}
 */
export const NEAR_TOP_THRESHOLD = 200;

/**
 * Viewport middle percentage for scroll trigger
 * Carousel animations start when reaching this viewport position
 * @type {number}
 */
export const VIEWPORT_TRIGGER_RATIO = 0.5; // 50% of viewport height

/**
 * Counter for generating unique IDs across multiple carousel instances
 * @type {number}
 */
let instanceCounter = 0;

/**
 * Generate a unique ID for carousel instances
 * Uses timestamp + counter for guaranteed uniqueness without collisions
 * @returns {string} Unique ID string
 */
export function generateCarouselUID() {
  instanceCounter += 1;
  // Combine timestamp with counter for guaranteed uniqueness
  // Format: carousel-timestamp-counter (e.g., "carousel-1634567890123-1")
  return `carousel-${Date.now()}-${instanceCounter}`;
}
