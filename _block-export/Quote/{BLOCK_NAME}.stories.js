import '../../styles/styles.css';
import './{BLOCK_NAME}.css';
import decorate from './{BLOCK_NAME}.js';

export default {
  title: 'Blocks/{BLOCK_FUNC}',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## {BLOCK_FUNC} Block

A versatile {BLOCK_NAME} component that displays testimonials, expert opinions, and statements with proper attribution and multiple layout variants.

**Content Model Fields:**
- **variant** (required): Layout variant - 'default', 'article-big', or 'article-small'
- **logo** (optional): Company/organization logo (for default variant)
- **logoAltText** (conditional): Alt text for logo (required when logo provided)
- **quoteText** (required): The main {BLOCK_NAME} content (supports rich text)
- **attributionInfo1** (required): Primary attribution (name/title)
- **attributionInfo2** (optional): Secondary attribution (company/role)
- **attributionLink** (optional): Link to attribution source (internal or external)
- **attributionAvatar** (optional): Avatar image (for article variants)

### Features:
- ✅ **Three Variants**: Default, article-big, and article-small layouts
- ✅ **Logo Support**: Company logos for testimonials (default variant)
- ✅ **Avatar Support**: Personal avatars for article variants
- ✅ **Link Handling**: Internal and external attribution links with proper security
- ✅ **Accessibility**: Full WCAG 2.1 AA compliance with ARIA attributes
- ✅ **Responsive**: Mobile-first design with proper breakpoints
- ✅ **Rich Text**: HTML support in {BLOCK_NAME} text and attribution

### Variants:
- **Default**: Side-by-side layout with optional logo, ideal for testimonials
- **Article Big**: Large {BLOCK_NAME} format for prominent statements
- **Article Small**: Compact {BLOCK_NAME} with avatar, perfect for inline testimonials

### CSS Classes:
- \`.{BLOCK_NAME}\` - Main {BLOCK_NAME} block
- \`.{BLOCK_NAME}-default\` - Default variant
- \`.{BLOCK_NAME}-article-big\` - Article big variant
- \`.{BLOCK_NAME}-article-small\` - Article small variant
- \`.{BLOCK_NAME}-blockquote\` - Main blockquote element
- \`.{BLOCK_NAME}-content\` - Content wrapper (logo container)
- \`.{BLOCK_NAME}-logo\` - Logo container
- \`.{BLOCK_NAME}-text\` - {BLOCK_FUNC} text wrapper
- \`.{BLOCK_NAME}-attribution\` - Attribution section
- \`.{BLOCK_NAME}-attribution-content\` - Attribution content wrapper
- \`.{BLOCK_NAME}-avatar\` - Avatar container
- \`.{BLOCK_NAME}-attribution-text\` - Attribution text wrapper
- \`.{BLOCK_NAME}-cite\` - Citation element
- \`.{BLOCK_NAME}-attribution-link\` - Attribution link
- \`.{BLOCK_NAME}-attribution-info2\` - Secondary attribution info

### Universal Editor Support:
This block is fully compatible with Universal Editor, using the content model defined in \`_{BLOCK_NAME}.json\`.
The model includes conditional field visibility and validation rules for optimal authoring experience.

### Accessibility:
- Semantic blockquote and cite elements
- ARIA labelledby and describedby relationships
- Proper link handling with security attributes
- Keyboard navigation support
- Screen reader announcements
- Focus management for interactive elements
        `,
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'article-big', 'article-small'],
      description: '{BLOCK_FUNC} layout variant',
      defaultValue: 'default',
    },
    showLogo: {
      control: 'boolean',
      description: 'Show company logo (default variant only)',
      defaultValue: false,
      if: { arg: 'variant', eq: 'default' },
    },
    logoAltText: {
      control: 'text',
      description: 'Logo alt text for accessibility',
      defaultValue: 'Company Logo',
      if: { arg: 'showLogo', eq: true },
    },
    quoteText: {
      control: { type: 'text', rows: 4 },
      description: 'Main {BLOCK_NAME} content (supports HTML)',
      defaultValue: 'Innovation distinguishes between a leader and a follower. We must continue to push the boundaries of what\'s possible in technology.',
    },
    attributionInfo1: {
      control: 'text',
      description: 'Primary attribution (name/title)',
      defaultValue: 'Steve Johnson',
    },
    attributionInfo2: {
      control: 'text',
      description: 'Secondary attribution (company/role)',
      defaultValue: 'Chief Technology Officer, NEC Corporation',
    },
    attributionLink: {
      control: 'text',
      description: 'Attribution link (internal or external)',
      defaultValue: '',
    },
    showAvatar: {
      control: 'boolean',
      description: 'Show attribution avatar (article variants only)',
      defaultValue: false,
      if: { arg: 'variant', neq: 'default' },
    },
    avatarAltText: {
      control: 'text',
      description: 'Avatar alt text for accessibility',
      defaultValue: 'Author avatar',
      if: { arg: 'showAvatar', eq: true },
    },
  },
};

/**
 * Creates the DOM structure matching AEM block format
 * AEM creates rows with single divs (one field per row)
 * Field order matches _{BLOCK_NAME}.json configuration
 */
const createQuoteBlock = (args) => {
  const block = document.createElement('div');
  block.className = '{BLOCK_NAME}';

  // Field order from _{BLOCK_NAME}.json
  const fields = [
    'variant',
    'logo',
    'logoAltText',
    'quoteText',
    'attributionInfo1',
    'attributionInfo2',
    'attributionLink',
    'attributionAvatar',
  ];

  fields.forEach((field) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');

    switch (field) {
      case 'variant':
        cell.textContent = args.variant || 'default';
        break;

      case 'logo':
        if (args.showLogo && args.variant === 'default') {
          const picture = document.createElement('picture');
          const img = document.createElement('img');
          img.src = '/icons/placeholder.svg';
          img.alt = args.logoAltText || 'Company Logo';
          img.loading = 'lazy';
          picture.appendChild(img);
          cell.appendChild(picture);
        }
        break;

      case 'logoAltText':
        if (args.showLogo && args.variant === 'default') {
          cell.textContent = args.logoAltText || 'Company Logo';
        }
        break;

      case 'quoteText':
        if (args.quoteText) {
          const content = document.createElement('p');
          content.textContent = args.quoteText; // Safe: use textContent for user input
          cell.appendChild(content);
        }
        break;

      case 'attributionInfo1':
        if (args.attributionInfo1) {
          const content = document.createElement('span');
          // Safe handling of attribution content by building DOM elements explicitly
          if (args.attributionInfo1.includes('<strong>') || args.attributionInfo1.includes('<em>')) {
            // Parse and build safe DOM elements explicitly
            let textContent = args.attributionInfo1;

            // Handle <strong> tags
            const strongMatches = textContent.match(/<strong>(.*?)<\/strong>/g);
            if (strongMatches) {
              strongMatches.forEach((match) => {
                const innerText = match.replace(/<\/?strong>/g, '');
                const strong = document.createElement('strong');
                strong.textContent = innerText;

                // Replace the match with a placeholder and append the element
                const placeholder = `__STRONG_${Math.random().toString(36).substr(2, 9)}__`;
                textContent = textContent.replace(match, placeholder);

                // Store the element for later insertion
                if (!content.strongElements) content.strongElements = {};
                content.strongElements[placeholder] = strong;
              });
            }

            // Handle <em> tags
            const emMatches = textContent.match(/<em>(.*?)<\/em>/g);
            if (emMatches) {
              emMatches.forEach((match) => {
                const innerText = match.replace(/<\/?em>/g, '');
                const em = document.createElement('em');
                em.textContent = innerText;

                // Replace the match with a placeholder and append the element
                const placeholder = `__EM_${Math.random().toString(36).substr(2, 9)}__`;
                textContent = textContent.replace(match, placeholder);

                // Store the element for later insertion
                if (!content.emElements) content.emElements = {};
                content.emElements[placeholder] = em;
              });
            }

            // Build the final content with text nodes and elements
            const parts = textContent.split(/(__(?:STRONG|EM)_[a-z0-9]+__)/);
            parts.forEach((part) => {
              if (part.startsWith('__STRONG_') && content.strongElements && content.strongElements[part]) {
                content.appendChild(content.strongElements[part]);
              } else if (part.startsWith('__EM_') && content.emElements && content.emElements[part]) {
                content.appendChild(content.emElements[part]);
              } else if (part.trim()) {
                const textNode = document.createTextNode(part);
                content.appendChild(textNode);
              }
            });
          } else {
            content.textContent = args.attributionInfo1; // Safe: plain text
          }
          cell.appendChild(content);
        }
        break;

      case 'attributionInfo2':
        if (args.attributionInfo2) {
          const content = document.createElement('span');
          content.textContent = args.attributionInfo2; // Safe: use textContent for user input
          cell.appendChild(content);
        }
        break;

      case 'attributionLink':
        if (args.attributionLink) {
          // Create a link element for the attribution with URL validation
          const link = document.createElement('a');

          // Validate URL to prevent javascript:/data: injection
          const url = args.attributionLink.trim();
          const isValidUrl = url.startsWith('http://')
                           || url.startsWith('https://')
                           || url.startsWith('/')
                           || url.startsWith('./')
                           || url.startsWith('../');

          if (isValidUrl) {
            link.href = url;
            link.textContent = url;

            // Add security attributes for external links
            if (url.startsWith('http://') || url.startsWith('https://')) {
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
            }
          } else {
            // For invalid URLs, display as text only
            link.textContent = url;
            link.setAttribute('aria-disabled', 'true');
            link.style.textDecoration = 'none';
            link.style.cursor = 'default';
          }

          cell.appendChild(link);
        }
        break;

      case 'attributionAvatar':
        if (args.showAvatar && args.variant !== 'default') {
          const picture = document.createElement('picture');
          const img = document.createElement('img');
          img.src = '/icons/user.svg';
          img.alt = args.avatarAltText || 'Author avatar';
          img.loading = 'lazy';
          picture.appendChild(img);
          cell.appendChild(picture);
        }
        break;

      default:
        // Empty cell for unused fields
        break;
    }

    row.appendChild(cell);
    block.appendChild(row);
  });

  return block;
};

/**
 * Template function for all story variants
 */
const Template = (args) => {
  const main = document.createElement('main');

  // Create section wrapper (matching AEM structure)
  const section = document.createElement('div');
  section.className = 'section';
  section.setAttribute('data-section-status', 'loaded');

  // Create block wrapper (matching AEM structure)
  const wrapper = document.createElement('div');
  wrapper.className = 'default-content-wrapper';

  // Create the block
  const block = createQuoteBlock(args);

  // Assemble the structure
  wrapper.appendChild(block);
  section.appendChild(wrapper);
  main.appendChild(section);

  // Apply the {BLOCK_NAME} decorator
  decorate(block);

  return main;
};

// Story variants

export const Default = Template.bind({});
Default.args = {
  variant: 'default',
  showLogo: false,
  quoteText: 'Innovation distinguishes between a leader and a follower. We must continue to push the boundaries of what\'s possible in technology.',
  attributionInfo1: 'Steve Johnson',
  attributionInfo2: 'Chief Technology Officer, NEC Corporation',
  attributionLink: '',
  showAvatar: false,
};
Default.parameters = {
  docs: {
    description: {
      story: 'Default {BLOCK_NAME} variant with side-by-side layout on desktop, perfect for testimonials and customer feedback.',
    },
  },
};

export const DefaultWithLogo = Template.bind({});
DefaultWithLogo.args = {
  variant: 'default',
  showLogo: true,
  logoAltText: 'TechCorp Solutions Logo',
  quoteText: 'Our partnership with NEC has transformed our digital infrastructure and accelerated our growth beyond expectations.',
  attributionInfo1: 'Maria Rodriguez',
  attributionInfo2: 'CEO, TechCorp Solutions',
  attributionLink: '/about/leadership',
  showAvatar: false,
};
DefaultWithLogo.parameters = {
  docs: {
    description: {
      story: 'Default variant with company logo, ideal for partner testimonials and business relationships.',
    },
  },
};

export const DefaultWithExternalLink = Template.bind({});
DefaultWithExternalLink.args = {
  variant: 'default',
  showLogo: false,
  quoteText: 'Digital transformation is not just about technology—it\'s about reimagining how we work and serve our customers.',
  attributionInfo1: 'Jennifer Park',
  attributionInfo2: 'VP of Digital Strategy',
  attributionLink: 'https://linkedin.com/in/jennifer-park',
  showAvatar: false,
};
DefaultWithExternalLink.parameters = {
  docs: {
    description: {
      story: 'Default variant with external attribution link that opens in a new tab with proper security attributes.',
    },
  },
};

export const ArticleBig = Template.bind({});
ArticleBig.args = {
  variant: 'article-big',
  showLogo: false,
  quoteText: 'The future of enterprise technology lies in seamless integration of AI, cloud computing, and human-centered design principles.',
  attributionInfo1: 'Dr. Sarah Chen',
  attributionInfo2: 'Director of Research, NEC Labs',
  attributionLink: '',
  showAvatar: false,
};
ArticleBig.parameters = {
  docs: {
    description: {
      story: 'Large article-style {BLOCK_NAME} for prominent statements, expert opinions, and thought leadership content.',
    },
  },
};

export const ArticleBigWithLink = Template.bind({});
ArticleBigWithLink.args = {
  variant: 'article-big',
  showLogo: false,
  quoteText: 'Artificial intelligence will reshape every industry, but success depends on ethical implementation and human-AI collaboration.',
  attributionInfo1: '<strong>Dr. Kenji Tanaka</strong>',
  attributionInfo2: 'AI Research Lead, NEC Corporation',
  attributionLink: '/research/ai-ethics',
  showAvatar: false,
};
ArticleBigWithLink.parameters = {
  docs: {
    description: {
      story: 'Article big variant with internal link and rich text formatting in attribution.',
    },
  },
};

export const ArticleSmall = Template.bind({});
ArticleSmall.args = {
  variant: 'article-small',
  showLogo: false,
  quoteText: 'NEC\'s commitment to sustainable technology solutions aligns perfectly with our environmental goals.',
  attributionInfo1: 'Michael Thompson',
  attributionInfo2: 'Sustainability Director',
  attributionLink: '',
  showAvatar: true,
  avatarAltText: 'Michael Thompson',
};
ArticleSmall.parameters = {
  docs: {
    description: {
      story: 'Compact {BLOCK_NAME} with avatar, perfect for inline testimonials and customer feedback within articles.',
    },
  },
};

export const ArticleSmallWithLink = Template.bind({});
ArticleSmallWithLink.args = {
  variant: 'article-small',
  showLogo: false,
  quoteText: 'The implementation was seamless, and the results exceeded our expectations in every metric.',
  attributionInfo1: 'Lisa Wang',
  attributionInfo2: 'CTO, GreenTech Industries',
  attributionLink: 'https://greentech.example.com/case-study',
  showAvatar: true,
  avatarAltText: 'Lisa Wang, CTO',
};
ArticleSmallWithLink.parameters = {
  docs: {
    description: {
      story: 'Article small variant with avatar and external link, demonstrating complete feature set.',
    },
  },
};

export const MinimalQuote = Template.bind({});
MinimalQuote.args = {
  variant: 'article-big',
  showLogo: false,
  quoteText: 'Simplicity is the ultimate sophistication in enterprise solutions.',
  attributionInfo1: 'Alex Kim',
  attributionInfo2: '',
  attributionLink: '',
  showAvatar: false,
};
MinimalQuote.parameters = {
  docs: {
    description: {
      story: 'Minimal {BLOCK_NAME} with just text and basic attribution, showing optional field behavior.',
    },
  },
};

export const LongContent = Template.bind({});
LongContent.args = {
  variant: 'default',
  showLogo: true,
  logoAltText: 'Enterprise Solutions Inc.',
  quoteText: 'Working with NEC has been transformational for our organization. Their comprehensive approach to digital transformation, combined with their deep understanding of enterprise needs, has enabled us to modernize our infrastructure while maintaining operational excellence. The team\'s expertise in AI, cloud computing, and cybersecurity has been invaluable in our journey toward becoming a truly digital-first organization.',
  attributionInfo1: '<strong>Robert Chen</strong>, <em>Chief Executive Officer</em>',
  attributionInfo2: 'Enterprise Solutions Inc. - Fortune 500 Technology Company',
  attributionLink: 'https://enterprise-solutions.example.com/leadership/robert-chen',
  showAvatar: false,
};
LongContent.parameters = {
  docs: {
    description: {
      story: '{BLOCK_FUNC} with longer content to test text wrapping, layout behavior, and rich text formatting.',
    },
  },
};

export const MultiLanguageContent = Template.bind({});
MultiLanguageContent.args = {
  variant: 'article-small',
  showLogo: false,
  quoteText: 'NECとの協力により、私たちのデジタル変革が加速しました。Innovation through collaboration - this is the future of technology.',
  attributionInfo1: '田中 太郎 (Taro Tanaka)',
  attributionInfo2: 'グローバル戦略部長 - Global Strategy Director',
  attributionLink: '',
  showAvatar: true,
  avatarAltText: '田中 太郎',
};
MultiLanguageContent.parameters = {
  docs: {
    description: {
      story: '{BLOCK_FUNC} with multi-language content demonstrating international character support and mixed-language attribution.',
    },
  },
};

// Accessibility story
export const AccessibilityShowcase = Template.bind({});
AccessibilityShowcase.args = {
  variant: 'default',
  showLogo: true,
  logoAltText: 'Accessible Design Corp - Company committed to inclusive technology',
  quoteText: 'Accessibility is not a feature to be added later—it\'s a fundamental principle that should guide every design decision from the very beginning.',
  attributionInfo1: '<strong>Dr. Amanda Rodriguez</strong>',
  attributionInfo2: 'Director of Accessibility, Inclusive Design Institute',
  attributionLink: 'https://accessibility.example.com/team/amanda-rodriguez',
  showAvatar: false,
};
AccessibilityShowcase.parameters = {
  docs: {
    story: `
### Accessibility Showcase

This story demonstrates all accessibility features of the {BLOCK_FUNC} block:

#### Semantic HTML & ARIA
- Proper \`blockquote\` and \`cite\` elements for semantic meaning
- ARIA \`labelledby\` and \`describedby\` relationships
- Unique IDs for {BLOCK_NAME} text and attribution sections
- Descriptive alt text for logos and avatars
- Proper heading hierarchy and landmark roles

#### Link Accessibility
- **Security Attributes**: External links include \`rel="noopener noreferrer"\`
- **Target Behavior**: External links open in new tabs with \`target="_blank"\`
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support with Enter/Space activation
- **Focus Management**: Visible focus indicators on all interactive elements

#### Screen Reader Support
- Semantic blockquote structure announces {BLOCK_NAME} context
- Citation elements properly identify attribution
- Descriptive alt text provides context, not just identification
- ARIA relationships connect {BLOCK_NAME} text with attribution
- Link purposes are clearly announced

#### Keyboard Navigation
- **Tab**: Navigate through all interactive elements (attribution links)
- **Enter/Space**: Activate links and interactive elements
- **Focus Indicators**: High contrast focus outlines on all controls
- **Focus Order**: Logical tab sequence through content

#### Visual Accessibility
- High contrast ratios meet WCAG AA standards (4.5:1 minimum)
- Text remains readable at 200% zoom level
- Focus indicators are clearly visible
- Color is not the only means of conveying information
- Responsive design maintains usability across all screen sizes

#### Content Accessibility
- Rich text support maintains semantic structure
- Long content wraps appropriately without breaking layout
- Multi-language content displays correctly
- Special characters and symbols render properly

#### Testing Instructions
1. **Screen Reader**: Use NVDA/JAWS to navigate and verify announcements
2. **Keyboard Only**: Tab through all interactive elements
3. **Focus Indicators**: Verify visible focus outlines on links
4. **Zoom**: Test at 200% zoom level for readability
5. **Color Contrast**: Verify text meets WCAG AA standards
6. **Link Behavior**: Test internal vs external link handling

#### WCAG 2.1 AA Compliance
- ✅ 1.3.1 Info and Relationships (Level A) - Semantic HTML structure
- ✅ 1.4.3 Contrast Minimum (Level AA) - Text contrast ratios
- ✅ 2.1.1 Keyboard (Level A) - Full keyboard accessibility
- ✅ 2.1.2 No Keyboard Trap (Level A) - Proper focus management
- ✅ 2.4.3 Focus Order (Level A) - Logical tab sequence
- ✅ 2.4.4 Link Purpose (Level A) - Clear link descriptions
- ✅ 2.4.7 Focus Visible (Level AA) - Visible focus indicators
- ✅ 3.2.1 On Focus (Level A) - No unexpected context changes
- ✅ 3.2.2 On Input (Level A) - Predictable functionality
- ✅ 4.1.2 Name, Role, Value (Level A) - Proper ARIA implementation
    `,
  },
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'keyboard-navigation',
          enabled: true,
        },
        {
          id: 'focus-management',
          enabled: true,
        },
        {
          id: 'link-purpose',
          enabled: true,
        },
      ],
    },
  },
};
