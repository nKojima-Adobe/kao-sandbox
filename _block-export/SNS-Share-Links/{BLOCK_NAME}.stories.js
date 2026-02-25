import { PLATFORMS } from './{BLOCK_NAME}.js';
import { decorateIcons } from '../../scripts/aem.js';
import '../../styles/styles.css';
import './{BLOCK_NAME}.css';
// Import content model for reference
import './_{BLOCK_NAME}.json';

export default {
  title: 'Blocks/{BLOCK_FUNC}',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## {BLOCK_FUNC} Block

🔗 **Social sharing block** - Creates social media sharing links for the current page

**Complexity:** simple
**Variants:** configurable platform selection
**Fields:** 1 per item

**Content Model Fields:**
- **sns**: Platform selection (LinkedIn, Facebook, X, LINE, Copy URL)

**Supported Platforms:**
- **LinkedIn**: Share on LinkedIn
- **Facebook**: Share on Facebook
- **X (Twitter)**: Share on X (formerly Twitter)
- **LINE**: Share on LINE messaging app
- **Copy URL**: Copy current page URL to clipboard

**Features:**
- Automatic URL encoding for sharing
- Page title inclusion for platforms that support it (X, LINE)
- Copy to clipboard functionality with feedback
- Accessible button design with proper ARIA labels
- Icon support with hover/focus states
- Clean HTML structure with semantic elements

This block uses the content model defined in \`_{BLOCK_NAME}.json\` for consistent authoring.
        `,
      },
    },
  },
  argTypes: {
    // Platform selection
    platforms: {
      control: 'object',
      description: 'Array of platforms to include',
      defaultValue: ['linkedin', 'facebook', 'x', 'line', 'copy'],
    },
    // Page context for demonstration
    pageUrl: {
      control: 'text',
      description: 'Page URL for demonstration (simulated)',
      defaultValue: 'https://example.com/current-page',
    },
    pageTitle: {
      control: 'text',
      description: 'Page title for demonstration (simulated)',
      defaultValue: 'Example Page Title',
    },
    // Display options
    showCopyFeedback: {
      control: 'boolean',
      description: 'Show copy to clipboard feedback animation',
      defaultValue: false,
    },
  },
};

// Helper function to create a share link item
const createShareLinkItem = (platform) => {
  const container = document.createElement('div');
  const textDiv = document.createElement('div');

  // Set the platform name as text content
  switch (platform.toLowerCase()) {
    case 'linkedin':
      textDiv.textContent = 'LinkedIn';
      break;
    case 'facebook':
      textDiv.textContent = 'Facebook';
      break;
    case 'x':
      textDiv.textContent = 'X';
      break;
    case 'line':
      textDiv.textContent = 'LINE';
      break;
    case 'copy':
      textDiv.textContent = 'Copy URL';
      break;
    default:
      textDiv.textContent = platform;
  }

  container.appendChild(textDiv);
  return container;
};

const Template = (args) => {
  const {
    platforms, pageUrl, pageTitle, showCopyFeedback,
  } = args;

  // Create container
  const container = document.createElement('div');
  container.style.cssText = `
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: ${showCopyFeedback ? '80px' : '20px'};
    position: relative;
  `;

  // Create the {BLOCK_NAME} block
  const block = document.createElement('div');
  block.className = '{BLOCK_NAME}';

  // Add platform items
  platforms.forEach((platform) => {
    const item = createShareLinkItem(platform);
    block.appendChild(item);
  });

  // Add block to container
  container.appendChild(block);

  // Add page context simulation
  const contextInfo = document.createElement('div');
  contextInfo.style.cssText = `
    margin-top: 20px;
    padding: 12px;
    background: #e9ecef;
    border-radius: 4px;
    font-size: 12px;
    color: #495057;
  `;
  contextInfo.innerHTML = `
    <strong>Simulated Page Context:</strong><br>
    URL: ${pageUrl}<br>
    Title: ${pageTitle}<br><br>
    <em>Note: Share buttons use this simulated context for demonstration.</em>
  `;
  container.appendChild(contextInfo);

  // Helper functions for creating share buttons
  function extractSNSType(text) {
    const normalized = text.trim().toLowerCase();
    if (normalized === 'linkedin') return 'linkedin';
    if (normalized === 'facebook') return 'facebook';
    if (normalized === 'x' || normalized === 'twitter') return 'x';
    if (normalized === 'line') return 'line';
    if (normalized === 'copy' || normalized === 'copy url') return 'copy';
    return null;
  }

  function getSNSConfig(snsType) {
    const normalizedType = snsType.toLowerCase();
    switch (normalizedType) {
      case 'linkedin': return PLATFORMS.LINKEDIN;
      case 'facebook': return PLATFORMS.FACEBOOK;
      case 'x': return PLATFORMS.X;
      case 'line': return PLATFORMS.LINE;
      case 'copy': return PLATFORMS.COPY;
      default: return null;
    }
  }

  function replaceUrlPlaceholders(urlTemplate, currentUrl, currentTitle = '') {
    let url = urlTemplate;
    url = url.replace(/{CURRENT_PAGE_URL}/g, encodeURIComponent(currentUrl));
    url = url.replace(/{PAGE_TITLE}/g, encodeURIComponent(currentTitle));
    return url;
  }

  function createShareButton(snsType, currentUrl, currentTitle = '') {
    const normalizedType = snsType.toLowerCase();
    const platformConfig = getSNSConfig(normalizedType);

    if (!platformConfig) {
      console.warn(`Unknown SNS type: ${snsType}`);
      return null;
    }

    const isCopy = normalizedType === 'copy';
    const button = isCopy ? document.createElement('button') : document.createElement('a');

    button.className = '{BLOCK_CHILD}';
    button.setAttribute('aria-label', platformConfig.ariaLabel);

    if (isCopy) {
      button.type = 'button';
    }

    if (!isCopy) {
      const shareUrl = replaceUrlPlaceholders(
        platformConfig.shareUrlTemplate,
        currentUrl,
        currentTitle,
      );
      button.href = shareUrl;
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
    }

    // Create icon container
    const iconSpan = document.createElement('span');
    iconSpan.className = `icon icon-${platformConfig.icon}`;
    iconSpan.setAttribute('aria-hidden', 'true');
    button.appendChild(iconSpan);

    // Add copy functionality
    if (isCopy) {
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(currentUrl);
          const originalLabel = button.getAttribute('aria-label');
          button.setAttribute('aria-label', 'URL copied to clipboard');
          setTimeout(() => {
            button.setAttribute('aria-label', originalLabel);
          }, 2000);
        } catch (err) {
          console.error('Failed to copy URL:', err);
        }
      });
    }

    return button;
  }

  // Create a custom decorator function that uses our simulated URL and title
  const decorateWithSimulatedContext = (blockElem) => {
    // Set container class
    blockElem.classList.add('{BLOCK_NAME}');

    // Process all child divs
    const linkDivs = Array.from(blockElem.querySelectorAll(':scope > div'));
    const buttons = [];

    linkDivs.forEach((div) => {
      // Find the innermost div with text content
      const textDiv = div.querySelector('div:last-child');
      if (!textDiv) return;

      const text = textDiv.textContent.trim();
      const snsType = extractSNSType(text);

      if (snsType) {
        // Create share button with our simulated URL and title
        const button = createShareButton(snsType, pageUrl, pageTitle);
        if (button) {
          buttons.push(button);
          // Replace the container with the button
          div.replaceWith(button);
        }
      }
    });

    // Decorate icons after creating buttons
    if (buttons.length > 0) {
      decorateIcons(blockElem);
    }
  };

  // Apply our custom decorator function
  decorateWithSimulatedContext(block);

  // Add copy feedback simulation if enabled
  if (showCopyFeedback) {
    const copyButton = block.querySelector('button.{BLOCK_CHILD}');
    if (copyButton) {
      const feedbackDemo = document.createElement('div');
      feedbackDemo.style.cssText = `
        position: absolute;
        bottom: -60px;
        left: 0;
        right: 0;
        padding: 12px;
        background: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        color: #155724;
        font-size: 14px;
        text-align: center;
      `;
      feedbackDemo.innerHTML = `
        <strong>Copy Feedback Demo:</strong><br>
        Click the Copy URL button above to see the aria-label change to "URL copied to clipboard" for 2 seconds.
      `;
      container.appendChild(feedbackDemo);

      // Add click event listener to demonstrate the copy feedback
      copyButton.addEventListener('click', () => {
        const originalLabel = copyButton.getAttribute('aria-label');
        copyButton.setAttribute('aria-label', 'URL copied to clipboard');

        // Create a visual feedback element
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          z-index: 1000;
          animation: fadeInOut 2s forwards;
        `;
        toast.textContent = 'URL copied to clipboard!';

        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
          }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        // Remove toast after animation
        setTimeout(() => {
          document.body.removeChild(toast);
          copyButton.setAttribute('aria-label', originalLabel);
        }, 2000);
      });
    }
  }

  return container;
};

// Story variants
export const AllPlatforms = Template.bind({});
AllPlatforms.args = {
  platforms: ['linkedin', 'facebook', 'x', 'line', 'copy'],
  pageUrl: 'https://example.com/current-page',
  pageTitle: 'Example Page Title',
  showCopyFeedback: false,
};
AllPlatforms.parameters = {
  docs: {
    description: {
      story: 'Shows all supported social sharing platforms including LinkedIn, Facebook, X (Twitter), LINE, and Copy URL.',
    },
  },
};

export const SocialOnly = Template.bind({});
SocialOnly.args = {
  platforms: ['linkedin', 'facebook', 'x', 'line'],
  pageUrl: 'https://example.com/current-page',
  pageTitle: 'Example Page Title',
  showCopyFeedback: false,
};
SocialOnly.parameters = {
  docs: {
    description: {
      story: 'Shows only social media platforms without the Copy URL button.',
    },
  },
};

export const CopyUrlOnly = Template.bind({});
CopyUrlOnly.args = {
  platforms: ['copy'],
  pageUrl: 'https://example.com/current-page',
  pageTitle: 'Example Page Title',
  showCopyFeedback: true,
};
CopyUrlOnly.parameters = {
  docs: {
    description: {
      story: 'Shows only the Copy URL button with feedback demonstration.',
    },
  },
};

export const CustomSelection = Template.bind({});
CustomSelection.args = {
  platforms: ['linkedin', 'x', 'copy'],
  pageUrl: 'https://example.com/current-page',
  pageTitle: 'Example Page Title',
  showCopyFeedback: false,
};
CustomSelection.parameters = {
  docs: {
    description: {
      story: 'Shows a custom selection of sharing platforms (LinkedIn, X, and Copy URL).',
    },
  },
};

export const WithLongPageTitle = Template.bind({});
WithLongPageTitle.args = {
  platforms: ['linkedin', 'facebook', 'x', 'line', 'copy'],
  pageUrl: 'https://example.com/article/very-long-article-title-with-many-keywords',
  pageTitle: 'This is a Very Long Page Title That Will Be Encoded in Share URLs for X and LINE Platforms to Test URL Encoding and Length Handling',
  showCopyFeedback: false,
};
WithLongPageTitle.parameters = {
  docs: {
    description: {
      story: 'Demonstrates how the component handles long page titles in share URLs.',
    },
  },
};

export const WithCopyFeedback = Template.bind({});
WithCopyFeedback.args = {
  platforms: ['linkedin', 'facebook', 'x', 'line', 'copy'],
  pageUrl: 'https://example.com/current-page',
  pageTitle: 'Example Page Title',
  showCopyFeedback: true,
};
WithCopyFeedback.parameters = {
  docs: {
    description: {
      story: 'Demonstrates the copy to clipboard feedback when clicking the Copy URL button.',
    },
  },
};
