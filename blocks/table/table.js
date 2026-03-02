import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const table = document.createElement('table');
  [...block.children].forEach((row) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);

    const cells = [...row.children];
    const colCount = parseInt(cells[0]?.textContent?.trim(), 10) || 1;

    for (let i = 0; i < colCount; i += 1) {
      const td = document.createElement('td');
      const textCell = cells[1 + i * 2];
      const imageCell = cells[2 + i * 2];

      if (textCell) {
        while (textCell.firstChild) td.append(textCell.firstChild);
      }
      if (imageCell) {
        const pic = imageCell.querySelector('picture');
        if (pic) td.append(pic);
      }

      tr.append(td);
    }

    table.append(tr);
  });

  table.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.replaceChildren(table);
}
