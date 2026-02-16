import { decorateIcons } from '../../scripts/aem.js';

/**
 * Redirect Button block decorator.
 * Builds a bordered rectangular button with an optional icon, text, and link.
 * @param {HTMLElement} block The redirect-button block element
 */
export default function decorate(block) {
  const iconName = block.getAttribute('data-icon-name') || block.getAttribute('data-iconname') || '';
  const text = block.getAttribute('data-text') || block.textContent.trim() || '';
  const link = block.getAttribute('data-link') || '';

  block.textContent = '';

  const anchor = document.createElement('a');
  anchor.href = link || '#';
  anchor.className = 'redirect-button-link';
  if (link) {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  }

  if (iconName) {
    const iconSpan = document.createElement('span');
    iconSpan.className = `icon icon-${iconName}`;
    anchor.append(iconSpan);
  }

  const textSpan = document.createElement('span');
  textSpan.className = 'redirect-button-text';
  textSpan.textContent = text;
  anchor.append(textSpan);

  block.append(anchor);

  decorateIcons(block);
}
