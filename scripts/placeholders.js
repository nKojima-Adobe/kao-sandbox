/**
 * Placeholder loading utility for i18n support.
 * Fetches locale-specific placeholders from the content repository.
 */

let placeholdersCache = null;

/**
 * Fetch placeholders for the current locale.
 * @param {string} locale - Locale prefix (e.g., '/en', '/ja')
 * @returns {Promise<Object>} Key-value map of placeholder strings
 */
export default async function fetchPlaceholdersForLocale(locale = '') {
  if (placeholdersCache) return placeholdersCache;

  const prefix = locale || '';
  try {
    const resp = await fetch(`${prefix}/placeholders.json`);
    if (!resp.ok) {
      placeholdersCache = {};
      return placeholdersCache;
    }
    const json = await resp.json();
    const placeholders = {};
    if (json.data) {
      json.data.forEach((item) => {
        if (item.Key) {
          placeholders[item.Key] = item.Text || '';
        }
      });
    }
    placeholdersCache = placeholders;
    return placeholders;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load placeholders:', error);
    placeholdersCache = {};
    return placeholdersCache;
  }
}
