---
inclusion: always
---
# Project Context for LLM

## High-level Architecture

This is a legacy enterprise web application built on **Java Struts 1**, currently in a **progressive migration phase**.

- Backend: Java + Struts 1
- Frontend: JSP + Vue.js (Vue is being introduced incrementally)
- Communication: `.do` Struts actions (NOT REST controllers)
- Session-based architecture

The goal is to modernize the frontend gradually while keeping the existing Struts-based backend stable.

This is NOT a greenfield project.

---

## Backend Architecture (Java / Struts)

- The application is based on **Struts 1**
- All actions extend `DestinyActionParent`
- Actions are accessed via `.do` endpoints
- Actions usually handle multiple flows:
    - "blank" userAction (initial load)
    - `userAction=Select`, `Create`, `Edit`, etc.
- Session state is heavily used and expected

### Session Handling

- Session data is accessed via `SessionUtility`
- Session is a first-class state mechanism
- Do NOT suggest stateless designs

### DTO Patterns

- Java side uses DTOs (e.g. `XDTO`)
- JSON serialization/deserialization is done via:
    - `Jackson ObjectMapper`
    - `ObjectMapperFactory`
- DTO field names are mirrored exactly in frontend Forms

---

## Frontend Architecture

The frontend is hybrid:

- Legacy JSP pages
- Vue.js components embedded progressively replacing JSP logic

### Vue.js

- Vue 3 (Composition API)
- No Vuex / Pinia
- State handled via `reactive` objects
- Modals and UI flows are managed locally per component

### Forms & DTO Mirroring

- Frontend uses **Form objects** (JS objects)
- Forms mirror backend DTOs field-by-field
- Naming consistency between Java DTOs and JS Forms is critical

### Modal Patterns

Each modal typically has:
- an `open` flag
- a `loading` flag
- a reactive Form object

Common flows:
- Create:
    - Reset form to default/empty values
    - Open modal
- Edit:
    - Fetch data from backend
    - Assign response into reactive Form
    - Open modal only AFTER data is loaded

---

## Frontend Communication

- EventBus-based communication is widely used
- No global state managers

### AJAX / Fetch

Fetch wrappers are defined in `Ajax.js`:
- `requestURLReturnValueAsJSON`
- `requestURLNoReturn`

Rules:
- `.do` endpoints are called directly
- Responses are plain JSON objects
- Error handling is usually manual

---

## Frontend ↔ Backend Contract

- Communication is NOT RESTful
- `.do` actions return JSON when invoked via AJAX
- Responses are mapped into reactive Forms using `Object.assign`
- `null` vs `undefined` matters
- Missing fields should NOT overwrite existing form state

---

## Naming Conventions

- Java DTOs: `XDTO`
- Frontend forms: `XForm`
- Booleans: `isX`, `hasX`, `shouldX`
- Modal flags: `openXModal`, `loadingXModal`
- User actions: `userAction=Select`, `Create`, `Edit`, etc.

---

## Migration Rules

- This is a **progressive migration**, not a rewrite
- Vue is introduced incrementally
- Struts and JSP are still authoritative
- New UI logic may be implemented in Vue, but must integrate with existing flows

---

## Common Pitfalls

- Do NOT reassign reactive objects (always mutate or use Object.assign)
- Do NOT open modals before async data is fully loaded
- Do NOT assume stateless backend behavior
- Do NOT break session-dependent flows

---

## What LLM Should Do

- Follow existing Struts patterns
- Respect session-based state
- Generate code consistent with existing DTO/Form mirroring
- Be defensive when assigning backend responses to frontend forms
- Prefer explicit, readable logic over abstractions, offensive approach
- Implement simple and elegant solutions, avoid unnecessary complexity
- Remove previously generated code in the same session if it is no longer needed
- Always read the actual file before touching it, no exceptions.
- Think through all side effects before writing a change.
- When a fix introduces a new bug, that's a signal the mental model was wrong — stop and re-read everything rather than patching the patch.

---

## What LLM Must NOT Do

- Do NOT suggest Spring Boot
- Do NOT suggest REST controllers
- Do NOT suggest rewriting the architecture
- Do NOT introduce new frameworks
- Do NOT refactor legacy code unless explicitly asked
- Do NOT implement overly complex solutions when a simple one suffices
- Do NOT add unnecessary code, keep changes minimal and relevant