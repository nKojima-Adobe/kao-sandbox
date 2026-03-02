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
3. Below the image, add a **Rich Text** block with the content `Japan・日本語`

---

## Section 2: Navigation (green bar + dropdowns)

This section contains a **single bulleted list** authored in the rich text editor. The list has 4 nesting levels that control the green bar and mega dropdown menus.

### Structure

```
● Green Bar Item Label                              ← Level 1: green bar nav item
  ● Category Top Link [link]                        ← Level 2: bold link at top of dropdown
                                                       (horizontal line appears below this)
  ● Section Heading [link]                          ← Level 3: bold section heading with >
    ● Sub-link [link]                               ← Level 4: individual link with >
    ● Sub-link [link]
  ● Section Heading [link]                          ← Level 3: another section heading
    ● Sub-link [link]
● Next Green Bar Item                               ← Level 1: next green bar item
  ...
```

### How each level maps to the header

| Nesting level | What it becomes |
|---------------|-----------------|
| Level 1 (top-level bullet) | Green bar navigation item label |
| Level 2 (1st indented bullet) | Dropdown top link — bold heading at the top, followed by an HR |
| Level 3 (2nd indented bullet onward) | Section heading — bold with `>`, starts a group |
| Level 4 (under a Level 3 bullet) | Sub-links within that group — regular weight with `>` |

Level 3 groups and their Level 4 items are laid out using CSS multi-column layout. The left column fills first; when it reaches a certain height, content wraps to a new column to the right.

### How to author

1. Add a **Rich Text** block in Section 2
2. Start a **bulleted list** using the RTE toolbar
3. Type the first green bar item name (e.g. `イノベーション`)
4. Press **Enter** + **Tab** to create Level 2 — type the top link (e.g. `イノベーショントップ`) and add a link
5. Press **Enter** (stay at Level 2) to create Level 3 items — type a section heading and add a link
6. Press **Enter** + **Tab** to go to Level 4 — type sub-links under that section heading
7. Press **Shift+Tab** to return to Level 3 for the next section heading
8. Press **Shift+Tab** twice to return to Level 1 for the next green bar item

### Concrete example

```
● イノベーション
  ● イノベーショントップ  →  link to /innovation
  ● 研究開発ニュースリリース  →  link to /innovation/news
  ● 研究開発  →  link to /innovation/rd
    ● 商品開発研究  →  link to /innovation/rd/product
    ● 基盤技術研究  →  link to /innovation/rd/core
    ● 衛生科学研究  →  link to /innovation/rd/hygiene
    ● 蚊の行動制御研究  →  link to /innovation/rd/mosquito
    ● サステナブル界面活性剤 Bio IOS ®  →  link
    ● 組織運営  →  link
    ● 研究開発拠点  →  link
    ● 受賞実績  →  link
    ● 掲載論文  →  link
    ● 臨床研究法に基づく情報公開  →  link
  ● 品質保証  →  link to /innovation/quality
    ● 商品開発〜生産〜発売後の品質保証活動  →  link
    ● お客さまの声を活かす取り組み  →  link
    ● 化学物質をより安全に使用するための取り組み  →  link
    ● 品質基本方針  →  link
    ● 家庭品の安全基準  →  link
    ● 化粧品の安全基準  →  link
    ● 食品の安全基準  →  link
● 花王について
  ● 花王についてトップ  →  link to /about
  ● 企業情報  →  link to /about/corporate
    ● 社長メッセージ  →  link
    ● 企業理念  →  link
  ● 事業紹介  →  link to /about/business
```

### Items without dropdowns

If a green bar item should be a simple link with no dropdown, author it as a single bullet with a link and **no nested bullets** underneath:

```
● 採用情報  →  link to /careers
```

---

## Section 3: Utility Links (top bar right)

This section appears on the right side of the white top bar. It contains simple text links.

### How to author

1. Add a **Rich Text** block in Section 3
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
