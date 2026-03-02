export default function decorate(block) {
  block.innerHTML = '';
  const hr = document.createElement('hr');
  block.appendChild(hr);
}
