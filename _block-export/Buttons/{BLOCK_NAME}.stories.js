/**
 * {BLOCK_FUNC} Block Stories
 * Documentation and examples for the {BLOCK_NAME} block
 */

/* eslint-disable max-len */

import '../../styles/styles.css';
import './{BLOCK_NAME}.css';

export default {
  title: 'Blocks/{BLOCK_FUNC}',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# {BLOCK_FUNC} Block

A simple block that renders a single NEC-styled button based on authored content.

## Key Features

- **Multiple variants**: Filled (default), Outlined, Text, Anchor, Nav
- **Accessible**: Keyboard activation (Space and Enter) on links
- **URL safety**: Basic URL validation with safe fallback
- **Disabled state**: Proper cursor, colors, and icon treatment

## Authoring Model

In AEM, the {BLOCK_NAME} block typically looks like:

- Block class: \`{BLOCK_NAME}\` plus an optional variant class:
  - \`button-outlined\`
  - \`button-text\`
  - \`button-anchor\`
  - \`button-nav\`
- Content: A single link inside the block, which is converted into a styled button:

Example:

\`\`\`
| {BLOCK_FUNC} (block)
| └─ [button-outlined]
|     └─ [Link text](https://example.com)
\`\`\`

The block script:

- Finds the first \`<a>\` inside the block
- Adds the base \`button\` class
- Copies any \`button-*\` class from the block to the link
- Replaces the block contents with that single link

        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard-navigation', enabled: true },
          { id: 'focus-management', enabled: true },
        ],
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['filled', 'outlined', 'text', 'anchor', 'nav'],
      description: 'Button visual style / type',
      defaultValue: 'filled',
    },
    label: {
      control: { type: 'text' },
      description: 'Button label text',
      defaultValue: 'Primary action',
    },
    href: {
      control: { type: 'text' },
      description: 'Button link (href)',
      defaultValue: '#',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
      defaultValue: false,
    },
    iconToken: {
      control: { type: 'text' },
      description: 'Authorable icon token, e.g. `:add:` (leave empty for no icon)',
      defaultValue: '',
    },
  },
};

// Helper to map variant to class name
const getVariantClass = (variant) => {
  if (variant === 'outlined') return 'button-outlined';
  if (variant === 'text') return 'button-text';
  if (variant === 'anchor') return 'button-anchor';
  if (variant === 'nav') return 'button-nav';
  return ''; // filled/default
};

// Helper to create an icon span based on an authorable token like ":add:"
// Hardened: iconName is validated before being used in attributes/URL.
const createIconFromToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (!trimmed.startsWith(':') || !trimmed.endsWith(':')) return null;
  const rawIconName = trimmed.slice(1, -1).trim();

  // Only allow simple icon names (letters, numbers, hyphen, underscore).
  // If invalid or empty, skip creating an icon.
  if (!rawIconName || !/^[a-zA-Z0-9_-]+$/.test(rawIconName)) {
    return null;
  }

  const iconName = rawIconName;

  const span = document.createElement('span');
  span.className = `icon icon-${iconName}`;

  // Inline img so icons are visible in Storybook without decorateIcons()
  const img = document.createElement('img');
  img.setAttribute('data-icon-name', iconName);
  img.src = `/icons/${iconName}.svg`;
  img.loading = 'lazy';
  img.setAttribute('role', 'img');
  img.alt = iconName;
  img.setAttribute('aria-label', iconName);

  span.appendChild(img);
  return span;
};

// Helper to create a button element that matches the final block output
const createButtonElement = ({
  variant,
  label,
  href,
  disabled,
  iconToken,
}) => {
  const link = document.createElement('a');
  link.className = 'button';

  const variantClass = getVariantClass(variant);
  if (variantClass) {
    link.classList.add(variantClass);
  }

  link.href = href || '#';
  link.textContent = label || '';

  if (disabled) {
    link.classList.add('disabled');
    link.setAttribute('aria-disabled', 'true');
    link.tabIndex = -1;
  }

  const iconSpan = createIconFromToken(iconToken);
  if (iconSpan) {
    link.appendChild(iconSpan);
  }

  const wrapper = document.createElement('div');
  wrapper.className = '{BLOCK_NAME}';
  wrapper.appendChild(link);

  return wrapper;
};

// Story template
const Template = (args) => createButtonElement(args);

/**
 * Default filled button
 */
export const Filled = Template.bind({});
Filled.args = {
  variant: 'filled',
  label: 'Primary action',
  href: '#',
  disabled: false,
  iconToken: '',
};

/**
 * Outlined button
 */
export const Outlined = Template.bind({});
Outlined.args = {
  variant: 'outlined',
  label: 'Secondary action',
  href: '#',
  disabled: false,
  iconToken: '',
};

/**
 * Text button
 */
export const Text = Template.bind({});
Text.args = {
  variant: 'text',
  label: 'Text action',
  href: '#',
  disabled: false,
  iconToken: '',
};

/**
 * Disabled button
 */
export const Disabled = Template.bind({});
Disabled.args = {
  variant: 'filled',
  label: 'Disabled action',
  href: '#',
  disabled: true,
  iconToken: '',
};

/**
 * Button with icon (authorable token)
 */
export const WithIcon = Template.bind({});
WithIcon.args = {
  variant: 'outlined',
  label: 'Navigate',
  href: '#',
  disabled: false,
  iconToken: ':arrow-forward:',
};

/**
 * Anchor-style button
 */
export const AnchorVariant = Template.bind({});
AnchorVariant.args = {
  variant: 'anchor',
  label: 'Anchor link',
  href: '#section-id',
  disabled: false,
  iconToken: ':anchor:',
};

/**
 * Nav-style button
 */
export const NavVariant = Template.bind({});
NavVariant.args = {
  variant: 'nav',
  label: 'Nav item',
  href: '#',
  disabled: false,
  iconToken: '',
};
