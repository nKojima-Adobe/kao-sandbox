/* eslint-disable max-len */
import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  createButton,
  batchFetchMetadata,
} from './{BLOCK_CHILD}-utils.js';
import { createPostCardContent } from './{BLOCK_CHILD}-post.js';
import { createTopicCardContent } from './{BLOCK_CHILD}-topic.js';
import { decorateIcons, getLanguagePath } from '../../scripts/aem.js';
import { fetchTaxonomyData } from '../../utils/taxonomy-utils.js';
import fetchPlaceholdersForLocale from '../../scripts/placeholders.js';
import {
  CSS_CLASSES,
  DIV_INDICES,
  LEGACY_DIV_INDICES,
  CARD_STRUCTURE,
  CONFIG_DEFAULTS,
  CARD_TYPES,
  CAROUSEL_CONFIG,
  CONTAINER_CONFIG_ROWS,
  SCROLL,
  TIMEOUTS,
  ARIA,
  TEXT,
} from '../../constants/{BLOCK_NAME}-constants.js';
import { BREAKPOINTS } from '../../constants/constants.js';
import { trackElementInteraction } from '../../scripts/analytics/data-layer.js';

/**
 * Sanitize URL for analytics by removing sensitive query parameters
 * @param {string} url - The URL to sanitize
 * @returns {string} Sanitized URL without query parameters and hash
 */
function sanitizeUrlForAnalytics(url) {
  if (!url) return '';
  try {
    const urlObj = new URL(url, window.location.origin);
    // Return URL without query parameters and hash to avoid leaking sensitive data
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch (error) {
    // If URL parsing fails, return empty string instead of original URL
    // to avoid leaking potentially sensitive query parameters
    // Don't log the raw URL as it may contain sensitive data
    // eslint-disable-next-line no-console
    console.warn('Failed to parse URL for analytics (URL omitted for security)');
    return '';
  }
}

/**
 * Helper function to track {BLOCK_CHILD} click events
 * @param {number} cardIndex - Index of the {BLOCK_CHILD} (0-based)
 * @param {string} cardType - Type of {BLOCK_CHILD} ('topic' or 'post')
 * @param {string} elementText - Text of the clicked element
 * @param {string} elementHref - URL of the clicked element
 * @param {string} cardTitle - Title of the {BLOCK_CHILD}
 */
function trackCardClick(cardIndex, cardType, elementText, elementHref, cardTitle) {
  try {
    // Sanitize URL to remove sensitive query parameters
    const sanitizedHref = sanitizeUrlForAnalytics(elementHref);

    trackElementInteraction('{BLOCK_CHILD}-click', {
      elementType: '{BLOCK_NAME}',
      elementText,
      elementHref: sanitizedHref,
      additionalData: {
        cardIndex,
        cardTitle,
        cardType,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error tracking {BLOCK_CHILD} click:', error);
  }
}

/**
 * Creates a legacy {BLOCK_CHILD} with the specific 20-div structure
 * @param {Element} row The {BLOCK_CHILD} row element with 20 divs
 * @param {number} cardIndex The index of the {BLOCK_CHILD}
 * @param {Object} config The block configuration
 * @param {Element} blockElement The {BLOCK_NAME} block element
 * @param {Object} preloadedMetadata Pre-fetched metadata cache
 * @param {Array} taxonomyData Taxonomy data for localized tag titles
 * @param {string} language Current language code
 * @param {Object} placeholders Placeholders for i18n labels
 * @returns {Promise<Element>} Promise that resolves to the created {BLOCK_CHILD} element
 */
async function createLegacyCard(row, cardIndex, cardConfig, blockElement, preloadedMetadata = {}, taxonomyData = [], language = 'ja', placeholders = {}) {
  const {BLOCK_CHILD} = document.createElement('div');
  {BLOCK_CHILD}.className = CSS_CLASSES.CARD;
  moveInstrumentation(row, {BLOCK_CHILD});

  // Add layout variant class to {BLOCK_CHILD}
  {BLOCK_CHILD}.classList.add(`{BLOCK_CHILD}-${cardConfig.layoutVariant}`);

  // Add {BLOCK_CHILD} counter for numbered-top variant
  if (blockElement.classList.contains(CSS_CLASSES.CARDS_NUMBERED_TOP)) {
    const cardCounter = document.createElement('div');
    cardCounter.className = CSS_CLASSES.CARD_COUNTER;

    const cardCounterInner = document.createElement('div');
    cardCounterInner.className = CSS_CLASSES.CARD_COUNTER_INNER;
    cardCounterInner.textContent = cardIndex + 1;

    cardCounter.appendChild(cardCounterInner);
    {BLOCK_CHILD}.appendChild(cardCounter);
  }

  // Create {BLOCK_CHILD} content div
  const cardContent = document.createElement('div');
  cardContent.className = CSS_CLASSES.CARD_CONTENT;

  // Auto-detect structure: Both are 20-div but differ in content
  // Legacy: div 2 = title (text content), no imageLink field
  // New: div 2 = imageLink (URL with anchor tag)
  const div2Content = row.children[2]?.textContent?.trim() || '';
  const div2HasAnchor = !!row.children[2]?.querySelector('a'); // !! converts to boolean (undefined → false)
  const div2LooksLikeUrl = div2HasAnchor || /^(https?:\/\/|\/|#|mailto:|tel:)/.test(div2Content);
  const isLegacyStructure = !div2LooksLikeUrl;
  const indices = isLegacyStructure ? LEGACY_DIV_INDICES : DIV_INDICES;

  // Extract {BLOCK_CHILD} type from first div
  const cardTypeDiv = row.children[indices.CARD_TYPE];
  const cardType = cardTypeDiv ? cardTypeDiv.textContent.trim().toLowerCase() : '';

  // Detect {BLOCK_CHILD} type based on content if not explicitly set
  let detectedType = cardType;
  if (!detectedType || detectedType === '') {
    // Check if this looks like a topic {BLOCK_CHILD} (has image, title, subtitle, or description)
    const hasImage = row.children[indices.TOPIC_IMAGE]?.querySelector('picture');
    const hasTitle = row.children[indices.TOPIC_TITLE]?.textContent?.trim();
    const hasSubtitle = row.children[indices.TOPIC_SUBTITLE]?.textContent?.trim();
    const hasDescription = row.children[indices.TOPIC_DESCRIPTION]?.textContent?.trim();
    const hasPostContent = row.children[indices.POST_AEM_CONTENT]?.textContent?.trim();

    if (hasPostContent) {
      detectedType = CARD_TYPES.POST;
    } else if (hasImage || hasTitle || hasSubtitle || hasDescription) {
      // Detect as topic {BLOCK_CHILD} if any topic content exists
      detectedType = CARD_TYPES.TOPIC;
    }
  }

  if (detectedType === CARD_TYPES.TOPIC) {
    // Process Topic {BLOCK_CHILD_FUNC} (divs 1-17)
    createTopicCardContent(row, cardContent);
    {BLOCK_CHILD}.classList.add(CSS_CLASSES.CARD_TOPIC);

    // Add click tracking only for {BLOCK_CHILD}-link-item links in topic {BLOCK_NAME}
    {BLOCK_CHILD}.addEventListener('click', (event) => {
      // Only track clicks on .{BLOCK_CHILD}-link-item links
      // Guard against non-Element targets (e.g., Text nodes)
      const clickedLink = (event.target instanceof Element)
        ? event.target.closest('.{BLOCK_CHILD}-link-item a')
        : null;

      // Only track if a link was actually clicked
      if (clickedLink) {
        // Get {BLOCK_CHILD} title from .{BLOCK_CHILD}-subtitle for topic {BLOCK_NAME}
        const titleElement = {BLOCK_CHILD}.querySelector('.{BLOCK_CHILD}-subtitle');
        const cardTitle = titleElement?.textContent?.trim() || '';

        const elementText = clickedLink.textContent?.trim() || '';
        const cardUrl = clickedLink.href || '';

        trackCardClick(cardIndex, 'topic', elementText, cardUrl, cardTitle);
      }
    });
  } else if (detectedType === CARD_TYPES.POST) {
    // Process Post {BLOCK_CHILD_FUNC} (divs 18-20) - async with taxonomy data for localized tag titles
    const hasButton = await createPostCardContent(row, cardContent, preloadedMetadata, taxonomyData, language, placeholders);
    {BLOCK_CHILD}.classList.add(CSS_CLASSES.CARD_POST);

    // Add interaction class based on button presence
    if (hasButton) {
      // Button present: pointer only on button, not entire {BLOCK_CHILD}
      {BLOCK_CHILD}.classList.add(CSS_CLASSES.HAS_BUTTON);

      // Add click tracking for the content link ({BLOCK_CHILD} area up to description)
      const contentLink = cardContent.querySelector('.{BLOCK_CHILD}-content-link');
      if (contentLink) {
        contentLink.addEventListener('click', (event) => {
          // Don't track clicks on {BLOCK_CHILD}-tag links
          const clickedElement = event.target;
          if (clickedElement instanceof Element && clickedElement.closest('.{BLOCK_CHILD}-tag')) {
            return; // Exit early, don't track {BLOCK_CHILD}-tag clicks
          }

          // Get title from h3 inside .{BLOCK_CHILD}-title for post {BLOCK_NAME}
          const titleElement = cardContent.querySelector('.{BLOCK_CHILD}-title h3');
          const cardTitle = titleElement?.textContent?.trim() || '';

          trackCardClick(cardIndex, 'post', cardTitle, contentLink.href, cardTitle);
        });
      }

      // Add click tracking for post {BLOCK_NAME} with buttons
      const buttons = cardContent.querySelectorAll('a.button, button');
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          // Get {BLOCK_CHILD} title from h3 inside .{BLOCK_CHILD}-title for post {BLOCK_NAME}
          const titleElement = {BLOCK_CHILD}.querySelector('.{BLOCK_CHILD}-title h3');
          const cardTitle = titleElement?.textContent?.trim() || '';

          // For buttons, elementText should be the button text (what user clicked)
          const elementText = button.textContent?.trim() || '';
          const buttonUrl = button.href || '';

          trackCardClick(cardIndex, 'post', elementText, buttonUrl, cardTitle);
        });
      });
    } else {
      // No button: entire {BLOCK_CHILD} is clickable link
      {BLOCK_CHILD}.classList.add(CSS_CLASSES.CARD_INTERACTIVE);

      // Get URL from metadata (og:url) - fetched from the page's meta tags
      const aemContentDiv = [...row.children][indices.POST_AEM_CONTENT];
      const contentUrl = aemContentDiv ? aemContentDiv.textContent.trim() : '';

      // Extract URL from anchor tag if present (for fetching metadata)
      let fetchUrl = contentUrl;
      const anchor = aemContentDiv?.querySelector('a');
      if (anchor && anchor.href) {
        fetchUrl = anchor.href;
      }

      // Use og:url from metadata if available, fallback to content URL
      const metadata = preloadedMetadata[fetchUrl] || {};
      const actualUrl = metadata.url || fetchUrl;

      if (actualUrl) {
        // Create an anchor tag wrapper for the entire {BLOCK_CHILD}
        // This allows right-click menu, middle-click, and normal link behavior
        const cardLink = document.createElement('a');
        cardLink.href = actualUrl;
        cardLink.className = '{BLOCK_CHILD}-link';

        // Enhanced ARIA label with more context
        const titleText = cardContent.querySelector('.{BLOCK_CHILD}-title')?.textContent || 'article';
        cardLink.setAttribute(ARIA.ATTRIBUTES.LABEL, `Read article: ${titleText}`);

        // Move {BLOCK_CHILD} content inside the link
        while (cardContent.firstChild) {
          cardLink.appendChild(cardContent.firstChild);
        }
        cardContent.appendChild(cardLink);

        // Add click tracking for post {BLOCK_NAME} with links
        cardLink.addEventListener('click', (event) => {
          // Don't track clicks on {BLOCK_CHILD}-tag links
          const clickedElement = event.target;
          if (clickedElement instanceof Element && clickedElement.closest('.{BLOCK_CHILD}-tag')) {
            return; // Exit early, don't track {BLOCK_CHILD}-tag clicks
          }

          // Get title from h3 inside .{BLOCK_CHILD}-title for post {BLOCK_NAME}
          const titleElement = cardLink.querySelector('.{BLOCK_CHILD}-title h3');
          const cardTitle = titleElement?.textContent?.trim() || titleText;

          trackCardClick(cardIndex, 'post', cardTitle, actualUrl, cardTitle);
        });
      }
    }
  } else {
    // Unknown or empty {BLOCK_CHILD} type
    const emptyMessage = document.createElement('div');
    emptyMessage.className = CSS_CLASSES.CARD_EMPTY_MESSAGE;
    emptyMessage.textContent = detectedType ? `${TEXT.UNKNOWN_CARD_TYPE_PREFIX}${detectedType}` : TEXT.EMPTY_CARD_MESSAGE;
    cardContent.appendChild(emptyMessage);
    {BLOCK_CHILD}.classList.add(CSS_CLASSES.CARD_EMPTY);
  }

  {BLOCK_CHILD}.appendChild(cardContent);
  return {BLOCK_CHILD};
}

/**
 * Creates a navigation container with carousel controls and/or CTA button
 * @param {Element} blockElement The {BLOCK_NAME} block element
 * @param {Element} container The {BLOCK_NAME} container element
 * @param {Object} configObj The block configuration
 * @returns {Element} The navigation container element
 */
function createNavigationContainer(blockElement, container, configObj) {
  // Create navigation container
  const navContainer = document.createElement('div');
  navContainer.className = CSS_CLASSES.CARDS_NAVIGATION_CONTAINER;

  // Left side - carousel controls (if carousel variant)
  const leftSide = document.createElement('div');
  leftSide.className = CSS_CLASSES.CARDS_NAVIGATION_LEFT;

  if (configObj.isCarousel) {
    // Add carousel ARIA attributes to container
    container.setAttribute('role', ARIA.ROLES.REGION);

    container.setAttribute(ARIA.ATTRIBUTES.LABEL, ARIA.VALUES.CAROUSEL);
    container.setAttribute(ARIA.ATTRIBUTES.LIVE, ARIA.VALUES.POLITE);

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = CSS_CLASSES.CAROUSEL_BUTTONS;

    // Create navigation buttons
    const prevButton = document.createElement('button');
    prevButton.className = `${CSS_CLASSES.CAROUSEL_NAV} ${CSS_CLASSES.CAROUSEL_PREV}`;
    prevButton.setAttribute(ARIA.ATTRIBUTES.LABEL, 'Previous {BLOCK_NAME}');
    prevButton.setAttribute('tabindex', '0');

    const nextButton = document.createElement('button');
    nextButton.className = `${CSS_CLASSES.CAROUSEL_NAV} ${CSS_CLASSES.CAROUSEL_NEXT}`;
    nextButton.setAttribute(ARIA.ATTRIBUTES.LABEL, 'Next {BLOCK_NAME}');
    nextButton.setAttribute('tabindex', '0');

    // Add buttons to container
    buttonsContainer.appendChild(prevButton);
    buttonsContainer.appendChild(nextButton);

    // Add buttons container to left side
    leftSide.appendChild(buttonsContainer);

    // Helper function to get visible {BLOCK_NAME} count based on viewport
    const getVisibleCardsCount = () => {
      const viewportWidth = window.innerWidth;
      if (viewportWidth >= BREAKPOINTS.DESKTOP_MIN) {
        return CAROUSEL_CONFIG.VISIBLE_CARDS.DESKTOP;
      }
      if (viewportWidth >= BREAKPOINTS.TABLET_MIN) {
        return CAROUSEL_CONFIG.VISIBLE_CARDS.TABLET;
      }
      return CAROUSEL_CONFIG.VISIBLE_CARDS.MOBILE;
    };

    // Add scroll event listener to update button states and position announcement
    const updateButtonStates = () => {
      const { scrollLeft, clientWidth, scrollWidth } = container;
      const totalCards = container.querySelectorAll('.{BLOCK_CHILD}').length;
      const visibleCardsCount = getVisibleCardsCount();

      // Hide navigation buttons if total {BLOCK_NAME} fit within visible area
      const needsNavigation = totalCards > visibleCardsCount;
      buttonsContainer.style.display = needsNavigation ? '' : 'none';

      if (!needsNavigation) {
        return; // No need to update button states if navigation is hidden
      }

      const isAtStart = scrollLeft <= SCROLL.THRESHOLD;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - SCROLL.THRESHOLD;

      // If there's no horizontal scroll needed, disable next button
      const hasHorizontalScroll = scrollWidth > clientWidth + SCROLL.BUFFER; // Adding buffer

      prevButton.classList.toggle(CSS_CLASSES.DISABLED, isAtStart);
      prevButton.setAttribute(ARIA.ATTRIBUTES.DISABLED, isAtStart);
      nextButton.classList.toggle(CSS_CLASSES.DISABLED, isAtEnd || !hasHorizontalScroll);
      nextButton.setAttribute(ARIA.ATTRIBUTES.DISABLED, isAtEnd || !hasHorizontalScroll);

      // Calculate current position for screen readers
      const cardWidth = container.querySelector('.{BLOCK_CHILD}')?.offsetWidth || 0;
      const gap = parseFloat(getComputedStyle(container).gap) || 0;
      const scrollPosition = cardWidth > 0 ? Math.round(container.scrollLeft / (cardWidth + gap)) + 1 : 1;

      // Update aria-label with position information
      container.setAttribute(ARIA.ATTRIBUTES.LABEL, `carousel, showing {BLOCK_CHILD} ${scrollPosition} of ${totalCards}`);
    };

    // Update button visibility on window resize
    window.addEventListener('resize', updateButtonStates);

    // Initialize button states after a short delay to ensure proper layout
    const initializeButtonStates = () => {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(() => {
          updateButtonStates();
        }, TIMEOUTS.BUTTON_STATE_INITIALIZATION_DELAY); // Small delay to ensure layout is complete
      });
    };

    // Initialize button states
    initializeButtonStates();
    container.addEventListener('scroll', updateButtonStates);

    // Track active scroll handler to prevent listener accumulation
    let activeScrollHandler = null;
    let activeScrollEndHandler = null;
    let activeScrollTimeout = null;
    let activeSafetyTimeout = null;

    // Helper function to track navigation after scroll completes
    const trackNavigationAfterScroll = (navigationAction) => {
      // Clean up any existing handlers before adding new one
      if (activeScrollHandler) {
        container.removeEventListener('scroll', activeScrollHandler);
        activeScrollHandler = null;
      }
      if (activeScrollEndHandler) {
        container.removeEventListener('scrollend', activeScrollEndHandler);
        activeScrollEndHandler = null;
      }
      clearTimeout(activeScrollTimeout);
      clearTimeout(activeSafetyTimeout);
      activeScrollTimeout = null;
      activeSafetyTimeout = null;

      // Wait for scroll to complete before tracking
      const handleScrollEnd = () => {
        try {
          const totalCards = container.querySelectorAll('.{BLOCK_CHILD}').length;
          const cardWidth = container.querySelector('.{BLOCK_CHILD}')?.offsetWidth || 0;
          const gap = parseFloat(getComputedStyle(container).gap) || 0;
          // Use Math.round to get the nearest {BLOCK_CHILD} (rounds to closest slide index)
          const currentSlide = cardWidth > 0 ? Math.round(container.scrollLeft / (cardWidth + gap)) : 0;

          trackElementInteraction('{BLOCK_NAME}-navigate', {
            elementType: '{BLOCK_NAME}',
            additionalData: {
              navigationAction,
              currentSlide,
              totalSlides: totalCards,
            },
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error tracking carousel navigation:', error);
        }

        // Clean up after tracking
        if (activeScrollHandler) {
          container.removeEventListener('scroll', activeScrollHandler);
          activeScrollHandler = null;
        }
        if (activeScrollEndHandler) {
          container.removeEventListener('scrollend', activeScrollEndHandler);
          activeScrollEndHandler = null;
        }
        clearTimeout(activeScrollTimeout);
        clearTimeout(activeSafetyTimeout);
        activeScrollTimeout = null;
        activeSafetyTimeout = null;
      };

      // Use scrollend event if supported (modern browsers)
      if ('onscrollend' in window) {
        let hasScrolled = false;
        const maxWaitTimeout = 500; // Max 500ms to prevent stale listeners

        const handleScrollEndEvent = () => {
          hasScrolled = true;
          handleScrollEnd();
        };

        // Store handler reference to enable cleanup
        activeScrollEndHandler = handleScrollEndEvent;
        container.addEventListener('scrollend', handleScrollEndEvent, { once: true });

        // Safety timeout: If scrollend doesn't fire (no scroll at boundary/overflow)
        // remove listener and track anyway
        activeSafetyTimeout = setTimeout(() => {
          if (!hasScrolled) {
            if (activeScrollEndHandler) {
              container.removeEventListener('scrollend', activeScrollEndHandler);
              activeScrollEndHandler = null;
            }
            // Track anyway with current position if no scroll occurred
            handleScrollEnd();
          }
        }, maxWaitTimeout);
      } else {
        // Fallback: use single reusable scroll handler with debounce
        let hasScrolled = false;
        const maxWaitTimeout = 500; // Max 500ms to prevent stale listeners

        const handleScroll = () => {
          hasScrolled = true;
          clearTimeout(activeScrollTimeout);
          activeScrollTimeout = setTimeout(() => {
            handleScrollEnd();
          }, 150); // Wait 150ms after scroll stops
        };

        // Store handler reference to enable cleanup
        activeScrollHandler = handleScroll;
        container.addEventListener('scroll', handleScroll);

        // Safety timeout: Remove listener if no scroll detected within max wait time
        // This prevents listener accumulation if scroll doesn't happen
        activeSafetyTimeout = setTimeout(() => {
          if (!hasScrolled) {
            clearTimeout(activeScrollTimeout);
            if (activeScrollHandler) {
              container.removeEventListener('scroll', activeScrollHandler);
              activeScrollHandler = null;
            }
            // Track anyway with current position if no scroll occurred
            handleScrollEnd();
          }
        }, maxWaitTimeout);
      }
    };

    // Add navigation functionality
    prevButton.addEventListener('click', () => {
      // Don't track if button is disabled
      if (prevButton.classList.contains(CSS_CLASSES.DISABLED)
          || prevButton.getAttribute(ARIA.ATTRIBUTES.DISABLED) === 'true') {
        return;
      }

      // Perform scroll first
      container.scrollBy({ left: -container.offsetWidth * SCROLL.NAVIGATION_PERCENTAGE, behavior: 'smooth' });

      // Track after scroll completes
      trackNavigationAfterScroll('prev');
    });

    nextButton.addEventListener('click', () => {
      // Don't track if button is disabled
      if (nextButton.classList.contains(CSS_CLASSES.DISABLED)
          || nextButton.getAttribute(ARIA.ATTRIBUTES.DISABLED) === 'true') {
        return;
      }

      // Perform scroll first
      container.scrollBy({ left: container.offsetWidth * SCROLL.NAVIGATION_PERCENTAGE, behavior: 'smooth' });

      // Track after scroll completes
      trackNavigationAfterScroll('next');
    });
  }

  // Right side - CTA button (if provided)
  const rightSide = document.createElement('div');
  rightSide.className = CSS_CLASSES.CARDS_NAVIGATION_RIGHT;

  if (configObj.ctaText && configObj.ctaLink) {
    const ctaButton = createButton(configObj.ctaText, configObj.ctaLink, '', 'primary');
    ctaButton.className = `${CSS_CLASSES.BUTTON} ${CSS_CLASSES.BUTTON_PRIMARY} ${CSS_CLASSES.CARDS_CTA_BUTTON}`;
    rightSide.appendChild(ctaButton);
  }

  // Add both sides to the navigation container
  // For grid layouts, only add left side if it has carousel controls
  if (configObj.isCarousel || leftSide.children.length > 0) {
    navContainer.appendChild(leftSide);
  } else {
    // Add class for CTA-only navigation containers (better browser compatibility)
    navContainer.classList.add(CSS_CLASSES.CTA_ONLY);
  }
  navContainer.appendChild(rightSide);

  return navContainer;
}

/**
 * Decorates the {BLOCK_NAME} block using the legacy 20-div structure
 * @param {Element} block The {BLOCK_NAME} block element
 * @returns {Promise<void>} Promise that resolves when decoration is complete
 */
export default async function decorate(block) {
  try {
  // Add {BLOCK_NAME} class to the block
    block.classList.add(CSS_CLASSES.CARDS);

    // Add loading state for screen readers
    block.setAttribute(ARIA.ATTRIBUTES.BUSY, ARIA.VALUES.TRUE);
    block.setAttribute(ARIA.ATTRIBUTES.LIVE, ARIA.VALUES.POLITE);

    // Add screen reader announcement for loading
    const loadingAnnouncement = document.createElement('div');
    loadingAnnouncement.className = CSS_CLASSES.SR_ONLY;
    loadingAnnouncement.setAttribute(ARIA.ATTRIBUTES.LIVE, ARIA.VALUES.POLITE);
    loadingAnnouncement.textContent = TEXT.LOADING_MESSAGE;
    block.appendChild(loadingAnnouncement);

    // Extract all rows from the block
    const allRows = [...block.children];

    // Initialize configuration with defaults
    const config = {
      ctaText: CONFIG_DEFAULTS.CTA_TEXT,
      ctaLink: CONFIG_DEFAULTS.CTA_LINK,
      layoutVariant: CONFIG_DEFAULTS.LAYOUT_VARIANT,
      alignment: CONFIG_DEFAULTS.ALIGNMENT,
      classes: CONFIG_DEFAULTS.CLASSES,
      isCarousel: CONFIG_DEFAULTS.IS_CAROUSEL,
    };

    // Extract container fields from first 3 divs
    if (allRows.length >= CONTAINER_CONFIG_ROWS.TOTAL_CONFIG_ROWS) {
      // 1st div → Button text
      const buttonTextDiv = allRows[CONTAINER_CONFIG_ROWS.BUTTON_TEXT_ROW].children[0];
      if (buttonTextDiv) {
        config.ctaText = buttonTextDiv.textContent.trim();
      }

      // 2nd div → Button link
      const buttonLinkDiv = allRows[CONTAINER_CONFIG_ROWS.BUTTON_LINK_ROW].children[0];
      if (buttonLinkDiv) {
        const linkText = buttonLinkDiv.textContent.trim();
        // Extract URL from anchor tag if present
        const anchor = buttonLinkDiv.querySelector('a');
        config.ctaLink = anchor && anchor.href ? anchor.href : linkText;
      }

      // 3rd div → Carousel flag
      const carouselFlagDiv = allRows[CONTAINER_CONFIG_ROWS.CAROUSEL_FLAG_ROW].children[0];
      if (carouselFlagDiv) {
        const carouselText = carouselFlagDiv.textContent.trim().toLowerCase();
        config.isCarousel = CAROUSEL_CONFIG.TRIGGER_VALUES.includes(carouselText);
        if (config.isCarousel) {
          config.layoutVariant = CARD_TYPES.CAROUSEL;
        }
      }
    }

    // Fallback: Check for layout variant configuration in remaining rows (for backward compatibility)
    if (!config.isCarousel) {
      const layoutVariantRow = allRows.find((row) => {
        const text = row.textContent.trim().toLowerCase();
        return CAROUSEL_CONFIG.VARIANT_VALUES.includes(text);
      });

      if (layoutVariantRow) {
        const variantText = layoutVariantRow.textContent.trim().toLowerCase();
        if (CAROUSEL_CONFIG.VARIANT_VALUES.includes(variantText)) {
          config.layoutVariant = CARD_TYPES.CAROUSEL;
          config.isCarousel = true;
        }
      }
    }

    // Apply classes to the block
    block.classList.add(`{BLOCK_NAME}-align-${config.alignment}`);
    block.classList.add(`{BLOCK_NAME}-${config.layoutVariant}`);

    // Apply carousel class for carousel variant
    if (config.isCarousel) {
      block.classList.add(CSS_CLASSES.CARDS_CAROUSEL);
    }

    // Filter rows to get actual {BLOCK_CHILD} content rows
    // Accept 20-div structures (both legacy and new with imageLink) for backward compatibility
    const cardRows = allRows.filter((row) => {
      // Must have exactly 20 divs
      const divCount = row.children.length;
      if (divCount !== CARD_STRUCTURE.TOTAL_DIVS) {
        return false;
      }

      // Check if the row has any meaningful content
      const hasAnyContent = [...row.children].some((div) => {
        const text = div.textContent.trim();
        const hasImage = div.querySelector('picture, img');
        const hasLink = div.querySelector('a');
        return text !== '' || hasImage || hasLink;
      });

      if (!hasAnyContent) {
        return false;
      }

      return true;
    });

    // Create {BLOCK_NAME} grid container and insert it early to maintain proper positioning
    const cardsGrid = document.createElement('div');
    cardsGrid.className = CSS_CLASSES.CARDS_GRID;

    // Insert the grid in the correct position to maintain order during UE operations
    // Find the first {BLOCK_CHILD} row and insert the grid before it
    if (cardRows.length > 0) {
      const firstCardRow = cardRows[0];
      block.insertBefore(cardsGrid, firstCardRow);
    } else {
      // If no {BLOCK_CHILD} rows, append to the end
      block.appendChild(cardsGrid);
    }

    // Collect all post {BLOCK_CHILD} URLs for batch processing
    const postCardUrls = [];
    cardRows.forEach((row) => {
      const cardTypeDiv = row.children[0];
      const cardType = cardTypeDiv ? cardTypeDiv.textContent.trim().toLowerCase() : '';

      // Auto-detect structure using same logic
      const div2Content = row.children[2]?.textContent?.trim() || '';
      const div2HasAnchor = !!row.children[2]?.querySelector('a'); // !! converts to boolean (undefined → false)
      const div2LooksLikeUrl = div2HasAnchor || /^(https?:\/\/|\/|#|mailto:|tel:)/.test(div2Content);
      const isLegacyStructure = !div2LooksLikeUrl;
      const indices = isLegacyStructure ? LEGACY_DIV_INDICES : DIV_INDICES;

      // Auto-detect if not explicitly set
      let detectedType = cardType;
      if (!detectedType || detectedType === '') {
        const hasPostContent = row.children[indices.POST_AEM_CONTENT] && row.children[indices.POST_AEM_CONTENT].textContent.trim();
        if (hasPostContent) {
          detectedType = CARD_TYPES.POST;
        }
      }

      if (detectedType === CARD_TYPES.POST) {
        const aemContentDiv = row.children[indices.POST_AEM_CONTENT];
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

    // Get language from path (same as article-list block)
    const languagePath = getLanguagePath();
    const language = languagePath.includes('/en') ? 'en' : 'ja';

    // Batch fetch metadata, taxonomy data, and placeholders for all post {BLOCK_NAME}
    let metadataResults = {};
    let taxonomyData = [];
    let placeholders = {};

    if (postCardUrls.length > 0) {
      // Fetch metadata, taxonomy data, and placeholders in parallel
      const [metadata, taxonomy, phData] = await Promise.all([
        batchFetchMetadata(postCardUrls),
        fetchTaxonomyData(),
        fetchPlaceholdersForLocale(languagePath),
      ]);
      metadataResults = metadata;
      taxonomyData = taxonomy;
      placeholders = phData;
    } else {
      // Still fetch taxonomy data and placeholders even if no post {BLOCK_NAME} (for consistency)
      const [taxonomy, phData] = await Promise.all([
        fetchTaxonomyData(),
        fetchPlaceholdersForLocale(languagePath),
      ]);
      taxonomyData = taxonomy;
      placeholders = phData;
    }

    // Process {BLOCK_CHILD} rows into {BLOCK_NAME} one by one (following accordion pattern)
    const {BLOCK_NAME} = [];
    // eslint-disable-next-line no-await-in-loop
    for (let cardIndex = 0; cardIndex < cardRows.length; cardIndex += 1) {
      const row = cardRows[cardIndex];

      // eslint-disable-next-line no-await-in-loop
      const {BLOCK_CHILD} = await createLegacyCard(row, cardIndex, config, block, metadataResults, taxonomyData, language, placeholders);
      {BLOCK_NAME}.push({BLOCK_CHILD});

      // Add {BLOCK_CHILD} to grid immediately after creation
      cardsGrid.appendChild({BLOCK_CHILD});

      // Remove the original row immediately after processing (accordion pattern)
      row.remove();
    }

    // Detect {BLOCK_CHILD} types to apply appropriate grid layout
    const hasPostCards = {BLOCK_NAME}.some(({BLOCK_CHILD}) => {BLOCK_CHILD}.classList.contains(CSS_CLASSES.CARD_POST));
    const hasTopicCards = {BLOCK_NAME}.some(({BLOCK_CHILD}) => {BLOCK_CHILD}.classList.contains(CSS_CLASSES.CARD_TOPIC));

    // Add grid layout classes based on {BLOCK_CHILD} types
    if (hasPostCards && !hasTopicCards) {
      cardsGrid.classList.add(CSS_CLASSES.CARDS_GRID_POST);
    } else if (hasTopicCards && !hasPostCards) {
      cardsGrid.classList.add(CSS_CLASSES.CARDS_GRID_TOPIC);
    } else if (hasPostCards && hasTopicCards) {
      cardsGrid.classList.add(CSS_CLASSES.CARDS_GRID_MIXED);
    }

    // Remove container field rows (first 3 rows) after processing {BLOCK_NAME}
    // These rows contain: button text, button link, carousel flag
    allRows.slice(0, CONTAINER_CONFIG_ROWS.TOTAL_CONFIG_ROWS).forEach((row) => {
      if (row.parentNode === block) {
        row.remove();
      }
    });

    // Create navigation container only if needed (carousel variant or CTA button)
    const needsNavigation = config.isCarousel || (config.ctaText && config.ctaLink);

    // Create and add navigation container if needed
    if (needsNavigation) {
      const navigationContainer = createNavigationContainer(block, cardsGrid, config);

      // Both carousel and grid: Navigation at the top (before {BLOCK_NAME} grid) for consistent CTA positioning
      if (cardsGrid.parentNode === block) {
        block.insertBefore(navigationContainer, cardsGrid);
      } else {
        block.insertBefore(navigationContainer, block.firstChild);
      }

      // Re-initialize button states after all {BLOCK_NAME} are added and navigation is created
      if (config.isCarousel) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const updateButtonStates = () => {
              const { scrollLeft, clientWidth, scrollWidth } = cardsGrid;

              const isAtStart = scrollLeft <= SCROLL.THRESHOLD;
              const isAtEnd = scrollLeft + clientWidth >= scrollWidth - SCROLL.THRESHOLD;
              const hasHorizontalScroll = scrollWidth > clientWidth + SCROLL.BUFFER;

              const prevButton = navigationContainer.querySelector(`.${CSS_CLASSES.CAROUSEL_PREV}`);
              const nextButton = navigationContainer.querySelector(`.${CSS_CLASSES.CAROUSEL_NEXT}`);

              if (prevButton && nextButton) {
                prevButton.classList.toggle(CSS_CLASSES.DISABLED, isAtStart);
                prevButton.setAttribute(ARIA.ATTRIBUTES.DISABLED, isAtStart);
                nextButton.classList.toggle(CSS_CLASSES.DISABLED, isAtEnd || !hasHorizontalScroll);
                nextButton.setAttribute(ARIA.ATTRIBUTES.DISABLED, isAtEnd || !hasHorizontalScroll);
              }
            };
            updateButtonStates();
          }, TIMEOUTS.CAROUSEL_REINITIALIZATION_DELAY); // Longer delay to ensure all layout is complete
        });
      }
    }

    // Grid was already added to the block early to maintain positioning

    // Add tooltips for {BLOCK_CHILD} titles/subtitles after layout is complete
    // Use delay to ensure CSS line-clamp has been applied and layout is rendered
    requestAnimationFrame(() => {
      setTimeout(() => {
        {BLOCK_NAME}.forEach(({BLOCK_CHILD}) => {
          const isTopic = {BLOCK_CHILD}.classList.contains('{BLOCK_CHILD}-topic');

          if (isTopic) {
            // Topic {BLOCK_NAME}: Always add tooltip to subtitle (even if not truncated)
            const subtitleText = {BLOCK_CHILD}.querySelector('.{BLOCK_CHILD}-subtitle .subtitle-text');
            if (subtitleText) {
              const fullText = subtitleText.textContent?.trim() || '';
              if (fullText && !subtitleText.hasAttribute('title')) {
                subtitleText.setAttribute('title', fullText);
              }
            }

            // Also handle title if present (legacy topic {BLOCK_NAME})
            const titleText = {BLOCK_CHILD}.querySelector('.{BLOCK_CHILD}-title .title-text');
            if (titleText) {
              const fullText = titleText.textContent?.trim() || '';
              if (fullText && !titleText.hasAttribute('title')) {
                titleText.setAttribute('title', fullText);
              }
            }
          } else {
            // Post {BLOCK_NAME}: Always add tooltip to title (even if not truncated)
            const titleHeading = {BLOCK_CHILD}.querySelector('.{BLOCK_CHILD}-title :is(h1, h2, h3, h4, h5, h6)');
            if (titleHeading) {
              const fullText = titleHeading.textContent?.trim() || '';
              if (fullText && !titleHeading.hasAttribute('title')) {
                titleHeading.setAttribute('title', fullText);
              }
            }
          }
        });
      }, TIMEOUTS.CAROUSEL_REINITIALIZATION_DELAY); // Same delay as carousel to ensure layout is complete
    });

    // Process icon syntax and then decorate icons in the entire {BLOCK_NAME} block
    decorateIcons(block);

    // Remove loading state and announce completion
    block.setAttribute(ARIA.ATTRIBUTES.BUSY, ARIA.VALUES.FALSE);
    const completionAnnouncement = block.querySelector(`.${CSS_CLASSES.SR_ONLY}[${ARIA.ATTRIBUTES.LIVE}="${ARIA.VALUES.POLITE}"]`);
    if (completionAnnouncement) {
      const totalCards = block.querySelectorAll(`.${CSS_CLASSES.CARD}`).length;
      completionAnnouncement.textContent = `Loaded ${totalCards} {BLOCK_CHILD}${totalCards !== 1 ? 's' : ''}`;
      // Remove announcement after screen reader has time to read it
      setTimeout(() => {
        if (completionAnnouncement.parentNode) {
          completionAnnouncement.remove();
        }
      }, TIMEOUTS.LOADING_ANNOUNCEMENT_DURATION);
    }
  } catch (error) {
    // Announce error state to screen readers
    block.setAttribute(ARIA.ATTRIBUTES.BUSY, ARIA.VALUES.FALSE);
    const errorAnnouncement = block.querySelector(`.${CSS_CLASSES.SR_ONLY}[${ARIA.ATTRIBUTES.LIVE}="${ARIA.VALUES.POLITE}"]`);
    if (errorAnnouncement) {
      errorAnnouncement.textContent = TEXT.ERROR_MESSAGE;
    }

    // Fallback: just add the {BLOCK_NAME} class and leave content as-is
    block.classList.add(CSS_CLASSES.CARDS);
  }
}
