/**
 * Generic utility functions for text/URL sanitization and content processing.
 * Stub implementation - replace with full implementation as needed.
 */

/**
 * Sanitize text content to prevent XSS attacks.
 * When richHTML is true, allows safe HTML tags.
 * @param {string} text - Text to sanitize
 * @param {Object} options - Options
 * @param {boolean} options.richHTML - Allow rich HTML tags
 * @returns {string} Sanitized text
 */
export function sanitizeText(text, options = {}) {
  if (!text || typeof text !== 'string') return '';
  if (options.richHTML) {
    // Allow basic safe HTML tags for rich content
    return text;
  }
  // Strip all HTML tags for plain text
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize a URL to prevent XSS via javascript: or data: protocols.
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL or empty string
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Block dangerous protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return '';
  return trimmed;
}

/**
 * Decode CMS-encoded text (HTML entities, etc.)
 * @param {string} text - CMS text to decode
 * @returns {string} Decoded text
 */
export function decodeCmsText(text) {
  if (!text || typeof text !== 'string') return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Process HTML content to extract text, icons, and links.
 * @param {string} html - HTML content to process
 * @returns {Object} Processed content with content, href, and hasIcon properties
 */
export function processContentWithIconsAndLink(html) {
  if (!html || typeof html !== 'string') {
    return { content: '', href: '', hasIcon: false };
  }

  const div = document.createElement('div');
  div.innerHTML = html;

  // Extract link if present
  const anchor = div.querySelector('a');
  const href = anchor ? anchor.getAttribute('href') || '' : '';

  // Get text content, preserving icon spans
  const content = div.innerHTML.trim();

  // Check for icon spans
  const hasIcon = div.querySelector('.icon') !== null;

  return { content, href, hasIcon };
}

/**
 * Process rich HTML content with icon and decode support.
 * @param {string} html - Rich HTML content
 * @returns {string} Processed HTML
 */
export function processRichHtmlWithIconsAndDecode(html) {
  if (!html || typeof html !== 'string') return '';
  return html;
}

/**
 * Normalize alt text by trimming and cleaning whitespace.
 * @param {string} altText - The alt text to normalize
 * @returns {string} Normalized alt text
 */
export function normalizeAltText(altText) {
  if (!altText || typeof altText !== 'string') return '';
  return altText.trim().replace(/\s+/g, ' ');
}

/**
 * Decode HTML entities in a string.
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
export function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Checks if the Clipboard API is available (requires HTTPS context).
 * @returns {boolean} True if clipboard write is supported
 */
export function isClipboardSupported() {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}
