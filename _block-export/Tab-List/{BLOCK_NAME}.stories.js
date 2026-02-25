import '../../styles/variables.css';
import '../../styles/spacings.css';
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

Interactive tab navigation with responsive design and full accessibility support.

### Features
- **Responsive Design**: Mobile horizontal scrolling with automatic fade effects, tablet/desktop optimized
- **Dynamic Fade Indicators**: Left/right fade overlays that appear when content overflows
- **Position Options**: Left-aligned or Center-aligned tab lists
- **Accessibility**: Full ARIA implementation with keyboard arrow navigation
- **Show All Mode**: Optional "All" tab to display all content simultaneously
- **Smart Observers**: Uses ResizeObserver and scrollend event for automatic layout updates
- **Touch Optimized**: Mouse wheel horizontal scrolling on desktop, touch scrolling on mobile

### Implementation
The {BLOCK_NAME} block works with tab panel sections that follow it in the DOM.
Each section needs a \`data-tab-label\` attribute to define the tab text.

Configuration is provided via a nested {BLOCK_NAME} element in the last tab panel with:
- First row: Position (left or center)

### Responsive Behavior
Tab padding automatically adjusts based on viewport:
- **Mobile (<800px)**: Compact padding for space efficiency
- **Tablet (≥800px)**: Medium padding for better touch targets
- **Desktop (≥1080px)**: Enhanced padding for optimal visual hierarchy
        `,
      },
    },
  },
  args: {
    listPosition: 'left',
    showAll: false,
    tabs: [
      { label: 'Solutions', content: '<h3>Solutions</h3><p>Explore our comprehensive solutions designed to meet your business needs.</p><p>From enterprise software to cloud services, we provide cutting-edge technology solutions.</p>' },
      { label: 'Products', content: '<h3>Products</h3><p>Discover our innovative product portfolio.</p><ul><li>Software Solutions</li><li>Hardware Systems</li><li>Cloud Services</li><li>Mobile Applications</li></ul>' },
      { label: 'Services', content: '<h3>Services</h3><p>Professional services to support your digital transformation.</p><p>Our expert team provides consulting, implementation, and ongoing support services.</p>' },
      { label: 'Support', content: '<h3>Support</h3><p>24/7 customer support and resources.</p><p>Access documentation, tutorials, and get help from our support team.</p>' },
    ],
  },
  argTypes: {
    listPosition: {
      control: 'select',
      options: ['left', 'center'],
      description: 'Tab list alignment position (left or center)',
      defaultValue: 'left',
    },
    showAll: {
      control: 'boolean',
      description: 'Add an "All" tab that shows all content simultaneously',
      defaultValue: false,
    },
    tabs: {
      control: 'object',
      description: 'Array of tab objects with label and content',
      table: { category: 'Content' },
    },
  },
};

const Template = (args) => {
  const container = document.createElement('div');
  container.className = 'section-container';

  // Create main section with {BLOCK_NAME} block
  // Note: Tab-list should NOT be wrapped in default-content-wrapper
  // to avoid global ul styles (box-sizing: border-box) from interfering
  const mainSection = document.createElement('div');
  mainSection.className = 'section {BLOCK_NAME}-container';

  const block = document.createElement('div');
  block.className = '{BLOCK_NAME} block';

  if (args.showAll) {
    block.classList.add('showall');
  }

  mainSection.appendChild(block);
  container.appendChild(mainSection);

  // Create tab panel sections
  args.tabs.forEach((tab) => {
    const section = document.createElement('div');
    section.className = 'section';
    section.setAttribute('data-tab-label', tab.label);
    section.setAttribute('role', 'tabpanel');

    const panelWrapper = document.createElement('div');
    panelWrapper.className = 'default-content-wrapper';
    panelWrapper.innerHTML = tab.content;

    section.appendChild(panelWrapper);
    container.appendChild(section);
  });

  // Add configuration to the last tab panel
  if (args.tabs.length > 0) {
    const lastSection = container.lastElementChild;
    const configBlock = document.createElement('div');
    configBlock.className = '{BLOCK_NAME}';

    const positionRow = document.createElement('div');
    positionRow.textContent = args.listPosition;
    configBlock.appendChild(positionRow);

    lastSection.appendChild(configBlock);
  }

  // Decorate the {BLOCK_NAME} block - since it's async, call it immediately
  // Storybook handles async decoration internally
  decorate(block);

  return container;
};

export const Default = Template.bind({});
Default.parameters = {
  docs: {
    description: {
      story: 'Default tab list with left alignment. Tabs automatically adjust padding based on viewport size.',
    },
  },
};

export const CenterAligned = Template.bind({});
CenterAligned.args = {
  listPosition: 'center',
};
CenterAligned.parameters = {
  docs: {
    description: {
      story: 'Center-aligned tab list for layouts where centered navigation is preferred. Dynamic padding is applied when content overflows.',
    },
  },
};

export const ShowAllVariant = Template.bind({});
ShowAllVariant.args = {
  showAll: true,
  tabs: [
    { label: 'Overview', content: '<h3>Overview</h3><p>High-level summary of our offerings and capabilities.</p>' },
    { label: 'Details', content: '<h3>Detailed Information</h3><p>In-depth technical specifications and features.</p>' },
    { label: 'Examples', content: '<h3>Use Cases</h3><p>Real-world examples and implementation scenarios.</p>' },
  ],
};
ShowAllVariant.parameters = {
  docs: {
    description: {
      story: 'Show All variant includes an "All" tab that displays all content simultaneously, useful for comprehensive overviews.',
    },
  },
};

export const FadeEffectsDemo = Template.bind({});
FadeEffectsDemo.args = {
  tabs: [
    { label: 'Fade Left', content: '<h3>Dynamic Fade Effects</h3><p>Scroll the tabs to see fade indicators appear automatically on left and right edges.</p>' },
    { label: 'Fade Right', content: '<h3>Automatic Detection</h3><p>Uses ResizeObserver and scroll events to detect content changes and updates.</p>' },
    { label: 'Overflow', content: '<h3>Overflow Handling</h3><p>Fade overlays indicate when there are more tabs to scroll to.</p>' },
    { label: 'Responsive', content: '<h3>Smart Updates</h3><p>Fades update automatically when viewport resizes or content changes.</p>' },
    { label: 'Touch Friendly', content: '<h3>Touch Optimized</h3><p>Works seamlessly with touch scrolling on mobile devices.</p>' },
    { label: 'Mouse Wheel', content: '<h3>Mouse Wheel</h3><p>Desktop users can scroll horizontally using the mouse wheel.</p>' },
  ],
};
FadeEffectsDemo.parameters = {
  docs: {
    description: {
      story: 'Demonstrates the automatic fade effect overlays that appear when tab content overflows. Try scrolling the tabs to see the left/right indicators.',
    },
  },
};

export const ManyTabs = Template.bind({});
ManyTabs.args = {
  tabs: [
    { label: 'Home', content: '<h3>Home</h3><p>Welcome to our homepage with key information.</p>' },
    { label: 'About Us', content: '<h3>About Us</h3><p>Learn about our company history and mission.</p>' },
    { label: 'Products', content: '<h3>Products</h3><p>Explore our comprehensive product catalog.</p>' },
    { label: 'Services', content: '<h3>Services</h3><p>Professional services and consulting offerings.</p>' },
    { label: 'Solutions', content: '<h3>Solutions</h3><p>Industry-specific solutions and implementations.</p>' },
    { label: 'Resources', content: '<h3>Resources</h3><p>Documentation, guides, and learning materials.</p>' },
    { label: 'Support', content: '<h3>Support</h3><p>Customer support and technical assistance.</p>' },
    { label: 'Contact', content: '<h3>Contact</h3><p>Get in touch with our team for inquiries.</p>' },
  ],
};
ManyTabs.parameters = {
  docs: {
    description: {
      story: 'Example with many tabs demonstrating horizontal scrolling with automatic fade indicators showing overflow state.',
    },
  },
};

export const ResponsiveDemo = Template.bind({});
ResponsiveDemo.args = {
  listPosition: 'center',
  tabs: [
    {
      label: 'Mobile First',
      content: `
        <h3>Mobile-First Design</h3>
        <p>This tab system is designed with mobile devices as the primary consideration:</p>
        <ul>
          <li><strong>Horizontal Scrolling</strong>: Tabs scroll smoothly with touch or mouse wheel</li>
          <li><strong>Touch Optimized</strong>: Large touch targets for fingers</li>
          <li><strong>Progressive Enhancement</strong>: Better experience on larger screens</li>
          <li><strong>Fade Indicators</strong>: Visual cues show when more tabs are available</li>
        </ul>
      `,
    },
    {
      label: 'Responsive Padding',
      content: `
        <h3>Responsive Padding System</h3>
        <p>Tab padding adapts automatically to screen size:</p>
        <ul>
          <li><strong>Mobile (&lt;800px)</strong>: Compact padding for space efficiency</li>
          <li><strong>Tablet (≥800px)</strong>: Increased padding for better touch targets</li>
          <li><strong>Desktop (≥1080px)</strong>: Maximum padding for optimal visual hierarchy</li>
        </ul>
        <p>Resize the browser to see the adaptive padding in action!</p>
      `,
    },
    {
      label: 'Accessibility',
      content: `
        <h3>Full Accessibility Support</h3>
        <p>Comprehensive accessibility features:</p>
        <ul>
          <li><strong>ARIA</strong>: Complete ARIA implementation with proper roles</li>
          <li><strong>Keyboard</strong>: Arrow key navigation (left/right) between tabs</li>
          <li><strong>Screen Readers</strong>: Proper role and state announcements</li>
          <li><strong>Focus Management</strong>: Logical tab order and visible focus indicators</li>
        </ul>
      `,
    },
    {
      label: 'Smart Observers',
      content: `
        <h3>Event-Driven Architecture</h3>
        <p>Modern browser APIs eliminate the need for hardcoded setTimeout calls:</p>
        <ul>
          <li><strong>ResizeObserver</strong>: Detects size changes when tabs/content are added or removed - handles all layout updates automatically</li>
          <li><strong>scrollend Event</strong>: Triggers updates when scroll animation completes, no timing guesswork</li>
          <li><strong>scroll Event</strong>: Updates fade indicators in real-time during scrolling for instant feedback</li>
          <li><strong>Window Resize</strong>: Adapts to viewport changes for responsive behavior</li>
        </ul>
        <p><strong>Why no MutationObserver?</strong> It can create feedback loops when observing class/style changes that updateFades() itself modifies. ResizeObserver handles all our needs without this issue.</p>
        <p><em>Zero setTimeout calls + no feedback loops = deterministic behavior and reliable visual testing!</em></p>
      `,
    },
  ],
};
ResponsiveDemo.parameters = {
  docs: {
    description: {
      story: 'Comprehensive demonstration of responsive behavior and accessibility features. Resize the viewport and use keyboard navigation to explore.',
    },
  },
};

export const ContentVariations = Template.bind({});
ContentVariations.args = {
  tabs: [
    {
      label: 'Rich Content',
      content: `
        <h3>Rich Content Example</h3>
        <p>Tab panels can contain any HTML content:</p>
        <blockquote>
          <p>"The tab system seamlessly handles complex content structures while maintaining accessibility and performance."</p>
        </blockquote>
        <p><strong>Key Benefits:</strong></p>
        <ol>
          <li>Flexible content support</li>
          <li>Semantic HTML structure</li>
          <li>Responsive design with automatic adjustments</li>
          <li>Event-driven updates (ResizeObserver, scrollend event)</li>
          <li>No feedback loops or hardcoded timeouts for reliable testing</li>
        </ol>
      `,
    },
    {
      label: 'Media Content',
      content: `
        <h3>Media Integration</h3>
        <p>Tabs work well with images and media content:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 16px 0;">
          <p style="margin: 0; color: #666;">[Image Placeholder]</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #999;">Media content renders properly within tab panels</p>
        </div>
        <p>The responsive design ensures media content scales appropriately across devices.</p>
      `,
    },
    {
      label: 'Interactive Elements',
      content: `
        <h3>Interactive Components</h3>
        <p>Tab panels can include interactive elements:</p>
        <div style="margin: 16px 0;">
          <button style="background: #2c69ff; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px;">Primary Action</button>
          <button style="background: transparent; color: #2c69ff; border: 1px solid #2c69ff; padding: 8px 16px; border-radius: 4px;">Secondary Action</button>
        </div>
        <p>Focus management ensures proper keyboard navigation between tabs and content.</p>
      `,
    },
  ],
};
ContentVariations.parameters = {
  docs: {
    description: {
      story: 'Examples of different content types that work well within tab panels, from rich text to interactive elements.',
    },
  },
};
