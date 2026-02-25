/* eslint-disable max-len */
import {
  addAccessibleLazyLoadingBehavior,
} from './{BLOCK_CHILD}-utils.js';
import { decorateIcons } from '../../scripts/aem.js';
import {
  processRichHtmlWithIconsAndDecode,
  stripLinksFromHtml,
} from '../../utils/generic-utils.js';
import {
  DIV_INDICES,
  LEGACY_DIV_INDICES,
  CSS_CLASSES,
  TEXT,
  ARIA,
  CARD_STRUCTURE,
} from '../../constants/{BLOCK_NAME}-constants.js';

/**
 * Extracts links from div pairs (text + URL)
 * @param {Element[]} divs Array of div elements
 * @param {number} startIndex Starting index for link divs
 * @param {number} count Number of link pairs to extract
 * @param {number} pairOffset Offset between pairs (default: 2)
 * @returns {Array<{text: string, url: string}>} Array of link objects
 */
function extractLinksFromDivs(divs, startIndex, count, pairOffset = 2) {
  const links = [];
  for (let i = 0; i < count; i += 1) {
    const textDivIndex = startIndex + (i * pairOffset);
    const urlDivIndex = startIndex + 1 + (i * pairOffset);

    const textDiv = divs[textDivIndex];
    const urlDiv = divs[urlDivIndex];

    if (textDiv && urlDiv && textDiv.textContent.trim() && urlDiv.textContent.trim()) {
      const linkText = textDiv.innerHTML.trim();
      let linkUrl = urlDiv.textContent.trim();

      // Extract URL from anchor tag if present
      const anchor = urlDiv.querySelector('a');
      if (anchor && anchor.href) {
        linkUrl = anchor.href;
      }

      links.push({
        text: linkText,
        url: linkUrl,
      });
    }
  }
  return links;
}

/**
 * Creates content for Topic {BLOCK_CHILD_FUNC} - supports both 20-div (legacy) and 21-div (with imageLink) structures
 * @param {Element} row The {BLOCK_CHILD} row element
 * @param {Element} cardContent The {BLOCK_CHILD} content container
 */
export function createTopicCardContent(row, cardContent) {
  const divs = [...row.children];

  // Auto-detect structure: Both are 20-div but differ in content
  // Legacy: div 2 = title (text content), no imageLink field
  // New: div 2 = imageLink (URL with anchor tag), div 3 = subtitle
  // Check if div 2 looks like a URL/link (has anchor tag or URL pattern) vs plain text title
  const div2Content = divs[2]?.textContent?.trim() || '';
  const div2HasAnchor = !!divs[2]?.querySelector('a'); // !! converts to boolean (undefined → false)
  const div2LooksLikeUrl = div2HasAnchor || /^(https?:\/\/|\/|#|mailto:|tel:)/.test(div2Content);

  // If div 2 looks like a URL, it's the new structure with imageLink
  const isLegacyStructure = !div2LooksLikeUrl;
  const indices = isLegacyStructure ? LEGACY_DIV_INDICES : DIV_INDICES;

  // Process image, subtitle, and optional image link together
  // When image link exists, wrap both image and subtitle in a single clickable link
  const imageDiv = divs[indices.TOPIC_IMAGE];
  const subtitleDiv = divs[indices.TOPIC_SUBTITLE];
  const hasImage = imageDiv && imageDiv.querySelector('picture');
  const subtitleContent = subtitleDiv?.innerHTML.trim() || '';

  // Check for image link (only in new 21-div structure)
  let imageLinkUrl = '';
  if (!isLegacyStructure && indices.TOPIC_IMAGE_LINK !== undefined) {
    const imageLinkDiv = divs[indices.TOPIC_IMAGE_LINK];
    let rawUrl = imageLinkDiv?.textContent?.trim() || '';

    // Extract URL from anchor tag if present
    const imageLinkAnchor = imageLinkDiv?.querySelector('a');
    if (imageLinkAnchor && imageLinkAnchor.href) {
      rawUrl = imageLinkAnchor.href;
    }

    // Validate URL to prevent XSS (block javascript:, data:, etc.)
    if (rawUrl) {
      try {
        const url = new URL(rawUrl, window.location.href);
        // Allowlist safe protocols only
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        if (allowedProtocols.includes(url.protocol)) {
          imageLinkUrl = url.href;
        } else {
          // eslint-disable-next-line no-console
          console.warn('Blocked unsafe URL protocol:', url.protocol);
        }
      } catch (error) {
        // Relative URLs or invalid URLs - try as relative path
        if (rawUrl.startsWith('/') || rawUrl.startsWith('#')) {
          imageLinkUrl = rawUrl;
        } else {
          // eslint-disable-next-line no-console
          console.warn('Invalid URL for image link:', rawUrl);
        }
      }
    }
  }

  // Get description content early as we need it for multiple scenarios
  const descriptionDiv = divs[indices.TOPIC_DESCRIPTION];
  const descriptionContent = descriptionDiv?.textContent?.trim() || '';
  const descriptionHtml = descriptionDiv?.innerHTML?.trim() || '';

  // If we have an image link, wrap image, subtitle, and description in a single link
  if (imageLinkUrl && (hasImage || subtitleContent || descriptionContent)) {
    const imageLinkWrapper = document.createElement('a');
    imageLinkWrapper.href = imageLinkUrl;
    imageLinkWrapper.className = CSS_CLASSES.CARD_IMAGE_SUBTITLE_LINK;

    // Process and add image if present
    if (hasImage) {
      const imageContainer = document.createElement('div');
      imageContainer.className = CSS_CLASSES.CARD_IMAGE;
      const picture = imageDiv.querySelector('picture').cloneNode(true);

      // Add lazy loading behavior to the img element within the picture
      const imgElement = picture.querySelector('img');
      if (imgElement) {
        // Get the existing alt text from the img element (already set by AEM)
        const existingAlt = imgElement.alt?.trim() || '';

        // Check if we need to generate fallback alt text
        const needsFallback = !existingAlt
          || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(existingAlt);

        if (needsFallback) {
          // Fallback priority: subtitle (if present) or generic fallback
          const subtitle = subtitleDiv?.textContent?.trim() || '';
          const altText = subtitle || TEXT.FALLBACK_TOPIC_ALT_TEXT;
          imgElement.alt = altText;
        }

        // Add enhanced lazy loading with accessibility support
        addAccessibleLazyLoadingBehavior(imgElement);
      }

      imageContainer.appendChild(picture);
      imageLinkWrapper.appendChild(imageContainer);
    }

    // Process and add subtitle if present
    if (subtitleContent) {
      const subtitleContainer = document.createElement('div');
      subtitleContainer.className = CSS_CLASSES.CARD_SUBTITLE;
      const subtitleElement = document.createElement('p');

      // Strip anchors so slashes/paths are not links; decode and support :icon-name: (same as other blocks)
      const subtitleProcessed = processRichHtmlWithIconsAndDecode(stripLinksFromHtml(subtitleContent));
      subtitleElement.innerHTML = subtitleProcessed;
      subtitleContainer.appendChild(subtitleElement);

      // Decorate icons
      decorateIcons(subtitleContainer);

      // Wrap text nodes in span for CSS truncation support
      const wrapTextNodes = (element, className) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const textNodesToWrap = [];
        let node;
        // eslint-disable-next-line no-cond-assign
        while (node = walker.nextNode()) {
          if (node.textContent.trim()) {
            textNodesToWrap.push(node);
          }
        }
        textNodesToWrap.forEach((textNode) => {
          const textSpan = document.createElement('span');
          textSpan.className = className;
          textSpan.textContent = textNode.textContent;
          textNode.replaceWith(textSpan);
        });
      };
      wrapTextNodes(subtitleElement, 'subtitle-text');

      imageLinkWrapper.appendChild(subtitleContainer);
    }

    // Add description to the clickable link wrapper if present
    if (descriptionContent) {
      const descriptionContainer = document.createElement('div');
      descriptionContainer.className = CSS_CLASSES.CARD_DESCRIPTION;
      const descriptionElement = document.createElement('p');

      // Strip anchors so slashes/paths are not links; decode and support :icon-name:
      const descriptionProcessed = processRichHtmlWithIconsAndDecode(stripLinksFromHtml(descriptionHtml));
      descriptionElement.innerHTML = descriptionProcessed;
      descriptionContainer.appendChild(descriptionElement);

      // Decorate icons
      decorateIcons(descriptionContainer);

      imageLinkWrapper.appendChild(descriptionContainer);
    }

    // Set ARIA label based on content
    const subtitleText = subtitleDiv?.textContent?.trim() || '';
    imageLinkWrapper.setAttribute(ARIA.ATTRIBUTES.LABEL, subtitleText || 'linked content');

    cardContent.appendChild(imageLinkWrapper);
  } else {
    // No image link: render image and subtitle separately (original behavior)
    if (hasImage) {
      const imageContainer = document.createElement('div');
      imageContainer.className = CSS_CLASSES.CARD_IMAGE;
      const picture = imageDiv.querySelector('picture').cloneNode(true);

      // Add lazy loading behavior to the img element within the picture
      const imgElement = picture.querySelector('img');
      if (imgElement) {
        const existingAlt = imgElement.alt?.trim() || '';
        const needsFallback = !existingAlt
          || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(existingAlt);

        if (needsFallback) {
          // Fallback priority: subtitle (if present) or generic fallback
          const subtitle = subtitleDiv?.textContent?.trim() || '';
          const altText = subtitle || TEXT.FALLBACK_TOPIC_ALT_TEXT;
          imgElement.alt = altText;
        }

        addAccessibleLazyLoadingBehavior(imgElement);
      }

      imageContainer.appendChild(picture);
      cardContent.appendChild(imageContainer);
    }

    // Add subtitle separately if no image link
    if (subtitleContent) {
      const subtitleContainer = document.createElement('div');
      subtitleContainer.className = CSS_CLASSES.CARD_SUBTITLE;
      const subtitleElement = document.createElement('p');
      // Strip anchors so slashes/paths are not links; decode and support :icon-name: (same as other blocks)
      const subtitleProcessed = processRichHtmlWithIconsAndDecode(stripLinksFromHtml(subtitleContent));
      subtitleElement.innerHTML = subtitleProcessed;
      subtitleContainer.appendChild(subtitleElement);

      decorateIcons(subtitleContainer);

      const wrapTextNodes = (element, className) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const textNodesToWrap = [];
        let node;
        // eslint-disable-next-line no-cond-assign
        while (node = walker.nextNode()) {
          if (node.textContent.trim()) {
            textNodesToWrap.push(node);
          }
        }
        textNodesToWrap.forEach((textNode) => {
          const textSpan = document.createElement('span');
          textSpan.className = className;
          textSpan.textContent = textNode.textContent;
          textNode.replaceWith(textSpan);
        });
      };
      wrapTextNodes(subtitleElement, 'subtitle-text');

      cardContent.appendChild(subtitleContainer);
    }
  }

  // Add class to {BLOCK_CHILD} content if no image is present
  if (!hasImage) {
    cardContent.classList.add(CSS_CLASSES.NO_IMAGE);
  }

  // Title - only exists in legacy structure, not in new authoring model
  if (isLegacyStructure && indices.TOPIC_TITLE !== undefined) {
    const titleDiv = divs[indices.TOPIC_TITLE];
    const titleContent = titleDiv?.innerHTML.trim() || '';
    if (titleContent) {
      const titleContainer = document.createElement('div');
      titleContainer.className = CSS_CLASSES.CARD_TITLE;
      const titleElement = document.createElement('h3');
      titleElement.innerHTML = titleContent;
      titleContainer.appendChild(titleElement);

      // Decorate icons
      decorateIcons(titleContainer);

      // Wrap text nodes in span for CSS truncation support (search recursively)
      const wrapTitleTextNodes = (element, className) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const textNodesToWrap = [];
        let node;
        // eslint-disable-next-line no-cond-assign
        while (node = walker.nextNode()) {
          if (node.textContent.trim()) {
            textNodesToWrap.push(node);
          }
        }
        textNodesToWrap.forEach((textNode) => {
          const textSpan = document.createElement('span');
          textSpan.className = className;
          textSpan.textContent = textNode.textContent;
          textNode.replaceWith(textSpan);
        });
      };
      wrapTitleTextNodes(titleElement, 'title-text');

      cardContent.appendChild(titleContainer);
    }
  }

  // Description (only render here if not already in imageLink wrapper)
  if (descriptionContent && !imageLinkUrl) {
    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = CSS_CLASSES.CARD_DESCRIPTION;
    const descriptionElement = document.createElement('p');

    // Strip anchors so slashes/paths are not links; decode and support :icon-name:
    const descriptionProcessed = processRichHtmlWithIconsAndDecode(stripLinksFromHtml(descriptionHtml));
    descriptionElement.innerHTML = descriptionProcessed;
    descriptionContainer.appendChild(descriptionElement);

    // Decorate icons
    decorateIcons(descriptionContainer);

    cardContent.appendChild(descriptionContainer);
  }

  // Links (6 pairs of text + URL)
  const links = extractLinksFromDivs(
    divs,
    indices.TOPIC_LINKS_START,
    CARD_STRUCTURE.TOPIC_LINKS_COUNT,
    CARD_STRUCTURE.TOPIC_LINKS_PAIR_OFFSET,
  );

  // Create links container if we have any links
  if (links.length > 0) {
    const linksContainer = document.createElement('div');
    linksContainer.className = CSS_CLASSES.CARD_LINKS;
    linksContainer.setAttribute('role', ARIA.ROLES.LIST);

    links.forEach((linkData) => {
      const linkItem = document.createElement('div');
      linkItem.className = CSS_CLASSES.CARD_LINK_ITEM;
      linkItem.setAttribute('role', ARIA.ROLES.LISTITEM);

      const linkElement = document.createElement('a');
      linkElement.href = linkData.url;
      // Strip CMS auto-linked anchors (e.g. paths/slashes) so only our href is the link; then decode and icons
      const textWithoutAnchors = stripLinksFromHtml(linkData.text);
      const linkTextProcessed = processRichHtmlWithIconsAndDecode(textWithoutAnchors);
      linkElement.innerHTML = linkTextProcessed;

      // Extract plain text for aria-label (remove HTML tags)
      const linkText = linkElement.textContent.trim();
      // Only set aria-label if there's actual text content, otherwise use a meaningful fallback
      if (linkText) {
        linkElement.setAttribute(ARIA.ATTRIBUTES.LABEL, linkText);
      } else {
        // Fallback for icon-only links: use URL domain or generic label
        try {
          const url = new URL(linkData.url);
          linkElement.setAttribute(ARIA.ATTRIBUTES.LABEL, `Link to ${url.hostname}`);
        } catch {
          // If URL parsing fails, use generic label
          linkElement.setAttribute(ARIA.ATTRIBUTES.LABEL, 'Link');
        }
      }

      // Decorate icons in the link
      decorateIcons(linkElement);

      linkItem.appendChild(linkElement);
      linksContainer.appendChild(linkItem);
    });

    cardContent.appendChild(linksContainer);
  }
}

/**
 * Extracts topic {BLOCK_CHILD} data from {BLOCK_CHILD} rows for batch processing
 * Supports both legacy 20-div and new 21-div structures
 * @param {Element[]} cardRows Array of {BLOCK_CHILD} row elements
 * @returns {Object[]} Array of topic {BLOCK_CHILD} data objects
 */
export function extractTopicCardData(cardRows) {
  const topicCardData = [];

  cardRows.forEach((row, index) => {
    const cardTypeDiv = row.children[0];
    const cardType = cardTypeDiv ? cardTypeDiv.textContent.trim().toLowerCase() : '';

    // Auto-detect structure using same logic as createTopicCardContent
    const divs = [...row.children];
    const div2Content = divs[2]?.textContent?.trim() || '';
    const div2HasAnchor = !!divs[2]?.querySelector('a'); // !! converts to boolean (undefined → false)
    const div2LooksLikeUrl = div2HasAnchor || /^(https?:\/\/|\/|#|mailto:|tel:)/.test(div2Content);
    const isLegacyStructure = !div2LooksLikeUrl;
    const indices = isLegacyStructure ? LEGACY_DIV_INDICES : DIV_INDICES;

    // Auto-detect if not explicitly set
    let detectedType = cardType;
    if (!detectedType || detectedType === '') {
      // Check for subtitle or image to detect topic {BLOCK_CHILD} (title is legacy only)
      const hasSubtitle = row.children[indices.TOPIC_SUBTITLE]?.textContent?.trim();
      const hasImage = row.children[indices.TOPIC_IMAGE]?.querySelector('picture');
      if (hasSubtitle || hasImage) {
        detectedType = 'topic';
      }
    }

    if (detectedType === 'topic') {
      // Extract topic {BLOCK_CHILD} data
      const topicData = {
        index,
        image: divs[indices.TOPIC_IMAGE]?.querySelector('picture') ? divs[indices.TOPIC_IMAGE].innerHTML : '',
        subtitle: divs[indices.TOPIC_SUBTITLE]?.innerHTML.trim() || '',
        description: divs[indices.TOPIC_DESCRIPTION]?.innerHTML.trim() || '',
        links: extractLinksFromDivs(
          divs,
          indices.TOPIC_LINKS_START,
          CARD_STRUCTURE.TOPIC_LINKS_COUNT,
          CARD_STRUCTURE.TOPIC_LINKS_PAIR_OFFSET,
        ),
      };

      // Add title only if it exists (legacy structure)
      if (isLegacyStructure && indices.TOPIC_TITLE !== undefined) {
        topicData.title = divs[indices.TOPIC_TITLE]?.innerHTML.trim() || '';
      }

      topicCardData.push(topicData);
    }
  });

  return topicCardData;
}
