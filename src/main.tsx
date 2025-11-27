import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ErrorBoundary } from '@/components/error-boundary';
import { RouteErrorBoundary } from '@/components/route-error-boundary';
import { HomePage } from '@/pages/home'
import '@/index.css'
import { SignIn } from '@/components/auth/sign-in';
import { SignUp } from '@/components/auth/sign-up';
import { Toaster } from 'react-hot-toast'
import { Spinner } from '@/components/ui/spinner';
import { ConsoleViewer } from '@/components/debug/console-viewer';
import { initConsoleListener } from '@/lib/console-listener';

// Initialize console listener early to capture all logs
initConsoleListener();

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <AuthLoading>
          <div className="min-h-screen flex items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        </AuthLoading>
        <Authenticated>
          <HomePage />
        </Authenticated>
        <Unauthenticated>
          <Navigate to="/sign-in" replace />
        </Unauthenticated>
      </>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/sign-in",
    element: (
      <>
        <Authenticated>
          <Navigate to="/" replace />
        </Authenticated>
        <Unauthenticated>
          <SignIn />
        </Unauthenticated>
      </>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/sign-up",
    element: (
      <>
        <Authenticated>
          <Navigate to="/" replace />
        </Authenticated>
        <Unauthenticated>
          <SignUp />
        </Unauthenticated>
      </>
    ),
    errorElement: <RouteErrorBoundary />,
  },
]);

// Clear the HTML fallback timer since React is mounting
declare global {
  interface Window {
    clearFallbackTimer?: () => void;
  }
}
window.clearFallbackTimer?.();

// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
        <ConsoleViewer />
      </ConvexAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
   