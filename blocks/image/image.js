/**
 * Image block decorator.
 * For the GKC Home variant, wraps the image in a clickable link.
 * @param {HTMLElement} block The image block element
 */
export default function decorate(block) {
  const isGkcHome = block.classList.contains('gkc-home');
  if (!isGkcHome) return;

  // The link value is stored as a data attribute by xwalk rendering
  const link = block.getAttribute('data-link');
  if (!link) return;

  const picture = block.querySelector('picture');
  if (!picture) return;

  const anchor = document.createElement('a');
  anchor.href = link;
  anchor.className = 'image-link';
  anchor.setAttribute('aria-label', picture.querySelector('img')?.alt || 'View linked content');

  picture.parentNode.insertBefore(anchor, picture);
  anchor.appendChild(picture);
}
