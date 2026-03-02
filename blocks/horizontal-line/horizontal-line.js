export default function decorate(block) {
  const widthVal = parseInt(block.children[0]?.textContent?.trim(), 10);

  block.innerHTML = '';
  const hr = document.createElement('hr');

  if (widthVal >= 1 && widthVal <= 10) {
    hr.style.width = `${widthVal * 10}%`;
  }

  block.appendChild(hr);
}
