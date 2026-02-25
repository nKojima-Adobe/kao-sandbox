# Buttons Block Description

A simple, accessible block that renders a single NEC-styled button from an authored link. The block defines the global `.button` design system class and its variants.

## What It Does

The decorator finds the first `<a>` inside the block, adds the `.button` class, copies any variant class from the block wrapper, wraps text content in a `.button-caption` span (preserving icon order), and replaces the block's contents with the styled link.

## Key Features

- **5 button variants:** Filled (default), Outlined, Text, Anchor, Nav
- **URL validation:** Validates href patterns (http, /, #, mailto, tel) with safe fallback to `#`
- **Keyboard accessibility:** Space key activation via event handler, Enter via native `<a>` behavior
- **Disabled state:** `aria-disabled="true"`, pointer-events disabled, muted colors
- **Icon support:** Icon elements (`.icon` spans) are preserved alongside `.button-caption` text
- **Title normalization:** Strips icon syntax from title attributes using `normalizeAltText()`
- **State styles:** Hover, active, focus, and disabled states for all 5 variants
- **Japanese language support:** Custom line-height and letter-spacing for text variant
- **Icon color filters:** SVG icon colors change per variant and state via CSS filter

## Button Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Filled | (default) | Blue background, white text |
| Outlined | `.button-outlined` | White background, blue border and text |
| Text | `.button-text` | No background/border, underlined text |
| Anchor | `.button-anchor` | Compact, no border, for in-page anchors |
| Nav | `.button-nav` | White background, for navigation contexts |

## Design System Note

The `.button` class is a **global design system token**. Other blocks (hero, cards, etc.) also use `.button` and its variants. This CSS is loaded when any page includes the buttons block.
