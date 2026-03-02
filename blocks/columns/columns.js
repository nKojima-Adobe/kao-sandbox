import { decorateBlock, loadBlock } from '../../scripts/aem.js';

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // decorate and load nested blocks inside columns
  const nestedBlocks = block.querySelectorAll('div[class]:not(.block)');
  const toLoad = [];
  nestedBlocks.forEach((el) => {
    const name = el.classList[0];
    if (name && name !== 'columns-img-col' && !name.endsWith('-wrapper')) {
      decorateBlock(el);
      toLoad.push(el);
    }
  });
  for (let i = 0; i < toLoad.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await loadBlock(toLoad[i]);
  }
}
