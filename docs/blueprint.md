# **Blueprint: PayMailHook**

## 1. Overview

PayMailHook is an advanced automation platform designed to bridge the gap between bank payment notifications received via Gmail and any web application. It listens for transaction emails in real-time, intelligently extracts payment data using AI, and triggers webhooks to a specified endpoint (e.g., a WordPress/WooCommerce site, custom e-commerce backend). This enables instant, automated order processing and eliminates the need for manual payment verification.

The application features a comprehensive dashboard for users to manage their settings, monitor transactions, and an admin panel for application management.

## 2. Technology Stack

- **Framework**: Next.js 15 (with App Router)
- **Language**: TypeScript
- **Authentication**: Firebase Authentication (Email/Password, Google Sign-In)
- **Database**: Google Cloud Firestore (NoSQL) for storing user data, transaction logs, and configurations.
- **AI & Business Logic**: Google's Genkit is used to create robust AI flows for processing emails and managing notifications.
- **UI Components**: A custom component library built with Radix UI primitives and styled according to `shadcn/ui` conventions.
- **Styling**: Tailwind CSS with CSS Variables for theming (supporting both Light and Dark modes).
- **Icons**: Lucide React for a consistent and modern icon set.
- **Form Management**: React Hook Form with Zod for robust and type-safe form validation.
- **Data Visualization**: Recharts for displaying financial data and analytics in the dashboard.

## 3. Core Features

### 3.1. Authentication
- **User Accounts**: Secure user registration and login handled by Firebase Authentication.
- **Session Management**: Persistent user sessions across the application.
- **Client-Side Hydration**: The app gracefully handles authentication state, distinguishing between public-facing pages and protected routes.

### 3.2. AI-Powered Transaction Processing
- **Gmail Listener**: Utilizes a Genkit flow (`extract-transaction-flow.ts`) to securely connect to a user's Gmail account and monitor for incoming bank transaction emails in real-time.
- **Intelligent Data Extraction**: Leverages a Generative AI model via Genkit to parse email content, accurately extracting critical information such as transaction amount, currency, and reference codes.
- **Universal Webhook Trigger**: Upon successful data extraction, the system automatically sends a POST request (webhook) with the structured payment data to a user-defined URL.
- **Notification Flow**: A dedicated Genkit flow (`notification-flow.ts`) manages sending notifications back to the user or other systems.

### 3.3. User Dashboard (`/dashboard`)
- **Main Dashboard**: A central hub displaying key metrics, recent transactions, and quick-access cards.
- **Settings (`/dashboard/settings`)**: Allows users to configure their Gmail connection, webhook URL, and other preferences.
- **Billing (`/dashboard/billing`)**: Section for managing subscription and payment details.
- **Integrations (`/dashboard/integrations`)**: Provides information and tools for integrating with platforms like WordPress.
- **Webhooks (`/dashboard/webhooks`)**: A detailed log of all triggered webhooks, their status (success/failure), and the data payload sent.

### 3.4. Admin Panel (`/admin`)
- **User Management (`/admin/users`)**: Interface for administrators to view, manage, and monitor all users on the platform.
- **System Alerts (`/admin/alerts`)**: A panel to display and manage system-level alerts and notifications.
- **System Docs (`/admin/system-docs`)**: Internal documentation for administrative purposes.

### 3.5. Internationalization (I18n)
- The UI includes a `LanguageSwitcher` component, indicating built-in support for multiple languages.

## 4. Design System & Style Guidelines

The visual identity of PayMailHook is modern, clean, and trustworthy, built upon a flexible design system that supports both light and dark themes.

- **Framework**: Tailwind CSS.
- **Component Architecture**: Based on `shadcn/ui`, promoting reusability and accessibility through Radix UI primitives.
- **Fonts**:
    - **Headline & Body**: 'Inter', sans-serif.
    - **Code**: `monospace`.
- **Iconography**: `lucide-react` is used for all icons.
- **Border Radius**: A consistent corner radius is applied using `--radius: 0.75rem`.
- **Color Palette**: Colors are defined using HSL values in `src/app/globals.css`, allowing for easy theming.

### Color Reference

| Name          | Purpose                                  | Light Mode HSL Value | Dark Mode HSL Value  |
|---------------|------------------------------------------|----------------------|----------------------|
| `primary`     | Core branding, primary buttons, key headers | `229 41% 27%`        | `0 0% 98%`           |
| `accent`      | Interactive elements, links, highlights  | `267 61% 46%`        | `267 61% 56%`        |
| `background`  | Main page background                     | `0 0% 91%`           | `229 41% 10%`        |
| `foreground`  | Main text color                          | `229 41% 20%`        | `0 0% 98%`           |
| `card`        | Background for card components           | `0 0% 100%`          | `229 41% 12%`        |
| `muted`       | Subtle backgrounds and borders           | `0 0% 94%`           | `229 41% 20%`        |
| `destructive` | Error states, delete buttons             | `0 84% 60%`          | `0 62% 30%`          |
| `border`      | Default border color                     | `229 10% 85%`        | `229 41% 20%`        |
| `ring`        | Focus rings on interactive elements      | `267 61% 46%`        | `267 61% 56%`        |

