/**
 * Decorates the horizontal-line block
 * @param {Element} block The horizontal-line block element
 */
export default function decorate(block) {
  block.innerHTML = '';

  const hr = document.createElement('hr');
  block.appendChild(hr);
}
