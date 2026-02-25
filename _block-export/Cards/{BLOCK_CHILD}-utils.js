/* eslint-disable max-len */
import { decorateIcons, getMetadata } from '../../scripts/aem.js';
import fetchPlaceholdersForLocale from '../../scripts/placeholders.js';
import {
  OG_FALLBACK_IMAGE,
} from '../../constants/placeholders-constants.js';
import {
  CSS_CLASSES,
  URLS,
  ENVIRONMENT,
  URL_PATTERNS,
  METADATA_FIELDS,
  HTTP,
  TEXT,
} from '../../constants/{BLOCK_NAME}-constants.js';

// Cache for metadata to avoid duplicate requests
const metadataCache = new Map();

// Queue for batching metadata requests
const metadataQueue = new Map();

// Cache for failed requests to avoid retries
const failedRequestsCache = new Set();

/**
 * Adds lazy loading behavior to images
 * @param {Element} imgElement The image element
 */
export function addLazyLoadingBehavior(imgElement) {
  if (imgElement.loading === 'lazy') {
    const handleLoad = () => {
      imgElement.classList.add(CSS_CLASSES.LOADED);
      imgElement.removeEventListener('load', handleLoad);
    };

    imgElement.addEventListener('load', handleLoad);

    // If image is already loaded
    if (imgElement.complete) {
      imgElement.classList.add(CSS_CLASSES.LOADED);
    }
  }
}

/**
 * Adds enhanced lazy loading behavior with accessibility support
 * Sets aria-busy during loading and handles load/error states
 * @param {Element} imgElement The image element
 * @param {string} [errorAltText] Alt text to show on error (default: 'Image failed to load')
 */
export function addAccessibleLazyLoadingBehavior(imgElement, errorAltText = TEXT.IMAGE_LOAD_ERROR_ALT) {
  // Add loading state for screen readers
  imgElement.setAttribute('aria-busy', 'true');

  // Apply base lazy loading behavior
  addLazyLoadingBehavior(imgElement);

  // Add load event for accessibility
  const handleAccessibleLoad = () => {
    imgElement.setAttribute('aria-busy', 'false');
    imgElement.removeEventListener('load', handleAccessibleLoad);
  };
  imgElement.addEventListener('load', handleAccessibleLoad);

  // Handle load errors
  const handleError = () => {
    imgElement.setAttribute('aria-busy', 'false');
    imgElement.alt = errorAltText;
    imgElement.removeEventListener('error', handleError);
  };
  imgElement.addEventListener('error', handleError);

  // If image is already loaded or errored
  if (imgElement.complete) {
    imgElement.setAttribute('aria-busy', 'false');
  }
}

/**
 * Creates a button with the proper structure for styling
 * @param {string} text Button text
 * @param {string} href Button link
 * @param {string} title Button title attribute (optional)
 * @param {boolean|string} typeOrIsSecondary Type of button ('primary', 'secondary') or boolean for backward compatibility
 * @returns {Element} The created button element
 */
export function createButton(text, href, title, typeOrIsSecondary) {
  // Create button container
  const button = document.createElement('a');
  button.href = href;

  // Handle title if provided
  if (title) {
    button.title = title;
  }

  // Determine button type
  let type;
  if (typeof typeOrIsSecondary === 'string') {
    type = typeOrIsSecondary; // New usage with type parameter
  } else {
    // Legacy usage with isSecondary boolean
    type = typeOrIsSecondary ? 'secondary' : 'primary';
  }

  // Set button class based on type
  if (type === 'secondary') {
    button.className = `${CSS_CLASSES.BUTTON} ${CSS_CLASSES.BUTTON_SECONDARY}`;
  } else if (type === 'primary') {
    button.className = `${CSS_CLASSES.BUTTON} ${CSS_CLASSES.BUTTON_PRIMARY}`;
  } else {
    button.className = CSS_CLASSES.LINK; // Keep 'link' for compatibility
  }
  // Create text element and handle HTML content
  const textElement = document.createElement('span');
  textElement.className = CSS_CLASSES.BUTTON_TEXT;
  textElement.innerHTML = text;

  // Assemble button
  button.appendChild(textElement);

  // Decorate icons
  decorateIcons(button);

  return button;
}

/**
 * Extract the page path from AEM content URL
 * @param {string} url The original URL containing /content/{site-name}/
 * @returns {string} The extracted page path after /content/{site-name}/
 */
function extractPagePath(url) {
  try {
    const urlObj = new URL(url);
    const { pathname } = urlObj;

    // Check if it's a content path
    if (pathname.includes(URL_PATTERNS.CONTENT_PATH)) {
      // Split the pathname into segments and filter out empty segments
      const segments = pathname.split('/').filter((segment) => segment);

      // Find the index of 'content' segment
      const contentIndex = segments.indexOf('content');

      if (contentIndex !== -1 && segments.length > contentIndex + 2) {
        // Skip 'content' and the next segment (site name), return the rest
        const pageSegments = segments.slice(contentIndex + 2);
        return pageSegments.join('/');
      }
    }

    // Fallback: try to extract using regex
    const match = url.match(URL_PATTERNS.CONTENT_REGEX);
    return match ? match[1] : pathname.substring(1); // Remove leading slash
  } catch (error) {
    return url;
  }
}

/**
 * Transform URL based on environment (authoring vs live/EDS)
 * @param {string} url The original URL
 * @returns {string} The transformed URL
 */
function transformUrl(url) {
  // Check if we're in authoring mode (AEM Cloud URL)
  if (url.includes(URL_PATTERNS.AUTHOR_PATTERN) && url.includes(URL_PATTERNS.ADOBEAEMCLOUD_PATTERN)) {
    return url; // Return as-is for authoring mode
  }

  if (url.includes(URL_PATTERNS.CONTENT_PATH)) {
    // Extract the page path dynamically
    const pagePath = extractPagePath(url);

    // Determine the base URL based on current environment
    if (window.location.hostname === ENVIRONMENT.LOCALHOST) {
      return `${URLS.LOCALHOST_BASE}/${pagePath}`;
    }

    // For EDS/live environment, use current protocol and hostname
    return `${window.location.protocol}//${window.location.hostname}/${pagePath}`;
  }

  return url; // Return as-is if not a content URL
}

/**
 * Validates if an image URL is accessible
 * @param {string} imageUrl The image URL to validate
 * @returns {Promise<boolean>} Promise that resolves to true if image is accessible
 */
async function validateImageUrl(imageUrl) {
  if (!imageUrl) return false;

  try {
    const response = await fetch(imageUrl, {
      method: HTTP.METHODS.HEAD,
    });

    // If HEAD request succeeds, image is valid
    if (response.ok) {
      return true;
    }

    // If HEAD fails with 401/403, try GET request (some servers block HEAD)
    if (response.status === 401 || response.status === 403) {
      try {
        const getResponse = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            Range: 'bytes=0-1023', // Only fetch first 1KB to check if accessible
          },
        });
        return getResponse.ok;
      } catch (getError) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Internal function to fetch metadata from URL with comprehensive error handling
 * @param {string} url The URL to fetch metadata from
 * @returns {Promise<Object>} Promise that resolves to metadata object
 */
async function fetchMetadataFromUrl(url) {
  // Check if this URL has already failed to avoid repeated attempts
  if (failedRequestsCache.has(url)) {
    return {
      title: TEXT.FALLBACK_TITLE,
      description: `Content from: ${url}`,
      image: '',
      url,
      tags: '',
      publishDate: '',
      subtitle: '',
    };
  }

  // Transform URL based on environment
  const transformedUrl = transformUrl(url);
  const placeholders = await fetchPlaceholdersForLocale();

  try {
    const response = await fetch(transformedUrl, {
      headers: {
        [HTTP.HEADERS.CACHE_CONTROL]: HTTP.HEADERS.NO_CACHE,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract metadata using the same getMetadata function
    const extractedImage = getMetadata(METADATA_FIELDS.OG_IMAGE, doc) || '';

    // Validate the extracted image URL
    const isImageValid = await validateImageUrl(extractedImage);
    const finalImage = isImageValid ? extractedImage : (placeholders[OG_FALLBACK_IMAGE] || '');

    const metadata = {
      title: getMetadata(METADATA_FIELDS.OG_TITLE, doc) || getMetadata(METADATA_FIELDS.TITLE, doc) || doc.title || 'Article',
      description: getMetadata(METADATA_FIELDS.OG_DESCRIPTION, doc) || getMetadata(METADATA_FIELDS.DESCRIPTION, doc) || '',
      image: finalImage,
      url: getMetadata(METADATA_FIELDS.OG_URL, doc) || transformedUrl,
      // Combine tags from both cq-tags and article:tag sources
      tags: [
        getMetadata(METADATA_FIELDS.CQ_TAGS, doc),
        getMetadata(METADATA_FIELDS.ARTICLE_TAG, doc),
      ].filter(Boolean).join(','),
      publishDate: getMetadata(METADATA_FIELDS.PUBLISHED_TIME, doc) || getMetadata(METADATA_FIELDS.PUBLISHED_TIME_ALT, doc) || '',
      subtitle: getMetadata(METADATA_FIELDS.SUBTITLE, doc) || getMetadata(METADATA_FIELDS.OG_SUBTITLE, doc) || '',
    };

    return metadata;
  } catch (error) {
    // Determine error type for better handling
    let errorType = 'unknown';
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorType = 'network';
    } else if (error.message.includes('HTTP')) {
      errorType = 'http';
    } else if (error.name === 'SyntaxError') {
      errorType = 'parsing';
    }

    // Add to failed cache to prevent retries for certain error types
    // Don't cache network errors as they might be temporary
    if (errorType !== 'network') {
      failedRequestsCache.add(url);
    }

    // Return fallback metadata with more detailed error information
    const fallbackMetadata = {
      title: TEXT.FALLBACK_TITLE,
      description: `Content from: ${transformedUrl}`,
      image: placeholders[OG_FALLBACK_IMAGE] || '',
      url: transformedUrl,
      tags: '',
      publishDate: '',
      subtitle: '',
      errorType, // Include error type for debugging
      errorMessage: error.message, // Include error details for debugging
    };

    return fallbackMetadata;
  }
}

/**
 * Optimized metadata fetching with caching and batching
 * @param {string} url The URL to fetch metadata from
 * @returns {Promise<Object>} Promise that resolves to metadata object
 */
export async function fetchPageMetadata(url) {
  // Check cache first
  if (metadataCache.has(url)) {
    return metadataCache.get(url);
  }

  // Check if request is already in progress
  if (metadataQueue.has(url)) {
    return metadataQueue.get(url);
  }

  // Create new request and add to queue
  const metadataPromise = fetchMetadataFromUrl(url);
  metadataQueue.set(url, metadataPromise);

  try {
    const metadata = await metadataPromise;
    // Cache the result
    metadataCache.set(url, metadata);
    return metadata;
  } finally {
    // Remove from queue when done
    metadataQueue.delete(url);
  }
}

/**
 * Batch fetch metadata for multiple URLs
 * @param {string[]} urls Array of URLs to fetch metadata from
 * @returns {Promise<Object[]>} Promise that resolves to array of metadata objects
 */
export async function batchFetchMetadata(urls) {
  const results = urls.map((url) => fetchPageMetadata(url).then((metadata) => ({
    url,
    metadata,
  })));

  const allResults = await Promise.all(results);
  return allResults.reduce((acc, { url, metadata }) => {
    acc[url] = metadata;
    return acc;
  }, {});
}
