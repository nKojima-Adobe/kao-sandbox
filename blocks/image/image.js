/**
 * Image block decorator.
 * No additional JS logic needed — width is handled purely via CSS classes
 * applied by the 'classes' model field (e.g. image-width-80).
 * @param {HTMLElement} block The image block element
 */
export default function decorate(block) {
  // Ensure images are responsive
  const img = block.querySelector('img');
  if (img) {
    img.loading = 'lazy';
  }
}
