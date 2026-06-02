---
inclusion: fileMatch
fileMatchPattern: "**/*.vue,**/dlp-sbc-vue/**/*.js"
---

# Vue Modal Pattern

This skill provides the template and best practices for creating Vue 3 modal components in the SBC DLP application.

## Modal Component Template

```vue
<template>
  <div v-if="openEntityModal" class="modal-overlay" role="dialog" aria-modal="true" :aria-label="modalTitle">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ modalTitle }}</h2>
        <button @click="closeModal" aria-label="Close modal">&times;</button>
      </div>
      
      <div v-if="loadingEntityModal" class="modal-loading">
        <span>Loading...</span>
      </div>
      
      <div v-else class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Form fields mirroring backend DTO -->
          <div class="form-group">
            <label for="fieldName">Field Name</label>
            <input id="fieldName" v-model="entityForm.fieldName" type="text" />
          </div>
          
          <!-- Add more fields matching DTO structure -->
          
          <div class="modal-footer">
            <button type="button" @click="closeModal">Cancel</button>
            <button type="submit" :disabled="loadingEntityModal">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { requestURLReturnValueAsJSON, requestURLNoReturn } from './Ajax.js';

// --- Modal State ---
const openEntityModal = ref(false);
const loadingEntityModal = ref(false);
const isEditMode = ref(false);

// --- Form (mirrors backend DTO field-by-field) ---
const entityForm = reactive({
    id: null,
    fieldName: '',
    fieldTwo: '',
    fieldThree: null,
    // ... mirror all DTO fields exactly
});

// --- Default values for form reset ---
const defaultFormValues = {
    id: null,
    fieldName: '',
    fieldTwo: '',
    fieldThree: null,
};

// --- Computed ---
const modalTitle = computed(() => isEditMode.value ? 'Edit Entity' : 'Create Entity');

// --- Create Flow ---
const openCreateModal = () => {
    isEditMode.value = false;
    // Reset form to defaults (never reassign reactive object)
    Object.assign(entityForm, defaultFormValues);
    openEntityModal.value = true;
};

// --- Edit Flow ---
const openEditModal = async (entityId) => {
    isEditMode.value = true;
    loadingEntityModal.value = true;
    openEntityModal.value = true;
    
    try {
        const response = await requestURLReturnValueAsJSON(
            `/destiny/entity.do?userAction=Select&id=${entityId}`
        );
        // Defensive assignment - only merge response fields
        Object.assign(entityForm, response);
    } catch (error) {
        console.error('Failed to load entity:', error);
        closeModal();
    } finally {
        loadingEntityModal.value = false;
    }
};

// --- Submit ---
const handleSubmit = async () => {
    loadingEntityModal.value = true;
    
    try {
        const userAction = isEditMode.value ? 'Edit' : 'Create';
        const response = await requestURLReturnValueAsJSON(
            `/destiny/entity.do?userAction=${userAction}`,
            entityForm
        );
        
        // Handle success
        closeModal();
        // Emit event or refresh parent data
    } catch (error) {
        console.error('Failed to save entity:', error);
    } finally {
        loadingEntityModal.value = false;
    }
};

// --- Close ---
const closeModal = () => {
    openEntityModal.value = false;
    loadingEntityModal.value = false;
};

// Expose methods for parent component
defineExpose({
    openCreateModal,
    openEditModal,
});
</script>
```

## Key Patterns

### Form State Management
```javascript
// ALWAYS use reactive for forms
const entityForm = reactive({ ... });

// GOOD - Mutate via Object.assign
Object.assign(entityForm, response);

// BAD - Never reassign reactive objects
// entityForm = response;  // THIS BREAKS REACTIVITY
```

### Modal Flags Convention
```javascript
// Naming: open{Entity}Modal, loading{Entity}Modal
const openGuestModal = ref(false);
const loadingGuestModal = ref(false);

const openPaymentModal = ref(false);
const loadingPaymentModal = ref(false);
```

### DTO/Form Mirroring
```javascript
// Backend DTO (Java)
// public class GuestDTO {
//     private String firstName;
//     private String lastName;
//     private LocalDate birthDate;
//     private Boolean isVIP;
// }

// Frontend Form (must match field names exactly)
const guestForm = reactive({
    firstName: '',
    lastName: '',
    birthDate: null,
    isVIP: false,
});
```

### Edit Flow - Load Before Show
```javascript
// CORRECT: Load data, then show modal
const openEditModal = async (id) => {
    loadingEntityModal.value = true;
    openEntityModal.value = true;
    
    try {
        const data = await requestURLReturnValueAsJSON(`/destiny/entity.do?userAction=Select&id=${id}`);
        Object.assign(entityForm, data);
    } finally {
        loadingEntityModal.value = false;
    }
};

// WRONG: Don't show empty modal then load
// openEntityModal.value = true;
// const data = await fetch(...);  // User sees empty form briefly
```

### Separate Form Files
Each modal component extracts its reactive form into a standalone `.js` file. This allows both the modal component and the orchestrator (Home.vue) to import and populate the same reactive object.

```javascript
// GuestForm.js   standalone reactive form
import { reactive } from 'vue';

export const GuestForm = reactive({
    guestId: null,
    nameTitle: '',
    firstName: '',
    lastName: '',
    // ... mirror all DTO fields exactly
});

export const defaultGuestForm = {
    guestId: null,
    nameTitle: '',
    firstName: '',
    lastName: '',
};
```

The modal component imports and uses the form:
```javascript
// GuestModal.vue
import { GuestForm } from './GuestForm.js';
```

The orchestrator (Home.vue) populates it before opening:
```javascript
import { GuestForm } from '@/components/GuestModal/GuestForm.js';

getEventBus().accept('showGuestModal', async (data) => {
    openGuestModal.value = true;
    Object.assign(GuestForm, data);
    return await waitForModalInfo('showGuestModal');
});
```

### EventBus Integration
The EventBus uses `BroadcastChannel` for cross-window communication. Two patterns:

**Fire-and-forget** (`emit`/`on`)   for one-way notifications:
```javascript
import { getEventBus } from '@/utils/EventBus.js';

// Listen
getEventBus().on('showLoadingDumbo', (data) => {
    showLoading.value = data;
});

// Emit
getEventBus().emit('showLoadingDumbo', true);
```

**Request-response** (`send`/`accept`)   for awaitable modal flows:
```javascript
// Caller (e.g., Test.vue or JSP-side JS)   sends and waits for result
const result = await getEventBus().send('showGuestModal', guestData);

// Responder (Home.vue)   accepts, opens modal, returns result when done
getEventBus().accept('showGuestModal', async (data) => {
    openGuestModal.value = true;
    Object.assign(GuestForm, data);
    return await waitForModalInfo('showGuestModal');
});
```

The `waitForModalInfo` pattern uses a `watch` on a flag ref to resolve the promise when the modal closes:
```javascript
const flag = ref({});

const waitForModalInfo = (eventName) => {
    flag.value[eventName] = null;
    return new Promise((resolve) => {
        watch(() => flag.value[eventName], (val) => {
            if (val !== null) resolve(val);
        });
    });
};
```

### Standalone Popup Pages
For admin pages that run in their own popup window (not inside the main frameset), the component is a full page   not a modal inside Home.vue. It manages its own state and has its own embedded modals. It does NOT go through the EventBus orchestration. It's launched via `window.open()` and tested from Test.vue with mock data.

## Common Mistakes to Avoid

1. **Never reassign reactive objects** - Use `Object.assign()` always
2. **Never open modals before data loads** - Show loading state instead
3. **Never mismatch DTO field names** - Frontend must mirror backend exactly
4. **Never use Vuex/Pinia** - Use local reactive state
5. **Never forget loading states** - Always manage `loading` flags
6. **Never ignore null vs undefined** - Missing response fields shouldn't overwrite form
7. **Never use REST patterns** - Use `.do` endpoints with `userAction` parameter
8. **Never inline reactive forms** - Extract to separate `.js` Form files
9. **Never skip the `send`/`accept` pattern** - Use it for all modal flows that need to return data to the caller
