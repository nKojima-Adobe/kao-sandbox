/* eslint-disable max-len */
import {
  createButton,
  addAccessibleLazyLoadingBehavior,
  fetchPageMetadata,
} from './{BLOCK_CHILD}-utils.js';
import { decorateIcons } from '../../scripts/aem.js';
import { getLocalizedTagTitle } from '../../utils/taxonomy-utils.js';
import {
  parseTags,
  attachImageErrorHandler,
  processRichHtmlWithIconsAndDecode,
} from '../../utils/generic-utils.js';
import createTagUrl from '../../utils/tag-utils.js';
import {
  DIV_INDICES,
  CHARACTER_LIMITS,
  CSS_CLASSES,
  TEXT,
  ARIA,
  KEYBOARD,
} from '../../constants/{BLOCK_NAME}-constants.js';
import {
  CARDS_ARTICLE_TAGS_ARIA_LABEL,
  CARDS_TAG_ARIA_LABEL,
} from '../../constants/placeholders-constants.js';

/**
 * Creates content for Post {BLOCK_CHILD_FUNC} using the 20-div structure
 * @param {Element} row The {BLOCK_CHILD} row element
 * @param {Element} cardContent The {BLOCK_CHILD} content container
 * @param {Object} preloadedMetadata Pre-fetched metadata cache
 * @param {Array} taxonomyData Taxonomy data for localized tag titles
 * @param {string} language Current language code ('ja' or 'en')
 * @param {Object} placeholders Placeholders for i18n labels
 * @returns {Promise<boolean>} Promise that resolves to whether {BLOCK_CHILD} has button
 */
export async function createPostCardContent(row, cardContent, preloadedMetadata = {}, taxonomyData = [], language = 'ja', placeholders = {}) {
  const divs = [...row.children];
  // Div 17: AEM Content URL
  const aemContentDiv = divs[DIV_INDICES.POST_AEM_CONTENT];
  const contentUrl = aemContentDiv ? aemContentDiv.textContent.trim() : '';

  // Extract URL from anchor tag if present
  let actualUrl = contentUrl;
  const anchor = aemContentDiv?.querySelector('a');
  if (anchor && anchor.href) {
    actualUrl = anchor.href;
  }

  if (actualUrl) {
    // Use pre-fetched metadata or fetch if not available
    let metadata = preloadedMetadata[actualUrl];
    if (!metadata) {
      metadata = await fetchPageMetadata(actualUrl);
    }

    // Create image if available
    if (metadata.image) {
      const imageContainer = document.createElement('div');
      imageContainer.className = CSS_CLASSES.CARD_IMAGE;

      const imgElement = document.createElement('img');
      imgElement.src = metadata.image;

      // Use meta title directly as alt text (more concise and semantic)
      let altText = '';
      if (metadata.title) {
        // Use title directly without "Article image for" prefix
        altText = metadata.title;
      } else if (metadata.description) {
        // Fallback to description (truncated) if title is missing
        const shortDesc = metadata.description.substring(0, CHARACTER_LIMITS.POST_DESCRIPTION_ALT_TEXT_MAX);
        altText = shortDesc + (metadata.description.length > CHARACTER_LIMITS.POST_DESCRIPTION_ALT_TEXT_MAX ? TEXT.ELLIPSIS : '');
      } else {
        // Last resort: generic fallback
        altText = TEXT.FALLBACK_ALT_TEXT;
      }

      imgElement.alt = altText;
      imgElement.loading = 'lazy';

      // Add enhanced lazy loading with accessibility support
      addAccessibleLazyLoadingBehavior(imgElement);

      // Add error handling for broken images using shared utility
      attachImageErrorHandler(imgElement, imageContainer, placeholders, '{BLOCK_CHILD}-image-error');

      imageContainer.appendChild(imgElement);
      cardContent.appendChild(imageContainer);
    }

    // Create tags if available (limit to 3 maximum)
    if (metadata.tags) {
      const tagsContainer = document.createElement('div');
      tagsContainer.className = CSS_CLASSES.CARD_TAGS;
      tagsContainer.setAttribute('role', ARIA.ROLES.LIST);
      // Use placeholder for i18n, fallback to English
      const articleTagsLabel = placeholders[CARDS_ARTICLE_TAGS_ARIA_LABEL] || 'Article tags';
      tagsContainer.setAttribute(ARIA.ATTRIBUTES.LABEL, articleTagsLabel);

      // Use shared parseTags utility to support all helix-query formats
      const tagsArray = parseTags(metadata.tags);
      // Limit to maximum 3 tags
      const limitedTags = tagsArray.slice(0, CHARACTER_LIMITS.POST_MAX_TAGS);

      // Get placeholder for tag aria-label (e.g., "View all articles tagged with {tag}")
      // The placeholder should contain {tag} which will be replaced with the tag title
      const tagAriaLabelTemplate = placeholders[CARDS_TAG_ARIA_LABEL] || 'View all articles tagged with {tag}';

      // Process tags to create URLs and get localized titles
      const tagLinks = limitedTags.map((tag) => {
        // URL uses tag ID (not localized title)
        const tagUrl = createTagUrl(tag, placeholders);

        // Create wrapper span with role="listitem" (anchors cannot have role="listitem")
        const tagWrapper = document.createElement('span');
        tagWrapper.setAttribute('role', ARIA.ROLES.LISTITEM);

        // Create clickable tag link
        const tagLink = document.createElement('a');
        tagLink.className = CSS_CLASSES.CARD_TAG;
        tagLink.href = tagUrl;

        // Get localized tag title for display (fallback to tag ID if not found)
        const tagTitle = getLocalizedTagTitle(tag, language, taxonomyData) || tag;

        // Limit tag text to maximum 20 characters
        const maxTagLength = CHARACTER_LIMITS.POST_TAG_MAX_LENGTH;
        let tagText = tagTitle;
        if (tagText.length > maxTagLength) {
          tagText = `${tagText.substring(0, maxTagLength + TEXT.MINUS_THREE)}${TEXT.ELLIPSIS}`;
        }

        tagLink.textContent = tagText;

        // Enhanced accessibility attributes (use localized title with i18n template)
        const tagAriaLabel = tagAriaLabelTemplate.replace('{tag}', tagTitle);
        tagLink.setAttribute(ARIA.ATTRIBUTES.LABEL, tagAriaLabel);
        tagLink.setAttribute('title', tagAriaLabel);

        // Add keyboard navigation support
        tagLink.addEventListener('keydown', (event) => {
          if (event.key === KEYBOARD.KEYS.ENTER || event.key === KEYBOARD.KEYS.SPACE) {
            event.preventDefault();
            tagLink.click();
          }
        });

        tagWrapper.appendChild(tagLink);
        return tagWrapper;
      });

      // Append all tag links
      tagLinks.forEach((tagLink) => {
        tagsContainer.appendChild(tagLink);
      });

      if (limitedTags.length > 0) {
        cardContent.appendChild(tagsContainer);
      }
    }

    // Create publish date if available
    if (metadata.publishDate) {
      const dateContainer = document.createElement('div');
      dateContainer.className = CSS_CLASSES.CARD_PUBLISH_DATE;

      const dateElement = document.createElement('time');
      dateElement.dateTime = metadata.publishDate;

      // Format date as DD.MM.YY
      const date = new Date(metadata.publishDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      dateElement.textContent = `${day}.${month}.${year}`;

      dateContainer.appendChild(dateElement);
      cardContent.appendChild(dateContainer);
    }

    // Create title - support :icon-name: syntax and decode CMS-escaped slashes
    if (metadata.title) {
      const titleContainer = document.createElement('div');
      titleContainer.className = CSS_CLASSES.CARD_TITLE;
      const titleElement = document.createElement('h3');
      const titleHtml = processRichHtmlWithIconsAndDecode(metadata.title);
      titleElement.innerHTML = titleHtml;
      titleContainer.appendChild(titleElement);

      // Decorate icons
      decorateIcons(titleContainer);

      cardContent.appendChild(titleContainer);
    }

    // Create subtitle if available - support :icon-name: syntax
    if (metadata.subtitle) {
      const subtitleContainer = document.createElement('div');
      subtitleContainer.className = CSS_CLASSES.CARD_SUBTITLE;
      const subtitleElement = document.createElement('p');
      const subtitleHtml = processRichHtmlWithIconsAndDecode(metadata.subtitle);
      subtitleElement.innerHTML = subtitleHtml;
      subtitleContainer.appendChild(subtitleElement);

      // Decorate icons
      decorateIcons(subtitleContainer);

      cardContent.appendChild(subtitleContainer);
    }

    // Create description - support :icon-name: syntax and decoded slashes
    if (metadata.description) {
      const descriptionContainer = document.createElement('div');
      descriptionContainer.className = CSS_CLASSES.CARD_DESCRIPTION;
      const descriptionElement = document.createElement('p');

      const descriptionHtml = processRichHtmlWithIconsAndDecode(metadata.description);
      descriptionElement.innerHTML = descriptionHtml;
      descriptionContainer.appendChild(descriptionElement);

      cardContent.appendChild(descriptionContainer);
    }
  }

  // Div 18: Button Text
  const buttonTextDiv = divs[DIV_INDICES.POST_BUTTON_TEXT];
  const buttonText = buttonTextDiv ? buttonTextDiv.innerHTML.trim() : '';

  // Div 19: Button URL
  const buttonUrlDiv = divs[DIV_INDICES.POST_BUTTON_URL];
  let buttonUrl = buttonUrlDiv ? buttonUrlDiv.textContent.trim() : '';

  // Extract URL from anchor tag if present
  const buttonAnchor = buttonUrlDiv?.querySelector('a');
  if (buttonAnchor && buttonAnchor.href) {
    buttonUrl = buttonAnchor.href;
  }

  // Get the actual page URL from metadata for clickable {BLOCK_CHILD} area
  // Use optional chaining to safely handle undefined preloadedMetadata
  const metadata = preloadedMetadata?.[actualUrl] ?? {};
  const pageUrl = metadata.url || actualUrl;

  // Create button if we have both text and URL
  let hasButton = false;
  if (buttonText && buttonUrl) {
    // When button is present, wrap all content (except button) in a clickable link
    // This allows the entire {BLOCK_CHILD} area up to the description to be clickable
    // Note: This creates nested links with tags, but is consistent with related-block
    // and article-list patterns. Tags are absolutely positioned, so keeping them inside
    // ensures the entire {BLOCK_CHILD} area (including tag overlay area) remains clickable.
    if (pageUrl && cardContent.children.length > 0) {
      // Create a wrapper link for existing content
      const contentLink = document.createElement('a');
      contentLink.href = pageUrl;
      contentLink.className = '{BLOCK_CHILD}-content-link';

      // Enhanced ARIA label with more context
      const titleText = cardContent.querySelector('.{BLOCK_CHILD}-title')?.textContent || 'article';
      contentLink.setAttribute(ARIA.ATTRIBUTES.LABEL, `Read article: ${titleText}`);

      // Move all existing content inside the link
      while (cardContent.firstChild) {
        contentLink.appendChild(cardContent.firstChild);
      }
      cardContent.appendChild(contentLink);
    }

    // Add button container outside the content link
    const buttonContainer = document.createElement('div');
    buttonContainer.className = CSS_CLASSES.CARD_BUTTONS;

    const button = createButton(buttonText, buttonUrl, '', 'primary');
    // Extract plain text for aria-label (strip HTML tags)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = buttonText;
    const plainText = tempDiv.textContent || tempDiv.innerText || buttonText;
    button.setAttribute(ARIA.ATTRIBUTES.LABEL, `${plainText} button`);

    buttonContainer.appendChild(button);
    cardContent.appendChild(buttonContainer);
    hasButton = true;
  }

  return hasButton;
}

/**
 * Extracts post {BLOCK_CHILD} URLs from {BLOCK_CHILD} rows for batch processing
 * @param {Element[]} cardRows Array of {BLOCK_CHILD} row elements
 * @returns {string[]} Array of post {BLOCK_CHILD} URLs
 */
export function extractPostCardUrls(cardRows) {
  const postCardUrls = [];

  cardRows.forEach((row) => {
    const cardTypeDiv = row.children[0];
    const cardType = cardTypeDiv ? cardTypeDiv.textContent.trim().toLowerCase() : '';

    // Auto-detect if not explicitly set
    let detectedType = cardType;
    if (!detectedType || detectedType === '') {
      const hasPostContent = row.children[DIV_INDICES.POST_AEM_CONTENT] && row.children[DIV_INDICES.POST_AEM_CONTENT].textContent.trim();
      if (hasPostContent) {
        detectedType = 'post';
      }
    }

    if (detectedType === 'post') {
      const aemContentDiv = row.children[DIV_INDICES.POST_AEM_CONTENT];
      if (aemContentDiv) {
        let actualUrl = aemContentDiv.textContent.trim();
        const anchor = aemContentDiv.querySelector('a');
        if (anchor && anchor.href) {
          actualUrl = anchor.href;
        }
        if (actualUrl) {
          postCardUrls.push(actualUrl);
        }
      }
    }
  });

  return postCardUrls;
}
