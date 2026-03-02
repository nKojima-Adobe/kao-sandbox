export default function decorate(block) {
  const content = block.querySelector(':scope > div > div');
  if (!content) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'rich-text-content';
  while (content.firstChild) wrapper.append(content.firstChild);

  block.textContent = '';
  block.append(wrapper);
}
