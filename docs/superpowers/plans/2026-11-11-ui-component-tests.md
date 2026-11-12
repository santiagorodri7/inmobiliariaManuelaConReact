# UI Component Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five focused Vitest suites for testimonials, contact forms, property search, login, and property filters.

**Architecture:** Test the existing React components directly with React Testing Library and `user-event`, following `ImageUploader.test.jsx`. Mock external services and contexts so the tests remain independent of Firebase and translation files.

**Tech Stack:** React, Vitest, React Testing Library, `@testing-library/user-event`.

**Spec:** `docs/superpowers/specs/2026-11-11-ui-component-tests-design.md`

## Global Constraints

- Create all five suites under `src/tests`.
- Do not change application behavior or add dependencies.
- Mock Firebase-backed services, toast methods, authentication, and translations where needed.
- Keep the search and filter suites separate even though both exercise `PropertyFilters`.

## Review Focus

- Invalid form or login details must not call their service; cover in the testimonial, contact, and login suites.
- A signed-in visitor can publish a valid testimonial; cover in the testimonial suite.
- Submitting a valid contact request shows success and calls the completion callback; cover in the contact suite.
- Typing a location sends the expected value to the parent; cover in the search suite.
- Changing filters and clearing them notify the parent; cover in the filters suite.

---

### Task 1: Testimonial Form

**Files:**
- Create: `src/tests/TestimonialForm.test.jsx`
- Reference: `src/components/testimonials/TestimonialForm.jsx`

**Interfaces:**
- Mock `createTestimonial` from `src/services/testimonialsService.js`.
- Mock `useToast` from `src/components/ui/Toast.jsx` and `useI18n` from `src/i18n/I18nContext.jsx`.

- [x] **Step 1: Add focused cases**

Check that a guest is prompted to log in; an invalid signed-in submission shows validation feedback without calling `createTestimonial`; and a valid submission sends the entered name, text, and rating, calls `onCreated`, and shows success.

- [x] **Step 2: Run the suite**

Run: `npm run test:run -- src/tests/TestimonialForm.test.jsx`
Expected: all cases pass.

### Task 2: Contact Form

**Files:**
- Create: `src/tests/ContactForm.test.jsx`
- Reference: `src/components/contact/ContactForm.jsx`

**Interfaces:**
- Mock `sendContactMessage` from `src/services/contactService.js`.
- Mock `useAuth`, `useToast`, and `useI18n`; use a router wrapper for the privacy link.

- [x] **Step 1: Add focused cases**

Check that an invalid submission does not send a message and shows validation feedback; a valid submission sends the entered contact details and `propertyId`, calls `onSent`, and displays the success message.

- [x] **Step 2: Run the suite**

Run: `npm run test:run -- src/tests/ContactForm.test.jsx`
Expected: all cases pass.

### Task 3: Property Search

**Files:**
- Create: `src/tests/PropertySearch.test.jsx`
- Reference: `src/components/property/PropertyFilters.jsx`

**Interfaces:**
- Render `PropertyFilters` with location value and an `onChange` spy; mock `useI18n`.

- [x] **Step 1: Add the search case**

Type a location into the accessible location field and check that `onChange` receives `"location"` and the entered text.

- [x] **Step 2: Run the suite**

Run: `npm run test:run -- src/tests/PropertySearch.test.jsx`
Expected: the search case passes.

### Task 4: Login Page

**Files:**
- Create: `src/tests/LoginPage.test.jsx`
- Reference: `src/pages/auth/LoginPage.jsx`

**Interfaces:**
- Mock `useAuth` from `src/context/AuthContext.jsx` and `useI18n`; render within `MemoryRouter`.

- [x] **Step 1: Add focused cases**

Check that invalid credentials show field errors without calling `login`; valid credentials call `login` with the entered values and navigate to the correct home page for the returned profile.

- [x] **Step 2: Run the suite**

Run: `npm run test:run -- src/tests/LoginPage.test.jsx`
Expected: all cases pass.

### Task 5: Property Filters

**Files:**
- Create: `src/tests/PropertyFilters.test.jsx`
- Reference: `src/components/property/PropertyFilters.jsx`

**Interfaces:**
- Render `PropertyFilters` with controlled values, spies for `onChange`, `onSubmit`, and `onReset`; mock `useI18n`.

- [x] **Step 1: Add focused cases**

Check that selecting an operation and changing a property type notify `onChange` with the appropriate field and value; submitting calls `onSubmit`; and the clear button calls `onReset` when `showReset` is enabled.

- [x] **Step 2: Run the suite**

Run: `npm run test:run -- src/tests/PropertyFilters.test.jsx`
Expected: all cases pass.

### Final verification

- [x] Run `npm run test:run -- src/tests/TestimonialForm.test.jsx src/tests/ContactForm.test.jsx src/tests/PropertySearch.test.jsx src/tests/LoginPage.test.jsx src/tests/PropertyFilters.test.jsx`.
- [x] Confirm all five suites pass and no application files were changed.
