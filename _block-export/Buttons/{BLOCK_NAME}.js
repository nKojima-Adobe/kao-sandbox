/**
 * {BLOCK_FUNC} Block Decoration
 * Creates a single button with configurable type and properties
 */

import { normalizeAltText } from '../../utils/generic-utils.js';

/**
 * Validates if a string is a valid URL
 * @param {string} url The URL to validate
 * @returns {boolean} True if valid URL, false otherwise
 */
function isValidUrl(url) {
  if (!url || url.trim() === '') return true; // Empty is valid

  // Check for valid URL patterns
  const urlPatterns = [
    /^https?:\/\/.+/, // http:// or https://
    /^\/.+/, // /path
    /^#.+/, // #anchor
    /^mailto:.+/, // mailto:email
    /^tel:.+/, // tel:number
  ];

  return urlPatterns.some((pattern) => pattern.test(url));
}

/**
 * Creates a button element with proper structure and styling
 * @param {Element} block The button block element
 * @returns {Element} The created button element
 */
function createButton(block) {
  const button = block.querySelector('a');

  // Return null if no button link found
  if (!button) {
    // eslint-disable-next-line no-console
    return null;
  }

  // Validate URL if provided
  if (!isValidUrl(button.href)) {
    // eslint-disable-next-line no-console
    console.warn('Invalid URL provided:', button.href);
    // Use default href for invalid URLs
    button.href = '#';
  }

  button.classList.add('button');
  const buttonType = Array.from(block.classList).find((className) => className.startsWith('button-'));
  if (buttonType) {
    button.classList.add(buttonType);
  }

  // Title attribute is plain text (tooltip); strip icon syntax like we do for alt text
  const titleAttr = button.getAttribute('title');
  if (titleAttr) {
    button.setAttribute('title', normalizeAltText(titleAttr));
  }

  // Add keyboard event handler for Space key activation
  button.addEventListener('keydown', (event) => {
    // Only handle Space key - early return for better performance
    if (event.key !== ' ') return;

    // Prevent default spacebar scrolling behavior
    event.preventDefault();

    // Only activate if not disabled - cache the check for better performance
    const isDisabled = button.getAttribute('aria-disabled') === 'true';
    if (!isDisabled) {
      // Simulate click on Space key press
      button.click();
    }
  });

  // Wrap button text in span.button-caption (preserve icon elements and order)
  const fragment = document.createDocumentFragment();
  let captionSpan = null;

  function flushCaption() {
    if (captionSpan && captionSpan.childNodes.length > 0) {
      fragment.appendChild(captionSpan);
    }
    captionSpan = null;
  }

  Array.from(button.childNodes).forEach((node) => {
    const isIcon = node.nodeType === Node.ELEMENT_NODE
      && node.classList
      && node.classList.contains('icon');
    if (isIcon) {
      flushCaption();
      fragment.appendChild(node);
    } else {
      if (!captionSpan) {
        captionSpan = document.createElement('span');
        captionSpan.className = 'button-caption';
      }
      captionSpan.appendChild(node);
    }
  });
  flushCaption();
  button.replaceChildren(fragment);

  return button;
}

/**
 * Decorates the {BLOCK_NAME} block
 * @param {Element} block The {BLOCK_NAME} block element
 */
export default function decorate(block) {
  const button = createButton(block);

  // Only replace children if button was successfully created
  if (button) {
    block.replaceChildren(button);
  }
  // Icons will be processed globally by decorateMain() in scripts.js
}
