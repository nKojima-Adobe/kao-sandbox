/**
 * Decorates the {BLOCK_NAME} block
 * @param {Element} block The {BLOCK_NAME} block element
 */
export default function decorate(block) {
  // Clear existing content
  block.innerHTML = '';

  // Create the {BLOCK_NAME} element
  const hr = document.createElement('hr');

  // Add the {BLOCK_NAME} to the block
  block.appendChild(hr);

  // Add the {BLOCK_NAME} class for styling
  block.classList.add('{BLOCK_NAME}');
}
