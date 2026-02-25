# Grid-Columns Block Description

## What It Does

Grid-Columns is a section-level layout component for AEM Edge Delivery Services (EDS) that provides a responsive CSS grid system. It groups consecutive sections with `span-col-*` classes into a single grid container, enabling multi-column layouts without custom block JavaScript.

Authors assign column spans (1-12) to individual sections via the Universal Editor, and the system automatically wraps them in a grid container at runtime.

## Key UI/UX Characteristics

- **Section-Level Component:** Not a regular block — it wraps other blocks and sections in a CSS grid. Registered as a `core/franklin/components/section/v1/section` resource type.

- **12-Column Grid System:**
  - **Desktop (1080px+):** Full 12-column grid with `span-col-1` through `span-col-12`
  - **Tablet (800-1079px):** 8-column grid; desktop spans >8 are clamped; optional `tablet-span-col-*` overrides
  - **Mobile (<800px):** Single column; all spans collapse to full width

- **Responsive Visibility Toggles:** Authors can hide columns per breakpoint: `desktop-hide`, `tablet-hide`, `mobile-hide`

- **Bottom Margin Control:** Configurable spacing below the grid container with preset spacing tokens (Spacing07, Spacing12, Spacing14, or none)

- **Style Options:** Text alignment (left, center, right), article indent, and font weight variants

- **Automatic Grouping:** The JavaScript logic in `aem.js` automatically detects consecutive sections with `span-col-*` classes and wraps them in a `.grid-columns` container — authors don't need to manually create the wrapper

- **Universal Editor Support:** Dedicated unwrap/regroup logic ensures the grid structure is maintained correctly when content is edited in the Universal Editor

- **No Dedicated Block JS:** All logic is handled by global scripts, making this a purely structural/layout component
