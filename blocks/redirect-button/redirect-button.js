import { decorateIcons } from '../../scripts/aem.js';

/**
 * Field mapping: row index to field name (must match model field order).
 */
const FIELD_MAP = { 0: 'iconName', 1: 'text', 2: 'link', 3: 'widthVw', 4: 'heightVw' };

/**
 * Parse block rows into a structured content object.
 * @param {NodeListOf<Element>} rows The block's child row elements
 * @returns {Object} Parsed field values
 */
function parseContent(rows) {
  const content = { iconName: '', text: '', link: '', widthVw: '', heightVw: '' };
  rows.forEach((row, index) => {
    const cell = row.querySelector(':scope > div');
    if (!cell) return;
    const field = FIELD_MAP[index];
    if (!field) return;

    if (field === 'link') {
      const a = cell.querySelector('a');
      content.link = a ? a.href : cell.textContent.trim();
    } else {
      content[field] = cell.textContent.trim();
    }
  });
  return content;
}

/**
 * Redirect Button block decorator.
 * Builds a bordered rectangular button with an optional icon, text, and link.
 * @param {HTMLElement} block The redirect-button block element
 */
export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  const { iconName, text, link, widthVw, heightVw } = parseContent(rows);

  block.textContent = '';

  const width = parseFloat(widthVw);
  const height = parseFloat(heightVw);
  if (width > 0) block.style.width = `${width}vw`;
  if (height > 0) block.style.height = `${height}vw`;

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
