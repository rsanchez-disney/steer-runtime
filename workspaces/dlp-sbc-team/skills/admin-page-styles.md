# Admin Page Styles

This skill defines the visual design system for standalone admin popup pages migrated to Vue 3. All new admin pages must follow these styles for consistency.

## Reference Implementation

`SystemPropertiesPage.vue` is the gold standard. All new admin pages should match its look and feel.

## Design Tokens

```scss
// Colors
$primary-blue: #1F4F99;
$primary-blue-hover: #163d7a;
$text-dark: #333;
$border-color: #e0e0e0;
$row-bg: #fafafa;
$row-hover: #e8eef5;
$header-bg: #eef2f7;

// Typography
font-family: 'Segoe UI', Arial, sans-serif;
font-size: 13px; // base
```

## Page Layout

Full-height flexbox column: header, then scrollable content area.

```scss
.page {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 13px;
  color: #333;
  background: #fff;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

## Header

Blue gradient bar with white title text.

```scss
.header {
  background: linear-gradient(135deg, #1F4F99 0%, #152f6e 100%);
  padding: 16px 24px;
  flex-shrink: 0;
}

.title {
  color: white;
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.3px;
}
```

## Content Area

Flex column with padding, holds toolbar + table.

```scss
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  overflow: hidden;
  min-height: 0;
}
```

## Toolbar

Flex row, search on left (if applicable), actions on right.

```scss
.toolbar {
  display: flex;
  justify-content: space-between; // or flex-end if no search
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}
```

## Buttons

Three button types: primary (blue), link (text), and edit/delete (outlined).

```scss
// Base
.btn {
  font-family: inherit;
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

// Primary   solid blue with gradient and shadow
.btn-primary {
  background: linear-gradient(135deg, #1F4F99 0%, #1a3f7a 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(31, 79, 153, 0.3);
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #163d7a 0%, #112f5e 100%);
    box-shadow: 0 4px 8px rgba(31, 79, 153, 0.4);
    transform: translateY(-1px);
  }
}

// Link   text-only blue
.btn-link {
  background: none;
  border: none;
  color: #1F4F99;
  padding: 8px 16px;
  &:hover { background: rgba(31, 79, 153, 0.08); border-radius: 6px; }
}

// Edit   outlined blue, fills on hover
.btn-edit {
  background: white;
  color: #1F4F99;
  border: 1px solid #1F4F99;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #1F4F99; color: white; }
}

// Danger   red for delete
.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  &:hover:not(:disabled) { background: #c82333; }
}
```

## Table

Sticky header, alternating row backgrounds, hover highlight.

```scss
.table-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  min-height: 0;

  // Custom scrollbar
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #eef2f7;
    th {
      padding: 12px 14px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e0e0e0;
      white-space: nowrap;
      background: #eef2f7;
    }
  }

  tbody tr {
    background: #fafafa;
    transition: background-color 0.15s;
    &:hover { background: #e8eef5; }
    td {
      padding: 10px 14px;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: middle;
      word-wrap: break-word;
    }
  }
}
```

## Search Input (if applicable)

```scss
.search input {
  font-family: inherit;
  font-size: 14px;
  padding: 8px 14px;
  width: 300px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #1F4F99;
    box-shadow: 0 0 0 3px rgba(31, 79, 153, 0.1);
  }
  &::placeholder { color: #999; }
}
```

## Modal

Centered overlay with backdrop blur, slide-in animation.

```scss
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 600px; // or 400px for small confirm dialogs
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.2s ease-out;
  overflow: hidden;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  background: linear-gradient(135deg, #1F4F99 0%, #152f6e 100%);
  padding: 18px 24px;
  h5 { margin: 0; color: white; font-size: 16px; font-weight: 600; }
}

.modal-body { padding: 24px; }

.modal-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
}
```

## Form Inputs (inside modals)

```scss
.form-group {
  margin-bottom: 20px;
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }
  input, textarea {
    font-family: inherit;
    font-size: 14px;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;
    &:focus {
      outline: none;
      border-color: #1F4F99;
      box-shadow: 0 0 0 3px rgba(31, 79, 153, 0.1);
    }
  }
  textarea { resize: vertical; min-height: 140px; line-height: 1.5; }
  .input-disabled { background-color: #f5f5f5; color: #666; cursor: not-allowed; }
}
```

## Error Messages

```scss
// Page-level error
.error {
  color: #dc3545;
  font-weight: 500;
  text-align: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

// Modal-level error
.modal-error {
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  text-align: center;
  font-size: 13px;
}
```

## Loading State

```scss
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: #1F4F99;
  font-weight: 500;
  img { width: 24px; height: 24px; }
}
```

## Key Rules

- Use `$primary-blue: #1F4F99` everywhere   never hardcode different blues
- Use `linear-gradient(135deg, ...)` for header and primary button backgrounds
- Use `border-radius: 6px` for inputs/buttons, `8px` for containers, `12px` for modals
- Use `box-shadow` on primary buttons for depth
- **NEVER use `backdrop-filter: blur()` on modal overlays**   it breaks `position: fixed` inside `overflow: hidden` parents in Chrome, causing the modal to be clipped to the parent instead of covering the viewport. Use only `background: rgba(0, 0, 0, 0.5)` for the overlay dimming effect.
- Use sticky `thead` for scrollable tables
- Use `transition: all 0.2s` for interactive elements
- Loading spinner uses `/destiny/images/busy.gif`
- Font stack: `'Segoe UI', Arial, sans-serif`
- Base font size: 13px, inputs: 14px, title: 17px, modal title: 16px, edit buttons: 12px
- **Prefix all CSS classes** with a short component identifier (e.g., `pim-` for Payment Info Messages, `xf-` for XML Filter IDs) to avoid conflicts with global styles when using `<style scoped>`

## Entry Point HTML Reset (MANDATORY)

The Vite entry point `index.html` for every admin popup page MUST include these resets. Without them you get:
- A gap between the blue header and the window edge (default body margin)
- A double scrollbar (window scrollbar + table container scrollbar)

```html
<style>
    html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
    }
    #app {
        height: 100%;
        overflow: hidden;
    }
</style>
```

This ensures only the `.table-container` inside the Vue component scrolls   never the window itself.

## Vite Config Requirement

`vite.config.js` MUST include `base: './'` to produce relative asset paths. Without this, built HTML references `/assets/...` which resolves to `http://localhost:8080/assets/` (doesn't exist). With `base: './'`, paths become `../assets/...` which correctly resolves relative to the entry point's subdirectory.

```javascript
export default defineConfig({
    base: './',
    plugins: [vue()],
    // ...
})
```
