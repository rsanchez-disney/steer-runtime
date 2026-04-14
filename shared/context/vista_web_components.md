# Vista Web Components (Disney Design System)

## Overview

Vista is Disney's design system providing accessible, themed web components. Always prefer Vista components over custom HTML elements for UI consistency and accessibility compliance.

## Usage

### In Angular
```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-example',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<wdpr-button variant="primary" (click)="onSave()">Save</wdpr-button>`,
})
```

Package: `@wdpr/ra-web-components-angular` (Angular wrapper) or `@nickel/web-components` (core)

### In Astro/React
```tsx
// Use web component tags directly in JSX
<wdpr-button variant="primary" onClick={handleSave}>Save</wdpr-button>
<wdpr-card>
  <wdpr-card-header>Title</wdpr-card-header>
  <wdpr-card-content>Body</wdpr-card-content>
</wdpr-card>
```

## Common Components

| Component | Usage |
|-----------|-------|
| `<wdpr-button>` | Primary, secondary, text buttons |
| `<wdpr-card>` | Content containers with header/content/footer |
| `<wdpr-input>` | Text inputs with validation |
| `<wdpr-select>` | Dropdown selects |
| `<wdpr-modal>` | Dialog overlays |
| `<wdpr-table>` | Data tables with sorting/pagination |
| `<wdpr-tabs>` | Tab navigation |
| `<wdpr-toast>` | Notification toasts |
| `<wdpr-spinner>` | Loading indicators |
| `<wdpr-badge>` | Status badges |

## Styling Priority

1. **Vista components** — Always first choice
2. **Vista design tokens** — Use CSS custom properties for colors, spacing, typography
3. **Tailwind utilities** — Layout, responsive, spacing when Vista doesn't cover it
4. **Custom CSS** — Last resort, only when no Vista component or token exists

## Design Tokens

```css
/* Colors */
var(--wdpr-color-primary)
var(--wdpr-color-secondary)
var(--wdpr-color-error)
var(--wdpr-color-success)

/* Spacing */
var(--wdpr-spacing-xs)    /* 4px */
var(--wdpr-spacing-sm)    /* 8px */
var(--wdpr-spacing-md)    /* 16px */
var(--wdpr-spacing-lg)    /* 24px */
var(--wdpr-spacing-xl)    /* 32px */

/* Typography */
var(--wdpr-font-family)
var(--wdpr-font-size-sm)
var(--wdpr-font-size-md)
var(--wdpr-font-size-lg)
```

## Accessibility

Vista components include built-in accessibility:
- ARIA attributes pre-configured
- Keyboard navigation support
- Focus management
- Screen reader announcements

When using Vista, you get WCAG 2.1 AA compliance by default. Only add custom ARIA when extending beyond Vista's built-in behavior.
