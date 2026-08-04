# SBC: Vue Migration

## Overview

This migration is an effort to get SBC running in modern browsers. As a first step we replaced all that was obsolete and not supported in Google Chrome for every main page (Travel Plan, Discovery, Offers, Reservation and Reservation Summary). Mainly what we removed was the `window.showModalDialog` methods and replaced them with calls to `.vue` files.

---

## Approach

We use Vue 3 with a main template `Home.vue` (the "main file") which encapsulates all templates used throughout the implementation. This file also contains most of the handling for functionality regarding our modals.

### Modal Declaration (in Home.vue)

```vue
<BirthDatesModal
  :open="openDialog"
  :count="nonAdults"
  :ages="maxAges"
  :dateArr="dateArrival"
  :focused="focus"
  @close="openDialog = false"
  @info="onSave"
/>
```

- Variables are passed with `:` (props)
- Functions are bound with `@` (emits)

### Props Inside the Modal

The `:open` variable controls visibility:

```vue
<div v-if="open" class="screen">
```

Props must be defined inside the modal:

```javascript
const props = defineProps({
  open: Boolean,
  count: Number,
  ages: Number,
  dateArr: Number,
  focused: Boolean
});
```

### Emitting from Modal to Main File

Define emits and emit back to the main file:

```javascript
const emit = defineEmits(['close', 'info']);

const handleClose = () => {
  if (processedData.value.agesArray.length < props.count) {
    emit('info', processedData.value);
  }
  emit('close');
};
```

When emitted, `@info` points to `onSave` in the main file:

```javascript
const onSave = (data) => {
  flag.value['requestModalInfo'] = data;
};
```

This resolves the promise created when the modal was opened via the `showModalDialog` replacement:

```javascript
getEventBus().accept('requestModalInfo', async (data) => {
  openDialog.value = true;
  focus.value = true;
  nonAdults.value = data.input;
  maxAges.value = data.max;
  dateArrival.value = null;
  return await waitForModalInfo('requestModalInfo');
});
```

---

## EventBus — Link Between Vue and Legacy Frontend

We use `getEventBus()` (defined in `eventBus.js`) which provides an instance of the event bus with `send` and `accept` methods:

- `send` — makes a call to a listener to perform an event
- `accept` — the listener that either makes a request to an action or opens a modal

### Example: Cancel Itinerary EventBus Initialization

```javascript
function initializeEventBusCancelItinerary() {
  getEventBus().accept('continueToCancellationPenalty', async (data) => {
    const continueURL = buildURL("cancItineraryComp.do?", new URLSearchParams({
      action: "Continue",
      verifyPenalties: true,
      cancelReason: data.cancelReason,
      contactName: data.contactName,
      cancelPenalty: data.action
    }));
    return await requestURLReturnValueAsJSON(continueURL);
  });

  getEventBus().accept('updateItinDataWithCancellation', async (data) => {
    const url = await buildURL(contextPath + "/cancelPenaltyQuery.do?", new URLSearchParams({
      action: "Continue",
      optionSelected: data.optionSelected,
      forfeitDeposit: data.forfeitDeposit,
      cancelAction: data.action
    }));
    const response = await fetch(url, { method: "GET" });
    return await response.json();
  });

  getEventBus().accept("updateForm", async (data) => {
    const params = new URLSearchParams({
      action: "PROCEED",
      verifyPenalties: "false",
      cancelReason: data.cancelReason,
      contactName: data.contactName,
      cancelPenalty: data.action
    });

    if (data.action === 'ENTIRE_ITINERARY') {
      params.append("isEntireItinerary", "true");
    } else if (data.action === 'CANCELPENALTYFORINSURANCE') {
      params.append("isInsurance", "true");
      params.append("optionSelected", data.optionSelected);
    } else if (data.action === 'CANCELPENALTYFORMISC') {
      params.append("isMiscellaneous", "true");
      params.append("optionSelected", data.optionSelected);
    } else {
      params.append("isRoom", "true");
      params.append("optionSelected", data.optionSelected);
    }

    const deleteUrl = await buildURL(contextPath + "/cancItineraryComp.do?", params);
    const response = await fetch(deleteUrl, { method: "GET" });

    if (response.ok) {
      parent.ReservationGuest.document.forms.reservationForm.action =
        "screenForward.jsp?forward=moveToReservations.do";
      parent.ReservationGuest.document.forms.reservationForm.submit();
    }
  });
}
```

### JSP Integration

The event bus must be included in the `.jsp` file that calls the listener:

```html
<script type="module" crossOrigin src="<%=contextPath%>/dlp-sbc-vue/micro/assets/EventBus.js"></script>
```

---

## Backend Side

We added logic around existing actions without changing previously defined behavior. For each JSON object related to modal forms, we created DTOs on both sides to receive objects as JSON and assign them in the frontend with `Object.assign(source, target)`.

### Example: AccommodationWrapupAction.java

```java
AccommodationWrapupForm accommodationWrapupForm = (AccommodationWrapupForm) form;
ObjectMapper objectMapper = ObjectMapperFactory.createConfiguredMapper();
AccommodationFormDTO accommodationFormDTO = new AccommodationFormDTO();
```

After performing the action and filling DTOs:

```java
String guestInformationFormJson = objectMapper.writeValueAsString(accommodationFormDTO);
request.setAttribute("guestInformationFormJson", guestInformationFormJson);
response.setContentType("application/json");
response.setCharacterEncoding("UTF-8");
response.getWriter().write(guestInformationFormJson);
```

---

## Key Patterns Summary

| Pattern                | Description                                                        |
|------------------------|--------------------------------------------------------------------|
| Modal visibility       | `:open` prop + `v-if="open"` inside modal                         |
| Modal → Main comms     | `defineEmits` + `emit()` → resolves `waitForModalInfo` promise     |
| Legacy → Vue bridge    | `getEventBus().send()` from JSP, `accept()` in Vue                 |
| Backend → Frontend     | DTO → `ObjectMapper.writeValueAsString()` → JSON response          |
| Frontend form binding  | `Object.assign(reactiveForm, responseJSON)`                        |
