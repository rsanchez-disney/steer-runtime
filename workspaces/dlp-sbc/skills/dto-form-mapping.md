---
inclusion: fileMatch
fileMatchPattern: "**/dto/**/*.java,**/dlp-sbc-vue/**/*.js,**/dlp-sbc-vue/**/*.vue"
---

# DTO/Form Mapping Pattern

This skill provides guidelines for maintaining consistency between backend DTOs and frontend Forms in the SBC DLP application.

## Core Principle

**Frontend Forms MUST mirror backend DTOs field-by-field with exact naming.**

This ensures seamless data flow between Java backend and JavaScript frontend without transformation logic.

## Mapping Examples

### Example 1: Guest DTO/Form

**Backend (Java)**:
```java
package com.dd.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class GuestDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String email;
    private String phoneNumber;
    private Boolean isVIP;
    private String guestType;
}
```

**Frontend (JavaScript)**:
```javascript
const guestForm = reactive({
    id: null,
    firstName: '',
    lastName: '',
    birthDate: null,
    email: '',
    phoneNumber: '',
    isVIP: false,
    guestType: '',
});

const defaultGuestForm = {
    id: null,
    firstName: '',
    lastName: '',
    birthDate: null,
    email: '',
    phoneNumber: '',
    isVIP: false,
    guestType: '',
};
```

## Type Mapping Guidelines

| Java Type | JavaScript Type | Default Value |
|-----------|----------------|---------------|
| `String` | `string` | `''` (empty string) |
| `Long`, `Integer` | `number` | `null` |
| `BigDecimal`, `Double` | `number` | `null` |
| `Boolean` | `boolean` | `false` |
| `LocalDate`, `LocalDateTime` | `string` or `null` | `null` |
| `List<T>` | `Array` | `[]` |
| `Map<K,V>` | `Object` | `{}` |
| Custom DTO | `Object` | `null` or `{}` |

## Defensive Assignment Pattern

```javascript
// GOOD - Object.assign merges without losing reactivity
Object.assign(guestForm, response);

// BAD - Reassignment loses reactivity
// guestForm = response;
```

## Common Pitfalls

1. **Field name mismatch** - `firstName` in Java, `first_name` in JS
2. **Type mismatch** - `Long` in Java, `string` in JS
3. **Missing fields** - DTO has 10 fields, Form has 8
4. **Reassigning reactive objects** - Breaks Vue reactivity
5. **Not handling null** - Backend returns null, frontend expects empty string
6. **Date format issues** - Backend uses LocalDate, frontend expects ISO string
7. **Boolean defaults** - Backend null, frontend expects false
8. **Inlining forms** - Always extract reactive forms to separate `.js` files (e.g., `GuestForm.js`, `PaymentForm.js`)

## Form File Convention

Every modal/page component that has a form MUST have a companion Form file:

```
components/
  GuestModal/
    GuestModal.vue      # The component
    GuestForm.js        # The reactive form (exported, shared)
  PaymentModal/
    PaymentModal.vue
    PaymentForm.js
```

The Form file exports a `reactive()` object and optionally a defaults object:

```javascript
// GuestForm.js
import { reactive } from 'vue';

export const GuestForm = reactive({
    guestId: null,
    nameTitle: '',
    firstName: '',
    lastName: '',
});

export const defaultGuestForm = {
    guestId: null,
    nameTitle: '',
    firstName: '',
    lastName: '',
};
```

## Checklist for New DTO/Form

- [ ] Field names match exactly (case-sensitive)
- [ ] All DTO fields present in Form
- [ ] Appropriate default values in Form
- [ ] Type mapping is correct
- [ ] Date fields handle null and ISO strings
- [ ] Boolean fields default to false
- [ ] Arrays/Lists default to empty array
- [ ] Objects default to null or empty object
- [ ] Form extracted to separate `.js` file
- [ ] Validation rules match on both sides
