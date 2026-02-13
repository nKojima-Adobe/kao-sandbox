/**
 * Analytics data layer utilities.
 * Stub implementation for tracking element interactions.
 */

/**
 * Track an element interaction event.
 * @param {string} eventName - Name of the event
 * @param {Object} data - Event data
 * @param {string} data.elementType - Type of element
 * @param {string} data.elementText - Element text content
 * @param {string} data.elementHref - Element link URL
 * @param {Object} data.additionalData - Additional tracking data
 */
export function trackElementInteraction(eventName, data = {}) {
  try {
    // Push to data layer if available
    if (window.adobeDataLayer) {
      window.adobeDataLayer.push({
        event: eventName,
        ...data,
      });
    }
  } catch (error) {
    // Silent fail - analytics should never break the page
  }
}

/**
 * Sanitize a URL for analytics tracking.
 * Converts relative URLs to absolute and removes sensitive parameters.
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrlForAnalytics(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const fullUrl = new URL(url, window.location.origin);
    // Remove sensitive query parameters
    ['token', 'auth', 'key', 'secret', 'password'].forEach((param) => {
      fullUrl.searchParams.delete(param);
    });
    return fullUrl.toString();
  } catch (e) {
    return url;
  }
}
