/* eslint-disable max-len */

/**
 * Constants for the {BLOCK_FUNC} block module
 * This file contains all hardcoded values used across {BLOCK_NAME}-utils, {BLOCK_NAME}-topic, and {BLOCK_NAME}-post files
 */

// ===== DIV INDEX CONSTANTS =====
export const DIV_INDICES = {
  // Topic {BLOCK_CHILD} div indices (new 20-div structure with imageLink, no title)
  TOPIC_IMAGE: 1,
  TOPIC_IMAGE_LINK: 2, // Image link URL
  TOPIC_SUBTITLE: 3,
  TOPIC_DESCRIPTION: 4,
  TOPIC_LINKS_START: 5, // Links span from div 5 to 16 (6 pairs)
  TOPIC_LINKS_END: 16,

  // Post {BLOCK_CHILD} div indices (new 20-div structure)
  POST_AEM_CONTENT: 17,
  POST_BUTTON_TEXT: 18,
  POST_BUTTON_URL: 19,

  // {BLOCK_CHILD_FUNC} type
  CARD_TYPE: 0,
};

// ===== LEGACY DIV INDEX CONSTANTS (20-div structure, backward compatibility) =====
export const LEGACY_DIV_INDICES = {
  // Topic {BLOCK_CHILD} div indices (legacy 20-div structure without imageLink)
  TOPIC_IMAGE: 1,
  TOPIC_TITLE: 2,
  TOPIC_SUBTITLE: 3,
  TOPIC_DESCRIPTION: 4,
  TOPIC_LINKS_START: 5, // Links span from div 5 to 16 (6 pairs)
  TOPIC_LINKS_END: 16,

  // Post {BLOCK_CHILD} div indices (legacy 20-div structure)
  POST_AEM_CONTENT: 17,
  POST_BUTTON_TEXT: 18,
  POST_BUTTON_URL: 19,

  // {BLOCK_CHILD_FUNC} type
  CARD_TYPE: 0,
};

// ===== CHARACTER LENGTH LIMITS =====
export const CHARACTER_LIMITS = {
  // Post {BLOCK_CHILD} constants
  POST_TAG_MAX_LENGTH: 20,
  POST_DESCRIPTION_ALT_TEXT_MAX: 80,
  POST_MAX_TAGS: 3,
  POST_DESCRIPTION_MAX_LENGTH: 70, // Max chars for post {BLOCK_CHILD} description in grid layout

  // Topic {BLOCK_CHILD} constants
  TOPIC_DESCRIPTION_MAX_LENGTH: 70,
};

// ===== CARD STRUCTURE CONSTANTS =====
export const CARD_STRUCTURE = {
  TOTAL_DIVS: 20, // Each {BLOCK_CHILD} row should have 20 divs (with imageLink, no title)
  LEGACY_TOTAL_DIVS: 20, // Legacy structure without imageLink, with title (backward compatibility)
  TOPIC_LINKS_COUNT: 6, // Maximum number of link pairs for topic {BLOCK_NAME}
  TOPIC_LINKS_PAIR_OFFSET: 2, // Each link pair takes 2 divs (text + URL)
};

// ===== URL AND PATH CONSTANTS =====
export const URLS = {
  DEFAULT_TAG_PAGE_URL: '/jp/ja/article-list',
  LOCALHOST_BASE: 'http://localhost:3000',
  LOCALHOST_PORT: 3000,
};

// ===== TIMEOUT CONSTANTS =====
// Note: These are for UI/UX delays, not API call timeouts
export const TIMEOUTS = {
  LOADING_ANNOUNCEMENT_DURATION: 3000, // 3 seconds for screen reader announcements
  NAVIGATION_ANNOUNCEMENT_DURATION: 1000, // 1 second for navigation announcements
  BUTTON_STATE_INITIALIZATION_DELAY: 100, // 100ms delay for button state initialization
  CAROUSEL_REINITIALIZATION_DELAY: 500, // 500ms delay for carousel re-initialization
};

// ===== CSS CLASS NAMES =====
export const CSS_CLASSES = {
  // {BLOCK_CHILD_FUNC} classes
  CARD: '{BLOCK_CHILD}',
  CARD_CONTENT: '{BLOCK_CHILD}-content',
  CARD_IMAGE: '{BLOCK_CHILD}-image',
  CARD_IMAGE_LINK: '{BLOCK_CHILD}-image-link',
  CARD_IMAGE_SUBTITLE_LINK: '{BLOCK_CHILD}-image-subtitle-link',
  CARD_TITLE: '{BLOCK_CHILD}-title',
  CARD_SUBTITLE: '{BLOCK_CHILD}-subtitle',
  CARD_DESCRIPTION: '{BLOCK_CHILD}-description',
  CARD_TAGS: '{BLOCK_CHILD}-tags',
  CARD_TAG: '{BLOCK_CHILD}-tag',
  CARD_PUBLISH_DATE: '{BLOCK_CHILD}-publish-date',
  CARD_BUTTONS: '{BLOCK_CHILD}-buttons',
  CARD_LINKS: '{BLOCK_CHILD}-links',
  CARD_LINK_ITEM: '{BLOCK_CHILD}-link-item',
  CARD_EMPTY_MESSAGE: '{BLOCK_CHILD}-empty-message',
  CARD_COUNTER: '{BLOCK_CHILD}-counter',
  CARD_COUNTER_INNER: '{BLOCK_CHILD}-counter-inner',

  // {BLOCK_CHILD_FUNC} type classes
  CARD_TOPIC: '{BLOCK_CHILD}-topic',
  CARD_POST: '{BLOCK_CHILD}-post',
  CARD_EMPTY: '{BLOCK_CHILD}-empty',
  CARD_INTERACTIVE: '{BLOCK_CHILD}-interactive',
  HAS_BUTTON: 'has-button',
  NO_IMAGE: 'no-image',

  // Button classes
  BUTTON: 'button',
  BUTTON_PRIMARY: 'button-primary primary',
  BUTTON_SECONDARY: 'button-secondary secondary check-test',
  BUTTON_TEXT: 'button-text',
  LINK: 'link',

  // Layout classes
  CARDS: '{BLOCK_NAME}',
  CARDS_GRID: '{BLOCK_NAME}-grid',
  CARDS_GRID_POST: '{BLOCK_NAME}-grid-post',
  CARDS_GRID_TOPIC: '{BLOCK_NAME}-grid-topic',
  CARDS_GRID_MIXED: '{BLOCK_NAME}-grid-mixed',
  CARDS_CAROUSEL: '{BLOCK_NAME}-carousel',
  CARDS_NUMBERED_TOP: '{BLOCK_NAME}-numbered-top',

  // Navigation classes
  CARDS_NAVIGATION_CONTAINER: '{BLOCK_NAME}-navigation-container',
  CARDS_NAVIGATION_LEFT: '{BLOCK_NAME}-navigation-left',
  CARDS_NAVIGATION_RIGHT: '{BLOCK_NAME}-navigation-right',
  CARDS_CTA_BUTTON: '{BLOCK_NAME}-cta-button',
  CTA_ONLY: 'cta-only',

  // Carousel classes
  CAROUSEL_BUTTONS: 'carousel-buttons',
  CAROUSEL_NAV: 'carousel-nav',
  CAROUSEL_PREV: 'carousel-prev',
  CAROUSEL_NEXT: 'carousel-next',
  DISABLED: 'disabled',

  // Utility classes
  SR_ONLY: 'sr-only',
  LOADED: 'loaded',
};

// ===== ARIA AND ACCESSIBILITY CONSTANTS =====
export const ARIA = {
  ROLES: {
    LIST: 'list',
    LISTITEM: 'listitem',
    BUTTON: 'button',
    REGION: 'region',
    APPLICATION: 'application',
  },
  ATTRIBUTES: {
    LABEL: 'aria-label',
    BUSY: 'aria-busy',
    LIVE: 'aria-live',
    DISABLED: 'aria-disabled',
    ROLE_DESCRIPTION: 'aria-roledescription',
  },
  VALUES: {
    TRUE: 'true',
    FALSE: 'false',
    POLITE: 'polite',
    CAROUSEL: 'carousel',
  },
};

// ===== DATE FORMAT CONSTANTS =====
export const DATE_FORMAT = {
  DAY_PADDING: 2,
  MONTH_PADDING: 2,
  YEAR_SLICE_START: -2, // Get last 2 digits of year
  SEPARATOR: '.', // DD.MM.YY format
};

// ===== SCROLL AND NAVIGATION CONSTANTS =====
export const SCROLL = {
  THRESHOLD: 10, // Pixels threshold for scroll position detection
  BUFFER: 20, // Buffer for horizontal scroll detection
  NAVIGATION_PERCENTAGE: 0.8, // 80% of container width for navigation
  HORIZONTAL_SCROLL_BUFFER: 20, // Buffer for determining if horizontal scroll is needed
};

// ===== CONFIGURATION DEFAULTS =====
export const CONFIG_DEFAULTS = {
  CTA_TEXT: '',
  CTA_LINK: '',
  LAYOUT_VARIANT: 'grid',
  ALIGNMENT: 'left',
  CLASSES: '',
  IS_CAROUSEL: false,
};

// ===== CARD TYPE DETECTION =====
export const CARD_TYPES = {
  TOPIC: 'topic',
  POST: 'post',
  CAROUSEL: 'carousel',
  ARTICLE_CAROUSEL: 'article-carousel',
};

// ===== CAROUSEL CONFIGURATION =====
export const CAROUSEL_CONFIG = {
  TRIGGER_VALUES: ['carousel', 'true', '1'],
  VARIANT_VALUES: ['article-carousel', 'carousel'],
  VISIBLE_CARDS: {
    DESKTOP: 3, // 12 grid / 4 span = 3 {BLOCK_NAME}
    TABLET: 2, // 8 grid / 6 span = ~1.3 {BLOCK_NAME}
    MOBILE: 1, // 4 grid / 4 span = 1 {BLOCK_CHILD}
  },
};

// ===== METADATA FIELD NAMES =====
export const METADATA_FIELDS = {
  OG_IMAGE: 'og:image',
  OG_TITLE: 'og:title',
  OG_DESCRIPTION: 'og:description',
  OG_URL: 'og:url',
  OG_SUBTITLE: 'og:subtitle',
  TITLE: 'title',
  DESCRIPTION: 'description',
  SUBTITLE: 'subtitle',
  CQ_TAGS: 'cq-tags',
  ARTICLE_TAG: 'article:tag',
  PUBLISHED_TIME: 'published-time',
  PUBLISHED_TIME_ALT: 'published_time',
};

// ===== HTTP AND FETCH CONSTANTS =====
export const HTTP = {
  METHODS: {
    HEAD: 'HEAD',
  },
  HEADERS: {
    CACHE_CONTROL: 'Cache-Control',
    NO_CACHE: 'no-cache',
  },
};

// ===== KEYBOARD NAVIGATION =====
export const KEYBOARD = {
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
  },
};

// ===== TEXT CONSTANTS =====
export const TEXT = {
  FALLBACK_ALT_TEXT: 'Article image',
  FALLBACK_TITLE: 'Article Content',
  FALLBACK_TOPIC_ALT_TEXT: 'Topic {BLOCK_CHILD} image',
  IMAGE_LOAD_ERROR_ALT: 'Image failed to load',
  ELLIPSIS: '...',
  MINUS_THREE: -3, // For ellipsis truncation
  EMPTY_CARD_MESSAGE: 'No {BLOCK_CHILD} content found',
  UNKNOWN_CARD_TYPE_PREFIX: 'Unknown {BLOCK_CHILD} type: ',
  LOADING_MESSAGE: 'Loading {BLOCK_NAME}...',
  ERROR_MESSAGE: 'Error loading {BLOCK_NAME}. Please try again.',
  KEYBOARD_INSTRUCTIONS: 'Use arrow keys to navigate carousel, Home for first {BLOCK_CHILD}, End for last {BLOCK_CHILD}',
};

// ===== CONTAINER CONFIGURATION ROW INDICES =====
export const CONTAINER_CONFIG_ROWS = {
  BUTTON_TEXT_ROW: 0,
  BUTTON_LINK_ROW: 1,
  CAROUSEL_FLAG_ROW: 2,
  TOTAL_CONFIG_ROWS: 3,
};

// ===== URL PATTERN CONSTANTS =====
export const URL_PATTERNS = {
  CONTENT_PATH: '/content/',
  AUTHOR_PATTERN: 'author-',
  ADOBEAEMCLOUD_PATTERN: '.adobeaemcloud.com',
  CONTENT_REGEX: /\/content\/[^/]+\/(.*)$/,
};

// ===== ENVIRONMENT DETECTION =====
export const ENVIRONMENT = {
  LOCALHOST: 'localhost',
};
