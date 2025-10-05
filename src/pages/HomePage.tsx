const starterPrompt = `Build a minimal homepage with a hero, three features, and a primary call-to-action using Tailwind CSS. Keep it responsive and accessible.`

export function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-xl space-y-6 text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome to your blank template
        </h1>
        <p className="mx-auto max-w-md text-balance text-base text-muted-foreground sm:text-lg">
          Start by describing what you want to build. Keep it short, then add details.
        </p>
        <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-left text-sm font-mono text-muted-foreground">
          {starterPrompt}
        </pre>
      </div>
    </main>
  )
}
