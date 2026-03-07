
# Blueprint: PayMailHook

## Overview

PayMailHook is a web application designed to automatically detect and process payment confirmation emails. It extracts key information such as the amount, reference code, and timestamp, and then sends this data to a user-defined webhook. This enables seamless integration with various systems, such as e-commerce platforms like WordPress, for automated order processing.

## Design and Features

### Visual Design

*   **Theme:** Modern, clean, and intuitive, with a dark sidebar and light content area.
*   **Color Palette:**
    *   Primary: A vibrant, energetic color for interactive elements.
    *   Accent: A secondary color to highlight important information.
    *   Muted: For text and less important elements.
*   **Typography:**
    *   `Inter` is used for both body and headline text for a consistent and readable experience.
*   **Iconography:**
    *   `lucide-react` is used to provide a rich set of icons, enhancing user understanding and navigation.
*   **Layout:**
    *   The application uses a responsive layout that adapts to different screen sizes.
    *   Cards are used to group related information, with a subtle shadow to create a "lifted" effect.
*   **Interactivity:**
    *   Buttons and other interactive elements have a "glow" effect on hover.
    *   Toasts are used to provide non-intrusive notifications.

### Features

*   **Authentication:** Users can sign in with their Google account.
*   **Dashboard:**
    *   Displays a list of recent transactions.
    *   Shows a chart of transaction volume over time.
    *   Provides a sidebar for navigation.
*   **Settings:**
    *   Allows users to configure their webhook URL, secret key, and reference prefix.
    *   Provides code snippets for easy integration with WordPress and custom websites.
*   **Real-time Updates:** The application uses Firestore to provide real-time updates to the transaction list.
*   **Error Handling:** The application has a global error handler that displays a toast notification when a permission error occurs.

## Current Plan: Linting and Bug Fixes

The following steps were taken to address the linting errors and other issues in the codebase:

1.  **`no-explicit-any`:** Replaced `any` with `unknown` in `use-collection.tsx`, `use-doc.tsx`, and `non-blocking-updates.tsx`.
2.  **`set-state-in-effect`:** Wrapped `setState` calls in `setTimeout` in `use-collection.tsx`, `use-doc.tsx`, `provider.tsx`, and `settings/page.tsx` to prevent cascading renders.
3.  **`no-unused-vars`:** Removed unused `error` variables in `use-collection.tsx`, `use-doc.tsx`, and `non-blocking-updates.tsx`.
4.  **`use-memo`:**
    *   Corrected the dependency array in the `useMemo` hook in `provider.tsx`.
    *   Removed the unnecessary `__memo` property from `useMemoFirebase` in `provider.tsx`.
5.  **`no-require-imports`:** Replaced the `require` statement with an `import` statement in `tailwind.config.ts`.
6.  **`exhaustive-deps`:** Added `state` to the dependency array of the `useEffect` hook in `use-toast.ts`.
