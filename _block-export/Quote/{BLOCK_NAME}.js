import { sanitizeUrl, normalizeAltText } from '../../utils/generic-utils.js';

export default async function decorate(block) {
  // Extract data from block structure
  const rows = [...block.children];
  const data = {};

  // Parse block data based on row structure
  // Keys mapping to row indices based on _{BLOCK_NAME}.json configuration
  const keyMapping = [
    'variant',
    'logo',
    'logoAltText',
    'quoteText',
    'attributionInfo1',
    'attributionInfo2',
    'attributionLink',
    'attributionAvatar',
  ];

  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length >= 1 && keyMapping[index]) {
      const key = keyMapping[index];
      const value = cells[0]; // Take the first (and possibly only) cell as value
      data[key] = value;
    }
  });

  // Get variant from block classes or default
  let variant = 'default';
  const variantText = data.variant?.textContent || '';
  if (variantText.includes('article-big')) {
    variant = 'article-big';
  } else if (variantText.includes('article-small')) {
    variant = 'article-small';
  }

  // Create main blockquote element
  const blockquote = document.createElement('blockquote');
  blockquote.className = '{BLOCK_NAME}-blockquote';

  // Add variant class to block
  block.classList.add(`{BLOCK_NAME}-${variant}`);

  // Create {BLOCK_NAME} content container
  const quoteContent = document.createElement('div');
  quoteContent.className = '{BLOCK_NAME}-content';

  // Add logo if present (for default variant)
  if (variant === 'default' && data.logo) {
    const logoContainer = document.createElement('div');
    logoContainer.className = '{BLOCK_NAME}-logo';

    const logoImg = data.logo.querySelector('img');
    if (logoImg) {
      logoImg.alt = normalizeAltText(data.logoAltText);
      logoContainer.appendChild(logoImg);
      quoteContent.appendChild(logoContainer);
    }
  }

  // Create {BLOCK_NAME} text element
  const quoteText = document.createElement('div');
  quoteText.className = '{BLOCK_NAME}-text';

  if (data.quoteText || data.quotation) {
    const textContent = data.quoteText || data.quotation;
    quoteText.innerHTML = textContent.innerHTML;

    // Add {BLOCK_NAME} marks for styling
    const firstChild = quoteText.firstElementChild;
    const lastChild = quoteText.lastElementChild;

    if (firstChild) {
      firstChild.classList.add('{BLOCK_NAME}-first');
    }
    if (lastChild && lastChild !== firstChild) {
      lastChild.classList.add('{BLOCK_NAME}-last');
    } else if (firstChild) {
      firstChild.classList.add('{BLOCK_NAME}-last');
    }
  }

  // Add quoteContent to blockquote if it has children (logo)
  if (quoteContent.children.length > 0) {
    blockquote.appendChild(quoteContent);
  }

  blockquote.appendChild(quoteText);

  // Create attribution section
  if (data.attributionInfo1 || data.attribution) {
    const attribution = document.createElement('div');
    attribution.className = '{BLOCK_NAME}-attribution';

    // Create attribution content container
    const attributionContent = document.createElement('div');
    attributionContent.className = '{BLOCK_NAME}-attribution-content';

    // Add avatar for article-small and article-big variant
    if (variant !== 'default' && data.attributionAvatar) {
      const avatarContainer = document.createElement('div');
      avatarContainer.className = '{BLOCK_NAME}-avatar';

      const avatarImg = data.attributionAvatar.querySelector('img');
      if (avatarImg) {
        avatarImg.alt = normalizeAltText(data.attributionInfo1) || 'Author avatar';
        avatarContainer.appendChild(avatarImg);
      }
      attributionContent.appendChild(avatarContainer);
    }

    // Create attribution text container
    const attributionText = document.createElement('div');
    attributionText.className = '{BLOCK_NAME}-attribution-text';

    // Add attribution info
    const attributionInfo1 = data.attributionInfo1 || data.attribution;
    if (attributionInfo1) {
      const cite = document.createElement('cite');
      cite.className = '{BLOCK_NAME}-cite';
      cite.innerHTML = attributionInfo1.innerHTML;

      // Handle links
      if (data.attributionLink) {
        // Extract URL from anchor tag if present (for internal links)
        // Use getAttribute('href') to preserve relative paths (href property converts to absolute)
        const existingAnchor = data.attributionLink.querySelector('a');
        const rawUrl = existingAnchor && existingAnchor.getAttribute('href')
          ? existingAnchor.getAttribute('href')
          : data.attributionLink.textContent.trim();
        const linkUrl = sanitizeUrl(rawUrl);

        // Only create link if URL is valid (sanitizeUrl returns empty string for invalid URL)
        if (linkUrl) {
          const link = document.createElement('a');
          link.href = linkUrl;
          link.innerHTML = cite.innerHTML;
          link.className = '{BLOCK_NAME}-attribution-link';

          // Set link attributes based on internal/external
          // Check if URL is external by comparing origins (handles both absolute and relative URLs)
          try {
            const urlObj = new URL(linkUrl, window.location.origin);
            const isExternal = urlObj.origin !== window.location.origin;
            if (isExternal) {
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
            }
          } catch (e) {
            // If URL parsing fails, treat as internal link (fallback)
            // sanitizeUrl already validated the URL, so this is safe
          }

          // Add accessibility attributes
          link.setAttribute('tabindex', '0');
          link.setAttribute('role', 'link');

          // Add ARIA label for better screen reader support
          const linkText = cite.textContent.trim();
          if (linkText) {
            link.setAttribute('aria-label', `${linkText}`);
          }

          cite.innerHTML = '';
          cite.appendChild(link);
        }
        // If linkUrl is empty (invalid/unsafe URL), cite element remains as plain text without link
      }

      attributionText.appendChild(cite);
    }

    // Add second attribution info if present
    if (data.attributionInfo2) {
      const info2 = document.createElement('div');
      info2.className = '{BLOCK_NAME}-attribution-info2';
      info2.innerHTML = data.attributionInfo2.innerHTML;
      attributionText.appendChild(info2);
    }

    attributionContent.appendChild(attributionText);
    attribution.appendChild(attributionContent);
    blockquote.appendChild(attribution);

    // Add accessibility attributes
    const quoteId = `{BLOCK_NAME}-${Math.random().toString(36).substr(2, 9)}`;
    const attributionId = `attribution-${Math.random().toString(36).substr(2, 9)}`;

    quoteText.id = quoteId;
    attribution.id = attributionId;

    blockquote.setAttribute('aria-labelledby', quoteId);
    blockquote.setAttribute('aria-describedby', attributionId);
  }

  // Clear block and add new content
  block.innerHTML = '';
  block.appendChild(blockquote);

  // Handle keyboard navigation for links
  const links = block.querySelectorAll('.{BLOCK_NAME}-attribution-link');
  links.forEach((link) => {
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        link.click();
      }
    });
  });
}
