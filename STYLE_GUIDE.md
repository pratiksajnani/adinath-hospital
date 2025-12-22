# Adinath Hospital - CSS & UI Style Guide

This document establishes coding standards for maintaining consistent, bug-free UI across the codebase.

## Core Principles

1. **No inline styles** - Use utility classes or component classes from the design system
2. **No page-specific `<style>` blocks** - All styles go in CSS files
3. **Single source of truth** - All shared styles in `css/design-system.css`
4. **Mobile-first** - Design for mobile, enhance for desktop

---

## CSS File Structure

```
css/
├── design-system.css    # Variables, utilities, component classes (THE source of truth)
├── styles.css           # Main styles for the public website
├── components.css       # Shared component styles for pages without styles.css
└── [page-specific].css  # Only if absolutely necessary (avoid if possible)
```

### Import Order

```html
<link rel="stylesheet" href="css/design-system.css" />
<link rel="stylesheet" href="css/styles.css" />
<!-- OR for standalone pages -->
<link rel="stylesheet" href="css/design-system.css" />
<link rel="stylesheet" href="css/components.css" />
```

---

## Z-Index Scale

**Use ONLY these defined z-index values:**

| Variable             | Value | Use Case                       |
| -------------------- | ----- | ------------------------------ |
| `--z-dropdown`       | 100   | Dropdown menus                 |
| `--z-sticky`         | 200   | Sticky headers                 |
| `--z-fixed`          | 300   | Fixed elements (FAB, sidebars) |
| `--z-modal-backdrop` | 400   | Modal overlays                 |
| `--z-modal`          | 500   | Modal dialogs                  |
| `--z-popover`        | 600   | Popovers, tooltips             |
| `--z-tooltip`        | 700   | Tooltips                       |
| `--z-toast`          | 800   | Toast notifications            |
| `--z-max`            | 9999  | Maximum priority (avoid)       |

**Bad:**

```css
.my-modal {
    z-index: 99999;
}
```

**Good:**

```css
.my-modal {
    z-index: var(--z-modal);
}
```

---

## Spacing Scale

Use the spacing utility classes instead of custom padding/margin:

| Class          | Size |
| -------------- | ---- |
| `.p-0`, `.m-0` | 0    |
| `.p-1`, `.m-1` | 4px  |
| `.p-2`, `.m-2` | 8px  |
| `.p-3`, `.m-3` | 12px |
| `.p-4`, `.m-4` | 16px |
| `.p-5`, `.m-5` | 20px |
| `.p-6`, `.m-6` | 24px |
| `.p-8`, `.m-8` | 32px |

Directional variants: `mt-`, `mb-`, `ml-`, `mr-`, `pt-`, `pb-`, `px-`, `py-`

**Bad:**

```html
<div style="padding: 16px; margin-bottom: 24px;"></div>
```

**Good:**

```html
<div class="p-4 mb-6"></div>
```

---

## Color Usage

Use CSS variables for all colors:

**Bad:**

```css
.my-text {
    color: #0f766e;
}
```

**Good:**

```css
.my-text {
    color: var(--primary-dark);
}
```

### Available Colors

- Primary: `--primary`, `--primary-dark`, `--primary-light`, `--primary-50`
- Secondary: `--secondary`, `--secondary-dark`
- Grays: `--gray-50` through `--gray-900`
- Status: `--success`, `--warning`, `--error`, `--info`

---

## Component Classes

### Menu Items

```html
<!-- Menu header -->
<div class="menu-header">SECTION TITLE</div>

<!-- Menu divider -->
<hr class="menu-divider" />

<!-- Menu item -->
<a href="#" class="menu-item">Menu Item</a>
```

### Cards

```html
<div class="card">
    <div class="card-header">Title</div>
    <div class="card-body">Content</div>
    <div class="card-footer">Footer</div>
</div>
```

### Alerts

```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-error">Error message</div>
<div class="alert alert-info">Info message</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

---

## Images

Use image utility classes:

```html
<!-- Full cover image -->
<img src="..." class="img-cover" />

<!-- Gallery thumbnail -->
<img src="..." class="img-gallery" />

<!-- Doctor photo -->
<img src="..." class="img-doctor" />
```

---

## Typography Utilities

```html
<!-- Font sizes -->
<span class="text-xs">Extra small</span>
<span class="text-sm">Small</span>
<span class="text-base">Base</span>
<span class="text-lg">Large</span>
<span class="text-xl">Extra large</span>

<!-- Font weights -->
<span class="font-normal">Normal</span>
<span class="font-medium">Medium</span>
<span class="font-semibold">Semibold</span>
<span class="font-bold">Bold</span>

<!-- Text colors -->
<span class="text-primary">Primary</span>
<span class="text-muted">Muted</span>
<span class="text-error">Error</span>
```

---

## Layout Utilities

```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
    <div>Left</div>
    <div>Right</div>
</div>

<!-- Hidden elements (use instead of style="display: none;") -->
<div class="hidden" id="hiddenContent">...</div>

<!-- Centering -->
<div class="text-center mx-auto">Centered</div>
```

---

## What NOT to Do

### ❌ Inline Styles

```html
<div style="padding: 20px; margin: 10px; color: #333;"></div>
```

### ❌ Page-Specific Style Blocks

```html
<style>
    .my-custom-class { ... }
</style>
```

### ❌ Hardcoded Z-Index

```css
.modal {
    z-index: 9999;
}
```

### ❌ Hardcoded Colors

```css
.text {
    color: #0f766e;
}
```

### ❌ Arbitrary Spacing

```css
.box {
    padding: 17px;
    margin: 23px;
}
```

---

## Adding New Styles

1. Check if a utility class already exists in `design-system.css`
2. If not, consider adding a utility class if it's reusable
3. For one-off component styles, add to `components.css`
4. Document new patterns in this guide

---

## Pre-commit Checks

The following are checked before each commit:

1. **ESLint** - JavaScript linting
2. **Prettier** - Code formatting
3. **Stylelint** - CSS linting (coming soon)

---

## Internationalization (i18n)

All user-visible text must use the i18n system:

```html
<!-- Text content -->
<span data-i18n="key_name">English fallback</span>

<!-- Placeholders (coming soon) -->
<input placeholder="English" data-i18n-placeholder="placeholder_key" />
```

JavaScript:

```javascript
const message = I18N.t('key_name');
```

---

## Questions?

Refer to the existing code in `index.html` for examples, or consult the design system CSS file for available utilities.
