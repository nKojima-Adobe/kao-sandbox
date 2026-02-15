/* eslint-disable max-len */

import decorate from './carousel.js';
import { decorateIcons } from '../../scripts/aem.js';
import '../../styles/styles.css';
import './carousel.css';
import './_carousel.json';

export default {
  title: 'Blocks/Carousel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Carousel Block

A flexible, media-rich carousel that supports images and Brightcove videos, multiple layout variations, accessible navigation, and CTA links.

### Layout Variations
- **full-grid**: Standard grid-style carousel layout
- **full-width**: Edge-to-edge media presentation
- **image-only-medium**: Medium-sized image-only layout
- **image-only-large**: Large image-only layout

### Features
- Keyboard and screen reader friendly navigation
- Image and Brightcove video support
- Configurable titles, descriptions, and CTAs
- Support for multiple carousel items (slides)

### Video Support
- Videos in carousel slides use Brightcove video-js elements
- The carousel automatically initializes Brightcove players when slides contain video
- **Note**: Use real Brightcove video IDs in Storybook for videos to load and play
        `,
      },
    },
  },
  args: {
    layout: 'full-grid',
    slides: [
      {
        mediaType: 'image',
        imageUrl: 'https://picsum.photos/800/450?random=1',
        altText: 'Sample carousel image 1',
        link: '/solutions',
        title: 'Powering Digital Transformation',
        description: 'NEC solutions enabling secure, scalable digital transformation across industries.',
        ctaLink: '/solutions',
        ctaText: 'Learn More',
      },
      {
        mediaType: 'image',
        imageUrl: 'https://picsum.photos/800/450?random=2',
        altText: 'Sample carousel image 2',
        link: '/case-studies',
        title: 'Real-World Success Stories',
        description: 'Discover how organizations are leveraging NEC technology to achieve measurable outcomes.',
        ctaLink: '/case-studies',
        ctaText: 'View Stories',
      },
      {
        mediaType: 'image',
        imageUrl: 'https://picsum.photos/800/450?random=3',
        altText: 'Sample carousel image 3',
        link: '/contact',
        title: 'Partner With NEC',
        description: 'Work with NEC to design, build, and operate mission-critical solutions.',
        ctaLink: '/contact',
        ctaText: 'Contact Us',
      },
    ],
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['full-grid', 'full-width', 'image-only-medium', 'image-only-large'],
      description: 'Layout variation for the carousel block.',
      defaultValue: 'full-grid',
    },
    slides: {
      control: 'object',
      description: 'Array of carousel items (slides) with media and content fields.',
      table: { category: 'Content' },
    },
  },
};

const buildCarouselSlideRow = (slide) => {
  const {
    mediaType = 'image',
    imageUrl,
    videoId,
    altText = '',
    link,
    title = '',
    description = '',
    ctaLink,
    ctaText = '',
  } = slide || {};

  const row = document.createElement('div');

  // Media Type
  const mediaTypeCell = document.createElement('div');
  const mediaTypeContent = document.createElement('div');
  mediaTypeContent.textContent = mediaType;
  mediaTypeCell.appendChild(mediaTypeContent);
  row.appendChild(mediaTypeCell);

  // Media Image
  const imageCell = document.createElement('div');
  if (imageUrl && mediaType === 'image') {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = altText;
    img.loading = 'lazy';
    picture.appendChild(img);
    imageCell.appendChild(picture);
  }
  row.appendChild(imageCell);

  // Media Video (Brightcove)
  const videoCell = document.createElement('div');
  if (videoId && mediaType === 'video') {
    const videoJs = document.createElement('video-js');
    videoJs.setAttribute('data-account', '4598493582001');
    videoJs.setAttribute('data-player', 'VkljVUbZtx');
    videoJs.setAttribute('data-embed', 'default');
    videoJs.setAttribute('data-video-id', videoId);
    videoJs.setAttribute('controls', '');
    videoJs.className = 'video-js vjs-fluid';
    // Ensure video-js has an ID (required by carousel video loading logic)
    if (!videoJs.id) {
      const uniqueId = `carousel-video-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      videoJs.setAttribute('id', uniqueId);
    }
    videoCell.appendChild(videoJs);
  }
  row.appendChild(videoCell);

  // Alt Text
  const altCell = document.createElement('div');
  const altContent = document.createElement('div');
  altContent.textContent = altText;
  altCell.appendChild(altContent);
  row.appendChild(altCell);

  // Link
  const linkCell = document.createElement('div');
  if (link) {
    const a = document.createElement('a');
    a.href = link;
    a.textContent = link;
    linkCell.appendChild(a);
  }
  row.appendChild(linkCell);

  // Title
  const titleCell = document.createElement('div');
  const titleContent = document.createElement('div');
  titleContent.textContent = title;
  titleCell.appendChild(titleContent);
  row.appendChild(titleCell);

  // Description
  const descCell = document.createElement('div');
  const descContent = document.createElement('div');
  descContent.textContent = description;
  descCell.appendChild(descContent);
  row.appendChild(descCell);

  // CTA Link
  const ctaLinkCell = document.createElement('div');
  if (ctaLink) {
    const ctaAnchor = document.createElement('a');
    ctaAnchor.href = ctaLink;
    ctaAnchor.textContent = ctaLink;
    ctaLinkCell.appendChild(ctaAnchor);
  }
  row.appendChild(ctaLinkCell);

  // CTA Text
  const ctaTextCell = document.createElement('div');
  const ctaTextContent = document.createElement('div');
  ctaTextContent.textContent = ctaText;
  ctaTextCell.appendChild(ctaTextContent);
  row.appendChild(ctaTextCell);

  return row;
};

const Template = (args) => {
  const section = document.createElement('div');
  section.className = 'section';

  const wrapper = document.createElement('div');
  wrapper.className = 'default-content-wrapper';

  const block = document.createElement('div');
  block.className = 'carousel block';

  // Layout row (first row)
  const layoutRow = document.createElement('div');
  const layoutCell = document.createElement('div');
  layoutCell.textContent = (args.layout || 'full-grid').toLowerCase();
  layoutRow.appendChild(layoutCell);
  block.appendChild(layoutRow);

  // Slides
  const slides = Array.isArray(args.slides) ? args.slides : [];
  slides.forEach((slide) => {
    const row = buildCarouselSlideRow(slide);
    block.appendChild(row);
  });

  wrapper.appendChild(block);
  section.appendChild(wrapper);

  // Decorate with carousel logic and icons
  decorate(block);
  decorateIcons(block);

  return section;
};

export const FullGridImages = Template.bind({});
FullGridImages.args = {
  layout: 'full-grid',
  slides: [
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=1',
      altText: 'Business professionals collaborating in a modern office',
      link: '/solutions',
      title: 'Digital Transformation Solutions',
      description: 'Accelerate your digital journey with secure and scalable platforms.',
      ctaLink: '/solutions',
      ctaText: 'Learn More',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=2',
      altText: 'Smart city at night with connected infrastructure',
      link: '/smart-city',
      title: 'Smart City Innovation',
      description: 'Build resilient, people-centered smart cities with NEC.',
      ctaLink: '/smart-city',
      ctaText: 'Explore',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=3',
      altText: 'Cybersecurity specialist monitoring networks',
      link: '/security',
      title: 'Advanced Security & Identity',
      description: 'Protect critical infrastructure and digital identities.',
      ctaLink: '/security',
      ctaText: 'Discover',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=10',
      altText: 'AI and data analytics dashboard',
      link: '/ai-data',
      title: 'AI & Data Analytics',
      description: 'Unlock insights with advanced analytics and machine learning.',
      ctaLink: '/ai-data',
      ctaText: 'Explore AI',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=11',
      altText: 'Network infrastructure hardware',
      link: '/networking',
      title: 'Networking & Infrastructure',
      description: 'Robust, scalable networks for modern enterprises.',
      ctaLink: '/networking',
      ctaText: 'See Networking',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=12',
      altText: 'Team collaborating in a hybrid workspace',
      link: '/workstyle',
      title: 'Workstyle Innovation',
      description: 'Empower hybrid work with secure, flexible tools.',
      ctaLink: '/workstyle',
      ctaText: 'Learn More',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=13',
      altText: 'Citizen services and public safety',
      link: '/public',
      title: 'Public Services & Safety',
      description: 'Technology that supports safer, smarter societies.',
      ctaLink: '/public',
      ctaText: 'View Solutions',
    },
  ],
};
FullGridImages.parameters = {
  docs: {
    description: {
      story: 'Standard full-grid layout with multiple image-based slides (more than five) to exercise full carousel navigation.',
    },
  },
};

export const FullWidthMixedMedia = Template.bind({});
FullWidthMixedMedia.args = {
  layout: 'full-width',
  slides: [
    {
      mediaType: 'video',
      videoId: '6379184097112', // Real Brightcove video ID - replace with your video ID
      altText: 'Brightcove video demonstrating NEC solutions',
      link: '/video-solutions',
      title: 'See Our Solutions in Action',
      description: 'Watch how NEC technology solves complex real-world challenges.',
      ctaLink: '/video-solutions',
      ctaText: 'Watch Now',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=4',
      altText: 'Cloud infrastructure graphic',
      link: '/cloud',
      title: 'Cloud & Platform Services',
      description: 'Scalable, secure cloud platforms tailored to your needs.',
      ctaLink: '/cloud',
      ctaText: 'View Cloud Services',
    },
  ],
};
FullWidthMixedMedia.parameters = {
  docs: {
    description: {
      story: 'Full-width layout combining Brightcove video and image slides. The video slide uses a real Brightcove video ID and will load and play automatically when the carousel initializes.',
    },
  },
};

export const ImageOnlyMedium = Template.bind({});
ImageOnlyMedium.args = {
  layout: 'image-only-medium',
  slides: [
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=5',
      altText: 'Medium-sized promotional visual',
      link: '/campaign',
      title: 'Campaign Highlight',
      description: 'Promote key campaigns with medium image-only layout.',
      ctaLink: '/campaign',
      ctaText: 'View Campaign',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=6',
      altText: 'Second promotional visual',
      link: '/campaign-2',
      title: 'Secondary Highlight',
      description: 'Secondary promotional content with clear imagery.',
      ctaLink: '/campaign-2',
      ctaText: 'Learn More',
    },
  ],
};
ImageOnlyMedium.parameters = {
  docs: {
    description: {
      story: 'Image-only medium layout ideal for promotional content.',
    },
  },
};

export const ImageOnlyLarge = Template.bind({});
ImageOnlyLarge.args = {
  layout: 'image-only-large',
  slides: [
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/1200/600?random=7',
      altText: 'Large hero-style visual',
      link: '/hero',
      title: 'Immersive Visual Storytelling',
      description: 'Use large imagery to create impactful visual experiences.',
      ctaLink: '/hero',
      ctaText: 'Explore Story',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/1200/600?random=8',
      altText: 'Alternate hero visual',
      link: '/hero-2',
      title: 'Alternative Hero Layout',
      description: 'Showcase alternate hero visuals with clear CTAs.',
      ctaLink: '/hero-2',
      ctaText: 'View Alternative',
    },
  ],
};
ImageOnlyLarge.parameters = {
  docs: {
    description: {
      story: 'Large image-only layout optimized for hero-style visuals.',
    },
  },
};

export const SingleSlideMinimal = Template.bind({});
SingleSlideMinimal.args = {
  layout: 'full-grid',
  slides: [
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=9',
      altText: 'Single minimal slide image',
      link: '',
      title: 'Single Slide Carousel',
      description: 'Minimal configuration with only one slide and no CTA link.',
      ctaLink: '',
      ctaText: '',
    },
  ],
};
SingleSlideMinimal.parameters = {
  docs: {
    description: {
      story: 'Minimal example with a single image slide for the carousel.',
    },
  },
};

// Story with many slides to showcase pagination and scrolling behavior
export const ManySlides = Template.bind({});
ManySlides.args = {
  layout: 'full-grid',
  slides: [
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=11',
      altText: 'Slide 1 image',
      link: '/slide-1',
      title: 'Slide 1',
      description: 'First slide in a larger carousel set.',
      ctaLink: '/slide-1',
      ctaText: 'View Slide 1',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=12',
      altText: 'Slide 2 image',
      link: '/slide-2',
      title: 'Slide 2',
      description: 'Second slide with example content.',
      ctaLink: '/slide-2',
      ctaText: 'View Slide 2',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=13',
      altText: 'Slide 3 image',
      link: '/slide-3',
      title: 'Slide 3',
      description: 'Third slide showcasing additional imagery.',
      ctaLink: '/slide-3',
      ctaText: 'View Slide 3',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=14',
      altText: 'Slide 4 image',
      link: '/slide-4',
      title: 'Slide 4',
      description: 'Fourth slide in the carousel.',
      ctaLink: '/slide-4',
      ctaText: 'View Slide 4',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=15',
      altText: 'Slide 5 image',
      link: '/slide-5',
      title: 'Slide 5',
      description: 'Fifth slide with sample text.',
      ctaLink: '/slide-5',
      ctaText: 'View Slide 5',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=16',
      altText: 'Slide 6 image',
      link: '/slide-6',
      title: 'Slide 6',
      description: 'Sixth slide to test extended navigation.',
      ctaLink: '/slide-6',
      ctaText: 'View Slide 6',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=17',
      altText: 'Slide 7 image',
      link: '/slide-7',
      title: 'Slide 7',
      description: 'Seventh slide with additional content.',
      ctaLink: '/slide-7',
      ctaText: 'View Slide 7',
    },
    {
      mediaType: 'image',
      imageUrl: 'https://picsum.photos/800/450?random=18',
      altText: 'Slide 8 image',
      link: '/slide-8',
      title: 'Slide 8',
      description: 'Eighth slide to reach beyond 5 slides.',
      ctaLink: '/slide-8',
      ctaText: 'View Slide 8',
    },
  ],
};
ManySlides.parameters = {
  docs: {
    description: {
      story: 'Carousel configured with eight slides to demonstrate behavior with more than five items.',
    },
  },
};
