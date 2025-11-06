import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ErrorBoundary } from '@/components/error-boundary';
import { RouteErrorBoundary } from '@/components/route-error-boundary';
import { HomePage } from '@/pages/HomePage'
import '@/index.css'
import { SignIn } from '@/components/auth/sign-in';
import { SignUp } from '@/components/auth/sign-up';
import { Toaster } from 'react-hot-toast'

// Uncommend this to enable auth
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);


const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
    errorElement: <RouteErrorBoundary />,
  },
]);

// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Uncommend this to enable auth */}
    <ConvexAuthProvider client={convex}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
      <Toaster position="top-right" />
    </ConvexAuthProvider>
  </StrictMode>,
)
   