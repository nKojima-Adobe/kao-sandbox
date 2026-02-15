/**
 * Text block decorator.
 * Reads the bottomOffset data attribute and applies it as a CSS custom property.
 * @param {HTMLElement} block The text block element
 */
export default function decorate(block) {
  const bottomOffset = block.getAttribute('data-bottom-offset')
    || block.getAttribute('data-bottomoffset');

  if (bottomOffset) {
    const offsetVal = parseInt(bottomOffset, 10);
    if (!Number.isNaN(offsetVal)) {
      block.style.setProperty('--bottom-offset', `${offsetVal}px`);
    }
  }
}
