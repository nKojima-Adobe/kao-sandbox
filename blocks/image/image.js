/**
 * Apply GKC Home Card sizing via inline styles.
 * Uses inline styles for maximum specificity, ensuring they override
 * any global rules (e.g. main img { width:auto; height:auto }).
 * @param {HTMLElement} block The image block element
 * @param {HTMLElement} picture The picture element
 * @param {HTMLElement} img The img element
 */
function applyHomeCardStyles(block, picture, img) {
  Object.assign(block.style, {
    position: 'relative',
    width: '60vw',
    height: '20vw',
    overflow: 'hidden',
  });
  Object.assign(picture.style, {
    position: 'absolute',
    inset: '0',
    display: 'block',
  });
  Object.assign(img.style, {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  });
}

/**
 * Image block decorator.
 * For GKC Home variants, applies card sizing and wraps the image in a clickable link.
 * @param {HTMLElement} block The image block element
 */
export default function decorate(block) {
  const isGkcHome = block.classList.contains('gkc-home')
    || block.classList.contains('gkc-home-card');
  const isGkcHomeCard = block.classList.contains('gkc-home-card');
  if (!isGkcHome) return;

  const picture = block.querySelector('picture');
  if (!picture) return;
  const img = picture.querySelector('img');

  // Apply card sizing before link wrapping
  if (isGkcHomeCard && img) {
    applyHomeCardStyles(block, picture, img);
  }

  // Wrap the image in a clickable link
  const link = block.getAttribute('data-link');
  if (!link) return;

  const anchor = document.createElement('a');
  anchor.href = link;
  anchor.className = 'image-link';
  anchor.setAttribute('aria-label', img?.alt || 'View linked content');

  if (isGkcHomeCard) {
    Object.assign(anchor.style, {
      position: 'absolute',
      inset: '0',
      display: 'block',
      textDecoration: 'none',
      cursor: 'pointer',
    });
  }

  picture.parentNode.insertBefore(anchor, picture);
  anchor.appendChild(picture);
}
