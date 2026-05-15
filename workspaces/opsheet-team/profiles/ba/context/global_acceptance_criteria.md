# Global Acceptance Criteria (Condensed)

Source: https://mywiki.disney.com/spaces/OPSHEET/pages/603135701/Global+Acceptance+Criteria
Last synced: May 2026

---

## 1. Data Tables — General Behavior

- When implementing a data table, the reusable table component should be used to ensure consistency across the application.
- For tables with **active/inactive capabilities**, the default view is to show all rows (active and inactive). Users should have the ability to adjust the view to only active records.
  - By default, new records should be flagged as active.
  - Duplicate Validations: The active flag should be ignored when running duplicate checks.
- For tables with **delete capabilities**, the default view is to show non-deleted records. Users should have the ability to also show deleted records.
  - The "Show Deleted" button should be hidden for users without applicable permissions to view deleted records.
  - A user should be able to flag multiple records for delete within a single save event.
  - If a user flags rows for delete and selects Save, they should receive a confirmation message before deletes are processed.
  - Duplicate Validations: A non-deleted record can duplicate a deleted record, but restoring the deleted record would not be allowed if a non-deleted duplicate exists.
- For tables with **Effective & Expiration dates**, the default view is to show all unexpired records. Users should have the ability to view both unexpired and expired records.
- If a user has added or modified records but attempts to navigate away before saving, they should receive an **unsaved changes warning**.
  - Navigating away includes navigation to another module/screen or another tab.
- When a user adds a new record, if the first cell is a freeform/typeahead field, the cursor should be focused in the cell.
- When a user adds new records, upon save, the record should remain at the top of the list. Selecting Refresh Table would move it to the proper place based on default sorting.
- When a user modifies an existing record, upon save, the record should remain at its current place. Selecting Refresh Table would move it based on default sorting if applicable.

## 2. Data Tables — Cancel/Save Bar

- The Cancel/Save bar is always present, but neither button should be selectable until an action is completed (add, modify, or delete).
- Following an action, both Cancel and Save become available until the user selects one or navigates away (which acts as Cancel).
  - **Save**: Applies new records and modifications. Provides success toast. Both buttons become un-selectable.
  - **Cancel**: Clears new records and returns edits to previously saved state. Both buttons become un-selectable.
- If a save detects a validation error, the Save button becomes un-selectable until the error is corrected. Cancel remains selectable.
- Upon successful save with no validation errors, a success toast message is presented.

## 3. Data Tables — Refresh Table Function

- Most screens with a data table will showcase a Refresh Table option in the Cancel/Save bar.
  - Tables that do not allow sorting will not showcase Refresh Table.
  - Tables that are fully read-only will not showcase Refresh Table.
- Selecting Refresh Table does the following:
  - Adjusts the table back to its **default sort**.
  - Adjusts the table back to its **default view** (e.g., clears "show deleted" back to non-deleted only).
  - **Clears any applied filters** and returns to default view.
  - Moves new/modified records to the appropriate place based on default sort.

## 4. Data Tables — Sorting

- Tables should be sortable by all non-binary columns (sort not allowed for checkboxes, delete icon, links, or binary data).
- Each table will have a default sort, typically the first non-binary column sorted alphabetically A-Z.
- For tables with effective and expiration dates, the default sort is typically expiration date, newest to oldest.

## 5. Data Tables — Filtering

- When implementing data table filtering, the reusable component should be used.
- All data tables should have the filtering component available, unless otherwise specified in the associated user story.
- When the filtering component is implemented, there will be specific criteria for the Type and Qualifier values allowed.

## 6. Data Tables — Row Count

- All screens with a single data table will showcase a row count (X Rows) in the Cancel/Save bar.
- The row count should adjust automatically when records are added or deleted.
- The row count should adjust when the table view is adjusted by filters, active/inactive filtering, or deleted filtering.

## 7. Common Components — Loading Indicator

- The loading indicator should be displayed whenever any type of navigation/page load or save/processing is occurring.
- When implementing the loading indicator, the reusable component should be used.

## 8. Common Components — General Navigation

- If a user has taken an action that requires a Save or Cancel event but attempts to navigate away before saving, they should receive an unsaved changes warning indicator.
- Navigating away includes navigation to another module/screen or another tab.

## 9. Common Components — Toast Messages

- **Success toast**: Presented whenever a save action comes back successful. Should auto-dismiss after 5 seconds. User can also close it manually via the X icon.
- **Error toast**: Presented whenever a save action comes back unsuccessful. Should persist until the user selects the X icon to close it.

## 10. Common Components — Panels/Modals

- When a modal is opened, a user should not be able to dismiss it unless they select an applicable action button (cannot close by clicking outside).
- The Cancel or Close button should always be in an active state when a modal opens.
- If a panel allows data entry, the Save button would not be available until the user takes an action that requires a save.

## 11. Permissions (General Pattern)

- The 'User Security Service' should be used to determine and apply permissions.
- Each module has a system module reference (e.g., ENTITY-DATA-MANAGEMENT, ALERT-MANAGEMENT, SCHEDULE-MANAGEMENT).
- Modules that require an Entity selection must complete Entity permission checks in addition to module permission checks.
- Access to modules is restricted to users with valid VIEW permissions.
- Detailed History Logging is available to all users with valid VIEW permissions. History Logging is strictly Read Only.

## 12. History Logging (General Pattern)

- Each "Updated On" field is a link to expand the full history of the associated record.
- Selecting Updated On will expand a panel directly under the selected record and showcase all revisions.
- If history logging is not immediately available, a loading indicator should appear.
- Only 5 records display within view; a scroll is present to showcase all records.
- A "Close" button is displayed below the records to collapse the panel.
- Detailed history logging should only show expanded for one record at a time.
- Detailed history logging should show for both non-expired and expired records.
