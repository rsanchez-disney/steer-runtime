---
inclusion: fileMatch
fileMatchPattern: "**/pages/**Page.vue,**/np_menu.jsp,**/mwp_menu.jsp,**/vite.config.js"
---

# Admin Popup Page Pattern

This skill documents the pattern for creating standalone Vue 3 popup pages that integrate with the legacy admin sidebar (`np_menu.jsp`). These are NOT EventBus modals |-- they are full pages opened via `window.open()`.

## When to Use This Pattern

- Migrating admin JSP pages to Vue 3
- Creating new admin tools that need to run in a popup window
- Pages that manage their own state independently (no parent component orchestration)

## Architecture Overview

```
np_menu.jsp (admin sidebar)
    |--
    |-- window.open('/destiny/dlp-sbc-vue/micro/{page-name}/index.html')
            |--
            |-- Vue 3 SFC (standalone page)
                    |--
                    |-- Local state (ref/reactive)
                    |-- Inline modals (not EventBus)
                    |-- AJAX to .do endpoints
```

## File Structure

Each admin popup page requires its own Vite entry point:

```
dlp-sbc-vue/
|-- {page-name}/
|--   |-- index.html          |-- | Vite entry point HTML
|--   |-- main.js             |-- | Creates Vue app, mounts page component
|-- src/
|--   |-- pages/
|--       |-- {PageName}Page.vue    |-- | Main page component
|--       |-- {PageName}Form.js     |-- | Reactive form state (optional)
|-- vite.config.js          |-- | Add entry to rollupOptions.input
```

After `npm run build`, output lands in `micro/{page-name}/index.html`.

## Entry Point Files

### index.html

**CRITICAL**: The entry point HTML MUST include CSS resets to prevent double scrollbars and gaps. Without these, the browser's default `body` margin creates a gap between the header and the window edge, and the page content overflows causing a second scrollbar on the window itself.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
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
</head>
<body>
<div id="app"></div>
<script type="module" src="./main.js"></script>
</body>
</html>
```

**Why each rule matters:**
- `margin: 0; padding: 0;` |-- removes the default 8px body margin that causes the gap between header and window edge
- `height: 100%;` |-- ensures the page fills the popup window exactly
- `overflow: hidden;` on html/body |-- prevents the outer window scrollbar; only the `.table-container` inside the Vue component should scroll
- `#app { overflow: hidden; }` |-- prevents the Vue mount point from creating its own scrollbar

### main.js

```javascript
import { createApp } from 'vue'
import PageComponent from '@/pages/PageComponent.vue'

function main() {
    const app = createApp(PageComponent)
    app.mount('#app')
}

main()
```

### vite.config.js addition

**CRITICAL**: `vite.config.js` MUST have `base: './'` to produce relative asset paths. Without this, assets reference `/assets/` (server root) which does not exist in the Tomcat deployment. The built `index.html` must reference `../assets/{page-name}.js` (relative), not `/assets/{page-name}.js` (absolute).

```javascript
// In defineConfig:
base: './',

// In build.rollupOptions.input:
input: {
    main: resolve(__dirname, 'index.html'),
    test: resolve(__dirname, 'test/index.html'),
    '{page-name}': resolve(__dirname, '{page-name}/index.html'),
},
```

## CSRF Token Handling

**MANDATORY for all admin popup pages.** The CSRF filter (`CSRFFilter.java`) applies to ALL `*.do` URLs and validates tokens on both GET and POST requests.

### How the CSRF Filter Works

1. **GET requests**: Compares `CSRFToken` cookie value against the session token. If they don't match |-- | 403 forbidden page.
2. **POST requests**: Checks for `formToken` parameter in the request body OR `formToken` header. If neither matches the session token |-- | 403 forbidden page.

### Standard CSRF Implementation (copy this exactly)

Every admin popup page MUST include these two functions. Do NOT deviate from this pattern:

```javascript
function getCSRFToken() {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'CSRFToken') return decodeURIComponent(value)
  }
  return null
}

function fetchJSON(url, options = {}) {
  return new Promise((resolve) => {
    const method = options.method || 'GET'
    let body = options.body || null

    if (method === 'POST') {
      const csrfToken = getCSRFToken()
      if (csrfToken && body) {
        body = `formToken=${encodeURIComponent(csrfToken)}&${body}`
      } else if (csrfToken) {
        body = `formToken=${encodeURIComponent(csrfToken)}`
      }
    }

    const xhr = new XMLHttpRequest()
    xhr.open(method, url, true)
    xhr.withCredentials = true
    xhr.setRequestHeader('Pragma', 'no-cache')
    xhr.setRequestHeader('Expires', '-1')
    if (method === 'POST') {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try { resolve(JSON.parse(xhr.responseText)) } catch (e) { resolve(null) }
        } else { resolve(null) }
      }
    }
    xhr.onerror = function() { resolve(null) }
    xhr.send(body)
  })
}
```

### Key Rules

- `xhr.withCredentials = true` |-- REQUIRED. Sends the session cookie and CSRFToken cookie with the XHR request.
- `Pragma: no-cache` and `Expires: -1` |-- REQUIRED. Prevents stale cached responses.
- POST body prepends `formToken=...&` |-- REQUIRED. The CSRF filter checks this parameter first.
- GET requests do NOT need to pass the token explicitly |-- the filter validates the cookie against the session automatically.
- If you get a **400 error on GET requests**, the URL is wrong (action mapping doesn't exist in struts-config.xml).
- If you get a **403 error**, the CSRF cookie is missing or doesn't match the session (user not logged in, or popup opened outside the session context).

### Usage Pattern

```javascript
// GET |-- no CSRF handling needed, just call fetchJSON
const data = await fetchJSON('/destiny/admin/myAction.do?action=list')

// POST |-- pass body as URLSearchParams string, fetchJSON prepends formToken automatically
const params = new URLSearchParams()
params.append('field1', value1)
params.append('field2', value2)
const result = await fetchJSON('/destiny/admin/myAction.do?action=save', {
  method: 'POST',
  body: params.toString()
})
```

## Permission Handling (canEdit from backend)

**NEVER use URL parameters for permission checks.** The backend List endpoint returns `canEdit: true/false` by checking the session's `sbc.admin_edit` ability server-side. The frontend reads this and conditionally renders action buttons.

```javascript
const canEdit = ref(false)

async function loadList() {
  const data = await fetchJSON('/destiny/admin/myAction.do?action=list')
  if (data) {
    items.value = data.items || []
    canEdit.value = data.canEdit === true
  }
}
```

In the template:
```html
<button v-if="canEdit" class="btn btn-primary" @click="openNew">New</button>
<th v-if="canEdit" style="width: 120px;">Actions</th>
<td v-if="canEdit" class="actions-cell">
  <button class="btn-edit" @click="openEdit(item.id)">Edit</button>
  <button class="btn-edit btn-edit-danger" @click="confirmDelete(item.id)">Delete</button>
</td>
```

Why this matters:
- URL parameters (`?canEdit=true`) are client-side and trivially bypassable
- The backend checks the actual session ability (`sbc.admin_edit`) via SAML/Keystone
- The frontend just reflects what the backend says |-- no independent permission logic

## Styling Approach

Admin popup pages use scoped styles with **prefixed class names**. Every page MUST prefix all CSS classes with a short identifier to avoid conflicts with global styles (even with `<style scoped>`, Vue's data attribute selectors can lose specificity battles).

Naming convention: `{prefix}-{element}` where prefix is 2-4 chars derived from the page name:
- Payment Info Messages |-- | `pim-`
- XML Filter IDs |-- | `xf-`
- System Properties |-- | `sp-`

### Critical CSS Rules for Modals

1. **NEVER use `backdrop-filter: blur()`** |-- it creates a new stacking context that breaks `position: fixed` inside `overflow: hidden` parents in Chrome. The modal gets clipped to the parent instead of covering the viewport.

2. **Modal overlay must be a direct child of the root page element** |-- not nested inside the content area. This ensures `position: fixed` escapes the content's overflow context.

3. **The root page element should NOT have `overflow: hidden`** |-- use it only on the content area. The `html, body { overflow: hidden }` in the entry point HTML prevents the outer scrollbar.

### Correct modal overlay pattern:
```scss
.{prefix}-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
```

### Template structure (modal as sibling of content, not inside it):
```html
<div class="{prefix}-page">
  <div class="{prefix}-header">...</div>
  <div class="{prefix}-content">
    <!-- table, toolbar, etc -->
  </div>

  <!-- Modal OUTSIDE content, direct child of page -->
  <div v-if="showModal" class="{prefix}-modal-overlay">
    <div class="{prefix}-modal">...</div>
  </div>
</div>
```

## State Management

Admin popup pages manage their own state |-- NO EventBus, NO Vuex/Pinia.

```javascript
import { ref, reactive, computed } from 'vue'
import { pageForm, defaultPageForm } from './PageForm.js'

const items = ref([])
const loading = ref(false)
const errorMessage = ref('')
const openModal = ref(false)
```

### Form State Pattern

Extract reactive forms to separate `.js` files:

```javascript
// PageForm.js
import { reactive } from 'vue'

export const pageForm = reactive({
    field1: '',
    field2: '',
})

export const defaultPageForm = {
    field1: '',
    field2: '',
}
```

Reset form with `Object.assign()`:
```javascript
Object.assign(pageForm, defaultPageForm)
```

## JSP Sidebar Integration

Update the JavaScript function in `np_menu.jsp` to open the Vue page:

```javascript
function pageName(urlArg)
{
    var URLName = '../dlp-sbc-vue/micro/{page-name}/index.html';

    if (typeof urlArg === "string" && urlArg !== "")
        URLName += "?" + urlArg;

    window.open(URLName, "_blank", "width=900,height=550,resizable=yes");
}
```

The `../` prefix is needed because `np_menu.jsp` is served from `/destiny/admin/`.

## Development Workflow

### Vite Dev Server (localhost:5173)

During development, run `npm run dev` in `dlp-sbc-vue/`. Access the page at:
```
http://localhost:5173/{page-name}/
```

The Vite proxy forwards `.do` requests to `localhost:8080`, so backend calls work. However, the CSRF header approach works here because it's not a true popup window.

### Production (localhost:8080)

After `npm run build`, the page is served from Tomcat:
```
http://localhost:8080/destiny/dlp-sbc-vue/micro/{page-name}/index.html
```

This is the real popup window environment where CSRF tokens must be passed as URL parameters.

## Checklist for New Admin Popup Pages

1. [ ] Create entry point folder: `dlp-sbc-vue/{page-name}/`
2. [ ] Create `index.html` (with html/body reset) and `main.js`
3. [ ] Add entry to `vite.config.js` |-- | `rollupOptions.input`
4. [ ] Create page component: `src/pages/{PageName}Page.vue`
5. [ ] Create form state file: `src/pages/{PageName}Form.js` (if needed)
6. [ ] Implement `getCSRFToken()` and `fetchJSON()` with formToken body approach
7. [ ] Prefix ALL CSS classes with short identifier (e.g., `pim-`, `xf-`)
8. [ ] Backend action returns `canEdit` from session ability check
9. [ ] Connect the page: update `mwp_menu.jsp` href to `../dlp-sbc-vue/micro/{page-name}/index.html` (for in-frame pages) OR update the `window.open` function in `np_menu.jsp` (for popup pages)
10. [ ] Build and test in Docker (localhost:8080)

### Required Features (edge cases & UX)

11. [ ] **Client-side search** |-- filter table rows by text input (computed property over the list)
12. [ ] **Form validation** |-- validate required fields before save, show error in modal
13. [ ] **Loading states** |-- separate `loading`, `saving`, `deleting` refs; disable buttons during operations
14. [ ] **Error handling on load** |-- show page-level error if list fetch fails
15. [ ] **Error handling on edit load** |-- show modal-level error if single record fetch fails (don't close modal)
16. [ ] **Error handling on save** |-- show modal-level error with backend message
17. [ ] **Error handling on delete** |-- show page-level error with backend message, close confirm dialog
18. [ ] **Success feedback on save** |-- show success message, disable Save button (prevent double-submit)
19. [ ] **Refresh list after modal close** |-- always re-fetch list when closing edit/new modal
20. [ ] **Delete confirmation** |-- separate modal with Cancel/Delete buttons, `deleting` loading state
21. [ ] **Empty state** |-- show "No items found" when list is empty or search has no results
22. [ ] **Permission-based UI** |-- hide New/Edit/Delete buttons when `canEdit` is false

### Search Pattern

```javascript
const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return items.value
  const q = searchQuery.value.toLowerCase()
  return items.value.filter(item =>
    (item.field1 || '').toLowerCase().includes(q) ||
    (item.field2 || '').toLowerCase().includes(q)
  )
})
```

Template:
```html
<div class="{prefix}-toolbar">
  <div class="{prefix}-search">
    <input v-model="searchQuery" type="text" placeholder="Search..." />
  </div>
  <div class="{prefix}-actions">
    <button v-if="canEdit" class="btn btn-primary" @click="openNew">New</button>
    <button class="btn btn-link" @click="handlePrint">Print</button>
    <button class="btn btn-link" @click="handleClose">Close</button>
  </div>
</div>
```

### Validation Pattern

```javascript
async function handleSave() {
  modalError.value = ''
  if (!form.requiredField || !form.requiredField.trim()) {
    modalError.value = 'Required field is required.'
    return
  }
  saving.value = true
  // ... save logic
}
```

## Differences from EventBus Modals

| Aspect | Admin Popup Page | EventBus Modal |
|--------|------------------|----------------|
| Opening | `window.open()` | EventBus `send`/`accept` |
| State | Local (ref/reactive) | Shared via EventBus |
| CSRF | URL parameter | Header (formToken) |
| Parent | None (standalone) | Home.vue orchestrates |
| Styling | Self-contained SCSS | Global + scoped |
| Entry point | Own index.html | Main app bundle |

## Reference Implementation

See `SystemPropertiesPage.vue` for a complete working example of this pattern.


## In-Frame Admin Pages

Some admin pages load inside the admin frameset (via mwp_menu.jsp) rather than as popup windows (via 
p_menu.jsp + window.open()). The implementation is identical except for how the page is opened.

### Key Differences from Popup Pages

| Aspect | Popup Page | In-Frame Page |
|--------|-----------|---------------|
| Opened by | window.open() from 
p_menu.jsp | Direct <a href> in mwp_menu.jsp |
| Viewport | Own browser window | Admin frame (shared with menu) |
| HTML reset | overflow: hidden on html/body | May need overflow: auto if content exceeds frame height |

### mwp_menu.jsp Integration

For in-frame pages, update the existing href in mwp_menu.jsp:

`html
<!-- Before (JSP) -->
<a href="../admin/someAction.do?method=load">Page Name</a>

<!-- After (Vue) -->
<a href="../dlp-sbc-vue/micro/{page-name}/index.html">Page Name</a>
`

The ../ prefix is required because mwp_menu.jsp is served from /destiny/admin/.

### Overflow Note for In-Frame Pages

The standard HTML reset uses overflow: hidden on html/body to prevent double scrollbars in popup windows. For in-frame pages where the content may exceed the frame height, consider using overflow: auto on the content area instead, so the frame's own scrollbar handles overflow.

## Deployment Verification

After 
pm run build, verify these files exist before hotswapping:

1. micro/{page-name}/index.html   the entry point
2. micro/assets/{page-name}.js   the compiled Vue component
3. micro/assets/{page-name}.css   the scoped styles

If any are missing, the Vite build failed silently (check for import errors or missing dependencies).

### Hotswap Checklist

When hotswapping into a running container:
1. Copy the entry point folder: docker cp micro/{page-name} sbc-dlp:/usr/local/tomcat/webapps/destiny/dlp-sbc-vue/micro/{page-name}
2. Copy ALL assets (JS + CSS): docker cp micro/assets/{page-name}.js sbc-dlp:/.../micro/assets/ and same for .css
3. Copy any shared chunks referenced in the HTML (e.g., modulepreload-polyfill.js, _plugin-vue_export-helper.js)
4. Copy the updated JSP if the link was changed

**Note**: docker cp for directories can be unreliable with nested paths. Prefer copying individual files or use the full rebuild via .kiro/hooks/build-deploy.sh for production deployments.