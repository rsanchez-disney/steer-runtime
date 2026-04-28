# Polymer Patterns (2.x / 3.x)

## Polymer 2 Patterns

### HTML Imports and `<dom-module>`

Polymer 2 uses HTML imports to load component definitions. Each element is defined inside a `<dom-module>` block with a matching `id` attribute.

```html
<!-- my-element.html -->
<link rel="import" href="../polymer/polymer-element.html">
<link rel="import" href="../iron-icon/iron-icon.html">

<dom-module id="my-element">
  <template>
    <style>
      :host {
        display: block;
        padding: 16px;
      }
      .title {
        font-size: 1.2em;
        color: var(--my-element-title-color, #333);
      }
    </style>

    <h2 class="title">[[title]]</h2>
    <div class="content">
      <slot></slot>
    </div>
  </template>

  <script>
    class MyElement extends Polymer.Element {
      static get is() { return 'my-element'; }

      static get properties() {
        return {
          title: {
            type: String,
            value: 'Default Title',
          },
        };
      }
    }
    customElements.define(MyElement.is, MyElement);
  </script>
</dom-module>
```

Rules:
- Every element MUST have a `static get is()` method returning the element tag name.
- The `<dom-module id="...">` MUST match the value returned by `static get is()`.
- HTML imports use `<link rel="import" href="...">` — these are NOT ES module imports.
- Styles are scoped inside `<template>` using `<style>` blocks. `:host` targets the element itself.
- Use `<slot>` (not `<content>`) for light DOM projection.

### Polymer.Element Base Class

All Polymer 2 elements extend `Polymer.Element`:

```javascript
class ConfigCard extends Polymer.Element {
  static get is() { return 'config-card'; }

  static get properties() {
    return {
      clientName: {
        type: String,
        value: '',
        observer: '_clientNameChanged',
      },
      isActive: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      config: {
        type: Object,
        notify: true,  // enables two-way binding for this property
      },
      items: {
        type: Array,
        value: () => [],  // use factory function for Object/Array defaults
      },
    };
  }

  static get observers() {
    return [
      '_configChanged(config.name, config.version)',  // sub-property observer
      '_itemsChanged(items.splices)',                  // array mutation observer
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    // Element added to DOM — set up listeners, fetch data
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Element removed from DOM — clean up listeners
  }

  ready() {
    super.ready();
    // Called once after the element's template has been stamped and local DOM initialized
    // Preferred over connectedCallback for one-time setup
  }

  _clientNameChanged(newVal, oldVal) {
    console.log(`Client changed from ${oldVal} to ${newVal}`);
  }

  _configChanged(name, version) {
    console.log(`Config: ${name} v${version}`);
  }

  _itemsChanged(changeRecord) {
    if (changeRecord) {
      changeRecord.indexSplices.forEach((splice) => {
        console.log(`${splice.addedCount} items added, ${splice.removed.length} removed`);
      });
    }
  }
}
customElements.define(ConfigCard.is, ConfigCard);
```

Property descriptor fields:

| Field | Type | Purpose |
|-------|------|---------|
| `type` | Constructor | `String`, `Number`, `Boolean`, `Object`, `Array`, `Date` |
| `value` | any / Function | Default value. Use factory function `() => []` for Object/Array |
| `observer` | String | Method name called when property changes |
| `notify` | Boolean | Fire `<property>-changed` event — required for two-way binding (`{{}}`) |
| `reflectToAttribute` | Boolean | Sync property value to HTML attribute |
| `computed` | String | Expression for computed property (e.g., `'_computeFullName(first, last)'`) |
| `readOnly` | Boolean | Property can only be set via private setter `_setPropertyName(val)` |

### Lifecycle Callbacks

| Callback | Timing | Use |
|----------|--------|-----|
| `constructor()` | Element created | Minimal setup only — no DOM access |
| `connectedCallback()` | Added to document | Add event listeners, start observers |
| `disconnectedCallback()` | Removed from document | Remove listeners, cancel pending work |
| `ready()` | Template stamped, local DOM ready | One-time DOM setup, query local DOM nodes |
| `attributeChangedCallback()` | Attribute changed | Rarely used directly — Polymer handles via properties |

### `<dom-repeat>` — List Rendering

```html
<dom-module id="client-list">
  <template>
    <h3>Clients ([[clients.length]])</h3>

    <template is="dom-repeat" items="[[clients]]" as="client">
      <div class="client-row" on-click="_handleClientClick">
        <span>[[client.name]]</span>
        <span>[[client.environment]]</span>
        <iron-icon icon="icons:chevron-right"></iron-icon>
      </div>
    </template>

    <template is="dom-repeat" items="[[clients]]" filter="_isActive" sort="_sortByName">
      <div class="active-client">[[item.name]]</div>
    </template>
  </template>

  <script>
    class ClientList extends Polymer.Element {
      static get is() { return 'client-list'; }

      static get properties() {
        return {
          clients: {
            type: Array,
            value: () => [],
          },
        };
      }

      _handleClientClick(e) {
        const client = e.model.client;  // access the item via e.model.<as>
        this.dispatchEvent(new CustomEvent('client-selected', {
          detail: { client },
          bubbles: true,
          composed: true,
        }));
      }

      _isActive(client) {
        return client.active === true;
      }

      _sortByName(a, b) {
        return a.name.localeCompare(b.name);
      }
    }
    customElements.define(ClientList.is, ClientList);
  </script>
</dom-module>
```

Rules:
- Use `items` attribute to bind the array. Default item variable is `item`; use `as` to rename.
- Access the repeated item in event handlers via `e.model.<as>` (e.g., `e.model.client`).
- Use `filter` for a filter function name and `sort` for a sort function name.
- Use `observe` attribute to re-render when sub-properties change: `observe="name active"`.
- To mutate arrays, use Polymer's array mutation methods (`this.push`, `this.splice`, `this.set`) — direct mutation won't trigger re-render.

### `<dom-if>` — Conditional Rendering

```html
<template is="dom-if" if="[[isAdmin]]">
  <admin-panel config="[[config]]"></admin-panel>
</template>

<template is="dom-if" if="[[!isAdmin]]">
  <p>You do not have admin access.</p>
</template>

<!-- Restamp mode: fully removes/recreates DOM instead of hiding -->
<template is="dom-if" if="[[showHeavyWidget]]" restamp>
  <heavy-data-widget data="[[reportData]]"></heavy-data-widget>
</template>
```

Rules:
- `<dom-if>` stamps its template content when the `if` condition is truthy.
- By default, DOM is hidden but not removed. Use `restamp` attribute to fully remove/recreate DOM.
- Use `restamp` for heavy components that should release resources when hidden.
- Negation uses `[[!property]]` syntax.

### Two-Way Data Binding: `{{}}` vs `[[]]`

Polymer 2 has two binding syntaxes:

| Syntax | Direction | When to use |
|--------|-----------|-------------|
| `[[property]]` | One-way (host → child) | Default. Use when child should not modify parent data |
| `{{property}}` | Two-way (host ↔ child) | Use when child needs to push changes back to parent |

```html
<!-- One-way: parent pushes clientName down, child cannot modify it -->
<client-header name="[[clientName]]"></client-header>

<!-- Two-way: changes to selectedConfig in the child propagate back to parent -->
<config-selector selected="{{selectedConfig}}"></config-selector>

<!-- Two-way with nested path -->
<config-editor config="{{currentConfig}}" on-config-changed="_handleConfigChange"></config-editor>
```

For two-way binding to work, the child element's property MUST have `notify: true`:

```javascript
static get properties() {
  return {
    selected: {
      type: Object,
      notify: true,  // fires 'selected-changed' event automatically
    },
  };
}
```

Rules:
- Prefer `[[]]` (one-way) by default. Only use `{{}}` when the child genuinely needs to update the parent.
- Two-way binding requires `notify: true` on the child property.
- Polymer auto-fires `<property-name>-changed` events for `notify` properties.
- For computed bindings: `[[_computeLabel(item.name, item.type)]]` — works with both syntaxes.
- Binding to native attributes uses `$=` syntax: `class$="[[dynamicClass]]"`, `href$="[[url]]"`.

### `iron-*` and `paper-*` Elements

Polymer 2 projects commonly use the `iron-*` (core utilities) and `paper-*` (Material Design) element sets.

#### Common `iron-*` Elements

```html
<!-- iron-ajax: Declarative HTTP requests -->
<iron-ajax
  auto
  url="/api/clients"
  handle-as="json"
  last-response="{{clients}}"
  on-error="_handleApiError">
</iron-ajax>

<!-- iron-icon: SVG icon rendering -->
<iron-icon icon="icons:settings"></iron-icon>
<iron-icon icon="communication:email"></iron-icon>

<!-- iron-pages: Page switching (like a tab view) -->
<iron-pages selected="[[selectedPage]]" attr-for-selected="name">
  <div name="overview">Overview content</div>
  <div name="details">Details content</div>
  <div name="history">History content</div>
</iron-pages>

<!-- iron-list: Virtualized list for large datasets -->
<iron-list items="[[largeDataset]]" as="row">
  <template>
    <div class="row">[[row.name]] — [[row.value]]</div>
  </template>
</iron-list>

<!-- iron-localstorage: Declarative localStorage binding -->
<iron-localstorage
  name="user-preferences"
  value="{{preferences}}"
  on-iron-localstorage-load-empty="_initDefaults">
</iron-localstorage>
```

#### Common `paper-*` Elements

```html
<!-- paper-button -->
<paper-button raised on-click="_handleSave">Save Configuration</paper-button>
<paper-button disabled="[[!isValid]]">Submit</paper-button>

<!-- paper-input -->
<paper-input
  label="Client Name"
  value="{{clientName}}"
  required
  error-message="Client name is required"
  auto-validate>
</paper-input>

<!-- paper-dropdown-menu with paper-listbox -->
<paper-dropdown-menu label="Environment">
  <paper-listbox slot="dropdown-content" selected="{{selectedEnv}}" attr-for-selected="value">
    <paper-item value="dev">Development</paper-item>
    <paper-item value="stage">Staging</paper-item>
    <paper-item value="prod">Production</paper-item>
  </paper-listbox>
</paper-dropdown-menu>

<!-- paper-dialog -->
<paper-dialog id="confirmDialog" modal>
  <h2>Confirm Promotion</h2>
  <p>Promote configuration to [[targetEnv]]?</p>
  <div class="buttons">
    <paper-button dialog-dismiss>Cancel</paper-button>
    <paper-button dialog-confirm autofocus on-click="_confirmPromotion">Promote</paper-button>
  </div>
</paper-dialog>

<!-- paper-toast -->
<paper-toast id="toast" text="Configuration saved successfully."></paper-toast>
```

Rules:
- Import each element via HTML import: `<link rel="import" href="../iron-ajax/iron-ajax.html">`.
- `iron-ajax` with `auto` fires the request whenever `url` or `params` change.
- `iron-list` virtualizes rendering — use for lists with 100+ items.
- `paper-*` elements follow Material Design. They may conflict with Vista design tokens — prefer Vista `<wdpr-*>` components when available (see Vista Integration section).
- `paper-input` supports `auto-validate`, `required`, `pattern`, and `error-message` for form validation.


## Polymer 3 Patterns

### ES Module Imports

Polymer 3 replaces HTML imports with standard ES modules. Components are defined in `.js` files instead of `.html` files.

```javascript
// my-element.js
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-icon/iron-icon.js';

class MyElement extends PolymerElement {
  static get is() { return 'my-element'; }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
          padding: 16px;
        }
        .title {
          font-size: 1.2em;
          color: var(--my-element-title-color, #333);
        }
      </style>

      <h2 class="title">[[title]]</h2>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  static get properties() {
    return {
      title: {
        type: String,
        value: 'Default Title',
      },
    };
  }
}
customElements.define(MyElement.is, MyElement);
```

Key differences from Polymer 2:
- `import` instead of `<link rel="import">`.
- `html` tagged template literal instead of `<template>` inside `<dom-module>`.
- No `<dom-module>` wrapper — the template is returned from `static get template()`.
- Base class is `PolymerElement` (imported from `@polymer/polymer/polymer-element.js`), not `Polymer.Element`.
- Styles live inside the `html` tagged template, not in a separate `<style>` block.
- Package references use npm scoped packages (`@polymer/polymer`) instead of Bower (`../polymer`).

### LitElement Compatibility

Polymer 3 can coexist with LitElement in the same project. Both extend `HTMLElement` and use the custom elements registry.

```javascript
// Polymer 3 element
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class PolymerWidget extends PolymerElement {
  static get is() { return 'polymer-widget'; }
  static get template() {
    return html`<p>Polymer 3: [[message]]</p>`;
  }
  static get properties() {
    return { message: { type: String, value: 'Hello' } };
  }
}
customElements.define(PolymerWidget.is, PolymerWidget);

// LitElement in the same project
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

class LitWidget extends LitElement {
  static styles = css`p { color: blue; }`;

  @property({ type: String })
  message = 'Hello';

  render() {
    return html`<p>Lit: ${this.message}</p>`;
  }
}
customElements.define('lit-widget', LitWidget);
```

```html
<!-- Both can be used side by side in any HTML context -->
<polymer-widget message="from Polymer"></polymer-widget>
<lit-widget message="from Lit"></lit-widget>
```

Rules:
- Polymer 3 and Lit elements share the same custom elements registry — tag names must be globally unique.
- Both use Shadow DOM by default, so styles are encapsulated.
- Communication between Polymer and Lit elements uses standard DOM: attributes, properties, and custom events.
- When mixing, prefer Lit for new elements and keep Polymer 3 for existing elements pending migration.

### `css` Tagged Template Literals

Polymer 3 uses `html` for templates. When migrating toward Lit patterns, you can use `css` tagged template literals for shared styles:

```javascript
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

// Shared styles as a module
const sharedStyles = html`
  <style>
    :host {
      display: block;
      font-family: var(--wdpr-font-family, 'Helvetica Neue', sans-serif);
    }
    .card {
      border: 1px solid var(--wdpr-border-color, #e0e0e0);
      border-radius: 4px;
      padding: 16px;
    }
  </style>
`;

class StyledCard extends PolymerElement {
  static get is() { return 'styled-card'; }

  static get template() {
    return html`
      ${sharedStyles}
      <style>
        .card-title { font-weight: bold; }
      </style>
      <div class="card">
        <div class="card-title">[[title]]</div>
        <slot></slot>
      </div>
    `;
  }

  static get properties() {
    return { title: String };
  }
}
customElements.define(StyledCard.is, StyledCard);
```

In Lit (target pattern after migration):

```javascript
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

const sharedStyles = css`
  :host {
    display: block;
    font-family: var(--wdpr-font-family, 'Helvetica Neue', sans-serif);
  }
  .card {
    border: 1px solid var(--wdpr-border-color, #e0e0e0);
    border-radius: 4px;
    padding: 16px;
  }
`;

class StyledCard extends LitElement {
  static styles = [
    sharedStyles,
    css`.card-title { font-weight: bold; }`,
  ];

  @property({ type: String })
  title = '';

  render() {
    return html`
      <div class="card">
        <div class="card-title">${this.title}</div>
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('styled-card', StyledCard);
```

### `@property` Decorators (Lit-Compatible)

When writing Polymer 3 elements that target eventual Lit migration, use decorator syntax (requires TypeScript or Babel with decorator support):

```typescript
// config-viewer.ts (TypeScript with decorators)
import { LitElement, html, css } from 'lit';
import { property, customElement, state, query } from 'lit/decorators.js';

@customElement('config-viewer')
class ConfigViewer extends LitElement {
  static styles = css`
    :host { display: block; }
    .highlight { background: var(--wdpr-highlight-bg, #fff3cd); }
  `;

  @property({ type: String })
  clientId = '';

  @property({ type: Object })
  config: ConfigData | null = null;

  @property({ type: Boolean, reflect: true })
  loading = false;

  @state()  // internal state — does not create an attribute
  private _errorMessage = '';

  @query('#output')  // shorthand for this.shadowRoot.querySelector('#output')
  private _outputEl!: HTMLDivElement;

  render() {
    if (this.loading) {
      return html`<p>Loading configuration...</p>`;
    }
    if (this._errorMessage) {
      return html`<p class="error">${this._errorMessage}</p>`;
    }
    return html`
      <div id="output">
        <h3>${this.config?.name ?? 'No config'}</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }
}
```

Decorator reference:

| Decorator | Purpose | Polymer 3 Equivalent |
|-----------|---------|---------------------|
| `@customElement('tag-name')` | Register custom element | `static get is()` + `customElements.define()` |
| `@property({ type: String })` | Reactive property with attribute | `static get properties()` with `type`, `notify`, etc. |
| `@property({ reflect: true })` | Sync property to attribute | `reflectToAttribute: true` |
| `@state()` | Internal reactive state (no attribute) | Property without `reflectToAttribute` |
| `@query('#id')` | Shadow DOM query | `this.shadowRoot.querySelector('#id')` |
| `@queryAll('.class')` | Shadow DOM query all | `this.shadowRoot.querySelectorAll('.class')` |
| `@eventOptions({ passive: true })` | Event listener options | Manual `addEventListener` with options |


## Uplift Path

**⚠️ MANDATORY: Search for RA wiki guides before any Polymer uplift.**

All Polymer uplifts in Config Studio follow the RA (Reusable Assets) team's migration guides. The patterns in this section are supplementary — they do NOT replace the RA wiki steps.

**Do not rely on hardcoded URLs** — pages may move. Always search dynamically using MCP tools.

**How to find RA Polymer migration guides:**
- **Search Confluence** (space key: `DPEPRA`) with queries like: `"Polymer migration"`, `"Polymer uplift"`, `"Polymer to Lit"`, `"web component migration"`, `"DPEP Reference Architecture"`

Before applying any migration pattern:
1. **Search Confluence (DPEPRA space)** via MCP tools for the RA migration guide matching the uplift.
2. **Read and present the RA wiki steps to the user** — summarize and ask for confirmation.
3. Check RA component compatibility with the target framework/version.
4. Follow RA-prescribed steps first, then apply the patterns below as supplementary guidance.

### Polymer 2 → Polymer 3 via `polymer-modulizer`

The `polymer-modulizer` tool automates the bulk of the Polymer 2 → 3 conversion:

```bash
# Install polymer-modulizer globally
npm install -g polymer-modulizer

# Run on a single element (converts .html to .js)
modulizer --out . --npm-name @myorg/my-element --npm-version 1.0.0

# Run on an entire project
modulizer --out . --npm-name @myorg/my-app --npm-version 1.0.0
```

What `polymer-modulizer` does automatically:
1. Converts `<link rel="import">` to ES `import` statements.
2. Converts `<dom-module>` + `<template>` to `static get template() { return html\`...\`; }`.
3. Converts Bower dependencies to npm `@polymer/*` scoped packages.
4. Converts `Polymer.Element` references to `PolymerElement` imports.
5. Generates a `package.json` from `bower.json`.

What `polymer-modulizer` does NOT do (manual steps required):
- Convert `iron-ajax` to `fetch` or a modern HTTP client.
- Convert `paper-*` elements to Vista `<wdpr-*>` components.
- Refactor two-way binding patterns to unidirectional data flow.
- Update test files (WCT → Karma/Mocha/web-test-runner).
- Fix complex computed bindings or observers that reference removed APIs.

### Manual Migration Steps (Polymer 2 → 3)

For elements where `polymer-modulizer` produces incomplete results, follow these manual steps:

1. **Convert HTML imports to ES imports**

```html
<!-- BEFORE (Polymer 2) -->
<link rel="import" href="../polymer/polymer-element.html">
<link rel="import" href="../iron-ajax/iron-ajax.html">
<link rel="import" href="../paper-button/paper-button.html">
```

```javascript
// AFTER (Polymer 3)
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-button/paper-button.js';
```

2. **Convert `<dom-module>` to `static get template()`**

```html
<!-- BEFORE (Polymer 2) -->
<dom-module id="my-element">
  <template>
    <style>:host { display: block; }</style>
    <p>[[message]]</p>
  </template>
  <script>
    class MyElement extends Polymer.Element {
      static get is() { return 'my-element'; }
    }
  </script>
</dom-module>
```

```javascript
// AFTER (Polymer 3)
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class MyElement extends PolymerElement {
  static get is() { return 'my-element'; }

  static get template() {
    return html`
      <style>:host { display: block; }</style>
      <p>[[message]]</p>
    `;
  }
}
customElements.define(MyElement.is, MyElement);
```

3. **Convert Bower to npm**

```json
// BEFORE — bower.json
{
  "dependencies": {
    "polymer": "Polymer/polymer#^2.0.0",
    "iron-ajax": "PolymerElements/iron-ajax#^2.0.0"
  }
}
```

```json
// AFTER — package.json
{
  "dependencies": {
    "@polymer/polymer": "^3.0.0",
    "@polymer/iron-ajax": "^3.0.0"
  }
}
```

4. **Update test infrastructure**

```bash
# BEFORE: Web Component Tester (WCT)
wct --local chrome

# AFTER: Karma, Mocha, or @web/test-runner
npx web-test-runner "test/**/*.test.js" --node-resolve
```

5. **Update build tooling**

```bash
# BEFORE: polymer-cli build
polymer build

# AFTER: Rollup, Webpack, or @web/dev-server
npx rollup -c rollup.config.js
```

### Polymer 3 → Lit Migration

Lit is the recommended successor to Polymer. Migrate incrementally — Polymer 3 and Lit elements coexist in the same project.

#### Step-by-Step Element Migration

```javascript
// BEFORE — Polymer 3
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class ConfigPanel extends PolymerElement {
  static get is() { return 'config-panel'; }

  static get template() {
    return html`
      <style>
        :host { display: block; }
        .panel { border: 1px solid #ccc; padding: 16px; }
      </style>
      <div class="panel">
        <h3>[[title]]</h3>
        <template is="dom-repeat" items="[[items]]">
          <div class="item">[[item.name]]: [[item.value]]</div>
        </template>
        <template is="dom-if" if="[[showActions]]">
          <paper-button on-click="_handleSave">Save</paper-button>
        </template>
      </div>
    `;
  }

  static get properties() {
    return {
      title: { type: String, value: '' },
      items: { type: Array, value: () => [] },
      showActions: { type: Boolean, value: false },
    };
  }

  _handleSave() {
    this.dispatchEvent(new CustomEvent('config-saved', {
      detail: { items: this.items },
      bubbles: true,
      composed: true,
    }));
  }
}
customElements.define(ConfigPanel.is, ConfigPanel);
```

```javascript
// AFTER — Lit
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

class ConfigPanel extends LitElement {
  static styles = css`
    :host { display: block; }
    .panel { border: 1px solid #ccc; padding: 16px; }
  `;

  @property({ type: String })
  title = '';

  @property({ type: Array })
  items = [];

  @property({ type: Boolean })
  showActions = false;

  render() {
    return html`
      <div class="panel">
        <h3>${this.title}</h3>
        ${this.items.map(item => html`
          <div class="item">${item.name}: ${item.value}</div>
        `)}
        ${this.showActions ? html`
          <button @click=${this._handleSave}>Save</button>
        ` : ''}
      </div>
    `;
  }

  private _handleSave() {
    this.dispatchEvent(new CustomEvent('config-saved', {
      detail: { items: this.items },
      bubbles: true,
      composed: true,
    }));
  }
}
customElements.define('config-panel', ConfigPanel);
```

#### Migration Cheat Sheet

| Polymer 3 | Lit | Notes |
|-----------|-----|-------|
| `PolymerElement` | `LitElement` | Different base class |
| `static get template()` | `render()` | Instance method, not static |
| `html` from `@polymer/polymer` | `html` from `lit` | Different `html` tag — do not mix |
| `[[property]]` / `{{property}}` | `${this.property}` | Standard template literal interpolation |
| `<template is="dom-repeat">` | `.map()` in template | Use JavaScript array methods |
| `<template is="dom-if">` | Ternary / `if` in template | `${condition ? html\`...\` : ''}` |
| `on-click="_handler"` | `@click=${this._handler}` | Lit event binding syntax |
| `static get properties()` | `@property()` decorator | Or `static properties = {}` without decorators |
| `notify: true` | `dispatchEvent()` | Lit has no auto-notify; fire events explicitly |
| `observer: '_fn'` | `willUpdate()` / `updated()` | Use lifecycle for reactions |
| `static get observers()` | `willUpdate(changedProps)` | Check `changedProps.has('prop')` |
| `this.set('path', val)` | Direct assignment | Lit uses immutable patterns; reassign to trigger update |
| `this.push('array', item)` | `this.array = [...this.array, item]` | Spread to create new reference |
| `<style>` in template | `static styles = css\`...\`` | Styles are separate from template in Lit |

#### Migration Priority

Migrate elements in this order:
1. **Leaf components** (no children) — simplest, no dependency chain.
2. **Shared/utility elements** — high reuse value.
3. **Container/page elements** — migrate last, after children are converted.
4. **Remove `iron-*`/`paper-*` dependencies** — replace with native HTML, Lit equivalents, or Vista `<wdpr-*>` components.


## Vista Integration

Disney's Vista Design System provides `<wdpr-*>` web components and design tokens. In Polymer projects, Vista components coexist alongside Polymer and `paper-*` elements.

### Using Vista Components in Polymer 2

```html
<link rel="import" href="../polymer/polymer-element.html">
<!-- Vista components are loaded as custom elements — no HTML import needed if bundled -->

<dom-module id="client-search">
  <template>
    <style>
      :host {
        display: block;
        --wdpr-input-border-color: #0078d4;
      }
    </style>

    <!-- Vista input component instead of paper-input -->
    <wdpr-input
      label="Search Clients"
      value="{{searchTerm}}"
      placeholder="Enter client name or ID">
    </wdpr-input>

    <!-- Vista button instead of paper-button -->
    <wdpr-button variant="primary" on-click="_handleSearch">
      Search
    </wdpr-button>

    <!-- Mix: Polymer dom-repeat with Vista card components -->
    <template is="dom-repeat" items="[[results]]">
      <wdpr-card>
        <span slot="title">[[item.name]]</span>
        <span slot="subtitle">[[item.environment]]</span>
        <div slot="actions">
          <wdpr-button variant="text" on-click="_viewDetails">View</wdpr-button>
        </div>
      </wdpr-card>
    </template>
  </template>

  <script>
    class ClientSearch extends Polymer.Element {
      static get is() { return 'client-search'; }

      static get properties() {
        return {
          searchTerm: { type: String, value: '' },
          results: { type: Array, value: () => [] },
        };
      }

      _handleSearch() {
        this.dispatchEvent(new CustomEvent('search-requested', {
          detail: { term: this.searchTerm },
          bubbles: true,
          composed: true,
        }));
      }

      _viewDetails(e) {
        const item = e.model.item;
        this.dispatchEvent(new CustomEvent('view-client', {
          detail: { clientId: item.id },
          bubbles: true,
          composed: true,
        }));
      }
    }
    customElements.define(ClientSearch.is, ClientSearch);
  </script>
</dom-module>
```

### Using Vista Components in Polymer 3 / Lit

```javascript
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
// Vista components self-register — just import the module
import '@wdpr/vista-components/wdpr-input.js';
import '@wdpr/vista-components/wdpr-button.js';
import '@wdpr/vista-components/wdpr-card.js';

class ClientSearch extends LitElement {
  static styles = css`
    :host {
      display: block;
      --wdpr-input-border-color: #0078d4;
    }
    .results {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }
  `;

  @property({ type: String })
  searchTerm = '';

  @property({ type: Array })
  results = [];

  render() {
    return html`
      <wdpr-input
        label="Search Clients"
        .value=${this.searchTerm}
        @input=${(e) => this.searchTerm = e.target.value}
        placeholder="Enter client name or ID">
      </wdpr-input>

      <wdpr-button variant="primary" @click=${this._handleSearch}>
        Search
      </wdpr-button>

      <div class="results">
        ${this.results.map(item => html`
          <wdpr-card>
            <span slot="title">${item.name}</span>
            <span slot="subtitle">${item.environment}</span>
            <div slot="actions">
              <wdpr-button variant="text" @click=${() => this._viewDetails(item)}>
                View
              </wdpr-button>
            </div>
          </wdpr-card>
        `)}
      </div>
    `;
  }

  private _handleSearch() {
    this.dispatchEvent(new CustomEvent('search-requested', {
      detail: { term: this.searchTerm },
      bubbles: true,
      composed: true,
    }));
  }

  private _viewDetails(item) {
    this.dispatchEvent(new CustomEvent('view-client', {
      detail: { clientId: item.id },
      bubbles: true,
      composed: true,
    }));
  }
}
customElements.define('client-search', ClientSearch);
```

### Vista Design Tokens

Use Vista CSS custom properties for consistent theming across Polymer and Lit elements:

```css
:host {
  /* Typography */
  font-family: var(--wdpr-font-family, 'Helvetica Neue', sans-serif);
  font-size: var(--wdpr-font-size-body, 14px);

  /* Colors */
  color: var(--wdpr-text-primary, #1a1a1a);
  background: var(--wdpr-surface-primary, #ffffff);

  /* Spacing */
  padding: var(--wdpr-spacing-md, 16px);
  gap: var(--wdpr-spacing-sm, 8px);

  /* Borders */
  border-color: var(--wdpr-border-color, #e0e0e0);
  border-radius: var(--wdpr-border-radius, 4px);
}
```

### Replacement Guide: `paper-*` → Vista `<wdpr-*>`

When uplifting, replace `paper-*` elements with Vista equivalents where available:

| `paper-*` Element | Vista Replacement | Notes |
|-------------------|-------------------|-------|
| `paper-button` | `<wdpr-button>` | Use `variant` attribute: `primary`, `secondary`, `text` |
| `paper-input` | `<wdpr-input>` | Supports `label`, `placeholder`, `error-message` |
| `paper-dropdown-menu` | `<wdpr-select>` | Use `<wdpr-option>` children |
| `paper-dialog` | `<wdpr-modal>` | Use `open` attribute and slot-based content |
| `paper-toast` | `<wdpr-toast>` | Use `variant`: `success`, `error`, `warning`, `info` |
| `paper-checkbox` | `<wdpr-checkbox>` | Standard checkbox with label slot |
| `paper-toggle-button` | `<wdpr-switch>` | Toggle switch component |
| `paper-tabs` / `paper-tab` | `<wdpr-tabs>` / `<wdpr-tab>` | Tab navigation |
| `paper-spinner` | `<wdpr-spinner>` | Loading indicator |
| `paper-card` | `<wdpr-card>` | Card container with title/subtitle/actions slots |
| `iron-icon` | `<wdpr-icon>` | Vista icon set — check availability before using |
| `iron-ajax` | `fetch` API | No Vista equivalent — use native `fetch` or a service layer |
| `iron-pages` | Custom routing / `<wdpr-tabs>` | Depends on use case |

Rules:
- Always check if a `<wdpr-*>` component exists before using `paper-*` or custom HTML.
- Use Vista design tokens (`var(--wdpr-*)`) for colors, spacing, and typography — not hardcoded values.
- Vista components provide built-in WCAG 2.1 AA accessibility compliance.
- When a Vista equivalent does not exist, use semantic HTML with Vista design tokens for styling.
