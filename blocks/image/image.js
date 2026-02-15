/**
 * Image block decorator.
 * Reads the imageWidth data attribute and applies it as an inline width style.
 * @param {HTMLElement} block The image block element
 */
export default function decorate(block) {
  const imageWidth = block.getAttribute('data-image-width')
    || block.getAttribute('data-imagewidth');

  if (imageWidth) {
    const widthVal = parseInt(imageWidth, 10);
    if (!Number.isNaN(widthVal) && widthVal > 0 && widthVal <= 100) {
      block.style.setProperty('--image-width', `${widthVal}%`);
      const pic = block.querySelector('picture');
      if (pic) {
        pic.style.width = `${widthVal}%`;
        pic.style.display = 'block';
      }
      const img = block.querySelector('img');
      if (img) {
        img.style.width = '100%';
        img.style.height = 'auto';
      }
    }
  }
}
