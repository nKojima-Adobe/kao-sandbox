import { decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { isClipboardSupported } from '../../utils/generic-utils.js';
import fetchPlaceholdersForLocale from '../../scripts/placeholders.js';
import { trackElementInteraction } from '../../scripts/analytics/data-layer.js';
import {
  SNS_LINKEDIN_NAME,
  SNS_LINKEDIN_ARIA_LABEL,
  SNS_LINKEDIN_SHARE_URL,
  SNS_FACEBOOK_NAME,
  SNS_FACEBOOK_ARIA_LABEL,
  SNS_FACEBOOK_SHARE_URL,
  SNS_X_NAME,
  SNS_X_ARIA_LABEL,
  SNS_X_SHARE_URL,
  SNS_LINE_NAME,
  SNS_LINE_ARIA_LABEL,
  SNS_LINE_SHARE_URL,
  SNS_COPY_NAME,
  SNS_COPY_ARIA_LABEL,
  SNS_COPY_SUCCESS_MESSAGE,
  SNS_COPY_ERROR_MESSAGE,
} from '../../constants/placeholders-constants.js';

// Fetch placeholders at module level for reuse
let placeholders = {};
fetchPlaceholdersForLocale().then((p) => {
  placeholders = p || {};
});

/**
 * Platform configurations for SNS share links
 */
export const PLATFORMS = {
  LINKEDIN: {
    id: 'linkedin',
    name: 'LinkedIn',
    shareUrlTemplate: 'https://www.linkedin.com/sharing/share-offsite/?url={CURRENT_PAGE_URL}',
    ariaLabel: 'Share on LinkedIn',
    icon: 'linkedin',
  },
  FACEBOOK: {
    id: 'facebook',
    name: 'Facebook',
    shareUrlTemplate: 'https://www.facebook.com/sharer/sharer.php?u={CURRENT_PAGE_URL}',
    ariaLabel: 'Share on Facebook',
    icon: 'facebook',
  },
  X: {
    id: 'x',
    name: 'X (Twitter)',
    shareUrlTemplate: 'https://twitter.com/intent/tweet?url={CURRENT_PAGE_URL}&text={PAGE_TITLE}',
    ariaLabel: 'Share on X',
    icon: 'x',
  },
  LINE: {
    id: 'line',
    name: 'LINE',
    shareUrlTemplate: 'https://social-plugins.line.me/lineit/share?url={CURRENT_PAGE_URL}&text={PAGE_TITLE}',
    ariaLabel: 'Share on LINE',
    icon: 'line',
  },
  COPY: {
    id: 'copy',
    name: 'Copy URL',
    shareUrlTemplate: '',
    ariaLabel: 'Copy URL to clipboard',
    icon: 'link',
  },
};

/**
 * Maps SNS type to platform configuration
 */
const getSNSConfig = (snsType) => {
  const normalizedType = snsType.toLowerCase();
  const config = (() => {
    switch (normalizedType) {
      case 'linkedin': return { ...PLATFORMS.LINKEDIN };
      case 'facebook': return { ...PLATFORMS.FACEBOOK };
      case 'x': return { ...PLATFORMS.X };
      case 'line': return { ...PLATFORMS.LINE };
      case 'copy': return { ...PLATFORMS.COPY };
      default: return null;
    }
  })();

  if (!config) return null;

  // Apply placeholders for shareUrlTemplate if available
  if (normalizedType === 'linkedin') {
    config.shareUrlTemplate = placeholders[SNS_LINKEDIN_SHARE_URL] || config.shareUrlTemplate;
  } else if (normalizedType === 'facebook') {
    config.shareUrlTemplate = placeholders[SNS_FACEBOOK_SHARE_URL] || config.shareUrlTemplate;
  } else if (normalizedType === 'x') {
    config.shareUrlTemplate = placeholders[SNS_X_SHARE_URL] || config.shareUrlTemplate;
  } else if (normalizedType === 'line') {
    config.shareUrlTemplate = placeholders[SNS_LINE_SHARE_URL] || config.shareUrlTemplate;
  }

  return config;
};

/**
 * Replaces placeholders in URL template with actual values
 * @param {string} urlTemplate - URL template with placeholders like {CURRENT_PAGE_URL}
 * @param {string} currentUrl - The current page URL
 * @param {string} pageTitle - The page title (optional)
 * @returns {string} URL with placeholders replaced
 */
function replaceUrlPlaceholders(urlTemplate, currentUrl, pageTitle = '') {
  let url = urlTemplate;
  url = url.replace(/{CURRENT_PAGE_URL}/g, encodeURIComponent(currentUrl));
  url = url.replace(/{PAGE_TITLE}/g, encodeURIComponent(pageTitle));
  return url;
}

/**
 * Helper function to track SNS share click events
 * @param {string} platform - SNS platform (facebook, twitter, linkedin, line, email, copy)
 * @param {string} shareUrl - URL being shared
 * @param {string} pageTitle - Page title being shared
 */
function trackSNSShareClick(platform, shareUrl, pageTitle) {
  try {
    trackElementInteraction('sns-share-click', {
      elementType: 'sns-share-links',
      elementHref: shareUrl,
      additionalData: {
        platform,
        shareUrl,
        pageTitle,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error tracking SNS share click:', error);
  }
}

/**
 * Creates a share button element
 * @param {string} snsType - The SNS type (linkedin, facebook, x, copy)
 * @param {string} currentUrl - The current page URL
 * @param {string} pageTitle - The page title (optional)
 * @returns {HTMLElement} The created button element
 */
function createShareButton(snsType, currentUrl, pageTitle = '') {
  const normalizedType = snsType.toLowerCase();
  const platformConfig = getSNSConfig(normalizedType);

  if (!platformConfig) {
    // eslint-disable-next-line no-console
    console.warn(`Unknown SNS type: ${snsType}`);
    return null;
  }

  // Get localized texts from placeholders or use defaults
  const { name: defaultName, ariaLabel: defaultAriaLabel } = platformConfig;
  let name = defaultName;
  let ariaLabel = defaultAriaLabel;

  // Use placeholders based on platform type
  if (normalizedType === 'linkedin') {
    name = placeholders[SNS_LINKEDIN_NAME] || defaultName;
    ariaLabel = placeholders[SNS_LINKEDIN_ARIA_LABEL] || defaultAriaLabel;
  } else if (normalizedType === 'facebook') {
    name = placeholders[SNS_FACEBOOK_NAME] || defaultName;
    ariaLabel = placeholders[SNS_FACEBOOK_ARIA_LABEL] || defaultAriaLabel;
  } else if (normalizedType === 'x') {
    name = placeholders[SNS_X_NAME] || defaultName;
    ariaLabel = placeholders[SNS_X_ARIA_LABEL] || defaultAriaLabel;
  } else if (normalizedType === 'line') {
    name = placeholders[SNS_LINE_NAME] || defaultName;
    ariaLabel = placeholders[SNS_LINE_ARIA_LABEL] || defaultAriaLabel;
  } else if (normalizedType === 'copy') {
    name = placeholders[SNS_COPY_NAME] || defaultName;
    ariaLabel = placeholders[SNS_COPY_ARIA_LABEL] || defaultAriaLabel;
  }

  const isCopy = normalizedType === 'copy';
  const button = isCopy ? document.createElement('button') : document.createElement('a');

  button.className = 'sns-share-link';
  // Store the localized name as a data attribute for potential future use
  button.dataset.snsName = name;
  // Only set role="button" for non-button elements that need button behavior
  if (isCopy) {
    // Native button elements already have role="button" by default
    button.type = 'button';
    button.setAttribute('aria-label', ariaLabel);
  }

  if (!isCopy) {
    const shareUrl = replaceUrlPlaceholders(platformConfig.shareUrlTemplate, currentUrl, pageTitle);
    button.href = shareUrl;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    // Inform screen readers that link opens in new window
    button.setAttribute('aria-label', `${ariaLabel} (opens in new window)`);

    // Add click tracking for social media share links
    button.addEventListener('click', () => {
      // Map platform ID to match requirement (x -> twitter)
      const platformName = normalizedType === 'x' ? 'twitter' : normalizedType;
      trackSNSShareClick(platformName, currentUrl, pageTitle);
    });
  }

  // Create icon container
  const iconSpan = document.createElement('span');
  iconSpan.className = `icon icon-${platformConfig.icon}`;
  // Mark decorative icon as hidden for screen readers
  iconSpan.setAttribute('aria-hidden', 'true');
  button.appendChild(iconSpan);

  // Add copy functionality
  if (isCopy) {
    button.addEventListener('click', async () => {
      // Track SNS share click for copy action
      trackSNSShareClick('copy', currentUrl, pageTitle);

      const originalLabel = button.getAttribute('aria-label');
      try {
        if (!isClipboardSupported()) {
          // eslint-disable-next-line no-console
          console.warn('Clipboard API not supported in this context');
          throw new Error('Clipboard API not supported');
        }

        await navigator.clipboard.writeText(currentUrl);
        button.setAttribute('aria-label', 'URL copied to clipboard');

        // Create visual feedback toast
        const toast = document.createElement('div');
        toast.className = 'sns-share-toast';
        toast.textContent = placeholders[SNS_COPY_SUCCESS_MESSAGE] || 'URL copied to clipboard!';
        // Add accessibility attributes for screen readers
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.setAttribute('aria-atomic', 'true');
        document.body.appendChild(toast);

        // Store timeout ID for cleanup
        const timeoutId = setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
          button.setAttribute('aria-label', originalLabel);
        }, 2000);

        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
          clearTimeout(timeoutId);
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, { once: true });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to copy URL:', err);

        // Provide user feedback on failure
        button.setAttribute('aria-label', 'Failed to copy. Please try again.');

        // Show error toast
        const errorToast = document.createElement('div');
        errorToast.className = 'sns-share-toast sns-share-toast-error';
        errorToast.textContent = placeholders[SNS_COPY_ERROR_MESSAGE] || 'Failed to copy URL. Please try again.';
        // Add accessibility attributes for screen readers - use alert role for errors
        errorToast.setAttribute('role', 'alert');
        errorToast.setAttribute('aria-live', 'assertive');
        errorToast.setAttribute('aria-atomic', 'true');
        document.body.appendChild(errorToast);

        // Store timeout ID for cleanup
        const timeoutId = setTimeout(() => {
          if (document.body.contains(errorToast)) {
            document.body.removeChild(errorToast);
          }
          button.setAttribute('aria-label', originalLabel);
        }, 3000);

        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
          clearTimeout(timeoutId);
          if (document.body.contains(errorToast)) {
            document.body.removeChild(errorToast);
          }
        }, { once: true });
      }
    });
  }

  return button;
}

/**
 * Extracts SNS type from text content
 * @param {string} text - The text content
 * @returns {string|null} The SNS type or null
 */
function extractSNSType(text) {
  const normalized = text.trim().toLowerCase();
  if (normalized === 'linkedin') return 'linkedin';
  if (normalized === 'facebook') return 'facebook';
  if (normalized === 'x' || normalized === 'twitter') return 'x';
  if (normalized === 'line') return 'line';
  if (normalized === 'copy' || normalized === 'copy url') return 'copy';
  return null;
}

export default function decorate(block) {
  // Set container class
  block.classList.add('sns-share-links');

  // Get current page URL and title
  const currentUrl = window.location.href;
  const pageTitle = document.title || '';

  // Process all child divs
  const linkContainers = Array.from(block.querySelectorAll(':scope > div'));
  const buttons = [];

  linkContainers.forEach((container) => {
    // Find the innermost div with text content
    const textDiv = container.querySelector('div:last-child');
    if (!textDiv) return;

    const text = textDiv.textContent.trim();
    const snsType = extractSNSType(text);

    if (snsType) {
      const button = createShareButton(snsType, currentUrl, pageTitle);
      if (button) {
        buttons.push(button);
        moveInstrumentation(container, button);
        // Replace the container with the button
        container.replaceWith(button);
      }
    }
  });

  // Decorate icons after creating buttons
  if (buttons.length > 0) {
    decorateIcons(block);
  }
}
