# SNS Share Links Block

A social media sharing block that renders platform-specific share buttons for the current page.

## Features
- **5 platforms**: LinkedIn, Facebook, X (Twitter), LINE, Copy URL
- **Configurable per page**: Authors select which platforms to show via content model
- **Copy to clipboard**: With toast notification feedback (success/error)
- **Localization**: All labels, aria-labels, and share URL templates can be overridden via i18n placeholders
- **Analytics**: Share click events tracked per platform
- **Accessibility**: Proper ARIA labels, roles, and live regions for screen readers
- **Responsive**: Toast notifications adapt to mobile viewports

## Architecture
- Standard self-contained block (`blocks/sns-share-links/`)
- Uses root prefix naming: `sns-share-links` (block), `sns-share-link` (item), `sns-share-toast` (UI)
- Heavy reliance on i18n placeholders (16 constants) for full localization
- Platform configurations defined as exportable constants (`PLATFORMS` object)

## Content Model
- **Parent**: `sns-share-links` — container block (filter for child items)
- **Child**: `sns-share-link` — individual platform item with a select field for platform choice
