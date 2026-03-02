import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper-inner';

  [...block.children].forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'table-row';
    moveInstrumentation(row, rowEl);

    const cells = [...row.children];
    const colCount = parseInt(cells[0]?.textContent?.trim(), 10) || 1;

    for (let i = 0; i < colCount; i += 1) {
      const cellEl = document.createElement('div');
      cellEl.className = 'table-cell';
      const textCell = cells[1 + i * 2];
      const imageCell = cells[2 + i * 2];

      if (textCell) {
        while (textCell.firstChild) cellEl.append(textCell.firstChild);
      }
      if (imageCell) {
        const pic = imageCell.querySelector('picture');
        if (pic) cellEl.append(pic);
      }

      rowEl.append(cellEl);
    }

    wrapper.append(rowEl);
  });

  wrapper.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(wrapper);
}
