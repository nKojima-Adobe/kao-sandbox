/**
 * Video utility functions shared across video-related blocks.
 */

/**
 * Normalize text by decoding HTML entities and cleaning up whitespace.
 * Used for parsing video embed codes from richtext fields.
 * @param {string} text - Raw text to normalize
 * @returns {string} Normalized text
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  // Decode common HTML entities
  let normalized = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'");

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Extract a video-js element from a container.
 * Stub: returns null since Brightcove is not used in this project.
 * @param {HTMLElement} container - The container to search
 * @returns {HTMLElement|null} The video-js element or null
 */
export function extractVideoJsElement() {
  return null;
}

export default { normalizeText, extractVideoJsElement };
