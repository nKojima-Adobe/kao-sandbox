# Horizontal Line Block

A minimal block that renders a semantic `<hr>` element as a visual horizontal divider.

## Features
- **Simple**: Clears block content and inserts a single `<hr>` element
- **Semantic**: Uses the HTML `<hr>` element for proper document outline
- **Configurable**: No fields — just drop it in to create a divider
- **Styled**: 1px line with configurable color via CSS custom property

## Architecture
- Zero external dependencies
- 17-line JS decorator, 13-line CSS
- Empty fields array in content model (no author configuration needed)
- No filters (no child components)
