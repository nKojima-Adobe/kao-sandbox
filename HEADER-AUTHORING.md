# Header Authoring Guide

This guide explains how to author the Kao corporate header using the Universal Editor.

## Overview

The header is built from a **nav** page (fragment). The header block reads the nav page and splits it into three sections:

| Section | Class | Renders as |
|---------|-------|------------|
| Section 1 | `nav-brand` | White top bar — left side (logo + language) |
| Section 2 | `nav-sections` | Green bar navigation + mega dropdown menus |
| Section 3 | `nav-tools` | White top bar — right side (utility links) |

Sections are separated by **section dividers** (`---`) on the nav page.

---

## Section 1: Brand (top bar left)

This section appears on the left side of the white top bar.

| Order | Content type | Description |
|-------|-------------|-------------|
| a | Image (linked) | Kao logo — wrap in a link to `/` so it navigates to the homepage |
| b | Text | `Japan・日本語` — optionally make this a link to a language selector |

### How to author

1. Add an **Image** block with the Kao logo
2. Select the image and add a **link** pointing to `/`
3. Below the image, add a **Text** block with the content `Japan・日本語`

---

## Section 2: Navigation (green bar + dropdowns)

This section contains a **single bulleted list** authored in the rich text editor. The nesting levels control what appears in the green bar and the mega dropdown menus.

### Structure

```
● Green Bar Item Label                              ← Level 0: top-level bullet
  ● Category Top Link [link]                        ← Level 1: 1st indented bullet
  ● Column Heading [link]                           ← Level 1: 2nd+ indented bullet
    ● Sub-link [link]                               ← Level 2: doubly indented bullet
    ● Sub-link [link]
  ● Column Heading [link]                           ← Level 1: another column
    ● Sub-link [link]
● Next Green Bar Item                               ← Level 0: next top-level bullet
  ...
```

### How each level maps to the header

| Nesting level | What it becomes |
|---------------|-----------------|
| Level 0 (top-level bullet) | Green bar navigation item label |
| Level 1 — 1st bullet | Dropdown top link (bold heading at top of mega menu) |
| Level 1 — 2nd bullet onward | Dropdown column heading |
| Level 2 (under a Level 1 bullet) | Sub-links within that column |

### How to author

1. Add a **Text** block in Section 2
2. Start a **bulleted list** using the RTE toolbar
3. Type the first green bar item name (e.g. `ニュースルーム`)
4. Press **Enter**, then **Tab** (or click Increase Indent) to create a nested bullet
5. Type the category top link text, select it, and add a **link**
6. Continue adding Level 1 bullets for each dropdown column heading
7. For sub-links under a column, press **Enter** + **Tab** again to go to Level 2
8. To start a new green bar item, press **Enter** + **Shift+Tab** until you return to Level 0

### Concrete example

```
● ニュースルーム
  ● ニュースルームトップ  →  link to /newsroom
  ● ニュースリリース  →  link to /newsroom/releases
    ● 最新ニュース  →  link to /newsroom/releases/latest
    ● 2026年  →  link to /newsroom/releases/2026
    ● 2025年  →  link to /newsroom/releases/2025
  ● メディアライブラリ  →  link to /newsroom/media
    ● 画像素材  →  link to /newsroom/media/images
    ● 動画素材  →  link to /newsroom/media/videos
● 花王について
  ● 花王についてトップ  →  link to /about
  ● 企業情報  →  link to /about/corporate
    ● 社長メッセージ  →  link to /about/corporate/message
    ● 企業理念  →  link to /about/corporate/philosophy
  ● 事業紹介  →  link to /about/business
```

### Items without dropdowns

If a green bar item should be a simple link with no dropdown, author it as a single bullet with a link and **no nested bullets** underneath:

```
● お問い合わせ  →  link to /contact
```

---

## Section 3: Utility Links (top bar right)

This section appears on the right side of the white top bar. It contains simple text links.

### How to author

1. Add a **Text** block in Section 3
2. Type each utility link as text and add links:

| Link text | URL |
|-----------|-----|
| My Kao Mall | https://www.mykaomall.com/ |
| お問い合わせ | /contact |
| サイトマップ | /sitemap |
| Global | https://www.kao.com/ |

You can author these as:
- A paragraph of links separated by spaces or line breaks
- A bulleted list of links
- Multiple paragraphs, each containing a link

All formats work — the header renders whatever HTML is in this section into the right side of the top bar.

---

## Path-based header resolution

The header and footer are resolved based on the current page's path. The system walks up the directory tree from the page's location and loads the nav/footer from the **closest ancestor directory** that contains both `nav` and `footer` pages.

### Example

For a page at `/newsroom/2026/some-article`:
1. Checks `/newsroom/2026/` for both nav and footer
2. Checks `/newsroom/` for both nav and footer
3. Checks `/` (root) for both nav and footer
4. Uses the **first match** found

This means:
- Pages under `/newsroom/` use the nav/footer authored under `/newsroom/`
- Pages under `/` that don't have a closer nav/footer use the root nav/footer
- You can override specific sections by placing nav + footer pages in that directory

### Override via metadata

You can also set the `nav` or `footer` metadata property on any page to force a specific path, overriding the automatic resolution.

---

## Mobile behavior

- On screens narrower than 900px, the green bar collapses into a hamburger menu
- The mobile menu shows all navigation items as an expandable accordion
- Utility links from Section 3 appear at the bottom of the mobile menu
