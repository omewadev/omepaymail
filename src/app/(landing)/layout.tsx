
import { ReactNode } from 'react';

// This layout is specifically for the landing page.
// It ensures that the landing page does not inherit any logic or styles
// from the main dashboard or authenticated sections of the app.
export default function LandingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
