---
inclusion: fileMatch
fileMatchPattern: "**/components/**/*.vue,**/components/**/*.scss,**/css/Master.scss"
---

# Main App Visual Design System

This skill defines the visual standards for Vue 3 components that run inside the main SBC DLP application (modals, panels, inline components). These are NOT admin popup pages   they live inside the Struts frameset and are orchestrated by Home.vue via EventBus.

## Reference

`Master.scss` is the global stylesheet. All modals inherit from it. Component-specific overrides go in `{Component}.scss`.

## Design Tokens

```scss
// Typography
font-family: Verdana, Arial, Helvetica, sans-serif;
font-size: 11px; // base for all content
font-size: 12px; // modal titles (.modal-title)

// Colors
$title-color: #000099;       // modal titles, sub-titles
$error-color: #e93a3a;       // validation errors, required markers
$btn-bg: rgba(116, 116, 128, 100%);  // action buttons
$btn-hover-bg: rgba(204, 204, 255, 100%);  // button hover
$table-header-bg: #edededc7; // table header cells
$disabled-bg: #e0dede;       // disabled inputs
$border-color: #ddd;         // table borders, general borders
$input-border: #ccc;         // input/select borders
```

## Modal Structure

Every modal follows this DOM structure:

```html
<div class="{ComponentName}">      <!-- Wrapper with component-specific class -->
  <div class="screen">             <!-- Fixed overlay (from Master.scss) -->
    <div class="dialog">           <!-- Modal container -->
      <div class="modal-header">   <!-- Draggable header -->
        <span class="modal-title">Title</span>
        <button class="close-btn">&times;</button>
      </div>
      <div class="content-container">  <!-- Scrollable body -->
        <!-- Content here -->
      </div>
      <div class="buttons-container"> <!-- Footer with action buttons -->
        <button class="action-btn">Cancel</button>
        <button class="action-btn">Save</button>
      </div>
    </div>
  </div>
</div>
```

## Key Classes (from Master.scss)

### .screen (overlay)
```scss
.screen {
  position: fixed;
  top: 0; left: 0;
  width: 76vw; height: 90vh;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 10px;
}
```

### .dialog (modal box)
```scss
.dialog {
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 11px;
  position: relative;
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 10px 10px 10px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 48%);
  z-index: 100;
  height: 600px;
  max-height: 600px;
}
```

Component SCSS overrides width/height per modal:
```scss
.GuestModal {
  .dialog {
    width: 630px;
    max-width: 650px;
  }
}
```

### .modal-header
```scss
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px 10px 0 0;
  cursor: move;       // draggable
  user-select: none;
}
```

### .modal-title
```scss
.modal-title {
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #000099;
}
```

### .action-btn
```scss
.action-btn {
  padding: 7px 11px;
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 11px;
  cursor: pointer;
  background-color: rgba(116, 116, 128, 100%);
  color: white;
  border: none;
  border-radius: 5px;
}

.action-btn:hover {
  background-color: rgba(204, 204, 255, 100%);
  box-shadow: 0 0 0 1.5px black;
  color: black;
}

.action-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}
```

### .buttons-container
```scss
.buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: auto;
}
```

### .content-container
```scss
.content-container {
  flex-grow: 1;
  overflow: auto;
}
```

## Tables

```scss
table {
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 11px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
}

table thead th {
  background-color: #edededc7;
  text-align: center;
  padding: 2px;
  border: 1px solid #ddd;
}

table tbody td {
  padding: 2px;
  border: 1px solid #ddd;
  vertical-align: middle;
  text-align: center;
}

// Rounded corners on first/last cells
table thead tr th:first-child { border-top-left-radius: 8px; }
table thead tr th:last-child { border-top-right-radius: 8px; }
table tbody tr:last-child td:first-child { border-bottom-left-radius: 8px; }
table tbody tr:last-child td:last-child { border-bottom-right-radius: 8px; }
```

## Inputs & Selects

```scss
input, select {
  padding: 5px;
  color: black;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:disabled {
  background: #e0dede;
  cursor: not-allowed;
}
```

## Component SCSS Pattern

Each modal has its own `.scss` file that overrides `.dialog` dimensions:

```scss
// {ComponentName}.scss
.{ComponentName} {
  .dialog {
    width: 630px;
    max-width: 650px;
    // Override height if needed (default is 600px from Master)
  }

  // Component-specific styles below
}
```

## Key Rules

- Font is ALWAYS `Verdana, Arial, Helvetica, sans-serif` at 11px   NOT Segoe UI (that's admin pages only)
- Modal titles are `#000099` blue, 12px bold   NOT gradient headers (that's admin pages only)
- Buttons are gray (`rgba(116, 116, 128, 100%)`) with purple hover   NOT blue gradient (that's admin pages only)
- Tables use `border-collapse: separate` with rounded corners   NOT `border-collapse: collapse`
- `.screen` overlay is 76vw   90vh (fits inside the Struts frameset)   NOT 100vw   100vh
- Modals are draggable via `.modal-header` with `cursor: move`
- Close button is `&times;` character, no background   NOT a styled button
- `.content-container` handles scrolling   the `.dialog` itself does NOT scroll
- Required field markers use `.required` class (red asterisk)
- Error text uses `.color-red` class

## When to Use This vs Admin Page Styles

| Context | Use This | Use Admin Page Styles |
|---------|----------|----------------------|
| Modal inside Home.vue |   | |
| Component in main frameset |   | |
| EventBus-orchestrated modal |   | |
| Standalone popup via window.open() | |   |
| Admin screen (np_menu.jsp) | |   |
| Vite micro-frontend entry point | |   |

## Common Mistakes

- Using Segoe UI font in main app modals (that's admin-only)
- Using blue gradient headers in main app modals (that's admin-only)
- Using `position: fixed; width: 100%; height: 100%` for overlay (use `.screen` class instead)
- Forgetting `cursor: move` on modal headers (all modals are draggable)
- Using `border-collapse: collapse` on tables (breaks rounded corners)
- Adding padding to `.dialog` top (header handles its own spacing)
