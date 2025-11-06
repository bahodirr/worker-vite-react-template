const starterPrompt = `Build a minimal homepage with a hero, three features, and a primary call-to-action using Tailwind CSS. Keep it responsive and accessible.`

export function HomePage() {
  // Uncomment this to enable auth
  // const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl space-y-6 text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome back!
          </h2>
          <p className="mx-auto max-w-md text-balance text-base text-muted-foreground sm:text-lg">
            You're successfully signed in. Start building your amazing features.
          </p>
          <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-left text-sm font-mono text-muted-foreground">
            {starterPrompt}
          </pre>
        </div>
      </div>
    </main>
  );
}