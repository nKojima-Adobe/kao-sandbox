import '../../styles/styles.css';
import './{BLOCK_NAME}.css';
import decorate from './{BLOCK_NAME}.js';
import {
  {BLOCK_UPPER}_CSS_CLASSES,
} from './{BLOCK_NAME}-constants.js';

export default {
  title: 'Blocks/{BLOCK_FUNC}',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## {BLOCK_FUNC} Block

A flexible {BLOCK_VAR} component that displays primary content at the top of a webpage with title, description, optional media (image/video), and CTA buttons.

**Content Model Fields:**
- **layout** (required): Layout type - 'text-only' or 'contains-media'
- **mediaType** (conditional): Media type - 'image' or 'video' (when layout is contains-media)
- **mediaImage** (conditional): Image reference (when mediaType is image)
- **mediaVideo** (conditional): Video embed code (when mediaType is video)
- **altText** (conditional): Alt text for images
- **caption** (optional): Visual caption text displayed below media
- **pretitle** (optional): Small text above the title
- **title** (required): Main heading text (max 150 characters)
- **description** (optional): Supporting text (max 300 characters)
- **ctaButtonLink** (optional): CTA button URL
- **ctaButtonText** (conditional): CTA button text (required if ctaButtonLink provided)

### Features:
- Two Layouts: Text-only or contains-media
- Media Support: Images and videos with Brightcove integration
- Accessibility: Full WCAG 2.1 AA compliance with VTT captions
- Responsive: Mobile-first design with tablet and desktop breakpoints
- CTA Support: Optional call-to-action buttons
- Video Captions: Automatic VTT track generation for accessibility

### CSS Classes:
- \`.{BLOCK_CLASS}\` - Main block
- \`.{BLOCK_CLASS}-text-only\` - Text-only layout variant
- \`.{BLOCK_CLASS}-contains-media\` - Contains-media layout variant
- \`.{BLOCK_CLASS}-section\` - Section wrapper with ARIA attributes
- \`.{BLOCK_CLASS}-inner\` - Inner content container
- \`.{BLOCK_CLASS}-grid\` - Grid layout for contains-media
- \`.{BLOCK_CLASS}-content\` - Content wrapper
- \`.{BLOCK_CLASS}-pretitle\` - Pretitle text
- \`.{BLOCK_CLASS}-title\` - Main title heading
- \`.{BLOCK_CLASS}-description\` - Description text
- \`.{BLOCK_CLASS}-cta\` - CTA button wrapper
- \`.{BLOCK_CLASS}-media\` - Media wrapper
- \`.{BLOCK_CLASS}-caption\` - Media caption

### Universal Editor Support:
This block is fully compatible with Universal Editor, using the content model defined in \`_{BLOCK_NAME}.json\`.
The model includes conditional field visibility and validation rules for optimal authoring experience.

### Accessibility:
- Semantic section element with aria-labelledby
- Proper heading hierarchy (h1 for title)
- VTT caption tracks for videos (always present)
- Keyboard navigation support
- Focus management
- Screen reader announcements for dynamic content
        `,
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    layout: {
      control: { type: 'select' },
      options: ['text-only', 'contains-media'],
      description: '{BLOCK_FUNC} layout type',
      defaultValue: 'text-only',
    },
    mediaType: {
      control: { type: 'select' },
      options: ['image', 'video'],
      description: 'Media type when layout is contains-media',
      defaultValue: 'image',
      if: { arg: 'layout', eq: 'contains-media' },
    },
    pretitle: {
      control: 'text',
      description: 'Pretitle text (optional)',
      defaultValue: 'Welcome to NEC',
    },
    title: {
      control: 'text',
      description: 'Main heading text (supports HTML)',
      defaultValue: 'Innovation for a Better World',
    },
    description: {
      control: { type: 'text', rows: 3 },
      description: 'Description text (optional)',
      defaultValue: 'Discover how NEC is transforming industries through cutting-edge technology and innovative solutions.',
    },
    ctaButtonText: {
      control: 'text',
      description: 'CTA button text',
      defaultValue: 'Learn More',
    },
    ctaButtonLink: {
      control: 'text',
      description: 'CTA button link',
      defaultValue: 'https://www.nec.com',
    },
    caption: {
      control: 'text',
      description: 'Media caption (optional visual caption)',
      defaultValue: '',
      if: { arg: 'layout', eq: 'contains-media' },
    },
    imageUrl: {
      control: 'text',
      description: 'Image URL (optional, uses placeholder image if empty)',
      defaultValue: 'https://picsum.photos/1200/800?random=301',
      if: { arg: 'mediaType', eq: 'image' },
    },
    altText: {
      control: 'text',
      description: 'Image alt text for accessibility',
      defaultValue: 'NEC innovation showcase',
      if: { arg: 'mediaType', eq: 'image' },
    },
  },
};

/**
 * Creates the DOM structure matching AEM block format
 * AEM creates rows with single divs (one field per row)
 */
const createBlock = (args) => {
  const block = document.createElement('div');
  block.className = {BLOCK_UPPER}_CSS_CLASSES.BLOCK;

  // Row 0: Layout
  const layoutRow = document.createElement('div');
  const layoutCell = document.createElement('div');
  layoutCell.textContent = args.layout || 'text-only';
  layoutRow.appendChild(layoutCell);
  block.appendChild(layoutRow);

  // Row 1: Media Type
  const mediaTypeRow = document.createElement('div');
  const mediaTypeCell = document.createElement('div');
  mediaTypeCell.textContent = args.mediaType || 'image';
  mediaTypeRow.appendChild(mediaTypeCell);
  block.appendChild(mediaTypeRow);

  // Row 2: Media Image
  const mediaImageRow = document.createElement('div');
  const mediaImageCell = document.createElement('div');
  if (args.mediaType === 'image' && args.layout === 'contains-media') {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = args.imageUrl || 'https://picsum.photos/1200/800?random=301';
    img.alt = args.altText || '{BLOCK_FUNC} image';
    img.loading = 'eager';
    picture.appendChild(img);
    mediaImageCell.appendChild(picture);
  }
  mediaImageRow.appendChild(mediaImageCell);
  block.appendChild(mediaImageRow);

  // Row 3: Media Video
  const mediaVideoRow = document.createElement('div');
  const mediaVideoCell = document.createElement('div');
  if (args.mediaType === 'video' && args.layout === 'contains-media') {
    const videoJs = document.createElement('video-js');
    videoJs.setAttribute('data-account', '4598493582001');
    videoJs.setAttribute('data-player', 'VkljVUbZtx');
    videoJs.setAttribute('data-embed', 'default');
    videoJs.setAttribute('data-video-id', '6379184097112');
    videoJs.className = 'video-js';
    mediaVideoCell.appendChild(videoJs);
  }
  mediaVideoRow.appendChild(mediaVideoCell);
  block.appendChild(mediaVideoRow);

  // Row 4: Alt Text
  const altTextRow = document.createElement('div');
  const altTextCell = document.createElement('div');
  altTextCell.textContent = args.altText || '';
  altTextRow.appendChild(altTextCell);
  block.appendChild(altTextRow);

  // Row 5: Caption
  const captionRow = document.createElement('div');
  const captionCell = document.createElement('div');
  captionCell.textContent = args.caption || '';
  captionRow.appendChild(captionCell);
  block.appendChild(captionRow);

  // Row 6: Pretitle
  const pretitleRow = document.createElement('div');
  const pretitleCell = document.createElement('div');
  pretitleCell.textContent = args.pretitle || '';
  pretitleRow.appendChild(pretitleCell);
  block.appendChild(pretitleRow);

  // Row 7: Title
  const titleRow = document.createElement('div');
  const titleCell = document.createElement('div');
  if (args.title) {
    const titleContent = document.createElement('span');
    titleContent.innerHTML = args.title; // Controlled Storybook context only
    titleCell.appendChild(titleContent);
  }
  titleRow.appendChild(titleCell);
  block.appendChild(titleRow);

  // Row 8: Description
  const descRow = document.createElement('div');
  const descCell = document.createElement('div');
  if (args.description) {
    const descContent = document.createElement('span');
    descContent.innerHTML = args.description; // Controlled Storybook context only
    descCell.appendChild(descContent);
  }
  descRow.appendChild(descCell);
  block.appendChild(descRow);

  // Row 9: CTA Button Link
  const ctaLinkRow = document.createElement('div');
  const ctaLinkCell = document.createElement('div');
  ctaLinkCell.textContent = args.ctaButtonLink || '';
  ctaLinkRow.appendChild(ctaLinkCell);
  block.appendChild(ctaLinkRow);

  // Row 10: CTA Button Text
  const ctaTextRow = document.createElement('div');
  const ctaTextCell = document.createElement('div');
  ctaTextCell.textContent = args.ctaButtonText || '';
  ctaTextRow.appendChild(ctaTextCell);
  block.appendChild(ctaTextRow);

  return block;
};

/**
 * Template function for all story variants
 */
const Template = (args) => {
  const main = document.createElement('main');

  // Create section wrapper
  const section = document.createElement('div');
  section.className = {BLOCK_UPPER}_CSS_CLASSES.CONTAINER;
  section.setAttribute('data-section-status', 'loaded');

  // Create block wrapper
  const wrapper = document.createElement('div');
  wrapper.className = {BLOCK_UPPER}_CSS_CLASSES.WRAPPER;

  // Create the block
  const block = createBlock(args);

  // Assemble the structure
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  // Apply the decorator
  decorate(block);

  return main;
};

// Story variants

export const TextOnlyPrimary = Template.bind({});
TextOnlyPrimary.args = {
  layout: 'text-only',
  pretitle: 'Welcome to NEC',
  title: 'Innovation for a Better World',
  description: 'Discover how NEC is transforming industries through cutting-edge technology and innovative solutions.',
  ctaButtonText: 'Learn More',
  ctaButtonLink: 'https://www.nec.com',
};

export const ContainsMediaImage = Template.bind({});
ContainsMediaImage.args = {
  layout: 'contains-media',
  mediaType: 'image',
  pretitle: 'Technology Solutions',
  title: 'Digital Transformation',
  description: 'Empowering businesses with advanced technology solutions and digital innovation.',
  ctaButtonText: 'Explore Solutions',
  ctaButtonLink: 'https://www.nec.com/solutions',
  caption: 'NEC digital transformation showcase',
  altText: 'Digital transformation technology',
};

export const ContainsMediaVideo = Template.bind({});
ContainsMediaVideo.args = {
  layout: 'contains-media',
  mediaType: 'video',
  pretitle: 'Innovation in Action',
  title: 'Future Technology',
  description: 'Experience the future of technology through our innovative video demonstrations.',
  ctaButtonText: 'Watch Demo',
  ctaButtonLink: 'https://www.nec.com/demo',
  caption: 'Technology demonstration video',
};

export const TextOnlyMinimal = Template.bind({});
TextOnlyMinimal.args = {
  layout: 'text-only',
  title: 'Simple {BLOCK_FUNC}',
  description: 'A minimal {BLOCK_VAR} with just title and description.',
  pretitle: '',
  ctaButtonText: '',
  ctaButtonLink: '',
};
