import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserMenu } from "@/components/auth/user-menu";

export function HomePage() {
  const user = useQuery(api.auth.loggedInUser);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto h-14 max-w-7xl px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Home</h1>
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl space-y-6 text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h2>
          <p className="mx-auto max-w-md text-balance text-base text-muted-foreground sm:text-lg">
            You're successfully signed in. Start building your amazing features.
          </p>
        </div>
      </main>
    </div>
  );
}