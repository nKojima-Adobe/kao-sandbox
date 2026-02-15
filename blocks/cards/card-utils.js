/**
 * Card utility functions stub.
 * Provides a basic implementation for fetching page metadata.
 */

/**
 * Fetch metadata for a given page URL.
 * Used by carousel to auto-populate slide title/description from linked pages.
 * @param {string} url - The page URL to fetch metadata for
 * @returns {Promise<Object>} Page metadata object
 */
export async function fetchPageMetadata(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return {};
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaContent = (name) => {
      const meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return meta ? meta.content : '';
    };

    return {
      title: getMetaContent('og:title') || doc.title || '',
      description: getMetaContent('og:description') || getMetaContent('description') || '',
      image: getMetaContent('og:image') || '',
    };
  } catch (e) {
    return {};
  }
}

export default { fetchPageMetadata };
