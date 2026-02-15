import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * SNS Share Links block.
 * Renders a row of icon-image links.
 * Each child item provides a DAM image (icon) and a URL.
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const nav = document.createElement('nav');
  nav.className = 'sns-share-links-nav';
  nav.setAttribute('aria-label', 'Social share links');

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length < 2) return;

    const imageCell = cells[0];
    const linkCell = cells[1];

    // Extract the picture / img from the first cell
    const picture = imageCell.querySelector('picture');
    if (!picture) return;

    // Extract href from the second cell (could be an <a> or plain text URL)
    const anchor = linkCell.querySelector('a');
    let href = '';
    if (anchor) {
      href = anchor.getAttribute('href') || '';
    } else {
      href = linkCell.textContent.trim();
    }

    if (!href) return;

    // Build the link element
    const link = document.createElement('a');
    link.className = 'sns-share-link';
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(picture);

    // Preserve UE instrumentation
    moveInstrumentation(row, link);

    nav.appendChild(link);
  });

  // Replace block contents
  block.textContent = '';
  block.appendChild(nav);
}
