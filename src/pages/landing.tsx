import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto h-14 max-w-7xl px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold">App</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl space-y-6 text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome to Your App
          </h2>
          <p className="mx-auto max-w-md text-balance text-base text-muted-foreground sm:text-lg">
            Build something amazing. Sign in to get started with your dashboard.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link to="/sign-up">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
