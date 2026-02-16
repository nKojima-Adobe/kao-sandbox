import decorate from './accordion.js';
import { decorateIcons } from '../../scripts/aem.js';
import '../../styles/styles.css';
import './accordion.css';
import './_accordion.json';

export default {
  title: 'Blocks/Accordion',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Accordion Block

Accessible accordion with variants. Titles can include inline icons via ":icon-name:" syntax handled by the block.
        `,
      },
    },
  },
  args: {
    'accordionHeader': 'Frequently Asked Questions',
    styleVariation: 'full-bleed',
    withHeaderIcon: true,
    headerIcon: 'user',
    items: [
      { title: 'What is EDS?', content: 'Edge Delivery Services accelerates websites with modern authoring.' },
      {
        title: 'How do I use the accordion?', content: `
<div>
<picture>
<source type="image/jpeg" srcset="https://picsum.photos/800/450?random=601 800w, https://picsum.photos/1200/675?random=601 1200w" sizes="(max-width: 800px) 100vw, 800px"/>
<img src="https://picsum.photos/800/450?random=601" alt="Sample accordion image" width="800" height="450" loading="lazy" style="border-radius:8px;"/>
</picture>
</div>
<div>
<p>Text</p>
<p>Text</p>
</div>
`,
      },
      { title: 'Can I include icons?', content: 'Yes, include syntax like :add: in the title; icons are rendered.' },
    ],
  },
  argTypes: {
    'accordionHeader': { control: 'text', description: 'Optional heading rendered above the accordion' },
    styleVariation: {
      control: 'select',
      options: ['full-bleed', 'stacked-right'],
      description: 'Visual variant: full-bleed / stacked-right',
      defaultValue: 'full-bleed',
    },
    withHeaderIcon: { control: 'boolean', description: 'Prefix each item title with an icon (demo purpose)' },
    headerIcon: { control: 'text', description: 'Icon name for header prefix (e.g., add-20, chevron-down-20)' },
    items: { control: 'object', description: 'Array of { title, content } items', table: { category: 'Content' } },
  },
};

// Icons are decorated by the block via decorateIcons in accordion.js

const tokenizeIcons = (text) => text.replace(/:([a-zA-Z0-9-]+):/g, (_m, name) => `<span class="icon icon-${name}"></span>`);

const buildRow = (title, html) => {
  const row = document.createElement('div');
  const cell1 = document.createElement('div');

  const h = document.createElement('h5');
  h.innerHTML = tokenizeIcons(title || '');
  cell1.appendChild(h);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = tokenizeIcons(html || '');
  const cells = [];
  while (wrapper.firstChild) {
    const cell = document.createElement('div');
    cell.appendChild(wrapper.firstChild);
    cells.push(cell);
  }

  row.appendChild(cell1);
  cells.forEach((c) => row.appendChild(c));
  return row;
};

const Template = (args) => {
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  wrapper.className = 'default-content-wrapper';

  const block = document.createElement('div');
  block.className = 'accordion block';

  if (args['accordionHeader']) block.setAttribute('data-accordion-header', tokenizeIcons(args['accordionHeader']));
  const mappedVariation = args.styleVariation === 'full-bleed' ? 'expanded' : args.styleVariation;
  if (mappedVariation) block.setAttribute('data-style-variation', mappedVariation);

  const fallbackItems = [
    { title: 'What is EDS?', content: 'Edge Delivery Services accelerates websites with modern authoring.' },
    { title: 'How do I use the accordion?', content: 'Click a title to expand. Keyboard: Enter/Space, Up/Down to navigate.' },
    { title: 'Can I include icons?', content: 'Yes, include syntax like :add: in the title; icons are rendered.' },
  ];
  let items = Array.isArray(args.items) && args.items.length > 0 ? args.items : fallbackItems;

  if (args.withHeaderIcon && args.headerIcon) {
    const iconToken = `:${args.headerIcon}:`;
    items = items.map((it) => ({ ...it, title: `${iconToken} ${it.title}` }));
  }
  items.forEach((it) => {
    const title = it && it.title ? it.title : 'Item';
    const content = it && it.content ? it.content : '';
    const contentHTML = /^\s*</.test(content) ? content : `<p>${content}</p>`;
    const row = buildRow(title, contentHTML);
    block.appendChild(row);
  });

  wrapper.appendChild(block);
  section.appendChild(wrapper);

  decorate(block);

  // Ensure icon spans inside content are decorated in Storybook
  decorateIcons(block);
  return section;
};

export const Accordion = Template.bind({});
Accordion.parameters = {
  docs: {
    description: { story: 'Single accordion story with full controls. Adjust properties in the Controls panel.' },
  },
};
